# 🗄️ Supabase Advanced — Kern-Wissen

**Primär-Personas:** 🖥️ John Carmack, 🕶️ Mr. Robot  
**Sekundär:** 🧠 Andrej Karpathy, 🌌 The Nexus

> [!IMPORTANT]
> Diese Datei ergänzt `backend-mastery.md` mit fortgeschrittenen Supabase-Patterns.
> pgvector, Realtime, Database Functions, Migrations — alles was der LLM oft falsch macht.

---

## pgvector — Embedding Storage & Similarity Search

### Setup (Migration)
```sql
-- Extension aktivieren
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Tabelle mit Vector-Spalte (1536 Dimensionen für Google text-embedding-004)
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding extensions.vector(1536),  -- Google text-embedding-004 Output
  importance INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  extracted_at TIMESTAMPTZ DEFAULT now()
);

-- RLS PFLICHT (auch für Vector-Tabellen!)
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own insights" ON user_insights
  FOR ALL USING (auth.uid() = user_id);

-- HNSW Index für schnelle Similarity Search
CREATE INDEX idx_insights_embedding ON user_insights
  USING hnsw (embedding extensions.vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### Semantic Search RPC (PL/pgSQL)
```sql
CREATE OR REPLACE FUNCTION search_user_insights_semantic(
  p_user_id UUID,
  p_query_embedding extensions.vector,
  p_limit INTEGER DEFAULT 10,
  p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID, insight TEXT, category TEXT, subcategory TEXT,
  importance INTEGER, similarity FLOAT, extracted_at TIMESTAMPTZ, raw_quote TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ui.id, ui.insight, ui.category, ui.subcategory,
    ui.importance,
    1 - (ui.embedding <=> p_query_embedding) AS similarity,
    ui.extracted_at, ui.raw_quote
  FROM user_insights ui
  WHERE ui.user_id = p_user_id
    AND ui.is_active = true
    AND ui.embedding IS NOT NULL
    AND 1 - (ui.embedding <=> p_query_embedding) > p_similarity_threshold
  ORDER BY ui.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;
```

### Paperclip Embedding Pipeline (Edge Function)
```typescript
// Google text-embedding-004 (1536 Dimensionen)
const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'models/text-embedding-004',
    content: { parts: [{ text: truncatedText }] },
    outputDimensionality: 1536,  // Muss zu DB vector() matchen!
  })
});
const data = await response.json();
const embedding = data.embedding?.values;
```

### Deduplication Pattern
```typescript
// Threshold 0.92 = "fast identisch"
const similar = await supabase.rpc('find_similar_insights', {
  p_user_id: userId,
  p_new_embedding: embedding,
  p_category: insight.category,
  p_threshold: 0.92  // Hoch für Dedup, niedrig (0.7) für Retrieval
});
```

---

## Supabase Realtime

### Postgres Changes (DB → Client)
```typescript
const channel = supabase
  .channel('trace-feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'user_traces',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // payload.new = das neue Row
    addTrace(payload.new);
  })
  .subscribe();

// Cleanup:
supabase.removeChannel(channel);
```

### Broadcast (Client ↔ Client, kein DB)
```typescript
const channel = supabase.channel('room-1');

// Senden:
channel.send({ type: 'broadcast', event: 'cursor', payload: { x, y } });

// Empfangen:
channel.on('broadcast', { event: 'cursor' }, (payload) => {
  moveCursor(payload.payload);
});

channel.subscribe();
```

### Presence (Online/Offline Status)
```typescript
const channel = supabase.channel('online-users');

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  // { user-1: [{ online_at: '...', user_id: '...' }] }
});

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({ user_id: userId, online_at: new Date().toISOString() });
  }
});
```

---

## Database Migrations Best Practices

### CLI Workflow
```bash
# Migration erstellen (generiert Datei in supabase/migrations/)
npx supabase migration new create_user_goals

# Lokal anwenden
npx supabase db reset

# Remote anwenden (Production)
npx supabase db push

# Diff generieren (Schema-Änderungen erkennen)
npx supabase db diff --use-migra --schema public

# Status prüfen
npx supabase migration list
```

### Migration Template
```sql
-- supabase/migrations/20260320_create_user_goals.sql

-- 1. Tabelle
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS (PFLICHT!)
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Index
CREATE INDEX idx_goals_user_id ON user_goals (user_id);

-- 4. Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Supabase Storage

### Bucket Policies
```sql
-- Öffentlicher Bucket (z.B. Avatare)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Privater Bucket (z.B. Blutbilder)
INSERT INTO storage.buckets (id, name, public) VALUES ('health-docs', 'health-docs', false);

CREATE POLICY "Users access own docs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'health-docs' AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### File Upload Pattern (Frontend)
```typescript
const { data, error } = await supabase.storage
  .from('health-docs')
  .upload(`${userId}/bloodwork_2026.pdf`, file, {
    contentType: 'application/pdf',
    upsert: true,
  });

// URL generieren:
const { data: url } = supabase.storage
  .from('health-docs')
  .getPublicUrl(`${userId}/bloodwork_2026.pdf`);
```

---

## Edge Function Secrets Management

```bash
# Secret setzen
npx supabase secrets set MY_API_KEY=sk-...

# Secrets auflisten
npx supabase secrets list

# Secret löschen
npx supabase secrets unset MY_API_KEY

# Im Code verwenden:
const key = Deno.env.get('MY_API_KEY');
```

> **NIEMALS Secrets in Code committen. IMMER via `npx supabase secrets set`.**

---

## RLS Advanced Patterns

### Policy mit Subquery (Mehrstufig)
```sql
-- User darf Einträge sehen die zu seinem eigenen Profil gehören
CREATE POLICY "Users see own profile data" ON health_entries
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### Service Role Bypass (Edge Functions)
```typescript
// NUR in Edge Functions mit service_role_key:
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
// Umgeht RLS — NIEMALS im Frontend!
```

### Batch Operations
```sql
-- Batch Delete mit IN-Clause
DELETE FROM user_insights
WHERE user_id = auth.uid()
  AND id = ANY(ARRAY['uuid1', 'uuid2']::uuid[]);
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Warum |
|---|---|---|
| `select *` bei Vector-Tabellen | Embedding-Spalte excluden wenn nicht gebraucht | 1536 floats × N rows = teuer |
| HNSW Index mit Default-Werten | `m=16, ef_construction=64` explizit setzen | Performance-Tuning |
| Realtime ohne Filter | Immer `filter` mit `user_id` setzen | Sonst bekommt Client ALLE Updates |
| Migrations in Production editieren | Neue Migration erstellen | Idempotenz |
| Storage ohne Folder-Isolation | `/user_id/filename` Pattern | Multi-Tenant Security |
| `SECURITY DEFINER` ohne RLS-Check | `WHERE user_id = auth.uid()` in der Function | RLS-Bypass in RPCs |

---

## Offizielle Docs

| Thema | URL |
|---|---|
| Supabase Overview | https://supabase.com/docs |
| RLS Guide | https://supabase.com/docs/guides/database/postgres/row-level-security |
| pgvector | https://supabase.com/docs/guides/ai/vector-columns |
| Realtime | https://supabase.com/docs/guides/realtime |
| Storage | https://supabase.com/docs/guides/storage |
| Edge Functions | https://supabase.com/docs/guides/functions |
| CLI Reference | https://supabase.com/docs/reference/cli |
| Database Functions | https://supabase.com/docs/guides/database/functions |
| Migrations | https://supabase.com/docs/guides/local-development/overview |

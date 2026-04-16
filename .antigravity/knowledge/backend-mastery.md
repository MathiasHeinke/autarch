# Backend Mastery — Kern-Wissen für Antigravity Personas

**Primär-Personas:** 🖥️ John Carmack, 🕶️ Mr. Robot  
**Sekundär:** 🔍 Sherlock Holmes, 📡 Cypher SRE

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bevor Backend-Arbeitsaufträge ausgeführt werden.
> Edge Functions, DB-Migrations, RLS-Policies, `_shared/`-Logik.

---

## Supabase Edge Function Architecture

### Verzeichnisstruktur
```
supabase/functions/
├── _shared/                    ← EINZIGE Quelle geteilter Logik
│   ├── ai/                     ← Model Registry, Provider Routing
│   ├── context/                ← User Context Loader, Fact Snapshot, Capacity
│   ├── memory/                 ← Memory Extractor, Pattern Detector, Rolling Summary
│   ├── prompts/                ← System Prompt Builder, Unhinged Context
│   ├── routing/                ← Intent Router, Container Patterns
│   ├── search/                 ← Brave Search API
│   ├── buckets/                ← Open Buckets CRUD + Bridge
│   ├── bloodwork/              ← Bloodwork Utilities
│   └── utils/                  ← PII Scrubber, AI Provider, Trace
├── feature-orchestrator/        ← Orchestration (Non-SSE)
├── data-streaming/              ← SSE Streaming
├── metric-compute/              ← Metrics / Analytics Cache
├── search-indexer/              ← Vector Search Indexing
├── bg-task-worker/              ← Background Jobs (Queue)
├── data-export/                 ← GDPR Data Export
└── ... (weitere)
```

### Edge Function Lifecycle (Deno)
```typescript
// Standard Edge Function Pattern
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    // 1. Auth prüfen
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    
    // 2. User verifizieren
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    // 3. Business Logic
    const body = await req.json();
    // ... Logik ...
    
    // 4. Response
    return new Response(JSON.stringify({ data: result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 5. Error Handling (PFLICHT)
    console.error('[function-name]', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
```

### Cold Start Awareness
- Deno Edge Functions haben Cold Starts (~200-500ms)
- Imports aus `_shared/` werden beim Cold Start geladen
- **Weniger Imports = schnellerer Cold Start**
- Nutze barrel imports sparsam

---

## `_shared/` — Die Goldene Regel

```
ABSOLUT VERBOTEN:
  ✗ Code aus _shared/ in eine einzelne Function kopieren
  ✗ Geteilte Logik direkt in einer Function implementieren
  ✗ Absolute Pfade verwenden

PFLICHT:
  ✓ Relativer Import: import { x } from '../_shared/utils/x.ts';
  ✓ Erweitere _shared/ wenn Logik in 2+ Functions benötigt wird
```

### Module-Map

| Modul | Key-Exports | Zweck |
|---|---|---|
| `utils/piiScrubber.ts` | `scrubText`, `scrubMessages`, `scrubObject` | PII-Anonymisierung vor AI-Calls |
| `utils/aiProvider.ts` | `callClaude`, `callGemini` | AI-Provider-Abstraktion + Failover |
| `ai/modelRegistry.ts` | `getModelForType`, `ModelType` | Modell-Routing (FAST/COMPLEX/DEEP) |
| `context/userContextLoader.ts` | `loadFullUserContext` | Vollständiger User Context |
| `context/factSnapshot.ts` | `buildFactSnapshot` | Truth Layer: COUNT/EXISTS |
| `context/usageCalculator.ts` | `calculateUsageStats` | Limit/Usage Berechnung |
| `prompts/buildSystemPrompt.ts` | `buildSystemPrompt` | System-Prompt Assembly |
| `memory/memoryExtractor.ts` | `extractInsights` | Insight-Extraktion aus User-Activity |
| `routing/intentRouter.ts` | `buildLoadingManifest` | Intent → Feature Mapping |

---

## RLS-Pattern-Katalog

### Standard User-Isolation
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own data" ON table_name
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_table_user_id ON table_name (user_id);
```

### Junction Table (Many-to-Many)
```sql
CREATE POLICY "Users access via junction" ON child_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM parent_table 
      WHERE parent_table.id = child_table.parent_id 
      AND parent_table.user_id = auth.uid()
    )
  );
```

### Service Role (Edge Functions Only)
```typescript
// NUR in Edge Functions mit service_role_key
const supabaseAdmin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
// Umgeht RLS — NIEMALS im Frontend verwenden
```

---

## Error Handling Pflicht-Pattern

```typescript
// Jede Edge Function MUSS dieses Pattern nutzen:
try {
  // Business Logic
} catch (error) {
  const errorId = crypto.randomUUID().slice(0, 8);
  console.error(`[function-name][${errorId}]`, error);
  
  return new Response(JSON.stringify({
    error: 'Internal error',
    errorId, // Für User-Support tracebar
  }), { status: 500 });
}
```

---

## AI-Provider Routing

### Model Registry
```typescript
enum ModelType {
  FAST           // gemini-3-flash (Routing, Klassifikation)
  COMPLEX        // claude-sonnet-4-6 (Chat, 1M Context)
  DEEP_ANALYSIS  // claude-opus-4-6 (Extended Thinking, 1M)
  REASONING      // gemini-3-pro (Komplexe Business Logik)
  VISION         // gemini-2.5-pro (Bildanalyse)
  EMBEDDING      // text-embedding-3-small (Semantic Memory)
}
```

### Failover-Kette
```
Primär: Google Vertex AI (EU Frankfurt) → Anthropic → OpenAI
```

### PII-Scrub PFLICHT VOR jedem AI-Call
```typescript
import { scrubObject, scrubMessages } from '../_shared/utils/piiScrubber.ts';

const cleanContext = scrubObject(userContext);
const cleanMessages = scrubMessages(conversationHistory);
// ERST DANN:
const response = await callClaude(cleanMessages, cleanContext);
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Warum |
|----------|-------|-------|
| `select *` | `select('id, name, created_at')` | Performance bei großen Tabellen |
| `any` Types | Explizite Types oder Zod | Type Safety = weniger Bugs |
| Inline SQL Strings | Prepared Statements / Supabase Client | SQL Injection Schutz |
| `console.log` in Prod | Structured Logging mit Error ID | Tracierbarkeit |
| Hardcoded API Keys | `Deno.env.get('KEY')` | Security |
| Sync-Loop über DB-Rows | Batch-Operations / `.in()` | Performance |

---

## Referenz-Dateien

| Datei | Zweck |
|---|---|
| `.antigravity/skills/supabase-workflow.md` | Deployment, Migrations, Secrets |
| `docs/ARCHITECTURE.md` | System-Architektur Überblick |
| `supabase/functions/_shared/` | Geteilte Logik (Source of Truth) |

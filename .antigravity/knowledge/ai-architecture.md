# AI Architecture — Kern-Wissen für Paperclip Personas

**Primär-Personas:** 🌌 The Nexus, 🧠 Andrej Karpathy  
**Sekundär:** 🖥️ John Carmack, 🕶️ Mr. Robot

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bei AI-Feature-Design,
> Prompt Engineering, Memory Architecture und Model-Routing.

---

## Paperclip AI Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  USER (iOS App / Web)                                         │
│  └── Chat UI → ares-streaming (SSE)                          │
│  └── Score Widgets → ares-score-compute                       │
│  └── HUD → ares-hud-compute                                  │
│  └── Character → ares-character-compute                       │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  EDGE FUNCTIONS (Orchestration Layer)                          │
│                                                               │
│  Intent Router → Model Selection → Context Assembly →         │
│  PII Scrub → AI Provider Call → Response Processing          │
│                                                               │
│  Key Modules:                                                 │
│  - _shared/routing/intentRouter.ts (Intent → Container)       │
│  - _shared/ai/modelRegistry.ts (Model Selection)              │
│  - _shared/context/userContextLoader.ts (Full Context)        │
│  - _shared/prompts/buildAresSystemPrompt.ts (Prompt Build)    │
│  - _shared/utils/piiScrubber.ts (PII before AI)              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  AI PROVIDERS                                                  │
│                                                               │
│  Primary: Vertex AI (EU Frankfurt)                             │
│  ├── Gemini 3.1 Pro (Reasoning, 2M Context)                  │
│  ├── Gemini 3 Flash (Fast Routing, Classification)            │
│  └── Context Cache (Recurring System Prompts)                 │
│                                                               │
│  Fallback 1: Anthropic                                        │
│  ├── Claude Opus 4.6 (Deep Analysis, Extended Thinking)       │
│  └── Claude Sonnet 4.6 (Chat, 1M Context)                    │
│                                                               │
│  Fallback 2: OpenAI                                           │
│  ├── GPT-4o (Tool Calling)                                    │
│  └── text-embedding-3-small (Embeddings)                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Model Registry

### Model Types & Routing

| ModelType | Provider | Modell | Use Case |
|---|---|---|---|
| `FAST` | Google | gemini-3-flash | Semantic Routing, Klassifikation, Intent Detection |
| `COMPLEX` | Anthropic | claude-sonnet-4-6 | Chat, Analyse, 1M Context |
| `DEEP_ANALYSIS` | Anthropic | claude-opus-4-6 | Deep Dive, Extended Thinking, 1M Context |
| `REASONING` | Google | gemini-3-pro | Medizinische/Wissenschaftliche Logik |
| `VISION` | Google | gemini-2.5-pro | Bildanalyse (Blutbilder, Supplements) |
| `EMBEDDING` | OpenAI | text-embedding-3-small | Semantic Memory, Similarity |
| `OPENAI_CHAT` | OpenAI | gpt-4o | Tool Calling, Function Calling |
| `OPENAI_MINI` | OpenAI | gpt-4o-mini | Memory, Summary, Background Tasks |
| `PERPLEXITY` | Perplexity | sonar-pro | Live Web Research |

### Model Selection Logic
```typescript
import { getModelForType, ModelType } from '../_shared/ai/modelRegistry.ts';

// Routing: Intent bestimmt Model
const model = getModelForType(ModelType.COMPLEX);
```

---

## Memory Architecture

### 3-Tier Memory System

```
┌─────────────────────────────────────────┐
│  Short-Term Memory (Conversation)        │
│  - Rolling summary per conversation      │
│  - Token-Budget-managed window           │
│  - conversationWindow.ts                 │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│  Long-Term Memory (Insights)             │
│  - User insights extracted from chat     │
│  - Stored in user_insights table         │
│  - Relevance-scored retrieval            │
│  - memoryExtractor.ts + memoryStore.ts   │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│  Episodic Memory (Patterns)              │
│  - Cross-conversation patterns           │
│  - Contradiction detection               │
│  - Trend identification                  │
│  - patternDetector.ts                    │
└─────────────────────────────────────────┘
```

### Memory Extraction Pipeline
```typescript
// Nach jedem Chat: Insights extrahieren
const insights = await extractInsights(conversation, userContext);
await storeInsights(userId, insights); // → user_insights table
await detectPatterns(userId); // → user_patterns table
```

---

## Context Architecture ("Unhinged Mode")

### Context Layers (hierarchisch)
```
System Prompt
├── Base Identity (Paperclip Persona)
├── User Profile (Digital Twin Basis)
├── Health Context (alle Messwerte)
│   ├── Sleep Data (letzte 30 Tage)
│   ├── HRV Data (letzte 7 Tage)
│   ├── Activity Data
│   ├── Weight/Body Composition
│   ├── Supplements & Protocols
│   └── Bloodwork (letzte Ergebnisse)
├── Computed Scores (Bio.X, Bio.CAP, HUD)
├── Memory Context
│   ├── Relevant Insights
│   ├── Detected Patterns
│   └── Conversation Summary
├── Fact Snapshot (Truth Layer)
│   └── COUNT/EXISTS Guards
└── Open Buckets (Custom Data)
```

### Context Caching (Vertex AI)
```
Problem: Unhinged System Prompt = 50-100K Tokens
Solution: Vertex AI Context Cache (EU Frankfurt)
Result: TTFT von ~5s auf ~2s, 75% Kostenersparnis

Cache-Key: User ID + Context Hash
TTL: 30 Minuten (erneuert bei Änderung)
```

---

## Prompt Engineering Patterns

### Fact Snapshot (Truth Layer)
```typescript
// Verhindert Halluzinationen durch harte Fakten:
const snapshot = await buildFactSnapshot(userId);
// Enthält: "User hat 23 Sleep-Einträge, 0 Bloodwork, 5 Supplements"
// LLM kann nicht behaupten: "Laut deinem Blutbild..." wenn keine Daten da
```

### Contradiction Guard
```typescript
// Erkennt wenn User früher X sagte, jetzt Y behauptet:
const contradictions = await detectContradictions(userId, newMessage);
// "Am 15.03 sagtest du X, heute sagst du Y. Was stimmt?"
```

---

## Vertex AI Context Cache (Proprietär)

> [!IMPORTANT]
> Context Caching ist ein Vertex AI Feature das >90% Token-Kosten spart
> bei wiederholten Calls mit gleichem System Context. Paperclip nutzt dies
> für den Coach — der gesamte Digital Twin Context wird gecached.

### Funktionsweise
```
Ohne Cache:  Jeder Call sendet ~50K Tokens (System + RAG + Insights)
             → $0.002/Call × 100 Calls/Tag = $0.20/Tag/User

Mit Cache:   System + RAG werden 1x gecached, nur User-Message ist neu
             → Cache-Read: $0.0001/Call × 100 = $0.01/Tag/User (95% günstiger!)
```

### Paperclip Implementation (`vertexCache.ts`)

```typescript
// REST API Endpoint (v1beta1):
const url = `https://${location}-aiplatform.googleapis.com/v1beta1/` +
  `projects/${projectId}/locations/${location}/cachedContents`;

// Cache erstellen:
const body = {
  model: `projects/${projectId}/locations/${location}/publishers/google/models/${model}`,
  systemInstruction,  // Coach Persona Prompt
  contents,           // Digital Twin Context (RAG + Insights + Fact Snapshot)
  ttl: `${ttlSeconds}s`  // z.B. "3600s" = 1 Stunde
};

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,  // Service Account OAuth2
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body)
});

// Ergebnis: { name: "cachedContents/12345", createTime, expireTime }
```

### Cache Lifecycle
```
┌─────────────────────────────────┐
│  ares-context-warmup (Edge Fn)  │ ← Triggered wenn User Session startet
│  1. Digital Twin Context laden   │
│  2. createVertexContextCache()   │ ← TTL: 1h
│  3. Cache-Name in DB speichern   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  ares-coach (Edge Fn)            │ ← Jeder Chat-Call
│  1. Cache-Name aus DB laden      │
│  2. Vertex API Call mit:         │
│     cachedContent: "name/12345"  │
│     + nur die neue User-Message  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Cache Cleanup                   │
│  - Automatisch nach TTL          │
│  - Oder: deleteVertexContextCache│
└─────────────────────────────────┘
```

### Auth: Service Account (JWT → Access Token)
```typescript
// Paperclip nutzt Service Account Key (VERTEX_AI_CLIENT_EMAIL + VERTEX_AI_PRIVATE_KEY)
// → JWT signieren → Google OAuth2 Token Exchange
// → Bearer Token für alle Vertex AI API Calls
// Implementiert in: _shared/vertex/vertexAuth.ts
```

### Limitierungen
| Limit | Wert |
|---|---|
| Max Cache Size | 10 GB |
| Min TTL | 1 Minute |
| Max TTL | 30 Tage |
| Max Caches pro Projekt | Unbegrenzt (aber kosten!) |
| Supported Models | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0+ |
| Region Paperclip | `europe-west3` (Frankfurt) |

### Anti-Patterns: Context Cache
| ❌ Don't | ✅ Do |
|---|---|
| Cache pro Message erstellen | 1 Cache pro Session (TTL 1h) |
| TTL > 24h | Max 1-2h, User Context ändert sich |
| Cache ohne Cleanup | `deleteVertexContextCache()` bei Session-Ende |
| Kleine Contexts cachen (<500 Tokens) | Nur bei >5K Tokens lohnt sich Caching |

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Warum |
|----------|-------|-------|
| PII an externe AI senden | `scrubObject()` vorher | DSGVO |
| Hardcoded Model Names | `getModelForType(ModelType.X)` | Flexibilität |
| Ganzen Context laden | Fact Snapshot + relevante Insights | Token-Budget |
| Prompt ohne User-Context | Unhinged Context laden | Personalisierung |
| AI-Antwort unvalidiert ausgeben | Fact Snapshot als Ground Truth | Anti-Halluzination |

---

## Referenz-Dateien

| Datei | Zweck |
|---|---|
| `docs/wiki/ai-coach-system.md` | Coach-Architektur (Pflicht) |
| `supabase/functions/_shared/ai/modelRegistry.ts` | Model Registry Source |
| `supabase/functions/_shared/context/factSnapshot.ts` | Truth Layer Source |
| `supabase/functions/_shared/memory/` | Memory System Source |
| `.antigravity/knowledge/backend-mastery.md` | Edge Function Patterns |

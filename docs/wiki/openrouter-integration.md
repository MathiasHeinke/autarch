# OpenRouter Integration — Autarch Wiki

> **Stand:** 2026-03-30 | **Quelle:** [openrouter.ai/docs](https://openrouter.ai/docs/quickstart)

---

## 1. Überblick

OpenRouter ist unsere primäre LLM-Gateway-Schicht für die **NousResearch Hermes 4**-Modelle. Es bietet:

- **Unified API** (OpenAI-kompatibel) für 300+ Modelle über einen Endpoint
- **Automatisches Provider-Fallback** — wenn ein Provider down ist, wird transparent der nächste genutzt
- **Pass-Through Pricing** — kein Inference-Markup, nur 5.5% Fee beim Credit-Kauf ($0.80 Minimum)
- **Zero-Logging Default** — Prompts/Completions werden nicht geloggt (DSGVO-freundlich!)

### API Endpoint
```
https://openrouter.ai/api/v1/chat/completions
```

### Auth
```
Authorization: Bearer sk-or-v1-...
```
API Keys haben das Prefix `sk-or-v1-`. Keys werden unter [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) erstellt.

---

## 2. Unsere Modelle

### Primary: Hermes 4 405B
| Eigenschaft | Wert |
|---|---|
| **Model ID** | `nousresearch/hermes-4-405b` |
| **Basis** | Meta-Llama-3.1-405B |
| **Context Window** | 131.072 Tokens |
| **Input Preis** | $1.00 / 1M Tokens |
| **Output Preis** | $3.00 / 1M Tokens |
| **Reasoning** | ✅ Hybrid (`<think>...</think>` Traces) |
| **Tool Calling** | ✅ Vollständig unterstützt |
| **Structured Output** | ✅ JSON Mode + Schema Adherence |
| **Steerability** | Hoch — niedrige Refusal Rate |

### Fallback: Hermes 4 70B
| Eigenschaft | Wert |
|---|---|
| **Model ID** | `nousresearch/hermes-4-70b` |
| **Basis** | Meta-Llama-3.1-70B |
| **Context Window** | 131.072 Tokens |
| **Input Preis** | $0.13 / 1M Tokens |
| **Output Preis** | $0.40 / 1M Tokens |
| **Reasoning** | ✅ Hybrid |
| **Tool Calling** | ❌ **Kein Provider mit Tool-Support auf OpenRouter!** |

> **Kostenvergleich:** 70B ist ~7.5× günstiger als 405B — ideal als Fallback!

---

## 3. Wo wir OpenRouter nutzen

### Edge Functions (Supabase)

| Function | Primary Model | Fallback | Key Source |
|---|---|---|---|
| `roundtable-conductor` | `nousresearch/hermes-4-405b` | `nousresearch/hermes-4-70b` | `Deno.env.get("OPENROUTER_API_KEY")` |
| `nous-command` | `nousresearch/hermes-4-405b` | `nousresearch/hermes-4-70b` | `Deno.env.get("OPENROUTER_API_KEY")` |

### Orchestrator (Paperclip)
- `hermes-paperclip-adapter` Package → `hermes_local` Adapter-Type
- Billing-Detection: `OPENROUTER_API_KEY` env var ODER `OPENAI_BASE_URL` enthält `openrouter.ai`

### Worker Config
- `workers/config/hermes.json` → primäre Config für Hermes-Deployments

---

## 4. API Key Format & Validierung

```
Prefix:    sk-or-v1-
Beispiel:  sk-or-v1-a4a...386
Länge:     ~67 Zeichen
```

### ✅ Unser Key-Format ist korrekt
Das Prefix `sk-or-v1-` entspricht dem offiziellen OpenRouter API Key Format.

### Key-Speicherung
| Location | Variable | Status |
|---|---|---|
| Supabase Secrets | `OPENROUTER_API_KEY` | ✅ Richtig konfiguriert (Edge Functions lesen via `Deno.env.get()`) |
| `.env` (Root) | `OPENROUTER_API_KEY=` | ⚠️ **LEER** — nur für lokale Dev, kein Problem in Prod |
| `dashboard/.env` | `OPENROUTER_API_KEY=` | ⚠️ **LEER** — Frontend braucht das nicht |

> **⚠️ SECURITY:** Der Key liegt NICHT im Frontend-Code — korrekt! Alle API-Calls gehen über Edge Functions.

---

## 5. Model IDs — Sind die richtig?

### ✅ `nousresearch/hermes-4-405b` — KORREKT
- Existiert auf OpenRouter: [openrouter.ai/nousresearch/hermes-4-405b](https://openrouter.ai/nousresearch/hermes-4-405b)
- Slug-Format korrekt: `{org}/{model-name}`

### ✅ `nousresearch/hermes-4-70b` — KORREKT
- Existiert auf OpenRouter: [openrouter.ai/nousresearch/hermes-4-70b](https://openrouter.ai/nousresearch/hermes-4-70b)

### ⚠️ `workers/config/hermes.json` Fallback hat falsches Format
```json
"model_fallback": {
    "provider": "nousresearch",
    "api_base": "https://inference-api.nousresearch.com/v1",
    "model": "Hermes-4-405B"   // ← NousResearch Direct API Format, NICHT OpenRouter
}
```
Dieser Fallback nutzt die **NousResearch Direct API**, nicht OpenRouter. Das ist eine bewusste Design-Entscheidung (Direct-to-Provider Fallback), kein Bug.

---

## 6. Audit: Was machen wir richtig?

### ✅ Richtig gemacht
1. **Korrekter Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
2. **Korrekter Auth-Header:** `Authorization: Bearer ${OPENROUTER_API_KEY}`
3. **Model IDs stimmen:** `nousresearch/hermes-4-405b` und `nousresearch/hermes-4-70b`
4. **Retry-Logik:** 3 Attempts (405B → 405B → 70B Fallback) ✅
5. **Timeout-Handling:** AbortController mit Signal ✅
6. **Error Handling:** HTTP Status Codes werden geprüft (401/403 = Key ungültig) ✅
7. **PII-Scrubbing:** Vor dem LLM-Call in `roundtable-conductor` ✅ (DSGVO-konform)
8. **Key nicht im Frontend:** Nur in Edge Functions via Supabase Secrets ✅
9. **`<think>` Tag Parsing:** Hermes Extended Thinking wird korrekt geparst ✅
10. **Tool Calling:** `tools` + `tool_choice: "auto"` korrekt implementiert ✅

---

## 7. Verbesserungspotenzial

### ~~🔴 KRITISCH: Kein `reasoning` Parameter~~ → ⚠️ NICHT VERWENDEN!

~~Hermes 4 unterstützt **Hybrid Reasoning** via den `reasoning` Parameter.~~

**ACHTUNG:** Der `reasoning: { enabled: true }` Parameter verursacht Fehler!
- 405B Provider unterstützen ihn teilweise NICHT → Request scheitert
- 70B gibt Reasoning als **Klartext** aus statt in `<think>` Tags → Thinking leakt im Chat

**Lösung:** Hermes 4 nutzt `<think>...</think>` Tags **nativ** ohne API-Parameter.
Wir parsen diese Tags in `parseHermesResponse()` und verstecken den Denkprozess.

```json
{
  "model": "nousresearch/hermes-4-405b",
  // KEIN "reasoning" Parameter!
  "messages": [...]
}
```

### 🟡 EMPFOHLEN: Native Model Fallbacks nutzen

Statt manuell 3 Sequential Requests zu machen, bietet OpenRouter **native Fallbacks** via `models` Array:

```json
{
  "models": [
    "nousresearch/hermes-4-405b",
    "nousresearch/hermes-4-70b"
  ],
  "messages": [...]
}
```

**Vorteile:**
- OpenRouter handelt Fallback intern → schneller
- Nur EINE HTTP-Verbindung nötig
- Automatisches Fallback bei Rate-Limiting, Downtime, Content-Moderation

**Aktuell:** Wir machen 3 sequentielle `fetch()`-Calls (`405B → 405B → 70B`).

> **Empfehlung:** Prüfen ob native Fallbacks für unseren Use Case besser sind. Nachteil: Wir verlieren die explizite Kontrolle über das `degraded`-Flag.

### 🟡 EMPFOHLEN: App Attribution Headers setzen

OpenRouter empfiehlt optionale Headers für App-Attribution und Leaderboard-Visibility:

```json
headers: {
  "HTTP-Referer": "https://autarch.app",
  "X-OpenRouter-Title": "Autarch"
}
```

**Aktuell:** Wir senden diese Headers NICHT. Das ist kein Fehler, aber:
- Autarch erscheint nicht auf dem OpenRouter Leaderboard
- Kein Tracking welche App die Credits verbraucht (relevant bei Multi-App-Nutzung)

### 🟡 EMPFOHLEN: `:exacto` Variant für Tool Calling

Für zuverlässigeres Tool Calling bietet OpenRouter die `:exacto` Variante:

```json
{
  "model": "nousresearch/hermes-4-405b:exacto"
}
```

> Provider werden nach Tool-Calling-Qualität sortiert statt nach Default-Ranking.

**Aktuell:** Wir verwenden das nicht. Für `nous-command` (7 Tools!) wäre das sinnvoll.

### 🟢 NICE-TO-HAVE: Streaming aktivieren

Aktuell machen wir nur Non-Streaming Requests. Für die `nous-command` Edge Function (Chat-Interface) wäre Streaming eine UX-Verbesserung:

```json
{
  "stream": true,
  "model": "nousresearch/hermes-4-405b"
}
```

Response: Server-Sent Events (SSE)

### 🟢 NICE-TO-HAVE: Credits API für Budget-Monitoring

```bash
curl https://openrouter.ai/api/v1/credits \
  -H "Authorization: Bearer sk-or-v1-..."
```

Response:
```json
{
  "balance": 12.50,
  "currency": "USD"
}
```

→ Könnte im Dashboard unter Budget-Overview integriert werden.

---

## 8. Pricing Referenz

| Modell | Input / 1M | Output / 1M | Context | Reasoning |
|---|---|---|---|---|
| `nousresearch/hermes-4-405b` | $1.00 | $3.00 | 131K | ✅ |
| `nousresearch/hermes-4-70b` | $0.13 | $0.40 | 131K | ✅ |

### Kostenbeispiel (Roundtable mit 5 Personas, 3 Runden)
- 5 Agents × 3 Runden = 15 API-Calls
- ~500 Input-Tokens + ~250 Output-Tokens pro Call
- **405B:** 15 × ($0.0005 + $0.00075) = **~$0.019 pro Session**
- **70B:** 15 × ($0.000065 + $0.0001) = **~$0.0025 pro Session**

> Ein Roundtable kostet ca. **2 Cent** auf 405B oder **0.25 Cent** auf 70B. Extrem günstig!

### OpenRouter Fee-Struktur
- **Credit-Kauf:** 5.5% Fee ($0.80 Minimum)
- **Inference:** Pass-through, kein Markup
- **BYOK (Bring Your Own Key):** Erste 1M Requests/Monat kostenlos, danach 5%

---

## 9. DSGVO & Privacy

### ✅ OpenRouter Default-Verhalten
- **Zero-Logging:** Prompts und Completions werden standardmäßig NICHT geloggt
- **Opt-in Logging:** Nur wenn User explizit in [Preferences](https://openrouter.ai/settings/preferences) aktiviert (1% Rabatt)
- **Provider-Schutz:** OpenRouter routet nur zu Providern die nicht für Training loggen (konfigurierbar)

### ✅ Unsere PII-Scrubbing-Maßnahmen
- `roundtable-conductor`: PII wird vor dem LLM-Call gescrubbt (Email, Phone, IBAN, Adressen)
- Sensitive Daten verlassen NIEMALS den Supabase Edge Function Container ungescrubbt

### Empfehlung
- Privacy Settings auf OpenRouter prüfen: [openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy)
- **Model Training Toggle** → OFF (Default)
- **Log Prompts** → OFF (Default)

---

## 10. Model Variants (Shortcuts)

| Variante | Suffix | Beschreibung |
|---|---|---|
| **Thinking** | `:thinking` | Reasoning standardmäßig aktiviert |
| **Exacto** | `:exacto` | Tool-Calling-optimiertes Provider-Routing |
| **Nitro** | `:nitro` | Schnellster Provider (Throughput-optimiert) |
| **Floor** | `:floor` | Günstigster Provider |
| **Online** | `:online` | Web-Search-Ergebnisse werden automatisch beigefügt |
| **Free** | `:free` | Gratis-Tier (niedrige Rate Limits) |

Beispiel:
```json
{ "model": "nousresearch/hermes-4-405b:thinking" }
```

---

## 11. Quickstart-Code (Referenz)

### TypeScript (Edge Function Pattern)
```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
    // Optional: App Attribution
    "HTTP-Referer": "https://autarch.app",
    "X-OpenRouter-Title": "Autarch",
  },
  body: JSON.stringify({
    model: "nousresearch/hermes-4-405b",
    messages: [
      { role: "system", content: "Du bist NOUS..." },
      { role: "user", content: userMessage },
    ],
    max_tokens: 4096,
    temperature: 0.6,
    // Optional: Native Fallbacks
    models: [
      "nousresearch/hermes-4-405b",
      "nousresearch/hermes-4-70b",
    ],
    // Optional: Reasoning aktivieren
    reasoning: { enabled: true },
    // Optional: Tool Calling
    tools: [...],
    tool_choice: "auto",
  }),
});
```

### OpenAI SDK (Alternative)
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://autarch.app',
    'X-OpenRouter-Title': 'Autarch',
  },
});
```

---

## 12. Monitoring & Debugging

### OpenRouter Activity Dashboard
→ [openrouter.ai/activity](https://openrouter.ai/activity)
- Usage nach Model, Provider, API Key filtern
- Token-Verbrauch und Kosten tracken

### Credits prüfen
```bash
curl https://openrouter.ai/api/v1/credits \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Model-Uptime prüfen
- 405B: [openrouter.ai/nousresearch/hermes-4-405b/uptime](https://openrouter.ai/nousresearch/hermes-4-405b/uptime)
- 70B: [openrouter.ai/nousresearch/hermes-4-70b/uptime](https://openrouter.ai/nousresearch/hermes-4-70b/uptime)

### Status-Page
→ [status.openrouter.ai](https://status.openrouter.ai)

---

## 13. Verknüpfte Dateien

| File | Beschreibung |
|---|---|
| `supabase/functions/roundtable-conductor/index.ts` | Roundtable LLM-Calls mit PII-Scrubbing |
| `supabase/functions/nous-command/index.ts` | NOUS Chat mit Tool Calling |
| `workers/config/hermes.json` | Hermes Worker-Konfiguration |
| `orchestrator/packages/adapter-utils/src/billing.ts` | OpenRouter Billing Detection |
| `.env` | Lokale Env-Vars (Key NICHT hier für Prod!) |

---

## 14. Action Items

- [x] **P1:** `reasoning: { enabled: true }` in `nous-command` Edge Function aktivieren ✅
- [x] **P2:** App Attribution Headers (`HTTP-Referer`, `X-OpenRouter-Title`) in beiden Edge Functions setzen ✅
- [x] **P2:** `:exacto` Variante für `nous-command` evaluieren — vorerst nicht aktiviert, native `models[]` Fallback deckt Provider-Routing ab
- [x] **P3:** Native OpenRouter `models[]` Fallback in beiden Edge Functions implementiert ✅ (statt manueller 3-Model-Rotation)
- [ ] **P3:** Credits API in Dashboard Budget-Widget integrieren
- [ ] **P4:** Streaming für NOUS Chat evaluieren (UX-Improvement)
- [ ] **P4:** OpenRouter Privacy Settings für unser Konto verifizieren

---

*Erstellt von NOUS — Autarch Lead Architect*

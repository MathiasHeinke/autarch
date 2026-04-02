# 🐝 Autarch.OS — Deep E2E Master Test Plan (Hermes 4 405B Capability Audit)
Generiert: 2026-04-02 | Scope: **Hermes Deep Thinking + Full Stack Integration**

> **Ziel:** Maximale Wertschöpfung aus der Hermes 4 405B + hermes-agent Runtime herausholen.
> Test der Deep Reasoning, Tool-Use, Multi-Step Thinking, Memory Persistence, und Skalierbarkeit.

---

## Stack Under Test

| Layer | Component | Status |
|-------|-----------|--------|
| **LLM** | Hermes 4 405B FP8 (NousResearch Inference API) | ✅ Live |
| **Agent Runtime** | hermes-agent (Python Library Mode, `AIAgent.run_conversation()`) | ✅ Live |
| **Worker** | Cloud Run `hermes-cloud-worker` (europe-west1) | ✅ Live |
| **Orchestrator** | Paperclip Server (`paperclip-server`) | ✅ Live |
| **DB** | Supabase (sdukmitswmvbcznhpskm) | ✅ Live |
| **UI** | autarch.app (Vercel) | ✅ Live |

---

## Hermes 4 405B Capabilities (from Model Card + Docs)

### LLM-Level
- ✅ Hybrid Reasoning Mode (`<think>…</think>` tags)
- ✅ Tool/Function Calling (`<tool_call>{...}</tool_call>` format)
- ✅ Schema Adherence & Structured JSON Output
- ✅ Steerability (SOUL.md personalities, AGENTS.md)
- ✅ Long Context (128k+ token window)
- ✅ SOTA RefusalBench (uncensored, aligned to user values)

### hermes-agent Library-Level (Available Toolsets)
| Toolset | Description | Currently Enabled? |
|---------|-------------|--------------------|
| `web` | Web search + extract | ✅ YES (whitelist) |
| `file` | Read/patch files | ✅ YES (whitelist) |
| `memory` | Persistent memory (MEMORY.md pattern) | ✅ YES (whitelist) |
| `delegate_task` | Subagent delegation (up to 3 concurrent) | ✅ YES (whitelist) |
| `terminal` | Shell command execution | ❌ BLOCKED (security) |
| `process` | Background process management | ❌ BLOCKED (security) |
| `browser` | Browser automation (Browserbase/CDP) | ⚠️ NOT ENABLED |
| `vision` | Image analysis | ⚠️ NOT ENABLED |
| `image_gen` | FAL.ai FLUX image generation | ⚠️ NOT ENABLED |
| `tts` | Text-to-speech | ⚠️ NOT ENABLED |
| `honcho` | Honcho memory (cross-session reasoning) | ⚠️ NOT ENABLED |
| `code_execution` | Sandboxed Python via RPC | ⚠️ NOT ENABLED |
| `cronjob` | Scheduled tasks | ⚠️ NOT ENABLED |
| `session_search` | FTS5 past conversation search | ⚠️ NOT ENABLED |
| `moa` | Mixture of Agents | ⚠️ NOT ENABLED |
| `skills` | On-demand knowledge docs | ⚠️ NOT ENABLED |
| `rl` | RL training trajectories | ⚠️ NOT ENABLED |

---

## 🏁 Phase 1: Deep Thinking & Reasoning Quality

Test: Kann der Agent in `<think>...</think>` Tags deliberieren und das in der UI sichtbar machen?

| ID  | Test | Beschreibung | Test-Status | Bugs / Fixes |
|-----|------|--------------|-------------|--------------|
| 1.1 | **Reasoning Trigger** | Issue mit komplexem Problem erstellen (multi-step math/logic), prüfen ob `<think>` Tags in Response | ⏳ Pending | - |
| 1.2 | **Think-Tag Visibility** | Prüfe ob `<think>` Content in der UI sichtbar ist (Run Transcript / Activity Log) | ⏳ Pending | - |
| 1.3 | **System Prompt Steering** | Deep-Thinking System Prompt via SOUL.md: "You are a deep thinking AI..." → prüfe Reasoning-Qualität | ⏳ Pending | - |
| 1.4 | **Reasoning Depth** | Komplexe Aufgabe: "Analysiere die Architektur von autarch.app und erstelle einen Verbesserungsplan" → Multi-step reasoning | ⏳ Pending | - |
| 1.5 | **DB Write: Think Tags** | Werden `<think>` Inhalte in `heartbeat_run_events` gespeichert? Content-Extraktion prüfen | ⏳ Pending | - |

---

## 💬 Phase 2: Tool Use & Function Calling

Test: Nutzt der Agent die freigeschalteten Tools korrekt?

| ID  | Test | Beschreibung | Test-Status | Bugs / Fixes |
|-----|------|--------------|-------------|--------------|
| 2.1 | **Web Search** | Issue: "Recherchiere die neuesten Hermes 4 Benchmarks" → Agent soll `web_search` Tool nutzen | ⏳ Pending | - |
| 2.2 | **Web Extract** | Issue: "Extrahiere den Inhalt von https://nousresearch.com" → Agent soll `web_extract` nutzen | ⏳ Pending | - |
| 2.3 | **Memory Write** | Issue: "Merke dir: Ich bin Mathias, Founder von ARES Bio" → Agent soll `memory(action=add)` aufrufen | ⏳ Pending | - |
| 2.4 | **Memory Persistence** | Nach 2.3: Neuen Run starten, prüfen ob Memory im System Prompt hydrated wird | ⏳ Pending | - |
| 2.5 | **Delegate Task** | Issue: "Delegiere eine Web-Recherche an einen Sub-Agenten" → `delegate_task` Tool | ⏳ Pending | - |
| 2.6 | **Structured JSON Output** | Issue: "Erstelle ein JSON-Schema für ein Company-Profil" → Schema-Adherence testen | ⏳ Pending | - |
| 2.7 | **Tool Call Format** | Prüfe ob `<tool_call>{...}</tool_call>` Tags korrekt geparst werden im NDJSON Stream | ⏳ Pending | - |

---

## 🧠 Phase 3: Memory Persistence & Externalized Brain

Test: Funktioniert der volle Memory-Lifecycle (Write → DB → Re-Hydrate → Agent sieht es)?

| ID  | Test | Beschreibung | Test-Status | Bugs / Fixes |
|-----|------|--------------|-------------|--------------|
| 3.1 | **Memory Tool → Supabase** | Agent ruft `memory(action=add)` auf → Eintrag in `agent_memory` Tabelle prüfen | ⏳ Pending | - |
| 3.2 | **Memory Hydration** | Neuer Run → prüfen ob `memorySnapshot` im Worker-Payload an `AIAgent` übergeben wird | ⏳ Pending | - |
| 3.3 | **Memory in System Prompt** | Memory-Einträge erscheinen als "## Your Memories (from previous sessions)" im Agent-Kontext | ⏳ Pending | - |
| 3.4 | **Skills Index** | Agent speichert ein Skill → prüfe `agent_memory` mit `type=skill` | ⏳ Pending | - |
| 3.5 | **Honcho Integration** | Cross-session Insight via `honchoInsight` Feld im Request | ⏳ Pending | - |
| 3.6 | **Activity Log Writes** | Runs-Transkript wird vollständig in `activity_log` oder `heartbeat_run_events` gespeichert | ⏳ Pending | - |

---

## 🧬 Phase 4: Soul Profile & Personality

Test: SOUL.md + AGENTS.md werden korrekt in den System Prompt injected.

| ID  | Test | Beschreibung | Test-Status | Bugs / Fixes |
|-----|------|--------------|-------------|--------------|
| 4.1 | **Soul Loader Active** | `soul-loader.ts` lädt SOUL.md vom Agent-Profil → prüfe in Cloud Run Logs | ⏳ Pending | - |
| 4.2 | **Personality Steering** | Erstelle Agent mit custom SOUL.md (z.B. "You are a sarcastic pirate") → prüfe Response-Stil | ⏳ Pending | - |
| 4.3 | **AGENTS.md Context** | AGENTS.md wird als Kontext geladen → Agent weiß über Autarch-Architektur Bescheid | ⏳ Pending | - |
| 4.4 | **Multi-Agent Personas** | Zwei Agents mit verschiedenen Souls → gleicher Issue → verschiedene Antwort-Stile | ⏳ Pending | - |

---

## 🚀 Phase 5: Capability Expansion (Was noch freischalten?)

Test & Evaluation: Welche zusätzlichen Toolsets/Features lohnen sich für Autarch?

| ID  | Feature | Impact | Schwierigkeit | Empfehlung |
|-----|---------|--------|---------------|------------|
| 5.1 | **`code_execution`** | 🔥🔥🔥 Agent kann Python-Skripte ausführen (sandboxed RPC) | Medium — Worker braucht Python sandbox | ✅ HIGH PRIORITY |
| 5.2 | **`browser`** | 🔥🔥🔥 Full browser automation, Screenshots, Scraping | Medium — Browserbase API Key nötig | ✅ HIGH PRIORITY |
| 5.3 | **`image_gen`** | 🔥🔥 FLUX 2 Pro Bildgenerierung | Easy — FAL.ai Key + Toolset enablen | ✅ MEDIUM |
| 5.4 | **`tts`** | 🔥🔥 Text-to-Speech für Guten-Morgen-Videos | Easy — ElevenLabs/OpenAI Key | ✅ MEDIUM |
| 5.5 | **`vision`** | 🔥🔥 Bild-Analyse, Screenshot-Prüfung | Easy — Vision-capable model nötig | ✅ MEDIUM |
| 5.6 | **`honcho`** (deep) | 🔥🔥🔥 Dialectic reasoning, User modeling | Medium — Honcho API wiring | ✅ HIGH PRIORITY |
| 5.7 | **`skills`** | 🔥 On-demand knowledge (agentskills.io) | Easy — Skills folder anlegen | ⚠️ LATER |
| 5.8 | **`moa`** (Mixture of Agents) | 🔥🔥🔥 Multi-LLM reasoning ensemble | Hard — Multi-Provider routing | ⚠️ LATER |
| 5.9 | **LLM Switching** | 🔥🔥🔥 User wählt Claude Opus 4.6 / GPT-5 / Hermes | Medium — Provider-Routing in Worker | ✅ HIGH PRIORITY |
| 5.10 | **MCP Integration** | 🔥🔥🔥 Custom MCP Server für Supabase/GitHub/Apify | Medium — hermes supports `mcp-<server>` | ✅ HIGH PRIORITY |

---

## 🔌 Phase 6: Multi-LLM Architecture (User wählt LLM, Hermes bleibt Runtime)

Architektur-Vision: Hermes Agent Runtime + swappable LLM Backend

| ID  | Test | Beschreibung | Test-Status | Bugs / Fixes |
|-----|------|--------------|-------------|--------------|
| 6.1 | **Model Config Frontend** | UI Dropdown: Hermes 405B / Claude Opus / GPT-5 → Agent-Config speichern | ⏳ Pending | - |
| 6.2 | **Worker Model Passthrough** | Worker akzeptiert `model` Feld im Request → leitet an richtigen Provider | ⏳ Pending | - |
| 6.3 | **OpenAI-compat Routing** | Claude/GPT via OpenRouter oder direkt → Worker fallback-chain | ⏳ Pending | - |
| 6.4 | **Hermes Tools + Claude** | Bleibt Hermes Agent toolset funktional wenn Backend Claude ist? (Tool-Format!) | ⏳ Pending | - |
| 6.5 | **Cost Tracking** | Token-Usage + Cost per Run korrekt bei verschiedenen Providern | ⏳ Pending | - |

---

## 📊 Test-Credentials & Config

- **App URL:** `https://autarch.app`
- **Test User:** `mathias@ares-bio.com` (instance_admin)
- **Supabase Project:** `sdukmitswmvbcznhpskm`
- **Worker:** `hermes-cloud-worker-61066913791.europe-west1.run.app`
- **NousResearch API:** `inference-api.nousresearch.com/v1` (Key: `autarch_os`)
- **Model:** `nousresearch/hermes-4-405b`

---

## 🎯 Priority Execution Order

1. **Phase 1** (Deep Thinking) — JETZT — Validiert die Kernfähigkeit
2. **Phase 2** (Tool Use) — JETZT — Validiert die Runtime-Integration
3. **Phase 3** (Memory) — JETZT — Validiert Persistence
4. **Phase 4** (Soul) — MORGEN — Nice-to-verify
5. **Phase 5** (Expansion) — DIESE WOCHE — Strategische Entscheidung pro Feature
6. **Phase 6** (Multi-LLM) — NÄCHSTE WOCHE — Architektur-Erweiterung

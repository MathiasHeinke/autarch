# Progress: Paperclip (Autarch)

> Letztes Update: 2026-04-03 (Post-Gemini-Migration v0.7.0)

## ✅ Abgeschlossen (Completed)

### Workspace-Initialisierung
- ✅ Antigravity Kit (`.antigravity/` + 21 Personas + 9 Workflows) von antigravity-kit nach autarch übertragen.
- ✅ `.rules` Workspace-Richtlinie angelegt (Boot-Sequenz, Architektur-Grenzen).
- ✅ Platzhalter (`[PROJEKT]` / `[projekt-repo]`) auf Paperclip/autarch umgeschrieben.
- ✅ Memory Bank initialisiert (projectbrief, productContext, techContext, systemPatterns).

### Doku-Migration (strategos → autarch)
- ✅ **Wiki:** 10 Dokumente migriert (hermes-agent, paperclip-integration, openrouter, apify-mcp, local-tools, roundtable, ux-architecture, upload-post-api, cloud-run-supabase, honcho-self-host).
- ✅ **Audits:** 2 Audit-Reports migriert (Phase 1-4 Full System, Cost Dashboard).
- ✅ **Workers:** Kompletter `workers/` Ordner migriert (Dockerfile, hermes-setup.sh, config, 23 agents, 3 skills).
- ✅ **Memory Bank:** 6 Referenz-Dokumente migriert (data-model-map, edge-function-registry, infrastructure-map, knowledge-index, module-interaction-map, paperclip-glossar).

### Architektur-Decisions (ADRs)
- ✅ Hermes als primärer Agent-Adapter (Python Library Mode, stateless).
- ✅ OpenRouter als LLM Gateway (Hermes 4 405B/70B).
- ✅ Cloud Run als Worker-Plattform (Scale-to-Zero, stateless).
- ✅ Supabase RLS für Multi-Tenancy (company_id scoping).

### 🏰 Hermes Stateless Engine Refactoring (6 Phasen)
- ✅ **Phase 1:** Gateway Security — `X-Hermes-Secret` Auth, Dead Code Cleanup (Fortress Gate 1 PASSED)
- ✅ **Phase 2:** Library Refactor — `AIAgent.run_conversation()` + NDJSON Usage Pipeline (Fortress Gate 2 PASSED)
- ✅ **Phase 3:** UI Feature Flag — `HERMES_ONLY_MODE` Enterprise Mode (Fortress Gate 3 PASSED)
- ✅ **Phase 4:** Externalized Brain — `agent_memory` Schema + Worker Memory Hydration (Fortress Gate 4 PASSED)
- ✅ **Phase 5:** Memory Lifecycle Bridge — Pre-Load/Post-Persist in Heartbeat Service (Fortress Gate 5 PASSED)
- ✅ **Phase 6:** Honcho Integration — REST Client + Cross-Session Reasoning + Self-Host Docs (Fortress Gate 6 PASSED)

#### Neue Dateien (durch Refactoring)
| Datei | Typ | Zweck |
|-------|-----|-------|
| `server/src/adapters/hermes-cloud/memory-lifecycle.ts` | Server | DB Pre-Load/Post-Persist |
| `server/src/adapters/hermes-cloud/honcho-client.ts` | Server | Honcho REST Client |
| `ui/src/lib/featureFlags.ts` | UI | Enterprise Feature Flags |
| `packages/db/src/schema/agent_memory.ts` | DB | Externalized Brain Schema |
| `docs/wiki/honcho-self-host.md` | Docs | Honcho Self-Hosting Guide |

### 🔬 Deep Research v4 — Ground of Truth (9 Phasen)
- ✅ **Phase 0:** File Manifest — 1.467 Dateien indexiert
- ✅ **Phase 1:** Git Archaeology — 1.846 Commits, 68 Contributors, 6 Epochen
- ✅ **Phase 2:** Schema Evolution — 47 Migrations, 59 Schema-Files, 66 Tabellen
- ✅ **Phase 3:** Module Deep Dive — 65 Services, 24 Routes, 7 Adapters, 40 Pages, 81 Components
- ✅ **Phase 4-6:** Knowledge Index — 111 Docs, Freshness Assessment
- ✅ **Phase 7:** Module Interaction Map — 5 Pipelines + Cross-Domain Wiring
- ✅ **Phase 8:** Infrastructure Map — Env Vars, Dependencies, Docker
- ✅ **Phase 9:** Ground of Truth Synthesis — `memory-bank/ground-of-truth.md`

#### Neue Memory Bank Dateien (durch Deep Research)
| Datei | Zweck |
|-------|-------|
| `memory-bank/file-manifest.md` | 1.467 Dateien Index |
| `memory-bank/architecture-timeline.md` | Git Archaeology (1.846 Commits) |
| `memory-bank/data-model-map.md` | ER-Mapping (66 Tabellen) |
| `memory-bank/edge-function-registry.md` | Module Census (211+ Module) |
| `memory-bank/knowledge-index.md` | 111 Docs Freshness |
| `memory-bank/module-interaction-map.md` | 5 Pipeline Diagramme |
| `memory-bank/infrastructure-map.md` | Env/Docker/Services |
| `memory-bank/ground-of-truth.md` | Synthesis Atlas |

#### Findings
- **27 Monster Files** (>1.000 Zeilen) identifiziert
- **5 verwaiste Schema-Dateien** + **5 verwaiste Migration-Tabellen**
- **77 stale Docs** (>7 Tage), davon **3 kritisch stale** (>30 Tage)
- **heartbeat.ts** als komplexestes Modul (4.038 LoC)

### 🔧 Hermes Worker Production Fix (2026-04-03)
- ✅ **Auth Fix:** `.strip()` on `HERMES_CLOUD_SECRET` — Whitespace from Secret Manager caused 401s
- ✅ **AIAgent kwargs:** Removed unsupported `mcp_config_path` + `skills_dir` from `AIAgent.__init__()`
- ✅ **NousResearch API Key:** Created in GCP Secret Manager + IAM Policy + Cloud Run mount
- ✅ **E2E Inference:** Health=healthy, apiConnected=true, "Hello!" in 4135ms, $0.000145

### 🧪 Deep E2E Test (2026-04-03, 19:07-19:27)
- ✅ **Phase 1:** Infrastructure Smoke — 4/4 passed (Worker, UI, Login, Company)
- ✅ **Phase 2:** Agent Inference Pipeline — 4/4 passed (ARE-6, Run 199cbd0d, "Hello from Hermes!", 3637ms)
- ✅ **Phase 3:** Memory Persistence — 4/4 passed after bugfix
  - 🐛 **Bug found:** `memory-lifecycle.ts` — Hermes `arguments` is JSON string, not object → empty content
  - 🔧 **Fix:** `typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs`
  - ✅ **Retest:** ARE-8, Run 79299908 → "Company is ARES, product is Bio.OS" korrekt gespeichert
- ⚠️ **Phase 4:** Known Issues — WebSocket failures, heartbeat 404s, doppelter Company Name (non-critical)

### 🧹 Production DB Cleanup (2026-04-03, 19:35-20:10)
- ✅ **Failed Runs gelöscht:** 7 failed heartbeat_runs entfernt (32 succeeded beibehalten)
- ✅ **EETA Test-Companies gelöscht:** Full FK-Kaskade für `65bec1c0` + `b541713c` (48 Tabellen)
- ✅ **Company Name Fix:** "ARES Bio.OSARES Bio.OS" → "ARES Bio.OS"
- ✅ **WebSocket Reconnect Cap:** Max 5 Retries statt endlos (Console-Spam gestoppt)
- ✅ **Vercel Redeploy:** `autarch.app` mit WS-Cap deployed

- ✅ **Heartbeat Cron aktiviert:** 5min Intervall (300s), erster Auto-Run `b4458d7a` um 18:22 succeeded

### 🚀 Gemini Migration v0.7.0 (2026-04-03)
- ✅ **Inference-Backend:** NousResearch Hermes-4-405B → Google Gemini 3.1 Pro Preview
- ✅ **3-Parameter-Swap:** `base_url`, `api_key`, `model` — hermes-agent Library 100% erhalten
- ✅ **Dual-Model Routing:** Adapter klassifiziert Tasks → Pro (komplex) oder Flash (simpel)
- ✅ **GCP Secret:** `google-api-key` angelegt + IAM Binding
- ✅ **Cloud Run:** Revision 00024-6jb deployed, Health: `{status: healthy, version: 0.7.0}`
- ✅ **Git:** Commit `f5f8cdca`, pushed to master

## 🔄 In Arbeit (In Progress)
- E2E Smoke Test mit Gemini-Backend (echten Agent-Run über Paperclip UI triggern)

## 📋 Offen (To-Do)

### P0 — Deployment & E2E
- [x] Worker Docker Image builden und auf Cloud Run deployen. ✅ (2026-04-01)
- [x] Honcho Self-Hosted Instance aufsetzen (Docker Compose). ✅ (2026-04-01, v3.0.3, localhost:8100)
- [x] End-to-End-Test: Task → Heartbeat → Worker → Memory → Honcho. ✅ (2026-04-01, 16/16 Steps)

### P1 — Integration Completion
- [x] Worker Agents (23 Persona-Dirs) auf Library Mode migrieren. ✅ (2026-04-02 — soul-loader.ts, profileName → SOUL.md + AGENTS.md + HEARTBEAT.md in System-Prompt)
- [ ] Custom Autarch-MCP-Server implementieren (Supabase-Zugriff).
- [x] Heartbeat-Cron im Orchestrator aktivieren (5-Min-Intervall). ✅ (2026-04-03, intervalSec=300)
- [ ] WebSocket richtig lösen (Custom Domain auf Cloud Run ODER SSE Fallback).

### P2 — Dashboard Fixes (aus Audit)
- [ ] C-001: Issue Status-Mutation verdrahten (statt console.log).
- [ ] C-002: Bulk Action Mutations verdrahten.
- [ ] W-002: CommandPalette Search implementieren.
- [ ] W-001: alert() durch Toast-System ersetzen.

### P3 — Production Hardening
- [ ] OpenRouter Credits API in Dashboard Budget-Widget integrieren.
- [ ] Streaming für NOUS Chat evaluieren.
- [ ] Error Boundary + Global Error Handler implementieren.
- [ ] Vitest + React Testing Library Setup für Dashboard.

### 🚀 Cloud-Native Deployment (2026-04-02)
- ✅ **Vercel** — UI deployed auf `autarch.app` (Domain bei AllInkl via CNAME)
- ✅ **Cloud Run** — Paperclip Server (`paperclip-server`) + Hermes Worker (`hermes-cloud-worker`) in `ares-488111`
- ✅ **Supabase** — Production DB `Autarch.OS` (`sdukmitswmvbcznhpskm`, eu-west-1)
- ✅ **Admin Bootstrap** — User `mathias@ares-bio.com` als `instance_admin` promoted
- ✅ **NousResearch API** — ~~Hermes-4-405B~~ → Replaced by Gemini 3.1 Pro Preview (v0.7.0, 2026-04-03)
- ✅ **Supabase MCP** — Live in Antigravity IDE (`sbp_1c5...`)
- ✅ **E2E Onboarding** — Company → Agent → Issue → Run erfolgreich (3/3 Runs succeeded)

## ⚠️ Known Issues / Blocker
- ~~**Honcho noch nicht deployed**~~ → ✅ Deployed: Docker Compose `localhost:8100` (v3.0.3)
- ~~**Cloud Run Worker noch nicht deployed**~~ → ✅ Deployed: `hermes-cloud-worker-61066913791.europe-west1.run.app`
- ~~**Hermes Response wrapped in tool_call**~~ → ✅ Fixed: `is not None` check (Hotfix, 97% Token-Reduction)
- ~~**Paperclip Server nur lokal**~~ → ✅ Cloud Run: `paperclip-server-61066913791.europe-west1.run.app`
- ~~**NousResearch API Key falsch**~~ → ✅ Fixed: Key `autarch_os` deployed
- ~~**EETA Test-Companies**~~ → ✅ Gelöscht: Full FK-Kaskade (48 Tabellen)
- ~~**Agent Memory leer**~~ → ✅ Fixed: JSON-String Parsing in memory-lifecycle.ts
- **WebSocket via Vercel** — Vercel proxy unterstützt kein WS-Upgrade. Reconnect auf 5 Retries gecappt. UI funktioniert via HTTP Polling. Langfristig: Custom Domain auf Cloud Run oder SSE Fallback.
- **Dashboard hat keine Unit-Tests** — für V1 akzeptabel, V2 muss Tests einführen.


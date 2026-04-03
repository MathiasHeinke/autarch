# Active Context: Paperclip (Autarch)

> Letztes Update: 2026-04-03 (Post Hermes Worker Fix + E2E Inference Verified)

## Aktueller Fokus
**Session 2026-04-03:** Hermes Cloud Worker vollständig live — Auth-Fix (secret whitespace), AIAgent kwargs cleanup, NousResearch API Key deployed, E2E Inference verified ("Hello!" in 4135ms).

### ✅ Hermes Worker Production Fix (2026-04-03)
- `config.py`: `.strip()` auf HERMES_CLOUD_SECRET — Whitespace aus Secret Manager bereinigt
- `main.py`: Unsupported kwargs `mcp_config_path` + `skills_dir` aus AIAgent init entfernt
- GCP Secret Manager: `nousresearch-api-key` angelegt + IAM Policy + Cloud Run mount
- E2E Smoke Test: Health=healthy, apiConnected=true, Inference 4135ms ✅

### ✅ Hermes Autonomous Expansion (5 Phasen — 2026-04-03)
- Phase 1: ALLOWED_TOOLSETS → 9 (todo, skills, vision, session_search, honcho)
- Phase 2: agent_memory unique index + atomic upsert
- Phase 3: MCP/Apify Integration (Dockerfile + config)
- Phase 4: Cohere Transcribe Pipeline (Dockerfile)
- Phase 5: Honcho POST /v1/apps/.../sessions/.../chat wiring

### ✅ Deep Research v4.1 + Deployment Sync (COMPLETE)
- Ground of Truth Atlas v4.1, Cloud Run LIVE, Honcho LIVE, E2E 16/16 PASSED

### ✅ Hermes Stateless Engine Refactoring (6 Phasen — COMPLETE)
- Gateway Security, Library Refactor, HERMES_ONLY_MODE, Externalized Brain, Memory Lifecycle, Honcho

## Wo finde ich was?

### Architektur & Research
| Frage | Antwort (Datei) |
|-------|-----------------|
| **Nordstern + Architektur-Gesetz?** | `memory-bank/semantic-context.md` Section 0 |
| **Kompletter Architektur-Atlas?** | `memory-bank/ground-of-truth.md` |
| Alle Dateien im Repo? | `memory-bank/file-manifest.md` |
| Alle DB-Tabellen & Migrations? | `memory-bank/data-model-map.md` |
| Alle Server-Module & UI Pages? | `memory-bank/edge-function-registry.md` |
| Wie interagieren Module? | `memory-bank/module-interaction-map.md` |
| Env Vars, Docker, Dependencies? | `memory-bank/infrastructure-map.md` |

### Code Quick-Access
| Was | Wo |
|-----|-----|
| Kern-Orchestrator | `server/src/services/heartbeat.ts` (4.055 LoC) |
| Soul-Loader | `server/src/adapters/hermes-cloud/soul-loader.ts` |
| Memory Lifecycle | `server/src/adapters/hermes-cloud/memory-lifecycle.ts` |
| Honcho Client | `server/src/adapters/hermes-cloud/honcho-client.ts` |
| Execute Bridge | `server/src/adapters/hermes-cloud/execute.ts` |
| Agent Personas | `workers/agents/{profileName}/SOUL.md` |
| Hermes Worker | `workers/hermes-cloud/main.py` |

## Nächste Schritte (P1)
1. **Deep E2E Test** — Full system test via autarch.app Browser
2. **Custom Autarch-MCP-Server** — Supabase-Zugriff für Hermes-Agents
3. **Heartbeat-Cron aktivieren** — 5-Min-Intervall

## Kürzliche Änderungen (diese Session)
- `workers/hermes-cloud/main.py` — Unsupported kwargs entfernt (mcp_config_path, skills_dir)
- `workers/hermes-cloud/config.py` — `.strip()` auf HERMES_CLOUD_SECRET
- GCP Secret Manager — `nousresearch-api-key` angelegt + mounted
- Cloud Run — Rev `hermes-cloud-worker-00021-s54` deployed, E2E verified

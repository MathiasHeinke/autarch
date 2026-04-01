# Active Context: Paperclip (Autarch)

> Letztes Update: 2026-04-02 (Post Soul-Loader Ship)

## Aktueller Fokus
**Session 2026-04-02:** semantic-context.md v2.0 (Founder Vision "Go Native" verankert) + Soul-Loader shipped — G-008 geschlossen.

### ✅ Deep Research v4.1 + Deployment Sync (COMPLETE)
- Ground of Truth Atlas v4.1, Cloud Run LIVE, Honcho LIVE, E2E 16/16 PASSED

### ✅ Hermes Stateless Engine Refactoring (6 Phasen — COMPLETE)
- Gateway Security, Library Refactor, HERMES_ONLY_MODE, Externalized Brain, Memory Lifecycle, Honcho

### ✅ Soul-Loader — G-008 geschlossen (2026-04-02)
- `soul-loader.ts`: Lädt SOUL.md + AGENTS.md + HEARTBEAT.md für profileName
- `heartbeat.ts`: Soul pre-load nach Honcho-Block → `context.hermesAgentSoul`
- `execute.ts`: `buildSoulSystemPrompt()` → systemPrompt prefix
- typecheck: Exit 0 ✅

### ✅ semantic-context.md v2.0 — /mt-arch Mastertable (2026-04-02)
- Nordstern (Founder Vision), 5 Directives, 9 Gotchas, 4 SGs, Dependency Graph, Modul-Index

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
| **Soul-Loader** | `server/src/adapters/hermes-cloud/soul-loader.ts` ← NEU |
| Memory Lifecycle | `server/src/adapters/hermes-cloud/memory-lifecycle.ts` |
| Honcho Client | `server/src/adapters/hermes-cloud/honcho-client.ts` |
| Execute Bridge | `server/src/adapters/hermes-cloud/execute.ts` |
| Agent Personas | `workers/agents/{profileName}/SOUL.md` |
| Hermes Worker | `workers/hermes-cloud/main.py` |

## Nächste Schritte (P1)
1. **Custom Autarch-MCP-Server** — Supabase-Zugriff für Hermes-Agents direkt aus Paperclip DB.
2. **Heartbeat-Cron aktivieren** — 5-Min-Intervall in Orchestrator enablen (`pnpm paperclipai onboard`).
3. **heartbeat.ts Refactoring** — Monster File (4.055 LoC) nach Sub-Modulen aufteilen.

## Kürzliche Änderungen (diese Session)
- `memory-bank/semantic-context.md` v2.0 — Founder Vision + /mt-arch Mastertable (350 Zeilen)
- `.antigravity/logs/architect-memory.md` — SG-001–004, 7 Active Directives, Session Log
- `server/src/adapters/hermes-cloud/soul-loader.ts` — NEU: Soul Profile Loader
- `server/src/adapters/hermes-cloud/execute.ts` — Soul → systemPrompt prefix
- `server/src/services/heartbeat.ts` — Soul pre-load block
- `memory-bank/progress.md` — G-008 closed

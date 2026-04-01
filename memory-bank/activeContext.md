# Active Context: Paperclip (Autarch)

> Letztes Update: 2026-04-01 (Post Deep Research v4)

## Aktueller Fokus
Deep Research v4 abgeschlossen — **Ground of Truth** Atlas erstellt mit 9-phasiger exhaustiver Analyse des gesamten Repos.

### ✅ Deep Research v4 (9 Phasen — COMPLETE)
- **Phase 0:** File Manifest — 1.467 Dateien indexiert
- **Phase 1:** Git Archaeology — 1.846 Commits, 68 Contributors, 6 Architektur-Epochen
- **Phase 2:** Schema Evolution — 47 Migrations, 59 Schema-Files, 66 Tabellen, 5 Orphans
- **Phase 3:** Module Deep Dive — 65 Services, 24 Routes, 7 Adapters, 40 Pages, 81 Components
- **Phase 4-6:** Knowledge Index — 111 Docs, Freshness Assessment (🟢6 🟡74 🔴3)
- **Phase 7:** Module Interaction Map — 5 Pipelines + Cross-Domain Wiring
- **Phase 8:** Infrastructure Map — Env Vars, Dependencies, Docker, External Services
- **Phase 9:** Ground of Truth Synthesis — Alles in einem Atlas

### ✅ Hermes Stateless Engine Refactoring (6 Phasen — COMPLETE)
- Gateway Security, Library Refactor, UI Feature Flag, Externalized Brain, Memory Lifecycle Bridge, Honcho Integration

### ✅ Abgeschlossene Migration (strategos → autarch)
- Wiki: 10 Docs, Audits: 2, Workers: Dockerfile + 23 Agent-Personas + 3 Skills, Memory Bank: 14 Referenz-Dokumente

## Wo finde ich was?

### Architektur & Research
| Frage | Antwort (Datei) |
|-------|-----------------| 
| **Kompletter Architektur-Atlas?** | `memory-bank/ground-of-truth.md` |
| Alle Dateien im Repo? | `memory-bank/file-manifest.md` |
| Git-Evolution (Epochen)? | `memory-bank/architecture-timeline.md` |
| Alle DB-Tabellen & Migrations? | `memory-bank/data-model-map.md` |
| Alle Server-Module & UI Pages? | `memory-bank/edge-function-registry.md` |
| Welche Docs sind veraltet? | `memory-bank/knowledge-index.md` |
| Wie interagieren Module? | `memory-bank/module-interaction-map.md` |
| Env Vars, Docker, Dependencies? | `memory-bank/infrastructure-map.md` |

### Paperclip Domain Knowledge
| Frage | Antwort (Datei) |
|-------|-----------------| 
| Wie funktioniert der Hermes Agent? | `docs/wiki/hermes-agent.md` |
| Wie integriert Paperclip? | `docs/wiki/paperclip-integration.md` |
| Welche LLM-Modelle nutzen wir? | `docs/wiki/openrouter-integration.md` |
| Was bedeutet "Agentur" vs "Company"? | `memory-bank/paperclip-glossar.md` |
| Cloud Run Deployment? | `docs/wiki/cloud-run-supabase-architecture.md` |
| Honcho Self-Hosting? | `docs/wiki/honcho-self-host.md` |
| V1 Build Contract? | `doc/SPEC-implementation.md` |

### Code Quick-Access
| Was | Wo |
|-----|----|
| Kern-Orchestrator | `server/src/services/heartbeat.ts` (4.038 LoC) |
| Memory Lifecycle | `server/src/adapters/hermes-cloud/memory-lifecycle.ts` |
| Honcho Client | `server/src/adapters/hermes-cloud/honcho-client.ts` |
| Adapter Registry | `server/src/adapters/registry.ts` |
| Externalized Brain Schema | `packages/db/src/schema/agent_memory.ts` |
| Feature Flags | `ui/src/lib/featureFlags.ts` |
| Hermes Worker | `workers/hermes-cloud/main.py` |

## Nächste Schritte
1. **Worker Deployment** — Docker Image builden, Cloud Run Service konfigurieren.
2. **Honcho Self-Host** — Docker Compose aufsetzen.
3. **E2E Test** — Task → Heartbeat → Worker → Memory → Honcho.
4. **heartbeat.ts Refactoring** — Monster File (4.038 LoC) aufteilen.
5. **Stale Docs updaten** — `doc/GOAL.md`, `doc/TASKS.md`, `doc/TASKS-mcp.md`.

## Kürzliche Änderungen
- Deep Research v4 Ground of Truth erstellt (9 Phasen).
- 8 neue Memory Bank Dateien: file-manifest, architecture-timeline, data-model-map, edge-function-registry, knowledge-index, module-interaction-map, infrastructure-map, ground-of-truth.
- 27 Monster Files (>1kLoC) identifiziert, 5 verwaiste Schema-Dateien, 77 stale Docs.

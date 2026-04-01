# Tech Context: Paperclip (Autarch)

> Letztes Update: 2026-04-01 (Post-Refactoring)

## Architektur-Ebenen (Monorepo)
- `server/`: Express REST API und Orchestrierungs-Services (Port 3100).
- `ui/`: React + Vite Board UI (wird im Dev via API-Server Middleware bedient).
- `packages/db/`: Drizzle ORM Schema, lokale Migrationen, DB Clients.
- `packages/shared/`: Geteilte Typen, Konstanten, Validatoren, API Pfade.
- `packages/adapters/`: Agenten-Adapter (Claude, Codex, Cursor, **Hermes**).
- `packages/adapter-utils/`: Getrennte Utilities für die Implementierungen.
- `packages/plugins/`: Plugin-System Packages.

## Hermes Cloud Worker (Stateless Inference Engine)
- `workers/hermes-cloud/`: FastAPI Worker für Cloud Run Deployment.
- `workers/hermes-cloud/main.py`: Stateless Execution Engine — `AIAgent.run_conversation()` mit `skip_memory=True`.
- `workers/hermes-cloud/models.py`: Pydantic Request/Response Schemas (ExecuteRequest, ExecuteEvent, MemoryEntry).
- `workers/hermes-cloud/config.py`: Security Config (ALLOWED/BLOCKED_TOOLSETS, MAX_ITERATIONS).
- `workers/hermes-cloud/Dockerfile`: Python 3.12-slim + Hermes Library (pip install from git).

### Stateless Design
- Worker hat **keine eigene Datenbank** — alle Migrationen gelöscht.
- Memory/Skills werden pro Request aus Paperclip DB injiziert (`memorySnapshot`, `skillsIndex`).
- Honcho Insights werden optional als `honchoInsight` im Payload geliefert.
- Gateway Security via `X-Hermes-Secret` Header.
- Usage Reports (Tokens, Cost) werden als NDJSON Events gestreamt.

## Server-Side Hermes Integration
- `server/src/adapters/hermes-cloud/execute.ts`: Adapter → Worker HTTP Bridge.
- `server/src/adapters/hermes-cloud/memory-lifecycle.ts`: `loadAgentMemories()` + `persistNewMemories()`.
- `server/src/adapters/hermes-cloud/honcho-client.ts`: REST Client für Honcho (ingest, query, context).
- `server/src/adapters/hermes-cloud/pii-scrub.ts`: PII-Scrubbing vor Worker-Dispatch.
- `server/src/services/heartbeat.ts`: Pre-Load Memory/Honcho Hooks + Post-Persist Memory/Honcho Hooks.

## Externalized Brain (DB Schema)
- `packages/db/src/schema/agent_memory.ts`: `agent_memory` Tabelle.
- Felder: `company_id`, `agent_id`, `key`, `content`, `category`, `importance`, `source_run_id`.
- Company-Scoped — kein Cross-Tenant Zugriff.
- Migration: `0046_lame_junta.sql`.

## UI Enterprise Mode
- `ui/src/lib/featureFlags.ts`: `HERMES_ONLY_MODE` (via `VITE_HERMES_ONLY_MODE`).
- Wenn aktiv: Adapter-Picker wird übersprungen, `hermes_cloud` ist Default.

## LLM Gateway (OpenRouter)
- **Primary Model:** `nousresearch/hermes-4-405b` ($1/1M in, $3/1M out, 131K ctx).
- **Fallback Model:** `nousresearch/hermes-4-70b` ($0.13/1M in, $0.40/1M out).
- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Auth:** `Authorization: Bearer sk-or-v1-...` (Supabase Secrets in Prod).
- **Details:** → `docs/wiki/openrouter-integration.md`

## Datenbank & Environment
- **Produktion:** Supabase PostgreSQL (Projekt `svmlkfqhwzwomlsptliz`, eu-central-1).
- **Dev-Setup:** Eingebetteter PGlite (via unset `DATABASE_URL`).
- **Dev-Commands:** `pnpm dev` startet `server` + `ui`.
- **RLS:** Company-Scoped Row Level Security auf allen Tabellen.
- **pgvector:** v0.8.0 für Knowledge Base Embedding Search.
- **Details:** → `memory-bank/data-model-map.md`

## External Services
| Service | Zweck | Env Key |
|---------|-------|---------|
| Supabase | PostgreSQL, Auth, RLS, Realtime | `DATABASE_URL` |
| OpenRouter | LLM Gateway (Hermes 4) | `OPENROUTER_API_KEY` |
| NousResearch | LLM Fallback + Worker Inference | `NOUSRESEARCH_API_KEY` |
| Honcho | Cross-Session Reasoning (self-hosted) | `HONCHO_API_URL`, `HONCHO_API_KEY` |
| Apify | Web Scraping MCP (3000+ Actors) | `APIFY_API_KEY` |
| Google Cloud Run | Stateless Worker Containers | GCP Projekt `swarm-490407` |

## Environment Variables (Hermes Integration)
| Variable | Layer | Zweck |
|----------|-------|-------|
| `HERMES_CLOUD_SECRET` | Server + Worker | Gateway Auth (X-Hermes-Secret Header) |
| `NOUSRESEARCH_API_KEY` | Worker | Agent Execution API Key |
| `VITE_HERMES_ONLY_MODE` | UI | Enterprise Feature Flag |
| `HONCHO_API_URL` | Server | Honcho Endpoint (Default: localhost:8100) |
| `HONCHO_API_KEY` | Server | Honcho API Auth |

## Check-Gateways (DoD)
Vor jeglichem Commit/Merge MUSS lokal erfolgreich durchgeführt werden:
```bash
pnpm -r typecheck
pnpm test:run
pnpm build
```

## Referenz-Index
| Thema | Datei |
|-------|-------|
| Hermes Agent Spec | `docs/wiki/hermes-agent.md` |
| Paperclip Integration | `docs/wiki/paperclip-integration.md` |
| OpenRouter Config | `docs/wiki/openrouter-integration.md` |
| Honcho Self-Hosting | `docs/wiki/honcho-self-host.md` |
| Apify MCP | `docs/wiki/apify-mcp.md` |
| Cloud Run + Supabase | `docs/wiki/cloud-run-supabase-architecture.md` |
| Local Tools | `docs/wiki/local-tools.md` |
| Roundtable System | `docs/wiki/roundtable.md` |
| Data Model + ER | `memory-bank/data-model-map.md` |
| Infrastructure | `memory-bank/infrastructure-map.md` |
| Module Interactions | `memory-bank/module-interaction-map.md` |
| Glossar (DE↔EN) | `memory-bank/paperclip-glossar.md` |
| Edge Functions | `memory-bank/edge-function-registry.md` |

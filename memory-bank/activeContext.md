# Active Context — Session 2026-04-03 #2 (Deep E2E Post-Ship)

## Aktueller Fokus
Deep E2E Testing → Phase 3 Bug gefunden und gefixt. Deploy läuft.

## Session Summary
1. **Phase 1 ✅** — Infrastructure Smoke (4/4 passed): Worker healthy, UI loads, auto-login, company visible
2. **Phase 2 ✅** — Agent Run Pipeline (4/4 passed): Issue ARE-6 erstellt, Hermes-E2E zugewiesen, Run 199cbd0d succeeded, Response: "Hello from Hermes! E2E test successful."
3. **Phase 3 ⚠️** — Memory Persistence: Issue ARE-7 erstellt, Agent speicherte via `memory` tool, Run 33f7c933 succeeded, **aber BUG**: `arguments` JSON-String wurde nicht geparst → leeres `content` in DB
4. **Bugfix committed**: `memory-lifecycle.ts` — `typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs`
5. **Deploying** — Paperclip Server auf Cloud Run (ares-488111/europe-west1)

## Kritische Kennzahlen
- **Production Worker:** hermes-cloud-worker v0.6.0 (NousResearch Hermes-4-405B)
- **Server:** paperclip-server (Cloud Run, ares-488111)
- **DB:** Supabase `sdukmitswmvbcznhpskm` (Autarch.OS)
- **GCP Project:** `ares-488111` (nicht autarch-prod!)
- **GCP Account:** `marketing@mathiasheinke.de`

## Known Issues
- WebSocket `wss://autarch.app/api/.../events/ws` — Verbindung schlägt fehl
- heartbeat-runs 404 Errors bei alten Runs
- Company Name doppelt: "ARES Bio.OSARES Bio.OS"
- "No transcript captured" auf älteren Runs (vor Fix)

## Nächste Schritte (nach Deploy)
1. Retest Memory-Persistence (Issue ARE-8 mit Memory-Task)
2. Phase 4: Console Error Monitoring
3. Memory Bank finale Aktualisierung
4. Walkthrough erstellen

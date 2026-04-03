# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-03 19:07 | Scope: Full System (Post Hermes Worker Fix) | Environment: autarch.app (Production)

**Test User:** mathias@ares-bio.com | **Company:** ARES Bio.OS (`b4eb2c07-...`)
**Worker:** hermes-cloud-worker-00021-s54 | **Server:** paperclip-server-00039-2vw

## 🏁 Phase 1: Infrastructure Smoke Tests
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 1.1 | Worker Health | `GET /v1/health` → status=healthy, apiConnected=true | ✅ Passed | - |
| 1.2 | Server Reachable | `autarch.app` lädt UI | ✅ Passed | Dark Mode Dashboard OK |
| 1.3 | Login Flow | Login als mathias@ares-bio.com → Dashboard | ✅ Passed | Auto-login via session |
| 1.4 | Company laden | ARES Bio.OS Company sichtbar mit Agents | ✅ Passed | Hermes-E2E Agent sichtbar, 4 recent runs |

### 🧹 Context Checkpoint — Phase 1
- Abgeschlossen: 2026-04-03 19:11
- Passed: 4 | Bugfixed: 0 | Failed: 0
- Known Issues: WebSocket `wss://autarch.app/api/companies/.../events/ws` failed, heartbeat-runs 404s, "No transcript captured" auf alten Runs
- Nächste Phase: Phase 2 — Agent Run Core Pipeline

## 💬 Phase 2: Agent Run — Core Inference Pipeline
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 2.1 | Issue erstellen | Neues Issue "Deep E2E Inference Test" im ARES Board | ⏳ Pending | - |
| 2.2 | Agent Run triggern | Task zuweisen → Heartbeat → Worker Execute | ⏳ Pending | - |
| 2.3 | NDJSON Stream | Run Events (system, response, usage) in UI sichtbar | ⏳ Pending | - |
| 2.4 | Run Completion | Run finisht mit "completed" status | ⏳ Pending | - |

## 🧠 Phase 3: Memory Persistence
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 3.1 | Memory Write | Agent lernt etwas → agent_memory Tabelle hat neuen Eintrag | ⏳ Pending | - |
| 3.2 | Memory Upsert | Gleiche Info nochmal → ON CONFLICT UPDATE | ⏳ Pending | - |

## 🌐 Phase 4: Console & Error Monitoring
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 4.1 | WebSocket | WS-Verbindung Status prüfen | ⏳ Pending | - |
| 4.2 | 404 Errors | heartbeat-runs 404 Errors diagnostizieren | ⏳ Pending | - |
| 4.3 | Transcript Rendering | "No transcript captured" → E2E flow prüfen | ⏳ Pending | - |

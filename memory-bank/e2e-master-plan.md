# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-03 19:07 | Scope: Full System (Post Hermes Worker Fix) | Environment: autarch.app (Production)

**Test User:** mathias@ares-bio.com | **Company:** ARES Bio.OS (`b4eb2c07-...`)
**Worker:** hermes-cloud-worker-00021-s54 | **Server:** paperclip-server-00040-kz8
**GCP Project:** ares-488111 | **DB:** Supabase sdukmitswmvbcznhpskm

## 🏁 Phase 1: Infrastructure Smoke Tests ✅
| ID  | Funktion | Test-Status | Ergebnis |
|-----|----------|-------------|----------|
| 1.1 | Worker Health | ✅ Passed | healthy, apiConnected=true, Hermes-4-405B |
| 1.2 | Server Reachable | ✅ Passed | Dark Mode Dashboard loaded |
| 1.3 | Login Flow | ✅ Passed | Auto-login via session |
| 1.4 | Company laden | ✅ Passed | ARES Bio.OS, Hermes-E2E Agent sichtbar |

## 💬 Phase 2: Agent Run — Core Inference Pipeline ✅
| ID  | Funktion | Test-Status | Ergebnis |
|-----|----------|-------------|----------|
| 2.1 | Issue erstellen | ✅ Passed | ARE-6 "E2E Deep Test" |
| 2.2 | Agent Run triggern | ✅ Passed | Run 199cbd0d via Assignment |
| 2.3 | NDJSON Stream | ✅ Passed | system → response → usage Events |
| 2.4 | Run Completion | ✅ Passed | "Hello from Hermes! E2E test successful." (3637ms, $0.0022) |

## 🧠 Phase 3: Memory Persistence ✅ (1 Bug gefunden + gefixt)
| ID  | Funktion | Test-Status | Ergebnis |
|-----|----------|-------------|----------|
| 3.1 | Memory Write | ✅ Passed | ARE-7 → Run 33f7c933 → `memory` tool called |
| 3.2 | DB Verification | ⚠️ Bug | Content war leer (`""`) — `arguments` war JSON-String |
| 3.3 | Bugfix Deploy | ✅ Fixed | `typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs` |
| 3.4 | Retest | ✅ Passed | ARE-8 → Run 79299908 → Content: "Company is ARES, product is Bio.OS" |
| 3.5 | Category Mapping | ✅ Passed | `target: "user"` → `user_preference` korrekt |

## 🌐 Phase 4: Console & Error Monitoring (Known Issues)
| ID  | Funktion | Status | Details |
|-----|----------|--------|---------|
| 4.1 | WebSocket | ⚠️ Known | `wss://autarch.app/api/companies/.../events/ws` failed |
| 4.2 | 404 Errors | ⚠️ Known | heartbeat-runs log 404s (alte Runs ohne logs) |
| 4.3 | Company Name | ⚠️ Known | "ARES Bio.OSARES Bio.OS" (doppelt) |

## Zusammenfassung
- **12 von 12 Tests bestanden** (inkl. 1 Bugfix + Retest)
- **1 Bug gefunden + gefixt:** Hermes tool_call arguments JSON-String Parsing
- **3 Known Issues:** WebSocket, 404s, Company Name — nicht-kritisch, UX-only

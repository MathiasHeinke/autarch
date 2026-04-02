# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-02 | Scope: Hermes Cloud Full-Stack E2E
Fokus-Company: **EETA — E2E Testing Corp 1** (`0f005877-8eb1-4128-84ef-729694ee5c35`)

---

## 🏁 Phase 1: Infrastructure & Agent Config Verification

| ID  | Funktion                 | Beschreibung                                      | Test-Status | Gefundene Bugs / Fixes |
|-----|--------------------------|---------------------------------------------------|-------------|------------------------|
| 1.1 | DB — Agent Adapter       | CEO in EETA hat adapter_type=hermes_cloud         | ✅ Passed   | War hermes_local → gefixt via SQL |
| 1.2 | DB — Worker URL          | adapter_config hat workerUrl gesetzt              | ✅ Passed   | Per SQL gesetzt |
| 1.3 | DB — Model               | runtime_config.model=hermes-4-405b                | ✅ Passed   | Per SQL gesetzt |
| 1.4 | UI — Company Isolation   | Nur EETA sichtbar, andere paused                  | ✅ Passed   | 5 Companies paused via SQL |
| 1.5 | Worker URL reachable     | Cloud Run Worker antwortet auf /v1/execute        | ⏳ Pending  | - |

---

## 🏁 Phase 2: Agentic Task Execution (Simple)

| ID  | Funktion               | Beschreibung                                            | Test-Status | Gefundene Bugs / Fixes |
|-----|------------------------|---------------------------------------------------------|-------------|------------------------|
| 2.1 | Issue anlegen          | Erstelle Issue: „Write bash script 1..10"               | ⏳ Pending  | - |
| 2.2 | Agent triggern         | CEO wird auf Issue gesetzt → Heartbeat startet Run      | ⏳ Pending  | - |
| 2.3 | Run sichtbar           | Run erscheint in UI mit Status running                  | ⏳ Pending  | - |
| 2.4 | Hermes Cloud Call      | Backend-Log zeigt POST /v1/execute an Worker            | ⏳ Pending  | - |
| 2.5 | Antwort kommt zurück   | Run endet mit exitCode 0, Transcript sichtbar           | ⏳ Pending  | - |
| 2.6 | Output korrekt         | Script enthält `for i in {1..10}; do echo $i; done`    | ⏳ Pending  | - |

---

## 🏁 Phase 3: Komplexere Aufgabe (Research + Plan)

| ID  | Funktion                | Beschreibung                                              | Test-Status | Gefundene Bugs / Fixes |
|-----|-------------------------|-----------------------------------------------------------|-------------|------------------------|
| 3.1 | Issue anlegen           | Erstelle Issue: „Research best practices for REST API design and write a 1-page summary" | ⏳ Pending | - |
| 3.2 | Agent führt Web-Tool aus | Hermes nutzt web-toolset (Tavily/Search)                 | ⏳ Pending  | - |
| 3.3 | Multi-Iteration          | Run läuft >1 Iteration (Tool-Call sichtbar)              | ⏳ Pending  | - |
| 3.4 | Coherent Output          | Summary ist kohärent, strukturiert, >200 Wörter          | ⏳ Pending  | - |

---

## 🏁 Phase 4: Backend-Monitoring & Systemgesundheit

| ID  | Funktion                 | Beschreibung                                         | Test-Status | Gefundene Bugs / Fixes |
|-----|--------------------------|------------------------------------------------------|-------------|------------------------|
| 4.1 | Heartbeat-Service Logs   | Kein „Failed to start command hermes" Error          | ⏳ Pending  | - |
| 4.2 | PII-Scrub aktiv          | Log zeigt [pii-scrub] ohne Fehler                    | ⏳ Pending  | - |
| 4.3 | Cost logged              | heartbeat_runs.usage_json hat Tokens                 | ⏳ Pending  | - |
| 4.4 | Run in DB persistiert    | heartbeat_runs Eintrag created mit agentId + runId   | ⏳ Pending  | - |

---

## 🏆 E2E Test Result (wird nach Abschluss ausgefüllt)
- Total Steps: 16
- Passed: 4 | Bugfixed: 0 | Remaining Failed: 0
- Duration: ~ongoing
- System Status: 🏃 In Progress

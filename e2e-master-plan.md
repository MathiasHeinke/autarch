# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-01 | Scope: Hermes Cloud & Honcho Integration

## 🏁 Phase 1: Setup & Environment Validation
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 1.1 | Honcho Setup    | Honcho als Self-Hosted Service via Docker einrichten | ✅ Passed    | -                      |
| 1.2 | Backend Start   | `pnpm dev` erfolgreich gestartet, UI erreichbar | 🛠️ Bugfixed | DB wiped, failed 500 on auth. Fixed by running `pnpm run migrate` upon boot. |
| 1.3 | Trusted Origins | Login und Company Create requests via API/UI    | 🛠️ Bugfixed | 403 Forbidden. Fixed by manually setting `PAPERCLIP_ALLOWED_HOSTNAMES="localhost,127.0.0.1"`. |

## 💬 Phase 2: Autonomous Agent End-to-End (Simple Task)
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 2.1 | Company Create  | UI Wizard durchlaufen, "NOUS Architectures" anlegen | ✅ Passed    | Login successful via Puppeteer UI test. |
| 2.2 | CEO Agent Setup | Hermes Cloud Adapter als CEO wählen mit NOUS System Prompt | 🏃‍♂️ In Progress  | -                      |
| 2.3 | Issue Execution | "Design new landing page" Task anlegen und Agent evaluieren | ⏳ Pending  | -                      |

## 🧠 Phase 3: Stress Testing (Complex Scenario)
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 3.1 | Complex Task    | Multi-Step System Design Aufgabe übergeben, Output prüfen | ⏳ Pending  | -                      |
| 3.2 | Backend Trace   | Honcho Memory Trigger & Hermes API Calls im Hintergrund verifizieren | ⏳ Pending  | -                      |

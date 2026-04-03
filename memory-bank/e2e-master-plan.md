# 🐝 Hermes Autonomous Expansion — End-to-End Master Test Plan
Generiert: 2026-04-03 | Scope: Full System (5-Phase Features Integration) | Environment: autarch.app

## 🏁 Phase 1: Authentication & Basic Agent Connectivity
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 1.1 | Login & Session | Login auf `autarch.app` via E-Mail/UI. Prüfung der Auth-Cookies. | ⏳ Pending | - |
| 1.2 | Cloud Run Health | Hermes Worker muss erreichbar sein. | ⏳ Pending | - |

## 🧠 Phase 2: Agent Toolset & Learner Budget
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 2.1 | Toolset Injection | Task zuweisen und prüfen, ob die 9 Tools (inkl. MCP & Vision) bereitstehen. | ⏳ Pending | - |
| 2.2 | Learner Budget | Task starten, der externe API nutzt. Learner Budget ($0.50) Abzug verifizieren. | ⏳ Pending | - |

## 💾 Phase 3: Atomic Memory Upsert
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 3.1 | Learn Context | Agent soll etwas über den User lernen und speichern (Category: user_preference). | ⏳ Pending | - |
| 3.2 | Atomic Update | Gleiche Info mutieren → prüfen via `onConflictDoUpdate` und DB Console. | ⏳ Pending | - |

## 🌐 Phase 4: MCP + Web Intelligence
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 4.1 | Apify Scraper | Agent anweisen: "Kratze Infos von example.com". Prüfung via puppeteer/Console Logs. | ⏳ Pending | - |
| 4.2 | Transcription | Audio File verarbeiten (via Cohere Transcribe Endpoint) & Ausgabe prüfen. | ⏳ Pending | - |

## 🤖 Phase 5: Honcho Reasoning (Cross-Session)
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 5.1 | Post-Run Ingestion | Run abschließen. Prüfen, ob Konversation an Honcho gesendet wurde. | ⏳ Pending | - |
| 5.2 | Pre-Run Insight | Neuen Task öffnen. Prüfen ob Honcho Insight als System Prompt Inject zurückkommt. | ⏳ Pending | - |

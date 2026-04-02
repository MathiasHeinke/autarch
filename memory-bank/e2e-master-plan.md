# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-02 13:35 | Scope: Full System (Cloud-Native Stack)

> **Stack unter Test:**
> - Frontend: `autarch.app` (Vercel, Vite SPA)
> - API Server: `paperclip-server-61066913791.europe-west1.run.app` (Cloud Run)
> - Worker: `hermes-cloud-worker-61066913791.europe-west1.run.app` (Cloud Run)
> - DB: Supabase PostgreSQL
> - Domain: `autarch.app` (SSL via Vercel, DNS via All-Inkl)

---

## 🏁 Phase 1: Infrastructure & Health Checks
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 1.1 | Vercel Frontend | `autarch.app` → HTTP 200, SSL valid | ⏳ Pending | - |
| 1.2 | API Health | `/api/health` via Vercel Proxy → Cloud Run | ⏳ Pending | - |
| 1.3 | Hermes Worker Health | Cloud Run Worker erreichbar | ⏳ Pending | - |
| 1.4 | www Redirect | `www.autarch.app` → `autarch.app` | ⏳ Pending | - |

## 💬 Phase 2: Authentication & Account Flow
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 2.1 | Login | Login mit existierendem Account (mathias@ares-bio.com) | ⏳ Pending | - |
| 2.2 | Session Persistence | Nach Login: Session-Cookie / Token prüfen | ⏳ Pending | - |
| 2.3 | Protected Routes | Nicht-eingeloggt → Redirect zu /login | ⏳ Pending | - |

## 🏢 Phase 3: Company & Onboarding
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 3.1 | Company Create | Company anlegen via Onboarding Wizard | ⏳ Pending | - |
| 3.2 | DB Write: Company | Company in Supabase `companies` Tabelle prüfen | ⏳ Pending | - |
| 3.3 | Dashboard Access | Nach Company Create → Dashboard erreichbar | ⏳ Pending | - |

## 🤖 Phase 4: Agent Creation & Configuration
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 4.1 | Agent Create | Neuen Agent erstellen (Hermes Cloud Typ) | ⏳ Pending | - |
| 4.2 | DB Write: Agent | Agent in `agents` Tabelle prüfen | ⏳ Pending | - |
| 4.3 | Agent Config | System Prompt, Model, Toolsets konfigurieren | ⏳ Pending | - |

## 📋 Phase 5: Issue Pipeline (Task → Agent Execution)
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 5.1 | Issue Create | Issue erstellen (Title + Body) | ⏳ Pending | - |
| 5.2 | DB Write: Issue | Issue in `issues` Tabelle prüfen | ⏳ Pending | - |
| 5.3 | Issue Status Flow | Status-Übergang: backlog → todo → in_progress | ⏳ Pending | - |
| 5.4 | Agent Assign | Agent dem Issue zuweisen | ⏳ Pending | - |

## 🧠 Phase 6: Memory & Persistence (Kern-Test!)
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 6.1 | Memory Loading | Agent Run → Loading von `agent_memory` prüfen | ⏳ Pending | - |
| 6.2 | Memory Persistence | Agent Run → `save_memory` Tool-Calls → DB Writes | ⏳ Pending | - |
| 6.3 | DB Read: agent_memory | Direkte DB-Abfrage: memories in `agent_memory` vorhanden? | ⏳ Pending | - |
| 6.4 | Cross-Session Memory | Zweiter Run → Memories aus Run 1 im Context? | ⏳ Pending | - |
| 6.5 | Run Transcript | Run-Ergebnis abrufbar in UI? Transcript sichtbar? | ⏳ Pending | - |
| 6.6 | Cost Tracking | Run → `cost_events` Tabelle hat Eintrag? | ⏳ Pending | - |

## 🔐 Phase 7: Security & Edge Cases
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 7.1 | PII Scrubbing | Context Messages mit PII → Scrubbed vor Worker | ⏳ Pending | - |
| 7.2 | Toolset Whitelist | Nur erlaubte Toolsets (web, file, memory) | ⏳ Pending | - |
| 7.3 | Cost Cap | Cost Cap Breach → Warning in Logs | ⏳ Pending | - |
| 7.4 | CORS/Hostname | Fremde Hostname → Rejected | ⏳ Pending | - |

---

## 📊 Test Credentials
- **Email:** mathias@ares-bio.com
- **Password:** Autarch2026!Test
- **Account erstellt:** 2026-04-02 13:29 via E2E

---

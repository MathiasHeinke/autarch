# 📖 Autarch ↔ Paperclip Glossar

> **Zweck:** Übersetzungstabelle zwischen Autarch-Begriffen (User-facing) und Paperclip-Begriffen (Backend API).  
> Jeder Agent im IDE muss diese Datei kennen, um API-Responses korrekt zu mappen.

---

## Kern-Begriffe

| Autarch (Frontend) | Paperclip (Backend API) | DB-Tabelle | Beschreibung |
|---|---|---|---|
| **Agentur** | Company | `companies` | Multi-Tenant Organisation, enthält Agents und Budget |
| **Agent** | Agent | `agents` | AI-Worker mit Rolle, Budget, Adapter und Heartbeat |
| **Aufgabe** | Issue | `issues` | Task/Ticket mit Status-Pipeline (backlog→todo→in_progress→review→done) |
| **Automatisierung** | Routine | `routines` | Wiederkehrender Cron-Job mit Trigger und Run-History |
| **Freigabe** | Approval | `approvals` | Human-in-the-Loop Genehmigungsschritt |
| **Fähigkeit / Skill** | Company Skill | `company_skills` | Konfigurierbares Skill-Template pro Agentur |
| **Projekt** | Project | `projects` | Container für Aufgaben mit Lead Agent und Zieldatum |
| **Ziel** | Goal | `goals` | Hierarchisches Ziel (parent_id), zuweisbar an Agent |
| **Herzschlag** | Heartbeat Run | `heartbeat_runs` | Einzelne Ausführungs-Instanz eines Agent-Durchlaufs |
| **Kosten** | Cost Event | `cost_events` | Token-basiertes Kosten-Tracking (Provider, Model, Cents) |
| **Budget** | Budget Policy | `budget_policies` | Monatliches Budget-Limit mit Incident-Erkennung |
| **Aktivität** | Activity Log | `activity_log` | Chronologischer Audit Trail aller Aktionen |
| **Trigger** | Routine Trigger | `routine_triggers` | Cron-Expression + Timezone + Concurrency Policy |
| **Ergebnis** | Issue Work Product | `issue_work_products` | Output-Artefakt einer Aufgabe |
| **Geheimnis / Secret** | Company Secret | `company_secrets` | Verschlüsselter API Key / Token pro Agentur |
| **Dokument** | Document | `documents` | Rich Text Dokument (MDX) mit Revisions-Historie |
| **Posteingang** | Inbox | `issue_inbox_archives` | Benachrichtigungs-Feed mit Read/Unread State |
| **Organigramm** | Org Chart | `agents.reports_to` | Hierarchische Agent-Struktur (reports_to FK) |

## Status-Werte

### Aufgaben (Issues)
| Autarch | Paperclip | Beschreibung |
|---|---|---|
| Offen | `backlog` | Noch nicht begonnen |
| Geplant | `todo` | Zur Bearbeitung vorgesehen |
| In Arbeit | `in_progress` | Agent arbeitet aktiv |
| Zur Freigabe | `in_review` | Wartet auf Human Approval |
| Blockiert | `blocked` | Durch Dependency oder Fehler gestoppt |
| Erledigt | `done` | Abgeschlossen |
| Abgebrochen | `cancelled` | Manuell abgebrochen |

### Agents
| Autarch | Paperclip | Beschreibung |
|---|---|---|
| Bereit | `idle` | Kein aktiver Task |
| Aktiv | `running` | Führt Heartbeat aus |
| Pausiert | `paused` | Manuell gestoppt (mit `pause_reason`) |
| Fehler | `error` | Letzter Heartbeat fehlgeschlagen |

### Automatisierungen (Routines)
| Autarch | Paperclip | Beschreibung |
|---|---|---|
| Aktiv | `active` | Trigger feuern planmäßig |
| Pausiert | `paused` | Manuell deaktiviert |
| Archiviert | `archived` | Soft-Delete |

## Adapter-Typen

| Adapter | Paperclip Key | Zweck | Autarch-Relevanz |
|---|---|---|---|
| Hermes | `hermes` | NousResearch Hermes Agent | ✅ Primärer Adapter |
| Claude | `claude-local` | Anthropic Claude Code CLI | ⬜ Später |
| Gemini | `gemini-local` | Google Gemini CLI | ⬜ Später |
| Codex | `codex-local` | OpenAI Codex | ⬜ Später |
| Process | `process` | Generischer Prozess-Adapter | ✅ Default |

## API-Pfad-Konventionen

```
Paperclip API:     /api/companies/:companyId/[resource]
Autarch Mapping: Agentur ID → Paperclip Company ID

Beispiele:
GET  /api/companies/:id/agents          → Alle Agents einer Agentur
GET  /api/companies/:id/issues          → Alle Aufgaben
POST /api/companies/:id/issues          → Neue Aufgabe erstellen
GET  /api/companies/:id/routines        → Alle Automatisierungen
POST /api/companies/:id/approvals/:id/approve → Freigabe erteilen
GET  /api/companies/:id/costs           → Kostenübersicht
GET  /api/companies/:id/skills          → Fähigkeiten-Liste
```

## Deployment-Mapping

| Service | Cloud Run Name | Container | GCP Projekt |
|---|---|---|---|
| Dashboard | `autarch-dashboard` | Vite Build + Nginx Alpine | `swarm-490407` |
| Orchestrator | `autarch-orchestrator` | Paperclip Node.js + embedded Postgres | `swarm-490407` |
| Workers | `autarch-workers` | Hermes Python Docker | `swarm-490407` |

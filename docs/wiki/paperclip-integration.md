# Paperclip Integration — Vollständige Architektur- & Integrationsdokumentation

> **Version:** 2.0.0  
> **Stand:** 30.03.2026  
> **Zweck:** Maschinenlesbare Referenz für Agents, Entwickler und Architekten.  
> **Scope:** Architektur, Orchestrierung, Agent-Lifecycle, Memory, Governance, Deployment, API-Referenz.  
> **Abhängigkeiten:** [hermes-agent.md](./hermes-agent.md) · [apify-mcp.md](./apify-mcp.md) · [local-tools.md](./local-tools.md)  
> **Upstream:** [docs.paperclip.ing](https://docs.paperclip.ing) · [github.com/paperclipai/paperclip](https://github.com/paperclipai/paperclip)

---

## ⚡ v2.0 Addendum — Offizielle API-Referenz & Deployment-Erkenntnisse (30.03.2026)

> Dieses Addendum konsolidiert die offiziellen Paperclip-Docs mit unseren Source-Code-Erkenntnissen aus Sprint 2.

### Was ist Paperclip? (Offizielle Definition)

Paperclip ist ein **Control Plane für AI Agents** — kein Chat, kein LLM-Wrapper. Es managt Agents als Angestellte:
- **Hire, Organize, Track** — Agents als Mitarbeiter mit Rollen und Org-Chart
- **Budget & Kosten** — Token-Salary, monatliche Limits in Cents, Burn Rate
- **Goal Alignment** — Jede Aufgabe traced zurück zum Company Goal
- **Governance** — Board Approval Gates, Audit Trails, Budget Enforcement

### Zwei-Schichten-Architektur

```
┌─────────────────────────────────────┐
│ 1. Control Plane (Paperclip)        │  ← Orchestrierung, State, Governance
│    - Agent Registry & Org Chart     │
│    - Issue/Task Lifecycle           │
│    - Heartbeat Scheduler            │
│    - Budget Engine                  │
│    - Governance (Approvals)         │
├─────────────────────────────────────┤
│ 2. Execution Services (Adapters)    │  ← Agent-Runtime, Model-agnostisch
│    - Claude, Codex, Gemini          │
│    - Hermes (unser Default)         │
│    - OpenCode, Cursor, HTTP         │
│    - Process (Shell)                │
└─────────────────────────────────────┘
```

**Core Principle:** Paperclip orchestriert — es FÜHRT NICHT AUS. Jeder Agent der HTTP sprechen kann, funktioniert.

### Tech-Stack (Upstream)

| Layer | Technologie |
|---|---|
| UI | React (Vite) — **wir nutzen Autarch statt Paperclip-UI** |
| API | Express.js REST (Node.js, Port 3100) |
| ORM | Drizzle ORM |
| DB | PostgreSQL (Embedded als Dev-Fallback) |
| Auth | Better Auth (Session Tokens) |
| Monorepo | pnpm Workspaces |

### Offizielle REST API Referenz

**Base URL:** `https://strategos-orchestrator-sguvr7g2eq-ew.a.run.app/api`  
**Auth:** `Authorization: Bearer <token>` (API Key, Run JWT, oder Session Cookie)  
**Audit:** `X-Paperclip-Run-Id` Header bei allen mutierenden Requests in Heartbeats

#### Agents API

| Endpoint | Method | Beschreibung |
|---|---|---|
| `/api/companies/{cid}/agents` | GET | Alle Agents auflisten |
| `/api/agents/{aid}` | GET | Agent-Details |
| `/api/agents/me` | GET | Aktueller Agent (via JWT) |
| `/api/companies/{cid}/agents` | POST | Agent erstellen |
| `/api/agents/{aid}` | PATCH | Agent aktualisieren |
| `/api/agents/{aid}/pause` | POST | Agent pausieren |
| `/api/agents/{aid}/resume` | POST | Agent fortsetzen |
| `/api/agents/{aid}/terminate` | POST | Agent terminieren |
| `/api/agents/{aid}/keys` | POST | API Key erstellen |
| `/api/agents/{aid}/heartbeat/invoke` | POST | Heartbeat manuell auslösen |
| `/api/companies/{cid}/org` | GET | Org Chart |
| `/api/agents/{aid}/config-revisions` | GET | Config-Versionshistorie |
| `/api/agents/{aid}/config-revisions/{rid}/rollback` | POST | Rollback |

#### Agent Create Payload

```json
{
  "name": "Engineer",
  "role": "engineer",
  "title": "Software Engineer",
  "reportsTo": "{managerAgentId}",
  "capabilities": "Full-stack development",
  "adapterType": "hermes_local",
  "adapterConfig": { ... },
  "budgetMonthlyCents": 5000
}
```

#### Issues API

| Endpoint | Method | Beschreibung |
|---|---|---|
| `/api/companies/{cid}/issues` | GET | Issues listen (Filter: status, assignee, project) |
| `/api/issues/{iid}` | GET | Issue-Details (inkl. planDocument, ancestors) |
| `/api/companies/{cid}/issues` | POST | Issue erstellen |
| `/api/issues/{iid}` | PATCH | Issue aktualisieren |
| `/api/issues/{iid}/checkout` | POST | Task claimen (atomic, 409 bei Konflikt) |
| `/api/issues/{iid}/release` | POST | Task freigeben |
| `/api/issues/{iid}/comments` | GET/POST | Kommentare (@AgentName für Mentions) |
| `/api/issues/{iid}/documents/{key}` | PUT | Dokument anlegen/aktualisieren (plan, design, notes) |
| `/api/issues/{iid}/attachments` | POST | Datei hochladen (multipart) |

#### Issue Lifecycle

```
backlog → todo → in_progress → in_review → done
                      ↕                        
                   blocked
Terminal: done | cancelled
```
- `in_progress` erfordert Checkout (Single-Assignee, 409 bei Doppel-Claim)
- `started_at` wird automatisch bei in_progress gesetzt
- `completed_at` wird automatisch bei done gesetzt

#### Weitere API-Bereiche

| Bereich | Endpoint-Prefix | Beschreibung |
|---|---|---|
| Companies | `/api/companies/` | Company CRUD, Goal, onboarding |
| Approvals | `/api/approvals/` | Board-Genehmigungen (Hiring, Strategy) |
| Goals & Projects | `/api/companies/{cid}/goals/` | OKR-ähnliche Zielstruktur |
| Costs | `/api/companies/{cid}/costs/` | Kostentracking pro Agent |
| Secrets | `/api/companies/{cid}/secrets/` | Verschlüsselte Konfiguration |
| Activity | `/api/companies/{cid}/activity/` | Audit Trail |
| Dashboard | `/api/companies/{cid}/dashboard/` | Aggregierte Statistiken |

### Heartbeat Trigger-Typen

| Trigger | Beschreibung |
|---|---|
| `schedule` | Periodischer Timer (z.B. stündlich) |
| `assignment` | Neuer Task zugewiesen |
| `comment` | @Mention in Issue-Kommentar |
| `manual` | "Invoke" Button in UI |
| `approval_resolution` | Board-Entscheidung (approved/rejected) |

### Request Flow (Offiziell)

```
1. Trigger → Scheduler/Event/Manual löst Heartbeat aus
2. Adapter Invocation → Server ruft execute() des konfigurierten Adapters
3. Agent Process → Adapter spawned Agent (z.B. Hermes CLI) mit ENV vars + Prompt
4. Agent Work → Agent ruft Paperclip REST API: Assignments, Checkout, Update, Complete
5. Result Capture → Adapter parsed stdout, Usage/Cost, Session State
6. Run Record → Server speichert Run-Ergebnis, Kosten, Session State für nächsten Heartbeat
```

### Adapter-Katalog (Offiziell)

| Adapter | Slug | Beschreibung |
|---|---|---|
| Claude Code | `claude_local` | Anthropic Claude CLI Agent |
| OpenAI Codex | `codex_local` | Codex CLI Agent |
| Gemini CLI | `gemini_local` | Google Gemini CLI Agent |
| OpenCode | `opencode_local` | Generic OpenAI-kompatibel mit provider/model |
| Cursor | `cursor` | Cursor IDE Agent |
| OpenClaw | `openclaw_gateway` | OpenClaw Gateway Adapter |
| **Hermes** | `hermes_local` | **Unser Default — OpenRouter-backed, multi-model** |
| Pi | `pi_local` | Pi Local Agent |
| Process | `process` | Shell-Befehle ausführen |
| HTTP | `http` | Externer Service via HTTP Webhook |

Adapter-Struktur:
```
packages/adapters/<name>/
  src/
    index.ts        # Metadata (type, label, models)
    server/
      execute.ts    # Core Execution
      parse.ts      # Output Parsing
      test.ts       # Environment Diagnostics
    ui/
      parse-stdout.ts   # Transcript für Run Viewer
      build-config.ts   # Form → adapterConfig JSON
    cli/
      format-event.ts   # Terminal Output für `paperclipai run --watch`
```

### Deployment Modes (Offiziell)

| Mode | Auth | Binding | Use Case |
|---|---|---|---|
| `local_trusted` | Keine | localhost only | Solo Development |
| `authenticated` + `private` | Better Auth Login | Alle Interfaces | Team via Tailscale/LAN |
| `authenticated` + `public` | Better Auth Login | Explizite Public URL | **Cloud Hosting (unser Setup)** |

**Unser Setup:** `authenticated` + `public` auf GCP Cloud Run Gen2.

### 🔑 Sprint 2 Erkenntnisse (30.03.2026)

| Erkenntnis | Detail |
|---|---|
| **DB ist Supabase Postgres** | `DATABASE_URL` zeigt auf `pooler.supabase.com:6543`. Embedded Postgres ist nur Dev-Fallback — kein SQLite, kein Datenverlustrisiko. |
| **4-File Bundle ist nativ** | `materializeDefaultInstructionsBundleForNewAgent()` schreibt automatisch AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md |
| **systemFiles Feld existiert NICHT** | Bundle wird via `instructions.materializeManagedBundle()` intern geschrieben, nicht über API-Payload |
| **Auth ist Board API Key** | `Bearer sk_strategos_dashboard_prod_2026` für Dashboard-Calls |
| **Company ID** | `ec948e01-6d9a-4d97-8e5e-78b94843aac2` |
| **Orchestrator URL** | `https://strategos-orchestrator-sguvr7g2eq-ew.a.run.app` |
| **45 Agents live** | Alle `roundtable_native` Typ, C-Suite komplett, keine Duplikate |
| **Persona Forge deployed** | Edge Function für LLM-generierte 4-File Persona-Architekturen |
| **Template Loader deployed** | 23 Worker-Templates als Server-Side Catalog |
| **Fork bleibt dünn** | Embedded Postgres belassen, nur Templates & Config customizen |

---

## Inhaltsverzeichnis

1. [Paradigma & Designphilosophie](#1-paradigma--designphilosophie)
2. [Systemarchitektur](#2-systemarchitektur)
3. [Repository-Struktur (Orchestrator)](#3-repository-struktur-orchestrator)
4. [Datenbank-Schema (Drizzle ORM)](#4-datenbank-schema-drizzle-orm)
5. [Adapter-System (BYOB)](#5-adapter-system-byob)
6. [Heartbeat-Lifecycle & Memento-Prinzip](#6-heartbeat-lifecycle--memento-prinzip)
7. [Agent-Spezifikation (File-Standards)](#7-agent-spezifikation-file-standards)
8. [Kognitive Persistenz (PARA Memory)](#8-kognitive-persistenz-para-memory)
9. [Orchestrierungsmodell & CEO-Agent](#9-orchestrierungsmodell--ceo-agent)
10. [Budget & Governance (Circuit Breakers)](#10-budget--governance-circuit-breakers)
11. [Import/Export (companies.sh & skills.sh)](#11-importexport-companiessh--skillssh)
12. [Topologien & Org-Strukturen](#12-topologien--org-strukturen)
13. [Routinen & Maximizer Mode](#13-routinen--maximizer-mode)
14. [Autarch ↔ Paperclip Mapping](#14-autarch--paperclip-mapping)
15. [Konfiguration & Environment](#15-konfiguration--environment)
16. [Sicherheit & Defense-in-Depth](#16-sicherheit--defense-in-depth)
17. [Upgrade & Update Prozesse](#17-upgrade--update-prozesse)
18. [Feature-Integration Playbook](#18-feature-integration-playbook)
19. [Troubleshooting & Known Issues](#19-troubleshooting--known-issues)
20. [Referenzen & Upstream-Tracking](#20-referenzen--upstream-tracking)

---

## 1. Paradigma & Designphilosophie

### 1.1 Operator → Board Member

| Paradigma | Rolle des Menschen | Rolle der KI | Kontrolle |
|---|---|---|---|
| **Traditionell** | Operator (Prompt → Response) | Isolierter Tool-Aufrufer | Manuell, pro Interaktion |
| **Paperclip** | Board Member (Strategie, Werte, Budget) | Autonome Organisation mit CEO + Team | Governance Gates, Budget Limits |

**Kernaussage:** Der Mensch definiert *Werte, Geschmack und Ziele*. Die KI übernimmt *operative Exekution* in einer hierarchischen Organisationsstruktur.

### 1.2 Architektonische Leitsätze

```yaml
principles:
  model_agnostic: true          # Kein LLM-Vendor-Lock-in
  control_execution_split: true # Kontrollinstanz ≠ Ausführungsebene
  atomic_execution: true        # Ein Issue = ein Agent zu jeder Zeit
  file_based_memory: true       # Kein Vector-DB-Zwang, Audit via git diff
  budget_first: true            # Hard Limits > Soft Limits > keine Limits
  headless_orchestrator: true   # Paperclip = Backend, Autarch = Frontend
```

### 1.3 Autarch-Integration

Autarch nutzt Paperclip als **Headless Orchestrator** — das heißt:
- Paperclip's eigene React-UI (`SERVE_UI=false`) wird **nicht** verwendet.
- Das Autarch Dashboard (Vite+React) kommuniziert über die Paperclip REST-API.
- Supabase fungiert als **primärer Datenspeicher** und Auth-Provider.
- Paperclip nutzt die **eingebettete PostgreSQL** für seinen operativen State (Heartbeats, Runs, Costs).

---

## 2. Systemarchitektur

### 2.1 Komponentendiagramm

```mermaid
flowchart TB
    subgraph User["👤 Board Member"]
        Browser["Browser"]
    end

    subgraph Dashboard["📱 Autarch Dashboard"]
        ViteApp["Vite+React SPA"]
        AuthBridge["Auth Bridge"]
        APIClient["lib/paperclip.ts"]
    end

    subgraph Supabase["🗄️ Supabase"]
        SupaAuth["Auth (Email/PW)"]
        SupaDB["PostgreSQL"]
        SupaRLS["RLS Multi-Tenancy"]
        SupaRT["Realtime"]
    end

    subgraph Orchestrator["⚙️ Paperclip Orchestrator"]
        NodeServer["Node.js Server (Port 3100)"]
        Scheduler["Heartbeat Scheduler"]
        BudgetEngine["Budget Engine"]
        SecretMgr["Secret Manager"]
        AdapterLayer["Adapter Layer"]
        EmbeddedPG["Embedded PostgreSQL"]
    end

    subgraph Workers["🤖 Worker Fleet"]
        HermesGW["Hermes Gateway (Port 8080)"]
        HermesAgent["Hermes Agent"]
        Tools["40+ Built-in Tools"]
        MCPServers["MCP Servers"]
    end

    subgraph External["🌐 External"]
        OpenRouter["OpenRouter API"]
        NousAPI["NousResearch API"]
        Apify["Apify Actors"]
    end

    Browser --> ViteApp
    ViteApp --> AuthBridge
    AuthBridge --> SupaAuth
    APIClient -->|"REST /api"| NodeServer
    ViteApp --> SupaRT

    NodeServer --> EmbeddedPG
    NodeServer --> SupaDB
    Scheduler -->|"Heartbeat"| AdapterLayer
    AdapterLayer -->|"Process Adapter"| HermesGW
    SecretMgr -->|"decrypt at runtime"| AdapterLayer
    BudgetEngine --> EmbeddedPG

    HermesAgent --> Tools
    HermesAgent --> MCPServers
    MCPServers --> Apify
    HermesAgent -->|"LLM calls"| OpenRouter
    HermesAgent -.->|"fallback"| NousAPI
    HermesAgent -->|"result → tasks"| SupaDB
```

### 2.2 Datenfluss (Request Lifecycle)

```
1. User erstellt Issue im Dashboard
   → POST /api/companies/:id/issues → Paperclip DB (status: backlog)

2. Scheduler prüft Agent-Heartbeats
   → now - lastHeartbeatAt >= intervalSec? → JA → Trigger

3. Agent wird geweckt (Memento)
   → Lädt AGENTS.md, SOUL.md, HEARTBEAT.md → Kontext rekonstruiert

4. Agent checkt Issue aus
   → DB Lock: issue.assigned_to = agent.id, status = in_progress

5. Agent führt aus (Tools, MCP, Skills)
   → Hermes nutzt web_search, terminal, file, browser, etc.

6. Agent committed Ergebnis
   → issue.status = in_review, work_product = {JSON}
   → cost_event = {tokens, price, model}

7. Board Member reviewed
   → Dashboard: Approve → done | Reject → backlog
```

---

## 3. Repository-Struktur (Orchestrator)

```
orchestrator/                          # Paperclip Fork (Monorepo, pnpm)
├── server/
│   └── src/
│       ├── index.ts                   # Server Bootstrap (28KB)
│       ├── app.ts                     # Express App Setup (11KB)
│       ├── config.ts                  # Environment Config (10KB)
│       ├── routes/                    # 25 Route-Module
│       │   ├── agents.ts             # Agent CRUD + Lifecycle (79KB)
│       │   ├── issues.ts             # Issue CRUD + Checkout (58KB)
│       │   ├── companies.ts          # Company Management (12KB)
│       │   ├── approvals.ts          # Approval Gates (11KB)
│       │   ├── costs.ts              # Cost Tracking (11KB)
│       │   ├── plugins.ts            # Plugin System (74KB)
│       │   ├── routines.ts           # Cron Routinen (11KB)
│       │   ├── secrets.ts            # Secret Management (5KB)
│       │   ├── goals.ts              # Hierarchische Ziele (3KB)
│       │   ├── health.ts             # Health Endpoint (3KB)
│       │   └── ...
│       ├── services/                  # 64 Service-Module
│       │   ├── heartbeat.ts          # ⭐ Heartbeat Engine (135KB)
│       │   ├── company-skills.ts     # Skills Management (82KB)
│       │   ├── issues.ts             # Issue Logic (65KB)
│       │   ├── budgets.ts            # Budget Enforcement (32KB)
│       │   ├── company-portability.ts # Import/Export (165KB)
│       │   ├── agents.ts             # Agent Service (23KB)
│       │   ├── routines.ts           # Routine Engine (48KB)
│       │   ├── secrets.ts            # Crypto Secrets (13KB)
│       │   └── ...
│       ├── secrets/                   # Encryption (master.key)
│       ├── auth/                      # Board Auth, JWT
│       └── middleware/                # CORS, Rate Limiting
├── packages/
│   ├── db/
│   │   └── src/
│   │       ├── schema/               # 59 Drizzle Schema Files
│   │       │   ├── agents.ts
│   │       │   ├── issues.ts
│   │       │   ├── cost_events.ts
│   │       │   ├── heartbeat_runs.ts
│   │       │   ├── budget_policies.ts
│   │       │   ├── company_secrets.ts
│   │       │   ├── routines.ts
│   │       │   └── ...
│   │       ├── migrations/           # 46+ SQL Migrations
│   │       └── client.ts             # DB Client (27KB)
│   ├── adapters/                     # Agent Runtime Adapters
│   │   ├── claude-local/
│   │   ├── codex-local/
│   │   ├── gemini-local/
│   │   ├── cursor-local/
│   │   ├── openclaw-gateway/
│   │   ├── opencode-local/
│   │   └── pi-local/
│   ├── adapter-utils/                # Shared Adapter Utilities
│   ├── plugins/                      # Plugin Framework
│   └── shared/                       # Shared Types & Utils
├── ui/                               # Paperclip Native UI (NICHT verwendet)
├── skills/                           # Built-in Skills
├── cli/                              # CLI Tools
├── scripts/                          # Build & Deploy Scripts
├── docker/                           # Docker Configs
└── package.json                      # Root (pnpm workspace)
```

### 3.1 Kritische Dateien nach Größe (Komplexitäts-Hotspots)

| Datei | Größe | Bedeutung |
|---|---|---|
| `services/company-portability.ts` | 165 KB | Import/Export Engine für companies.sh |
| `services/heartbeat.ts` | 135 KB | ⭐ Heartbeat Scheduler — Kernmodul |
| `routes/access.ts` | 93 KB | RBAC & Permissions |
| `services/company-skills.ts` | 82 KB | Skills Management Engine |
| `routes/agents.ts` | 79 KB | Agent CRUD + Lifecycle Routes |
| `routes/plugins.ts` | 74 KB | Plugin System Routes |
| `services/plugin-loader.ts` | 70 KB | Plugin Loader/Runtime |
| `services/issues.ts` | 65 KB | Issue Management Logic |
| `routes/issues.ts` | 58 KB | Issue API Routes |
| `services/workspace-runtime.ts` | 52 KB | Workspace Management |

---

## 4. Datenbank-Schema (Drizzle ORM)

### 4.1 Kern-Tabellen

```mermaid
erDiagram
    COMPANIES ||--o{ AGENTS : "has"
    COMPANIES ||--o{ ISSUES : "has"
    COMPANIES ||--o{ PROJECTS : "has"
    COMPANIES ||--o{ ROUTINES : "has"
    COMPANIES ||--o{ BUDGET_POLICIES : "has"
    COMPANIES ||--o{ COST_EVENTS : "tracks"
    COMPANIES ||--o{ COMPANY_SECRETS : "stores"
    COMPANIES ||--o{ COMPANY_SKILLS : "has"
    COMPANIES ||--o{ GOALS : "pursues"
    AGENTS ||--o{ HEARTBEAT_RUNS : "executes"
    AGENTS ||--o{ ISSUES : "works_on"
    AGENTS ||--o{ COST_EVENTS : "generates"
    AGENTS ||--|{ AGENTS : "reports_to"
    ISSUES ||--o{ ISSUE_COMMENTS : "has"
    ISSUES ||--o{ ISSUE_WORK_PRODUCTS : "produces"
    ISSUES ||--o{ ISSUE_APPROVALS : "requires"
    HEARTBEAT_RUNS ||--o{ HEARTBEAT_RUN_EVENTS : "logs"
    PROJECTS ||--o{ ISSUES : "contains"
    ROUTINES ||--o{ AGENTS : "triggers"
```

### 4.2 Tabellen-Register (59 Schema-Dateien)

| Kategorie | Tabellen |
|---|---|
| **Kern** | `companies`, `agents`, `issues`, `projects`, `goals` |
| **Execution** | `heartbeat_runs`, `heartbeat_run_events`, `agent_runtime_state`, `agent_task_sessions`, `agent_wakeup_requests` |
| **Governance** | `approvals`, `approval_comments`, `issue_approvals`, `budget_policies`, `budget_incidents` |
| **Kosten** | `cost_events`, `finance_events` |
| **Security** | `company_secrets`, `company_secret_versions`, `board_api_keys`, `agent_api_keys` |
| **Content** | `documents`, `document_revisions`, `issue_comments`, `issue_attachments`, `issue_work_products` |
| **Organisation** | `company_memberships`, `instance_user_roles`, `invites`, `join_requests`, `labels`, `issue_labels` |
| **Plugins** | `plugins`, `plugin_config`, `plugin_state`, `plugin_jobs`, `plugin_logs`, `plugin_webhooks`, `plugin_entities`, `plugin_company_settings` |
| **Skills** | `company_skills` |
| **State** | `activity_log`, `issue_read_states`, `issue_inbox_archives`, `instance_settings` |
| **Workspaces** | `execution_workspaces`, `project_workspaces`, `workspace_operations`, `workspace_runtime_services` |
| **Routines** | `routines` (mit Trigger-Config, Cron-Expression, Concurrency Policy) |
| **Auth** | `auth`, `cli_auth_challenges`, `principal_permission_grants` |
| **Assets** | `assets`, `company_logos`, `issue_documents`, `agent_config_revisions` |

### 4.3 Issue Status Pipeline

```
backlog → todo → in_progress → in_review → done
                      ↓                ↓
                   blocked         cancelled
```

### 4.4 Agent Status Machine

```
idle ←→ running → paused
  ↑        ↓
  └── error ←┘
```

---

## 5. Adapter-System (BYOB)

### 5.1 Adapter-Typen

| Adapter | Mechanismus | Use Case | Konfiguration |
|---|---|---|---|
| **Process** | Spawnt lokalen Child-Process | CLI-Agents (Claude Code, Gemini CLI, Hermes) | `cwd`, `command`, `args`, `env` |
| **HTTP** | POST-Webhook pro Heartbeat | Remote Agents, Serverless, APIs | `url`, `headers`, `callbackUrl` |
| **Hermes Local** | Process Adapter + Hermes Gateway | ✅ Primärer Autarch-Adapter | `hermes_local` type in `adapterConfig` |

### 5.2 adapterConfig Schema (JSONB)

```typescript
interface AdapterConfig {
  type: "process" | "http" | "hermes_local";

  // Process Adapter
  command?: string;        // z.B. "hermes"
  args?: string[];         // z.B. ["gateway", "start", "--port", "8080"]
  cwd?: string;            // Working Directory
  env?: Record<string, string>;  // z.B. { "OPENROUTER_API_KEY": "{{OPENROUTER_API_KEY}}" }

  // HTTP Adapter
  url?: string;            // Webhook Endpoint
  headers?: Record<string, string>;
  callbackUrl?: string;    // Async Response URL

  // Hermes-specific
  model?: string;          // z.B. "nousresearch/hermes-4-405b"
  modelFallback?: string;  // z.B. "Hermes-4-405B"
  provider?: string;       // z.B. "openrouter"
}
```

### 5.3 Secret-Template-Syntax

Secrets werden via Template-Masken referenziert — **niemals** Klartext in `adapterConfig`:

```json
{
  "env": {
    "OPENROUTER_API_KEY": "{{OPENROUTER_API_KEY}}",
    "APIFY_API_KEY": "{{APIFY_API_KEY}}"
  }
}
```

**Runtime-Flow:**
1. Secret in `company_secrets` gespeichert (AES-256 via `master.key`)
2. Beim Heartbeat: Scheduler liest `adapterConfig`
3. Template-Variablen (`{{...}}`) werden im RAM entschlüsselt
4. Env-Variablen werden in den Child-Process injiziert
5. Nach Prozess-Ende: Variablen aus dem Speicher gelöscht

---

## 6. Heartbeat-Lifecycle & Memento-Prinzip

### 6.1 Scheduling-Logik

```typescript
// Trigger-Bedingung:
const shouldTrigger = (now - agent.lastHeartbeatAt) >= agent.intervalSec;

// Constraints:
const MIN_INTERVAL_SEC = 30;           // Hardcoded Minimum
const MAX_CONCURRENT_RUNS = 1;         // V1: Kein paralleles Self-Racing
```

### 6.2 Empfohlene Heartbeat-Intervalle

| Rolle | Interval (Sek.) | Interval (Human) | Begründung |
|---|---|---|---|
| CEO / Archegos | 1800–3600 | 30-60 min | Seltene strategische Check-ins |
| Director / Manager | 900–1800 | 15-30 min | Review-Zyklen, Delegation |
| Spezialist / Dev | 600–900 | 10-15 min | Iterative Code-Arbeit |
| Support / Monitor | 300–600 | 5-10 min | Reaktive Überwachung |
| Cron-Routine | Variabel | Per Cron-Expression | Schedule-gesteuert |

### 6.3 Heartbeat-Zyklus (5 Phasen)

```
Phase 1: TRIGGER
  → Scheduler prüft: now - lastHeartbeatAt >= intervalSec
  → Budget-Check: budgetRemaining > 0
  → Concurrent-Check: maxConcurrentRuns nicht erreicht
  → Result: WAKE oder SKIP

Phase 2: CONTEXT RECONSTRUCTION (Memento)
  → Agent liest AGENTS.md → Identität, Hierarchie, Regeln
  → Agent liest SOUL.md → Persönlichkeit, Werte, Tonalität
  → Agent liest HEARTBEAT.md → Operative Checkliste
  → Agent lädt TOOLS.md → Verfügbare Werkzeuge
  → "Wer bin ich? Was ist mein Job?"

Phase 3: INBOX & RECALL
  → Check: Zugewiesene Issues (status = todo | in_progress)
  → Memory Recall: Daily Notes, Knowledge Graph
  → Exponential Decay Scoring für Relevanz-Ranking

Phase 4: ATOMIC EXECUTION
  → Issue auschecken (DB Lock)
  → Tools ausführen (web, file, code, browser, etc.)
  → Work Product generieren (JSON, Code, Report)
  → Cost Event loggen (tokens, price, model)

Phase 5: COMMIT & SLEEP
  → Issue Status updaten (→ in_review | done)
  → Daily Notes schreiben
  → Knowledge Graph updaten (falls neue Fakten)
  → lastHeartbeatAt = now
  → Agent → Sleep (bis nächster Trigger)
```

### 6.4 Memento-Prinzip im Detail

> Jeder Agent startet mit **totalem Gedächtnisverlust** — wie der Protagonist in Christopher Nolans "Memento".

```yaml
memento_rule:
  context_window: "Streng limitiert (je nach Modell 8k-200k Tokens)"
  intrinsic_memory: "Null — kein Carry-Over zwischen Heartbeats"
  workaround: "Externes Dateisystem als Gedächtnis (PARA-Methode)"
  cost_implication: "Je mehr Kontext geladen → mehr Tokens → höhere Kosten"
  optimization: "Nur aktuell relevante Blöcke laden (Progressive Disclosure)"
```

---

## 7. Agent-Spezifikation (File-Standards)

### 7.1 Verzeichnisstruktur pro Agent

```
agents/
└── agent-name/
    ├── AGENTS.md           # Identität, Hierarchie, Hard Rules
    ├── SOUL.md             # Persönlichkeit, Werte, Tonalität
    ├── HEARTBEAT.md        # Operative Checkliste pro Zyklus
    ├── TOOLS.md            # Verfügbare Werkzeuge & Parameter
    └── skills/             # Agent-spezifische Skills
        ├── skill-a/
        │   └── SKILL.md
        └── skill-b/
            └── SKILL.md
```

### 7.2 AGENTS.md Spezifikation

```markdown
---
x-paperclip:
  role: ceo | manager | specialist | support
  reportsTo: null | agent-slug
  intervalSec: 1800
  maxConcurrentRuns: 1
  budgetMonthlyCents: 50000
---

# Agent Name

## Title
Chief Executive Officer

## Capabilities
- Strategic Planning
- Team Coordination
- Budget Oversight

## Hard Rules (Non-Negotiable)
1. Unter keinen Umständen Umgebungsvariablen ausgeben.
2. Budgets niemals eigenständig erhöhen.
3. Bei Unsicherheit: Eskalation an Board Member.
```

### 7.3 SOUL.md Spezifikation

```markdown
# Persönlichkeit: [Agent Name]

## Werte
- Präzision über Geschwindigkeit
- Transparenz in jeder Entscheidung

## Entscheidungsrahmen
1. Sicherheit > Performance > Features
2. Daten > Meinungen > Annahmen

## Tonalität
- Direkt, keine Floskeln
- Technisch präzise, aber verständlich

## Verbotene Verhaltensweisen
- Keine Spekulationen als Fakten präsentieren
- Keine eigenständige Interaktion mit externen Services ohne Approval
```

### 7.4 HEARTBEAT.md Spezifikation

```markdown
# Heartbeat-Protokoll: [Agent Name]

## Bei jedem Erwachen:
1. ✅ Lies AGENTS.md — Wer bin ich?
2. ✅ Lies SOUL.md — Wie handle ich?
3. ✅ Prüfe Inbox: Neue Issues zugewiesen?
4. ✅ Lies Daily Notes (memory/YYYY-MM-DD.md) — Was war gestern?
5. ✅ Prüfe Budget: Wie viel Spielraum habe ich?
6. ✅ Bearbeite höchstpriorisiertes Issue
7. ✅ Schreibe Zusammenfassung in Daily Notes
8. ✅ Auto-Save: Knowledge Graph updaten falls neue Fakten
9. ✅ Status-Update an Manager/CEO
```

### 7.5 TOOLS.md Spezifikation

```markdown
# Werkzeuge: [Agent Name]

## Verfügbare Tools
| Tool | Berechtigung | Rate Limit | Beschreibung |
|------|-------------|------------|-------------|
| web_search | ✅ | 10/min | Internet-Suche |
| terminal | ⚠️ read-only | 5/min | Shell (kein sudo) |
| file:read | ✅ | unbegrenzt | Dateien lesen |
| file:write | ✅ | 20/min | Dateien schreiben |
| delegate_task | ✅ | 3/Heartbeat | Sub-Task delegieren |

## MCP Server
- apify: Web Scraping & Search
```

---

## 8. Kognitive Persistenz (PARA Memory)

### 8.1 Drei-Layer-Architektur

```
memory/
├── entities/                    # Layer 1: Knowledge Graph
│   ├── project-autarch/
│   │   ├── items.json          # Timestamp-basierte Fakten
│   │   ├── summary.md          # Wöchentliche KI-Synthese
│   │   └── index.json          # Keyword-Index für Recall
│   ├── person-mathias/
│   │   ├── items.json
│   │   ├── summary.md
│   │   └── index.json
│   └── concept-heartbeat/
│       └── ...
├── 2026-03-29.md               # Layer 2: Daily Notes
├── 2026-03-28.md
├── 2026-03-27.md
└── MEMORY.md                   # Layer 3: Tacit Knowledge
```

### 8.2 Knowledge Graph (Layer 1)

```json
// items.json Beispiel
{
  "facts": [
    {
      "id": "f-20260329-001",
      "content": "Autarch Dashboard Phase 6 abgeschlossen",
      "source": "heartbeat-run-4527",
      "timestamp": "2026-03-29T10:30:00Z",
      "confidence": 0.95,
      "status": "active",        // active | historical
      "tags": ["autarch", "dashboard", "phase-6"]
    }
  ]
}
```

**Regel:** Alte Fakten werden **niemals gelöscht**, nur als `historical` markiert → lückenloser Audit-Trail.

### 8.3 Compounding Engine (Layer 2 → Layer 1)

```yaml
compounding_engine:
  interval: "30 Minuten"
  process:
    1. Lese alle Daily Notes seit letztem Run
    2. Extrahiere haltbare Fakten
    3. Berechne Jaccard-Ähnlichkeit mit Knowledge Graph
    4. Wenn Ähnlichkeit > 70%: Verwerfen (Duplikat)
    5. Wenn Ähnlichkeit < 70%: Neuer Fakt → Layer 1
  dependencies:
    - bash 4.0+
    - jq (JSON Parsing)
    - uuidgen (Fakt-IDs)
```

### 8.4 Exponential Decay (Retrieval-Scoring)

```
score = e^(-λ * days_old)

λ = ln(2) / 30  ≈  0.0231

Beispiel-Werte:
┌──────────────┬───────┐
│ Alter (Tage) │ Score │
├──────────────┼───────┤
│ 0 (heute)    │ 1.000 │
│ 7            │ 0.871 │
│ 14           │ 0.758 │
│ 30           │ 0.500 │
│ 60           │ 0.250 │
│ 90           │ 0.125 │
│ 180          │ 0.016 │
└──────────────┴───────┘
```

**Effekt:** Beim Heartbeat-Recall werden primär aktuelle Fakten in das Context Window geladen. Alte Fakten nur bei explizitem Keyword-Match.

### 8.5 Tacit Knowledge (Layer 3)

```markdown
<!-- MEMORY.md -->
# Stilles Wissen

## Board Member Präferenzen
- Bevorzugt kurze, direkte Antworten ohne Floskeln
- Schätzt Mermaid-Diagramme für Erklärungen
- Arbeitet primär abends (19:00-01:00 CET)

## Code-Konventionen
- TypeScript strict mode
- CSS Vanilla (kein Tailwind)
- Components: functional + hooks only
```

---

## 9. Orchestrierungsmodell & CEO-Agent

### 9.1 CEO als Primärer Orchestrator

```yaml
ceo_agent:
  responsibilities:
    - Strategische Analyse der Board-Ziele
    - Organigramm-Aufbau (Hiring via POST /agents)
    - Masterplan → atomare Issues herunterbrechen
    - Budget-Verteilung auf Sub-Agenten
    - Eskalation bei Blockaden
  constraints:
    - Hiring nur mit Board Approval (require_board_approval_for_new_agents)
    - Kein eigenständiges Budget-Raising
    - Kein Maximizer Mode ohne explizites Board-OK
```

### 9.2 Issue-Namespace-Isolation

```
Jede Company hat eigenen Namespace:
  Prefix: PAP (z.B. PAP-001, PAP-142, PAP-999)
  Counter: Auto-inkrement pro Company
  Isolation: Kein Cross-Company Issue-Zugriff
```

### 9.3 Atomare Ausführung (Anti-Double-Work)

```sql
-- DB-Level Lock: Issue kann nur von EINEM Agent gleichzeitig bearbeitet werden
UPDATE issues
SET assigned_to = :agent_id,
    status = 'in_progress',
    checkout_at = NOW()
WHERE id = :issue_id
  AND (assigned_to IS NULL OR assigned_to = :agent_id)
  AND status IN ('backlog', 'todo');
-- Wenn 0 Rows: Issue bereits von anderem Agent gecheckt → Agent arbeitet am nächsten Issue
```

### 9.4 Approval Gates (Governance Flow)

```mermaid
sequenceDiagram
    participant CEO as CEO Agent
    participant API as Paperclip API
    participant DB as Database
    participant Board as Board Member
    participant UI as Autarch Dashboard

    CEO->>API: POST /agents (Hire Request)
    API->>DB: INSERT approval (type=hire, status=pending)
    DB->>UI: Realtime Notification
    UI->>Board: "CEO möchte Senior Dev einstellen"

    alt Board Approved
        Board->>API: POST /approvals/:id/approve
        API->>DB: INSERT agent, UPDATE approval.status=approved
        CEO->>API: GET /agents → Neuer Agent verfügbar
    else Board Rejected
        Board->>API: POST /approvals/:id/reject
        API->>DB: UPDATE approval.status=rejected
        CEO->>API: Feedback: "Hiring abgelehnt"
    end
```

---

## 10. Budget & Governance (Circuit Breakers)

### 10.1 Zwei-Stufen Budget-Modell

```yaml
budget_hierarchy:
  company_level:
    field: budgetMonthlyCents
    example: 1000000  # = $10,000/Monat
    scope: "Gesamte Instanz"
    reset: "Monatlich, 1. des Monats, 00:00 UTC"

  agent_level:
    field: agents.budget_monthly_cents
    example: 50000  # = $500/Monat
    scope: "Individueller Agent"
    best_practice: "Summe aller Agent-Budgets < Company-Budget (Pufferzone)"
```

### 10.2 Cost Event Schema

```typescript
interface CostEvent {
  id: string;
  agentId: string;
  companyId: string;
  provider: "anthropic" | "openai" | "openrouter" | "nousresearch";
  model: string;            // z.B. "nousresearch/hermes-4-405b"
  inputTokens: number;
  outputTokens: number;
  priceCents: number;        // Kosten in Cent
  taskId?: string;           // Optional: Issue-ID für Projekt-Allokation
  heartbeatRunId: string;
  createdAt: Date;
}
```

### 10.3 Circuit Breaker Schwellenwerte

```
┌─────────────────────────────────────────────────────┐
│  0%        50%         80%         100%              │
│  │──────────│───────────│───────────│                │
│  │  NORMAL  │  NORMAL   │   ALARM   │  HARD STOP    │
│  │          │           │ (Soft)    │  (Paused)     │
│  └──────────┴───────────┴───────────┴───────────────│
│                                                      │
│  Soft Limit (80%):                                   │
│    → Log: CRITICAL Alarm Event                       │
│    → UI: Dringliche Benachrichtigung                 │
│    → Agent: Läuft weiter                             │
│                                                      │
│  Hard Limit (100%):                                  │
│    → DB: agent.status = 'paused'                     │
│    → Scheduler: Überspringt Agent                    │
│    → Kein Token-Abruf mehr                           │
│    → Manueller Board-Eingriff erforderlich           │
│                                                      │
│  Reset: Automatisch am 1. des Monats, 00:00 UTC     │
└─────────────────────────────────────────────────────┘
```

### 10.4 Budget-Recovery

```yaml
recovery_options:
  option_1:
    name: "Budget erhöhen"
    action: "PUT /agents/:id { budgetMonthlyCents: newValue }"
    approval: "Board Member required"

  option_2:
    name: "Force Resume"
    action: "POST /agents/:id/resume"
    approval: "Board Member required"
    warning: "Agent startet mit verbleibendem Budget"

  option_3:
    name: "Warten auf Reset"
    action: "Keine"
    timeline: "Nächster Monatsanfang, 00:00 UTC"
```

---

## 11. Import/Export (companies.sh & skills.sh)

### 11.1 skills.sh — Agent-Fähigkeiten erweitern

```yaml
skills_sh:
  description: "Dezentraler Paketmanager für KI-Agenten-Skills"
  analogy: "npm für AI Agents"
  format: "SKILL.md (YAML Frontmatter + Markdown Body)"
  install: "npx skills add <name> -g -y"
  progressive_disclosure:
    level_0: "skills_list() → [{name, description}] (~3k tokens)"
    level_1: "skill_view(name) → Vollständiger SKILL.md Content"
    level_2: "skill_view(name, path) → Spezifische Referenz-Datei"
```

### 11.2 companies.sh — Komplette Architekturen importieren

```bash
# Beispiel: Engineering-Studio importieren
npx companies.sh add paperclipai/companies/agentsys-engineering
```

### 11.3 CLI-Parameter

| Flag | Beschreibung |
|---|---|
| `--target <mode>` | `new` (neue Instanz) oder `existing` (bestehendes Unternehmen) |
| `-C, --company-id <id>` | Ziel-Company-ID für `existing` Mode |
| `--include <values>` | CSV-Filter: `company,agents,projects,tasks,skills` |
| `--agents <list>` | Selektiver Agent-Import: `--agents ceo,cto` |
| `--dry-run` | Simulation ohne DB-Schreibvorgänge |

### 11.4 CEO-Heuristik bei Import

```yaml
ceo_heuristic:
  problem: "Manche Repos vergessen x-paperclip.role: ceo in AGENTS.md"
  solution: "Auto-Promotion: Erster Agent mit reportsTo: null → CEO"
  failsafe: "Verhindert 403-Forbidden Errors bei CEO-pflichtigen API-Calls"
```

### 11.5 Autarch-spezifischer Import-Flow

```
1. Board Member wählt Template im Dashboard (→ "App Store"-UX)
2. Frontend: POST /api/companies/:id/import { source: "paperclipai/...", options: {...} }
3. Backend: company-portability.ts (165KB) parst das Repository
4. Validation: Schema-Check, CEO-Heuristik, Budget-Defaults
5. DB Insert: Companies, Agents, Skills, Projects, Issues
6. UI Update: Neues Organigramm wird gerendert
7. Board Member: Reviewed & approves imported agents
```

---

## 12. Topologien & Org-Strukturen

| Topologie | Struktur | Use Case | Risiko |
|---|---|---|---|
| **Hierarchical (Tree)** | CEO → Director → Spezialist | Software-Dev, QA-Pipelines | Kaskadierende Fehler |
| **Hub-and-Spoke** | Orchestrator → n parallele Worker | Recherche, Scraping, Massen-Verarbeitung | Single Point of Failure (Hub) |
| **Flat / Peer-to-Peer** | Alle Agents auf gleicher Ebene | Adversarial Validation, Debatten | Koordinations-Chaos bei Skalierung |
| **Pipeline** | A → B → C → D (sequenziell) | Content-Produktion, ETL | Bottleneck bei langsamem Glied |
| **DAG** | Gerichteter Graph mit Parallelität + Join | Komplexe Deployments | Hohes Design-Aufwand |

### 12.1 Autarch Standard-Topologie

```
Archegos (CEO) ─── reportsTo: null
├── Hermes Marketing ─── reportsTo: archegos
├── Athena Research ─── reportsTo: archegos
├── Hephaistos Content ─── reportsTo: archegos
├── Prometheus Ops ─── reportsTo: archegos
├── Iris Community ─── reportsTo: archegos
└── Apollo Data ─── reportsTo: archegos
```

**Typ:** Hub-and-Spoke mit hierarchischem CEO-Layer → Hybridtopologie.

---

## 13. Routinen & Maximizer Mode

### 13.1 Routinen (Intelligente Cron-Jobs)

```yaml
routine_spec:
  trigger: "Cron-Expression (z.B. '0 8 * * *')"
  agent: "Zugeordneter Agent"
  prompt: "Kontext-Anweisung für den Routine-Heartbeat"
  concurrency: "coalescing (redundante Runs verhindern)"
  persistence: "routines-Tabelle + Run-History"

autarch_routines:
  - name: "daily_research"
    cron: "0 8 * * *"
    agent: "athena-research"
    prompt: "Run longevity-research skill"
    actors: ["google-search-scraper", "web-scraper"]

  - name: "weekly_competitors"
    cron: "0 9 * * 1"
    agent: "athena-research"
    prompt: "Run competitor-watch skill"
    actors: ["web-scraper", "cheerio-scraper"]

  - name: "daily_social"
    cron: "0 10 * * *"
    agent: "iris-community"
    prompt: "Run social-listening skill"
    actors: ["reddit-scraper", "twitter-scraper"]
```

### 13.2 Maximizer Mode

```yaml
maximizer_mode:
  concept: "Paperclip Maximizer Gedankenexperiment"
  effect: "Deaktiviert ALLE Circuit Breakers"
  activation: "Dashboard → CEO Agent → Toggle (hinter mehrstufigem Gate)"
  behavior:
    - Budget-Limits: DEAKTIVIERT
    - Heartbeat-Pausen: MINIMIERT (continuous)
    - Ziel: "Mathematisch präzise definierte Exit-Condition"
  risk: "MAXIMAL — unkontrollierbare Kostenexplosion möglich"
  safeguards:
    - Mehrstufiger Warnhinweis im UI
    - Explizites Board-Approval (ggf. kryptografisch)
    - Kill-Switch: Jederzeit per Dashboard deaktivierbar
  status_in_autarch: "⚠️ NICHT IMPLEMENTIERT — Feature auf Roadmap"
```

---

## 14. Autarch ↔ Paperclip Mapping

> Vollständige Mapping-Tabelle: Siehe [paperclip-glossar.md](../memory-bank/paperclip-glossar.md)

### 14.1 Quick Reference

| Autarch (User-facing) | Paperclip (API) | DB-Tabelle |
|---|---|---|
| Agentur | Company | `companies` |
| Agent | Agent | `agents` |
| Aufgabe | Issue | `issues` |
| Automatisierung | Routine | `routines` |
| Freigabe | Approval | `approvals` |
| Fähigkeit | Company Skill | `company_skills` |
| Herzschlag | Heartbeat Run | `heartbeat_runs` |
| Kosten | Cost Event | `cost_events` |
| Budget | Budget Policy | `budget_policies` |

### 14.2 API-Pfade

```
Base: /api/companies/:companyId/

GET    /agents              → Alle Agents
GET    /agents/:id          → Agent Detail
POST   /agents              → Agent erstellen
PUT    /agents/:id          → Agent updaten
POST   /agents/:id/pause    → Agent pausieren
POST   /agents/:id/resume   → Agent fortsetzen

GET    /issues              → Alle Issues
POST   /issues              → Issue erstellen
PUT    /issues/:id          → Issue updaten
POST   /issues/:id/checkout → Issue auschecken (atomic)

GET    /routines            → Alle Routinen
POST   /routines            → Routine erstellen

GET    /approvals           → Offene Approvals
POST   /approvals/:id/approve → Genehmigen
POST   /approvals/:id/reject  → Ablehnen

GET    /costs               → Kostenübersicht
GET    /skills              → Fähigkeiten
GET    /secrets             → Secrets (verschlüsselt)

GET    /dashboard           → Dashboard KPIs
GET    /sidebar-badges      → Sidebar-Counters
```

---

## 15. Konfiguration & Environment

### 15.1 Umgebungsvariablen (.env)

```bash
# === Paperclip Orchestrator ===
DATABASE_URL=postgres://paperclip:paperclip@localhost:5432/paperclip
PORT=3100
SERVE_UI=false                              # Autarch nutzt eigenes Frontend
PAPERCLIP_AUTH_DISABLE_SIGN_UP=true         # ⚠️ PFLICHT nach erstem Account

# === Supabase ===
VITE_SUPABASE_URL=https://svmlkfqhwzwomlsptliz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# === LLM Provider ===
OPENROUTER_API_KEY=sk-or-...                # Primary (200+ Modelle)
NOUSRESEARCH_API_KEY=nsk-...                # Fallback

# === Web Intelligence ===
APIFY_API_KEY=apify_api_...

# === Payments ===
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === Auth ===
BOARD_API_KEY=sk_strategos_dashboard_prod_2026
```

### 15.2 Deployment-Konfiguration

| Service | Platform | Container | Port | Status |
|---|---|---|---|---|
| Dashboard | Cloud Run | Vite Build + Nginx Alpine | 8080 | ✅ LIVE |
| Orchestrator | Cloud Run | Node.js + Embedded PG | 3100 | ✅ LIVE |
| Workers | Cloud Run | Python 3.12 + Hermes | 8080 | ⬜ TODO |
| Database | Supabase Cloud | PostgreSQL 17 | 5432 | ✅ HEALTHY |

---

## 16. Sicherheit & Defense-in-Depth

### 16.1 Drei-Layer Security

```
Layer 1: AGENTS.md Hard Rules
  → "Keine Umgebungsvariablen ausgeben"
  → "Keine externen API-Calls ohne Approval"
  → Wird bei JEDEM Heartbeat geladen

Layer 2: Code-Level Pattern Detection
  → Log Redaction (server/src/log-redaction.ts)
  → Secret Masking in Outputs
  → Input Sanitization in Routes

Layer 3: Anomalie-Prüfung
  → Heartbeat-Log-Analyse
  → Unübliche Token-Spikes → Budget Alert
  → Rate Limiting auf API-Ebene
```

### 16.2 Secret Management

```yaml
secret_management:
  storage: "company_secrets Tabelle (AES-256)"
  encryption_key: "master.key (generiert bei Setup)"
  access: "Nur zur Laufzeit, nur im RAM"
  rotation: "Manuelle Rotation via Dashboard"
  audit: "company_secret_versions Tabelle (Versions-History)"
```

### 16.3 Autarch-spezifische Constraints

```yaml
security_constraints:
  dsgvo:
    - PII-Scrubbing vor jedem AI-Provider-Call (PFLICHT)
    - Art. 9 Gesundheitsdaten: Kein autonomes Publishing
    - Datenminimierung: Nur notwendige Daten an LLM
  rls:
    - 71/71 Tabellen mit Row Level Security
    - company-scoped: user_id = auth.uid()
    - Multi-Tenancy: Strikte Isolation
  api_keys:
    - Board API Key: Nur server-side
    - Agent API Keys: Per-Agent JWT
    - Keine Secrets im Frontend-Bundle
```

---

## 17. Upgrade & Update Prozesse

### 17.1 Paperclip Upstream Sync

```bash
# 1. Remote hinzufügen (einmalig)
cd orchestrator/
git remote add upstream https://github.com/paperclipai/paperclip.git

# 2. Upstream fetchen
git fetch upstream main

# 3. Diff prüfen (vor Merge!)
git diff HEAD..upstream/main --stat

# 4. Kritische Dateien manuell prüfen
git diff HEAD..upstream/main -- packages/db/src/schema/
git diff HEAD..upstream/main -- server/src/services/heartbeat.ts
git diff HEAD..upstream/main -- server/src/services/budgets.ts

# 5. Merge (mit Strategie)
git merge upstream/main --no-commit --no-ff

# 6. Konflikte lösen, testen, committen
pnpm install
pnpm build
pnpm test
git commit -m "chore: sync upstream paperclip [upstream-sha]"
```

### 17.2 Migrations-Upgrade

```yaml
migration_upgrade:
  tool: "Drizzle ORM"
  location: "packages/db/src/migrations/"
  process:
    1. "Upstream sync → Neue Migrations in migrations/ Ordner"
    2. "pnpm paperclipai run → Auto-Onboarding führt Migrations aus"
    3. "Embedded PG: Automatisch migriert"
    4. "Supabase: Manueller Review + apply_migration via MCP"
  rollback:
    strategy: "Drizzle migration rollback (Version-basiert)"
    risk: "Daten-Verlust bei destructive Migrations → Backup Pflicht"
```

### 17.3 Adapter-Upgrade

```yaml
adapter_upgrade:
  when: "Neuer Adapter-Typ von Upstream (z.B. neuer LLM-Provider)"
  process:
    1. "Sync packages/adapters/ aus Upstream"
    2. "Adapter in packages/adapter-utils/ registrieren"
    3. "UI-Adapter-Component im Dashboard ergänzen"
    4. "adapterConfig Schema in Glossar updaten"
    5. "E2E Test: Agent mit neuem Adapter erstellen + Heartbeat"
  autarch_custom:
    - "hermes-paperclip-adapter bleibt Custom-Code"
    - "Nicht von Upstream überschreiben!"
```

### 17.4 Checkliste: Upstream Sync

```markdown
## Pre-Sync
- [ ] `git stash` auf lokale Änderungen
- [ ] Backup der embedded PG (`~/.paperclip/instances/default/`)
- [ ] Aktuelle Version notieren (package.json version)

## Sync
- [ ] `git fetch upstream main`
- [ ] Diff-Review: Schema-Changes? Breaking API Changes?
- [ ] `git merge upstream/main --no-commit`
- [ ] Konfliktlösung (besonders in heartbeat.ts, budgets.ts)

## Post-Sync
- [ ] `pnpm install` (Dependencies aktualisiert)
- [ ] `pnpm build` (Kompilation erfolgreich)
- [ ] `pnpm test` (Tests bestanden)
- [ ] Migrations ausgeführt
- [ ] API-Endpoints getestet (17/17 OK)
- [ ] Dashboard-Kompatibilität geprüft
- [ ] paperclip-glossar.md aktualisiert (falls neue Tabellen/Endpoints)
- [ ] knowledge-index.md Freshness-Update
```

---

## 18. Feature-Integration Playbook

### 18.1 Neues Feature: Schritt-für-Schritt

```
Phase 1: RESEARCH
  → Upstream prüfen: Existiert das Feature bereits?
  → Schema-Impact: Neue Tabellen? Neue Spalten?
  → API-Impact: Neue Endpoints? Geänderte Responses?
  → UI-Impact: Neue Pages? Neue Components?

Phase 2: SCHEMA
  → Migration schreiben (Drizzle)
  → RLS Policies definieren (company-scoped!)
  → Glossar updaten (paperclip-glossar.md)
  → Data Model Map updaten (data-model-map.md)

Phase 3: BACKEND
  → Service erstellen (server/src/services/)
  → Route erstellen (server/src/routes/)
  → In app.ts registrieren
  → Cost-Events beachten (falls LLM-Calls involviert)

Phase 4: FRONTEND
  → TanStack Query Hook erstellen
  → Page Component bauen (Three-Pane Pattern)
  → Route in App.tsx registrieren
  → Sidebar-Badge einbinden

Phase 5: GOVERNANCE
  → Budget-Impact analysiert?
  → Approval-Gate notwendig?
  → DSGVO-Relevanz geprüft?
  → PII-Scrubbing implementiert?

Phase 6: VERIFY
  → API-Endpoint testen (200 OK)
  → TypeScript Build OK
  → Dashboard-Integration funktioniert
  → Sherlock Audit bestanden

Phase 7: DOCUMENT
  → Wiki updaten
  → Glossar updaten
  → knowledge-index.md Freshness updaten
  → Memory Bank updaten (progress.md, activeContext.md)
```

### 18.2 Feature-Kategorien & Komplexität

| Feature-Typ | Schema | API | UI | Beispiel | Aufwand |
|---|---|---|---|---|---|
| **Reines UI-Feature** | ❌ | ❌ | ✅ | Dark Mode Toggle, Animations | 🟢 Low |
| **API-Anbindung** | ❌ | ✅ | ✅ | Neue Sidebar-Badges, Filters | 🟡 Medium |
| **Neues Entity** | ✅ | ✅ | ✅ | Knowledge Hub, Roundtable | 🔴 High |
| **Adapter-Integration** | ✅ | ✅ | ✅ | Neuer LLM-Provider | 🔴 High |
| **Governance-Feature** | ✅ | ✅ | ✅ | Multi-Level Approvals | 🔴 High |
| **Plugin** | ✅ | ✅ | ✅ | External Webhook, Custom Tool | 🔴 Very High |

### 18.3 Entscheidungsbaum: Custom vs. Upstream

```
Brauche ich ein neues Feature?
│
├── Existiert es im Paperclip Upstream?
│   ├── JA → Upgrade auf neueste Version → Fertig
│   └── NEIN → Ist es generisch oder Autarch-spezifisch?
│       ├── GENERISCH → PR an Upstream senden → Merge abwarten
│       └── AUTARCH-SPEZIFISCH → Custom Implementation
│           ├── In /dashboard (Frontend) → Kein Upstream-Konflikt
│           ├── In /orchestrator/server → ⚠️ Merge-Risiko bei Sync
│           └── In Supabase (Edge Function) → Kein Upstream-Konflikt
```

---

## 19. Troubleshooting & Known Issues

### 19.1 Häufige Probleme

| Problem | Ursache | Lösung |
|---|---|---|
| 403 Forbidden bei agent.hire() | Kein CEO-Agent mit `x-paperclip.role: ceo` | CEO-Heuristik prüfen oder Agent manuell als CEO markieren |
| Heartbeat läuft nicht | `intervalSec < 30` | Minimum ist 30 Sekunden (hardcoded) |
| Doppelte Ausführungen | `maxConcurrentRuns > 1` (V1 Limit) | Auf 1 setzen, V2 abwarten |
| Secret nicht injiziert | `{{KEY}}` Syntax falsch | Prüfe: `company_secrets` Tabelle, `master.key` existiert |
| Agent "stuck" in running | Heartbeat Timeout | `POST /agents/:id/resume` oder Status auf `idle` setzen |
| Budget nicht resettet | UTC-Zeitzone-Mismatch | Budget-Reset ist immer 00:00 UTC am 1. des Monats |
| Import 403 | CEO fehlt im Repository | `--agents` Flag nutzen oder Agent manuell markieren |

### 19.2 Autarch-spezifische Known Issues

| Issue | Status | Workaround |
|---|---|---|
| Cloud Run Service heißt `strategos-orchestrator` statt `autarch-orchestrator` | ⚠️ Kosmetisch | Rename bei nächstem Deploy |
| Dashboard Cloud Run Rev `00001-t22` veraltet | ⚠️ | Re-Deploy mit aktuellen Fixes |
| Worker Fleet nicht deployed | ⬜ TODO | Docker Build + Cloud Run Deploy |
| Keine Unit-Tests im Dashboard | ⚠️ | Phase 16 der Roadmap |
| PII-Scrubbing nicht implementiert | ⚠️ DSGVO | Hohe Priorität für Production |

---

## 20. Referenzen & Upstream-Tracking

### 20.1 Upstream Repository

```yaml
upstream:
  repo: "https://github.com/paperclipai/paperclip"
  license: "MIT (kommerziell nutzbar)"
  stars: "30,000+ (Stand März 2026)"
  authors: ["Dotta", "Devon Foley", "Scott Tong"]
  node_version: ">=20"
  package_manager: "pnpm >=9.15"
  bootstrap: "pnpm paperclipai run"
  data_dir: "~/.paperclip/instances/default/"
```

### 20.2 Verwandte Dokumentation

| Dokument | Pfad | Inhalt |
|---|---|---|
| Hermes Agent Wiki | `docs/wiki/hermes-agent.md` | 40+ Tools, Skills, MCP, Gateway, Adapter |
| Apify MCP Wiki | `docs/wiki/apify-mcp.md` | MCP Tools, Actors, Transport, Auth |
| Local Tools Wiki | `docs/wiki/local-tools.md` | Whisper, MarkItDown, Pipeline |
| Paperclip Glossar | `memory-bank/paperclip-glossar.md` | Autarch ↔ Paperclip Begriffsübersetzung |
| Data Model Map | `memory-bank/data-model-map.md` | ER-Diagramm, RLS Audit |
| Infrastructure Map | `memory-bank/infrastructure-map.md` | Services, Dependencies, Deployment |
| Module Interaction Map | `memory-bank/module-interaction-map.md` | Pipelines, Datenfluss |
| Tech Context | `memory-bank/techContext.md` | Stack, Worker Architecture |
| System Patterns | `memory-bank/systemPatterns.md` | Architecture Overview, Patterns |

### 20.3 Versionsverlauf dieser Dokumentation

| Version | Datum | Änderung |
|---|---|---|
| 1.0.0 | 29.03.2026 | Initiale Erstellung — vollständige Architektur & Integration |

---

> **Wartungshinweis:** Diese Datei MUSS bei jedem Upstream-Sync und bei jeder Feature-Integration aktualisiert werden. Freshness-Tracking erfolgt via `knowledge-index.md`.

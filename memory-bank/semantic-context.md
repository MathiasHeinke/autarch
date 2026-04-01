# 🧠 Semantic Context — Autarch / Paperclip

> Wachsendes Literaturverzeichnis des Systemverständnisses.
> Wird automatisch bei jedem Phasen-Checkpoint und Session-Ende erweitert.
> NIEMALS löschen — nur appenden. Bei Overflow (>300 Zeilen) → älteste 50% in `archive/` verschieben.

---

## Index der Kern-Module

### Control Plane (heartbeat.ts)
- **Zweck:** Kern-Orchestrator, 4.038 LoC, Agent Wakeup → Issue Checkout → Memory Load → Hermes Execute → Memory Persist → Honcho Ingest → Cost Record
- **Kritische Invariante:** maxConcurrentRuns=1 pro Agent (kein Self-Racing)
- **Datei:** `server/src/services/heartbeat.ts`
- **Lesen wenn:** Agent startet nicht, Issue bleibt stuck, Memory-Lifecycle-Bug

### Hermes Adapter Bridge (execute.ts)
- **Zweck:** HTTP POST zum Cloud Run Worker, NDJSON-Parsing, PII-Scrub, Toolset-Whitelist-Enforcement
- **Security:** ALLOWED={web,file,memory,delegate_task}, BLOCKED={terminal,process,shell,exec}
- **Datei:** `server/src/adapters/hermes-cloud/execute.ts`
- **Lesen wenn:** Worker-Dispatch-Problem, NDJSON-Parsing-Issue, Security-Überprüfung

### Memory Lifecycle (memory-lifecycle.ts)
- **Zweck:** Pre-Load agent_memory DB → Worker, Post-Persist memory_save Events aus NDJSON
- **Schema:** agent_memory (companyId, agentId, key, content, category, importance, sourceRunId)
- **Limit:** MAX_MEMORIES=50 (Token-Bloat-Schutz)
- **Datei:** `server/src/adapters/hermes-cloud/memory-lifecycle.ts`
- **Lesen wenn:** Memory-Persistenz-Problem, Agent erinnert sich nicht an vergangene Sessions

### Honcho Client (honcho-client.ts)
- **Zweck:** Cross-Session Reasoning, Workspace=company-scoped, Peer=agent-scoped
- **Fallback:** Non-fatal (logger.warn, gibt null zurück — blockiert nie)
- **URL:** HONCHO_API_URL=http://localhost:8100 (Self-Hosted Docker)
- **Datei:** `server/src/adapters/hermes-cloud/honcho-client.ts`
- **Lesen wenn:** Reasoning-Qualität sinkt, Honcho-Connectivity-Problem

### Hermes Worker (workers/hermes-cloud/main.py)
- **Zweck:** Stateless FastAPI Inference Engine (Python), AIAgent library mode
- **Config:** skip_memory=True, persist_session=False (100% stateless)
- **Auth:** X-Hermes-Secret Header (Shared Secret)
- **Datei:** `workers/hermes-cloud/main.py`
- **Lesen wenn:** Worker-500-Error, Streaming-Bug, GPU/Model-Problem

### DB Schema (packages/db)
- **Zweck:** Drizzle ORM, 59 Schema-Files, 66 Tabellen, 48 Migrations
- **Kritisch:** agentMemory (external brain), issues (Kern-Entity), budgetPolicies (Cost Control)
- **Migrations:** `packages/db/src/migrations/0000`–`0046.sql`
- **Lesen wenn:** Schema-Drift, Migration-Bug, Schema-Verständnis nötig

### Plugin System (15 Module)
- **Zweck:** Dynamisches Plugin-Loading, Process Sandbox, Job Scheduler, Event Bus, Host API
- **Einstieg:** `server/src/services/plugin-loader.ts`
- **Lesen wenn:** Plugin-Start-Problem, Capability-Violation, Secret-Injection-Bug

### Agent Personas (workers/agents/)
- **Zweck:** 23 Persona-Profile mit SOUL.md, AGENTS.md, HEARTBEAT.md, TOOLS.md
- **Format:** Statische Markdown-Dateien, kein Code
- **Lesen wenn:** Agent-Persönlichkeit konfigurieren, Neue Persona anlegen

---

## Session-Chronik (neueste zuerst)

### 2026-04-02 — Deep Research v4.1 (Iterativer Update)
**Pilot:** Antigravity (Deep Research Workflow)
**Scope:** Alle neuen Commits seit v4.0 (4 neue Commits), Infra-Audit, Drift-Detection
**Neue Erkenntnisse:**
- `7b83a323`: Model-Namespace Fix → `nousresearch/hermes-4-405b`
- `65672353`: Honcho Self-Host Infra deployt → `infrastructure/honcho/` (Docker :8100)
- `66f94130`: Hotfix `enabled_toolsets` falsy-list Bug
- `5bded47a`: Hermes Worker v0.6.0 DEPLOYED auf Cloud Run europe-west1
- **Hermes-agent.md DRIFT entdeckt:** "Nächste Schritte" als offen markiert, obwohl ALLE 3 High-Items seit 2026-04-01 DONE
- **23 Worker-Agent-Personas** in `workers/agents/`, **3 Skills** in `workers/skills/`
- **Honcho Docker Compose** Port 8100 (API), 5433 (DB), 6380 (Redis)
- **infrastructure-map.md aktualisiert:** Cloud Run + Honcho jetzt als LIVE markiert
- **semantic-context.md** initial befüllt (dieses Dokument)
**Output:** ground-of-truth.md v4.1, semantic-context.md befüllt, infrastructure-map.md LIVE-Status, hermes-agent.md Drift-Fix

### 2026-04-01 — Deep Research v4.0 (Initial)
**Pilot:** Antigravity (Deep Research Workflow)
**Scope:** 9-Phase Exhaustive Excavation, 1.467 Dateien, 1.846 Commits
**Erkenntnisse:**
- 27 Monster Files (>1kLoC) — heartbeat.ts (4.038), AgentDetail.tsx (4.078)
- 5 verwaiste Schema-Files, 5 verwaiste Migration-Tabellen
- 77 stale Docs (3 kritisch)
- Hermes Stateless Engine Validiert (Gateway Auth, PII-Scrub, Honcho)
- Hermes Worker v0.6.0 noch als PENDING — wurde 2026-04-01 später DEPLOYED
**Output:** ground-of-truth.md v4.0, file-manifest.md, architecture-timeline.md, data-model-map.md, edge-function-registry.md, knowledge-index.md, module-interaction-map.md, infrastructure-map.md

---

## 🔑 Schnell-Referenz: Kritische Werte

```yaml
# DB Schema
agent_memory:
  columns: [companyId, agentId, key, content, category, importance, sourceRunId]
  categories: [memory, skill]
  max_per_run: 50

# Hermes Worker
toolset_whitelist: [web, file, memory, delegate_task]
toolset_blocklist: [terminal, process, shell, exec, subprocess]
max_iterations_hard_cap: 50
cost_per_run_hard_cap: 5.00

# Honcho
workspace_pattern: "autarch-company-{companyId}"
peer_pattern: "agent-{agentId}"
session_pattern: "run-{runId}"

# Heartbeat
max_concurrent_runs_per_agent: 1
honcho_timeout: 5000ms (non-fatal)
memory_pre_load_cap: 50

# Ports
server: 3100
hermes_worker: 8080 (Cloud Run)
honcho_api: 8100
honcho_db: 5433
honcho_redis: 6380
```

---

## 📌 Bekannte Quirks & Gotchas

1. **heartbeat.ts Monolith**: 4.038 LoC — wenn ein Bug hier auftritt, zuerst `grep`-Suche nach dem relevanten Pipeline-Step, nicht die ganze Datei lesen.

2. **memory-lifecycle.ts `onConflictDoNothing()`**: Wenn ein Memory-Update nötig ist (gleicher Key, neuer Content), wird das aktuell **silent dropped**. Upgrade zu `onConflictDoUpdate()` wenn Updates nötig werden.

3. **Honcho Non-Fatal Pattern**: `honcho-client.ts` gibt bei jedem Fehler `null` zurück und loggt `logger.warn`. Worker blockiert nie auf Honcho. Wenn Honcho offline ist → Agent läuft ohne Reasoning-Enhancement weiter.

4. **hermes.json vs. per-agent Config**: Aktuell gibt es eine globale `workers/config/hermes.json` + pro Agent `workers/agents/{name}/`. Die globale Config ist der Default; `profileName` in `execute.ts` ermöglicht Hermes-Profile-basierte Isolation.

5. **PGlite in dev**: Keine externe DB nötig für Dev. `DATABASE_URL` fehlt → embedded PGlite springt ein. Migrations werden automatisch angewandt.

6. **Worker Agents sind Markdown, kein Code**: Die 23 Persona-Profiles in `workers/agents/` sind reine Markdown-Dateien (SOUL.md, AGENTS.md, HEARTBEAT.md, TOOLS.md). Sie sind Agent-Konfiguration, kein ausführbarer Code.

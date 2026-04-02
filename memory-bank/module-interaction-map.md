# 🔀 Module Interaction Map — Deep Research v4

> Generiert: 2026-04-01 | Letztes Update: 2026-04-02

## Pipeline 1: Agent Heartbeat Execution

```mermaid
flowchart TD
    CRON[Cron Scheduler] --> HB[heartbeat.ts]
    HB --> |0. Hydrate Context| CTX[issue body + comments → context.messages]
    CTX --> |issueComments table| DB2[(issues + issueComments)]
    HB --> |1. Load Memory| ML[memory-lifecycle.ts]
    ML --> |loadAgentMemories| DB[(agent_memory)]
    HB --> |2. Query Honcho| HC[honcho-client.ts]
    HC --> |getDialecticInsight| HONCHO[Honcho Server]
    HB --> |3. Select Adapter| AR[adapter/registry.ts]
    AR --> |hermes_cloud| EXEC[hermes-cloud/execute.ts]
    EXEC --> |HTTP POST| WORKER[Worker main.py]
    WORKER --> |NDJSON Stream| EXEC
    EXEC --> |4. usage events| COST[(cost_events)]
    HB --> |5. Post-Persist| ML2[memory-lifecycle.ts]
    ML2 --> |persistNewMemories| DB
    HB --> |6. Ingest to Honcho| HC2[honcho-client.ts]
    HC2 --> |ingestConversation| HONCHO
```

### Datenfluss
| Schritt | Modul | Input | Output | Ziel |
|---------|-------|-------|--------|------|
| 1 | `memory-lifecycle.ts` | company_id, agent_id | MemoryEntry[] | heartbeat context |
| 2 | `honcho-client.ts` | app_id, user_id, task | insight string | heartbeat context |
| 3 | `adapter/registry.ts` | adapter_key | ExecuteAdapter | heartbeat dispatch |
| 4 | `hermes-cloud/execute.ts` | ExecuteRequest | NDJSON stream | heartbeat events |
| 5 | `memory-lifecycle.ts` | save_memory events | DB inserts | agent_memory |
| 6 | `honcho-client.ts` | conversation messages | Honcho session | Honcho storage |

## Pipeline 2: Issue Lifecycle

```mermaid
flowchart TD
    UI[NewIssueDialog] --> |POST /api/issues| ROUTE[routes/issues.ts]
    ROUTE --> SVC[services/issues.ts]
    SVC --> |create| DB[(issues)]
    SVC --> |assign agent| WAKE[issue-assignment-wakeup.ts]
    WAKE --> |create wakeup| WR[(agent_wakeup_requests)]
    WR --> |next heartbeat| HB[heartbeat.ts]
    HB --> |checkout issue| SVC2[services/issues.ts]
    SVC2 --> |execution lock| DB
    HB --> |run adapter| ADAPTER[adapter/execute]
    ADAPTER --> |work products| WP[(issue_work_products)]
    HB --> |complete| SVC3[services/issues.ts]
    SVC3 --> |status: done| DB
```

## Pipeline 3: Plugin System

```mermaid
flowchart TD
    INSTALL[Plugin Install] --> LOADER[plugin-loader.ts]
    LOADER --> MANIFEST[plugin-manifest-validator.ts]
    LOADER --> REGISTRY[plugin-registry.ts]
    REGISTRY --> LIFECYCLE[plugin-lifecycle.ts]
    LIFECYCLE --> WORKER_MGR[plugin-worker-manager.ts]
    WORKER_MGR --> SANDBOX[plugin-runtime-sandbox.ts]
    LIFECYCLE --> JOBS[plugin-job-scheduler.ts]
    JOBS --> JOB_COORD[plugin-job-coordinator.ts]
    LIFECYCLE --> EVENTS[plugin-event-bus.ts]
    EVENTS --> TOOLS[plugin-tool-dispatcher.ts]
    TOOLS --> HOST[plugin-host-services.ts]
```

## Pipeline 4: Routines Automation

```mermaid
flowchart TD
    SCHED[cron.ts scheduler] --> ROUTINES[services/routines.ts]
    ROUTINES --> |evaluate triggers| RT[(routine_triggers)]
    ROUTINES --> |spawn issue| ISSUES[services/issues.ts]
    ISSUES --> |auto-assign| WAKE[issue-assignment-wakeup.ts]
    ROUTINES --> |log run| RR[(routine_runs)]
```

## Pipeline 5: Budget & Cost Control

```mermaid
flowchart TD
    HB[heartbeat.ts] --> |token usage| CE[(cost_events)]
    CE --> BUDGET[services/budgets.ts]
    BUDGET --> |check thresholds| BP[(budget_policies)]
    BUDGET --> |threshold breach| BI[(budget_incidents)]
    BI --> |auto-pause agent| AGENTS[(agents)]
    BUDGET --> |finance event| FE[(finance_events)]
```

## Cross-Domain Wiring
| Source Pipeline | Target Pipeline | Mechanismus | Beschreibung |
|----------------|-----------------|-------------|--------------|
| Heartbeat | Issue Lifecycle | Issue checkout/complete | Agent bearbeitet Issues während Heartbeat |
| Heartbeat | Budget Control | cost_events write | Token-Nutzung triggert Budget-Checks |
| Routines | Issue Lifecycle | Issue auto-create | Routine-Trigger erzeugen neue Issues |
| Plugin System | Heartbeat | Tool contributions | Plugins erweitern Agent-Toolsets |
| Issue Lifecycle | Approval System | issue_approvals | Governance-Gates für Aktionen |

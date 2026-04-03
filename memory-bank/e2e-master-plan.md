# 🐝 Autarch — End-to-End Master Test Plan
Generiert: 2026-04-02 18:02 CEST | Scope: **Memory Pipeline + Honcho Integration**

> **Fokus:** Validierung der 4 Fixes aus Commit `978b6791`:
> 1. Worker tool_call Event-Emission
> 2. memory-lifecycle Tool-Name Fix (save_memory → memory)
> 3. Honcho v3 Client Rewrite
> 4. Heartbeat Conversation Ingestion

## Baseline
| Metrik | Wert |
|--------|------|
| agent_memory Einträge | **0** |
| Honcho Workspaces | 1 (ares-intelligence) |
| Test-User | mathias@ares-bio.com (instance_admin) |
| Test-Company | ARES Bio.OS (b4eb2c07...) |
| Test-Agent | Hermes-E2E (23b6704e..., adapter: hermes_cloud, profileName: null) |
| Existierende Issues | ARE-1 (in_progress), ARE-2 (in_progress) |

---

## 🏁 Phase 1: Infrastructure Health (Pre-Flight)
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 1.1 | Server Health | GET /api/health → status:ok, authReady:true | ⏳ Pending | - |
| 1.2 | Worker Health | GET /v1/health → status:healthy, apiConnected:true | ⏳ Pending | - |
| 1.3 | Honcho Health | POST /v3/workspaces/list → 200 + items | ⏳ Pending | - |
| 1.4 | Supabase Connectivity | SELECT 1 FROM agent_memory → 0 rows | ⏳ Pending | - |
| 1.5 | Auth Login | POST /api/auth/sign-in → session cookie | ⏳ Pending | - |

## 💬 Phase 2: Agent Task Execution & Memory Write
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 2.1 | Reset Issues | Set ARE-1/ARE-2 to `done`, create fresh ARE-3 | ⏳ Pending | - |
| 2.2 | Issue Assignment | ARE-3 assigned to Hermes-E2E agent | ⏳ Pending | - |
| 2.3 | Trigger Heartbeat | POST /api/companies/{id}/heartbeat → 200 | ⏳ Pending | - |
| 2.4 | Worker Execution | Check Cloud Run logs: Worker received request, ran tools | ⏳ Pending | - |
| 2.5 | Tool-Call Events | Verify NDJSON stream contains tool_call events | ⏳ Pending | - |
| 2.6 | Memory Persistence | SELECT FROM agent_memory → rows > 0 | ⏳ Pending | - |
| 2.7 | Issue Completion | ARE-3 status changed to done/failed | ⏳ Pending | - |

## 🧠 Phase 3: Honcho Integration
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 3.1 | Honcho Workspace | Verify workspace created for ARES company | ⏳ Pending | - |
| 3.2 | Honcho Peer | Verify peer created for Hermes-E2E agent | ⏳ Pending | - |
| 3.3 | Honcho Session | Verify session created with run ID | ⏳ Pending | - |
| 3.4 | Honcho Messages | Verify conversation messages ingested | ⏳ Pending | - |

## 🌐 Phase 4: UI Dashboard Verification
| ID  | Funktion | Beschreibung | Test-Status | Gefundene Bugs / Fixes |
|-----|----------|--------------|-------------|------------------------|
| 4.1 | Login Flow | autarch.app → login → dashboard | ⏳ Pending | - |
| 4.2 | Company View | ARES Bio.OS company visible | ⏳ Pending | - |
| 4.3 | Agent Detail | Hermes-E2E agent shows runs | ⏳ Pending | - |
| 4.4 | Issue Detail | ARE-3 shows execution transcript | ⏳ Pending | - |
| 4.5 | Run Transcript | Agent response visible in run detail | ⏳ Pending | - |

---

## Legende
- ⏳ Pending | 🏃‍♂️ In Progress | ❌ Failed | 🛠️ Bugfixed | ✅ Passed

# Architect Memory

## Layer 2 (Active Directives)
- **Project Phase:** Feature Build — Workflow Engine v1 shipped ✅
- **Current Priorities:** 
  - Workflow Engine is live with reactive canvas feedback
  - Next: Marketing / Content Pipeline (Autarch-native, Hermes-driven)
  - Pending design: How to integrate Supabase-based ARES pipeline vs. native Autarch workflows
- **Tech Debt:** None (all audit findings resolved)
- **Invariants:**
  - Vanilla Core Only — no ARES/Paperclip imports
  - TypeScript strict — no `any`
  - Desktop-First — Tauri IPC, offline-capable
  - Local-First Persistence — FS for workflows, keychain for secrets
- **Last Commit:** `49bda0b3` — feat(workflow): Workflow Engine + Multi-Lens Audit + Reactive Execution Feedback

## Layer 3 (Session Log)
- **2026-04-13 (Session 1)**: Init-Session: Antigravity Kit installiert. System für Autarch (Tauri + React + PTY Agentic Shell) bootstrapped.
- **2026-04-13 (Session 2)**: Workflow Engine — Full Build + Audit + Ship
  - **Built:** Visual React Flow canvas (TriggerNode, AgentNode, OutputNode), Smart Gate System (auto/human/agent-review), Hermes Execution Bridge (topological sort + persona execution), Zustand store with Tauri FS persistence, EventBus with 6 workflow lifecycle events
  - **Audited:** 4-lens audit (Sherlock/Mr.Robot/Elon/Carmack) → 16 findings (14 fixed, 2 retracted)
  - **Key Fixes:** criteria split bug, resume event duplication, `as any` elimination, O(V²)→O(V) topo-sort, LLM injection sanitization, `crypto.randomUUID()`, eventBus strict types
  - **Puzzle Piece:** `useWorkflowExecution` hook — reactive bridge (hermesEventBus → Zustand → Canvas). Nodes show live execution rings (pulse/glow). Run/Resume buttons on canvas toolbar. MiniMap reflects execution status.
  - **Shipped:** `49bda0b3` → `origin/master`
  - **Files:** 49 changed, +5146 / -2176

## Architecture Notes
- **Module System:** Preset-based (`ModuleDefinition` → `vanilla.ts`). Each feature is a standalone module.
- **Execution Flow:** `▶ Run → useWorkflowExecution.startExecution() → executeWorkflow(hermesBridge) → hermesEventBus.emit → useWorkflowExecution subscribes → Zustand executionState → Nodes re-render`
- **Persistence:** `~/.autarch/workflows/*.json` via Tauri plugin-fs
- **Gate Modes:** `auto` (pass-through), `human` (suspend workflow, await approval), `agent-review` (LLM verifies criteria)
- **Node Status:** idle → running (accent pulse) → passed (green ring) / failed (red ring) / waiting-gate (yellow pulse)
- **Event Types:** `workflow.started`, `workflow.completed`, `workflow.failed`, `node.started`, `node.completed`, `node.suspended`
- **Stores:** 7 Zustand stores (hermes, editor, workflow, terminal, layout, module, executionPlan)
- **Services:** hermesBridge, hermesClient, hermesGateway, hermesProvisioner, eventBus, moduleInstaller, planExecutor
- **Rust Backend:** 3 commands (greet, get_keychain_secret, set_keychain_secret) + 6 plugins

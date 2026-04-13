# Progress Tracker — Autarch

> Letzte Aktualisierung: 2026-04-13

## ✅ Completed

### Foundation (Phase 1)
- [x] Tauri 2 Projekt Setup (Rust + React + Vite)
- [x] PTY Terminal Integration (xterm.js + tauri-pty)
- [x] Monaco Editor Embedding (Multi-Tab, Read/Write)
- [x] Workspace Persistence (Local FS)
- [x] React Router Tab-Navigation (IDE / Marketing / Dashboard / Settings)

### Hermes Integration (Phase 2)
- [x] Hermes Chat Interface (AgentChat.tsx)
- [x] Chat Session Persistence (Zustand + localStorage)
- [x] Hermes Bridge (stdio Streaming + Tool Call parsing)
- [x] Model Switcher (Gemini 3.1 Pro / Flash)
- [x] Hermes Provisioner (Kit download + install)

### Workflow Engine (Phase 3)
- [x] Type System: GateMode, GateConfig, WorkflowDocument, Execution State
- [x] Zustand Store: CRUD + dirty tracking + FS persistence (~/.autarch/workflows/)
- [x] React Flow Canvas: TriggerNode, AgentNode, OutputNode
- [x] Smart Gate System: auto / human / agent-review per node
- [x] Module Registration: Vanilla Core preset + TopNav icon
- [x] Hermes Execution Bridge: topological sort + persona execution
- [x] EventBus: 6 lifecycle events (workflow.started/completed/failed, node.started/completed/suspended)
- [x] Multi-Lens Audit: Sherlock / Mr. Robot / Elon / Carmack → 16 findings
- [x] Ramsay Hotfix: 14 fixed, 2 retracted
- [x] Reactive Execution Feedback: useWorkflowExecution hook, node rings, Run/Resume

### Security & Quality
- [x] OS Keychain via keyring-rs (API Key migration from localStorage)
- [x] Agent Inline Edit Overlay (Cmd+K, Diff Preview, Accept/Reject)
- [x] Cypher SRE Bundle Splitting (React.lazy + Suspense)
- [x] Paperclip Legacy Purge (ares preset, marketing components, stores)

## 🔄 In Progress

- [ ] Marketing Pipeline Design Decision (native vs. Supabase hybrid)

## 📋 Planned

- [ ] Hermes Kit OTA Update (bundled kit + version pinning)
- [ ] Marketing Module (Autarch-native, Hermes-driven content pipeline)
- [ ] Live Dashboard (Supabase Realtime integration)
- [ ] Workflow Templates (pre-built automation graphs)
- [ ] MCP Server Config UI (in Settings panel)

## ⚠️ Known Issues

- `marketingApi.ts` and `supabaseClient.ts` still exist in `/src/services/` but are not imported by any active module (dead code — safe to remove when Marketing design is finalized)
- `hermesGateway.ts` may need refactoring when ACP protocol is finalized

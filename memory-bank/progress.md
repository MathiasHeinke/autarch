# Progress Tracker — Autarch

> Letzte Aktualisierung: 2026-04-16

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
- [x] EventBus: 12 lifecycle events (typed discriminated union)
- [x] Multi-Lens Audit: Sherlock / Mr. Robot / Elon / Carmack → 16 findings
- [x] Ramsay Hotfix: 14 fixed, 2 retracted
- [x] Reactive Execution Feedback: useWorkflowExecution hook, node rings, Run/Resume

### Security & Quality
- [x] OS Keychain via keyring-rs (API Key migration from localStorage)
- [x] Agent Inline Edit Overlay (Cmd+K, Diff Preview, Accept/Reject)
- [x] Cypher SRE Bundle Splitting (React.lazy + Suspense)
- [x] Paperclip Legacy Purge (ares preset, marketing components, stores)

### Deep Research (Phase 4)
- [x] Ground of Truth: Exhaustive Analyse aller 50+ Source-Dateien
- [x] Architecture Map: 7 Stores, 6 Services, 17 Views, 5 Workflow Components
- [x] Security Assessment: 7 Findings (1 HIGH, 3 MEDIUM, 3 LOW)
- [x] Memory Bank Update: system-index, activeContext, progress, sessionLog
- [x] Invarianten-Dokumentation: 8 Architektur-Regeln verifiziert

## 🔄 In Progress

- [ ] Marketing Pipeline Design Decision (native vs. Supabase hybrid)

## 📋 Planned (Priority-Sorted)

### Security Hardening (Critical)
- [ ] S-1: Shell capabilities scopen (`capabilities/default.json` → scope-based filtering)
- [ ] S-3: Hermes Installer Checksum-Verifikation (SHA-256)
- [ ] S-5: OTA Kit Update SHA-256 Integrity Check

### Architecture Improvements
- [ ] S-2: Persona Map DRY Fix — Single Source of Truth (config.yaml ODER hermesBridge.ts, nicht beides)
- [ ] Orphaned Files entfernen: `marketingApi.ts`, `supabaseClient.ts`
- [ ] `hermesGateway.ts` Refactoring wenn ACP-Protokoll finalisiert

### Feature Development
- [ ] Hermes Kit OTA Update (bundled kit + version pinning + integrity check)
- [ ] Marketing Module (Autarch-native, Hermes-driven content pipeline)
- [ ] Live Dashboard (Supabase Realtime integration)
- [ ] Workflow Templates (pre-built automation graphs)
- [ ] MCP Server Config UI (in Settings panel)
- [ ] ARES Preset Implementation (referenced but not built)

## ⚠️ Known Issues

| Issue | Status | Location |
|-------|--------|----------|
| `marketingApi.ts` + `supabaseClient.ts` orphaned | Dead code, safe to remove | `/src/services/` |
| `hermesGateway.ts` PID-based lifecycle | Works but fragile | `/src/services/` |
| Persona Map duplicated | DRY violation → potential drift | `hermesBridge.ts` + `config.yaml` |
| `personas/` directory empty | All personas inline in config.yaml | `hermes-kit/personas/` |
| `greet` Tauri command | Dev placeholder, never called | `lib.rs:L4` |

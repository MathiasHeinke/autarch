# Tech Stack Context — Autarch

> Letzte Aktualisierung: 2026-04-13

## Overview
Autarch is a native desktop IDE (Tauri v2 + React 19) for agentic development. It provides a visual workflow builder, integrated terminal, code editor, and full Hermes Agent interface — all running offline-first on macOS/Linux/Windows.

## Frontend
- **Framework:** React 19 + TypeScript 5.8 (strict mode)
- **Build Tool:** Vite 7
- **Routing:** react-router-dom v7
- **Styling:** Tailwind CSS v4 + Tailwind Typography
- **State Management:** Zustand 5 (7 stores: hermes, editor, workflow, terminal, layout, module, executionPlan)
- **Editor Engine:** Monaco Editor (`@monaco-editor/react` v4.7)
- **Terminal:** xterm.js v6 (`@xterm/xterm`, `@xterm/addon-fit`)
- **Workflow Canvas:** React Flow (`@xyflow/react` v12)
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Animations:** Framer Motion v12
- **Icons:** Lucide React
- **Markdown:** react-markdown + remark-gfm

## Backend / Desktop Environment
- **Framework:** Tauri v2 (Rust)
- **PTY Management:** `tauri-pty` / `portable-pty`
- **Plugins:** `plugin-shell`, `plugin-os`, `plugin-dialog`, `plugin-fs`, `plugin-opener`
- **Security:** `keyring-rs` → OS Keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)

## Integrations & Services
- **Agent:** Hermes Agent (standalone CLI). Autarch bridges via stdio/ACP subprocess.
- **Data Persistence:** 
  - Workflows: `~/.autarch/workflows/*.json` (Tauri plugin-fs)
  - Chat Sessions: localStorage (Zustand persist)
  - API Keys: OS Keychain (keyring-rs via Tauri IPC)
  - Workspace state: Local JSON
- **Supabase:** Optional (Marketing pipeline connection). `@supabase/supabase-js` v2.103

## Workflow Engine
- **Canvas:** React Flow with 3 custom node types (Trigger, Agent, Output)
- **Gate System:** auto (pass-through), human (suspend + resume), agent-review (LLM criteria check)
- **Execution:** Topological sorting (Kahn's algorithm) + Hermes persona execution
- **Event Bus:** Type-safe discriminated union with 6 lifecycle events
- **Reactive Bridge:** `useWorkflowExecution` hook → subscriptions → Zustand → node status rings

## Data Flow
1. **Desktop Native APIs:** Tauri IPC handles file system, process spawning, keychain access
2. **Editor & Terminal:** React wraps Monaco and xterm.js components
3. **Hermes Integration:** Tauri spawns Hermes subprocess, bridges stdout/stdin
4. **Workflow Execution:** Canvas → Store → hermesBridge.executeWorkflow() → EventBus → Store → Canvas re-render

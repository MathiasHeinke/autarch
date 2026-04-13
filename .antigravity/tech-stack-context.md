# Tech Stack Context — Autarch

## Overview
Autarch is the ultimate agentic shell — a native desktop application combining an IDE, Terminal, Marketing Funnel, and complete Hermes Agent Integration via a vanilla core.

## Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** react-router-dom v7
- **Styling:** Tailwind CSS v4 + Tailwind Typography
- **State Management:** Zustand (Chat Sessions, Workspace State)
- **Editor Engine:** Monaco Editor (`@monaco-editor/react`)
- **Terminal:** xterm.js (`@xterm/xterm`, `@xterm/addon-fit`)
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Backend / Desktop Environment
- **Framework:** Tauri v2 (Rust)
- **PTY Management:** `tauri-pty` / `portable-pty`
- **Plugins:** `@tauri-apps/plugin-shell`, `@tauri-apps/plugin-os`

## Integrations & Services
- **Agent:** Hermes Agent (standalone CLI utility). Autarch acts as the interface to Hermes handling bridging over stdio/ACP.
- **Data Persistence:** Local settings, JSON, or LocalStorage for caching workspaces and session context.
- **Marketing:** Optional connections to Supabase for the marketing funnel.
- **Addon (Optional):** Paperclip (Not part of the vanilla core).

## Data Flow
1. **Desktop Native APIs:** Tauri bridging handles interactions with the OS (file system, process execution for terminal/PTY).
2. **Editor & Terminal:** React wraps Monaco and xterm.js components.
3. **Hermes Integration:** The user must explicitly have Hermes installed. Tauri runs the Hermes subprocess and bridges stdout/stdin. Autarch reads everything Hermes is capable of interpreting and visually represents tools, chat history, and diffs.

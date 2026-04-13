# 🏛️ AUTARCH — The Ultimate Agentic Shell

> **Version:** v4.1 (Vanilla Core Focus)  
> **Created:** 2026-04-13  
> **Author:** Mathias Heinke / ARES  
> **Status:** APPROVED — Ready for Implementation

---

## Vision

**AUTARCH ist das ultimative Macht-Instrument für Vanilla Agentic Development.**

Eine native Desktop-App, die eine extrem performante Entwicklungsumgebung bereitstellt:
- 🖥️ **IDE Core** (Monaco Editor + Native Terminal)
- 🤖 **Hermes Agent Integration** (Vanilla Chat Interface + Tool Access)
- 📈 **Marketing Funnel** (Newsletter + Social Automation)

Das Herzstück von Autarch ist die perfekte Integration des Hermes Agents. Der User installiert Hermes separat. Autarch stellt die IDE, das Terminal, speichert Workspaces und Chat-Sessions und macht **ALLES was Hermes kann in einer UI verfügbar**.

---

## 🔑 Kern-Prinzipien

1. **Vanilla Core.** Alles wird "Vanilla" gebaut. Keine Bloat-Abhängigkeiten.
2. **Hermes am Steuer.** Hermes ist extern installiert. Autarch verbindet sich via ACP/stdio. Das muss absolut zuverlässig funktionieren!
3. **Session & Workspace Persistence.** Chats, Workspaces und Terminal-States werden sauber lokal gespeichert.
4. **IDE-agnostisch.** Editor-Adapter Pattern (Monaco → CodeMirror → etc.).
5. **Closed Source, frei lizenzierbar.** 100% MIT/Apache 2.0 Stack.

---

## Architektur

```
┌─ AUTARCH (Tauri 2 + Rust Backend + React/Vite Frontend) ──────────┐
│                                                                     │
│  ┌─ TOP NAV ──────────────────────────────────────────────────────┐│
│  │ [🖥️ IDE] [📈 Marketing] [📊 Dash] [⚙️ Options]                 ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ ACTIVE TAB CONTENT (z.B. IDE) ───────────────────────────────┐│
│  │ ┌─────── File Tree ───────┐ ┌───── Monaco Editor ───────────┐ ││
│  │ │ src/                    │ │ function init() {             │ ││
│  │ │  App.tsx                │ │   console.log("Ready");       │ ││
│  │ │                         │ │ }                             │ ││
│  │ └─────────────────────────┘ └───────────────────────────────┘ ││
│  │ ┌─────── Terminal ────────┐ ┌───── Hermes Chat ─────────────┐ ││
│  │ │ $ cargo run             │ │ User: Refactor App.tsx        │ ││
│  │ │ Compiling...            │ │ Hermes: [Tool Call]           │ ││
│  │ └─────────────────────────┘ └───────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ STATUS BAR ──────────────────────────────────────────────────┐│
│  │ 🟢 Hermes Verbunden │ Workspace: /autarch │ Gemini 3.1 Pro    ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Die Kern-Module im Detail

### 1. 🖥️ IDE & Hermes Interface (Der absolute Fokus)

| Komponente | Technologie | Lizenz |
|-----------|-------------|--------|
| Code Editor | Monaco Editor (VS Code Engine) | MIT |
| Terminal | xterm.js + WebGL Addon | MIT |
| File Tree | Custom React + Rust FSEvents | Eigen |
| Hermes Chat | Custom React + ACP/stdio Bridging | Eigen |
| Git Integration | git2-rs (Rust) | MIT + Apache 2.0 |

**Features:**
- Native Terminal Integration (PTY)
- Hermes Chat Interface (Streaming, Tool-Calls transparent visualisieren)
- Workspace Management & File Tree
- Chat-Session Persistence (Sichern und Laden vergangener Chats)
- Voller Zugriff auf alle Hermes Tools (Lesen, Schreiben, Commands, MCPs)

### 2. 📈 Marketing

- Supabase Connection für Content
- Newsletter Generator, Social Media Post Setup
- Fokussierter Funnel-Builder eingebettet in den Autarch Workspace

### 3. 📊 Dashboard & ⚙️ Options

- Hermes Binary Pfad Config
- MCP Server Config
- LLM Keys via OS Keychain (keyring-rs)
- Workspace Overview & Logs



---

## Tech-Stack

### Frontend (React 19 + Vite)
- **Monaco Editor** — Code Editor
- **xterm.js** — Terminal Emulator
- **Zustand** — State Management (Workspaces, Sessions)
- **Tailwind CSS v4** — Styling
- **Framer Motion, Radix UI, Lucide React**
- **Cypher SRE Bundle Splitting** — All major views are dynamically loaded (`React.lazy` + `Suspense`) to ensure sub-500kB LCP payloads.

### Backend (Tauri 2 + Rust)
- **portable-pty** — Terminal PTY Backend
- **tokio** — Async Runtime
- **serde_json** / **tauri-plugin-shell** — JSON-RPC / Subprocess für Hermes stdio
- **notify** — FSEvents Watcher
- **keyring-rs** — Keychain Storage

---

## Roadmap Anpassung: Vanilla Core First!

### Phase 1: Pure Foundation (Terminal & Code)
- Tauri 2 Projekt Setup
- pty-Prozess mit xterm.js zum Laufen bringen
- Monaco Editor einbetten (Multi-Tab, Files lesen/schreiben)
- Lokale Workspaces persistieren (Local Database oder Settings-File)

### Phase 2: Hermes Integration
- Hermes CLI als lokalen Subprozess in Rust spawnen
- Chat Interface in React (Zustand) bauen
- stdio Stream von Hermes fehlerfrei parsen und als Messages/Tools darstellen
- Chat-Sessions speichern

### Phase 3: Workflow Features & Marketing
- Agent Inline-Edits im Editor
- Marketing Funnel Tab
- Settings/Config Panel

> **Ziel:** Erst wenn Monaco, Terminal, Workspaces und der Hermes-Chat **perfekt** laufen, wird an Erweiterungen gedacht!

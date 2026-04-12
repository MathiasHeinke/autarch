# 🏛️ AUTARCH — The Ultimate Agentic Shell

> **Version:** v4 FINAL  
> **Created:** 2026-04-12  
> **Author:** Mathias Heinke / ARES  
> **Status:** APPROVED — Ready for Implementation

---

## Vision

**AUTARCH ist das ultimative Macht-Instrument.**

Eine einzige native Desktop-App mit 6+ Tabs, die alles vereint:
- 🖥️ IDE (Monaco Editor + Hermes Chat + Terminal)
- 📎 Paperclip (AI Company Orchestration — nativ eingebettet)
- 📈 Marketing (Newsletter + Social für 10 Plattformen)
- 🤖 Agents (Übersicht, Approvals, Task Queue)
- 📊 Dashboard (LLM Costs, Memory, Health, Cron)
- ⚙️ Options (Hermes Config, MCP Servers, IDE Engine, API Keys)

Hermes Agent ist das Gehirn. Paperclip ist das Unternehmen. AUTARCH ist die Kommandozentrale.

---

## 🔑 Kern-Prinzipien

1. **EINE App.** Kein Tab-Wechsel zwischen verschiedenen Programmen.
2. **IDE-agnostisch.** Editor-Engine austauschbar (Monaco → CodeMirror → Future MIT IDE).
3. **Hermes bleibt vanilla.** Extern installiert, 100% updatebar, AUTARCH verbindet via ACP/stdio.
4. **Paperclip nativ eingebettet.** Kein iFrame-Hack — echte React-Integration.
5. **Closed Source, frei lizenzierbar.** 100% MIT/Apache 2.0 Stack.
6. **Erweiterbar ohne zu brechen.** Neue Tabs = neue Module. Adapter Pattern überall.

---

## Architektur

```
┌─ AUTARCH (Tauri 2 + Rust Backend + React/Vite Frontend) ──────────┐
│                                                                     │
│  ┌─ TOP NAV ──────────────────────────────────────────────────────┐│
│  │ [🖥️ IDE] [📎 Paperclip] [📈 Marketing] [🤖 Agents] [📊 Dash] [⚙️]│
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ ACTIVE TAB CONTENT ──────────────────────────────────────────┐│
│  │                                                                ││
│  │              (Wechselt je nach aktivem Tab)                    ││
│  │                                                                ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ STATUS BAR ──────────────────────────────────────────────────┐│
│  │ 🟢 Hermes │ 📎 Paperclip │ Gemini 3.1 Pro │ 14.2k tok │ €0.003││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ HERMES (Subprocess) ─────────────────────────────────────────┐│
│  │ ACP/stdio ↔ IDE Chat + Agent Panel + Paperclip + Marketing    ││
│  │ MCP Servers: Supabase, GitNexus, Honcho, GitHub               ││
│  │ Persona System: NOUS, Carmack, Draper, Karpathy, ...          ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ PAPERCLIP (Subprocess) ──────────────────────────────────────┐│
│  │ Node.js Server (localhost:3100) + Embedded PostgreSQL          ││
│  │ Org Charts, Budgets, Governance, Goal Alignment               ││
│  │ hermes-paperclip-adapter: Hermes ↔ Paperclip bidirektional    ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Kommunikationsfluss

```
                    ┌─────────────────────┐
                    │   AUTARCH (Tauri 2)  │
                    │   Rust Backend       │
                    └─────┬─────┬─────────┘
                          │     │
              ┌───────────┘     └───────────┐
              │                             │
    ┌─────────▼─────────┐       ┌───────────▼──────────┐
    │  Hermes Agent      │       │  Paperclip Server    │
    │  (ACP/stdio)       │◄─────►│  (HTTP localhost)    │
    │                    │       │                      │
    │  • IDE Chat        │  via  │  • Org Chart         │
    │  • Code Edits      │hermes-│  • Task Queue        │
    │  • MCP Tools       │paper- │  • Budgets           │
    │  • Cron Jobs       │clip-  │  • Governance        │
    │  • Personas        │adapter│  • Multi-Company     │
    │  • Memory          │       │  • Heartbeats        │
    └────────────────────┘       └──────────────────────┘
```

**Warum das funktioniert:**
- Hermes und Paperclip sind **bereits integriert** (es gibt einen `hermes-paperclip-adapter`)
- Hermes kann als Agent in Paperclip's Org Chart eingehängt werden
- Paperclip kann Hermes als "Employee" steuern (Heartbeats, Tasks, Budgets)
- AUTARCH rendert BEIDES — Hermes-Chat UND Paperclip-Dashboard — in EINER App
- Hermes weiß IMMER in welchem Kontext er ist (IDE, Marketing, Paperclip) weil alles im selben Prozessbaum läuft

---

## Die 6 Tabs im Detail

### Tab 1: 🖥️ IDE

| Komponente | Technologie | Lizenz |
|-----------|-------------|--------|
| Code Editor | Monaco Editor (VS Code Engine) | MIT |
| Terminal | xterm.js + WebGL Addon | MIT |
| File Tree | Custom React + Rust FSEvents | Eigen |
| Hermes Chat | Custom React + ACP/stdio | Eigen |
| Git Integration | git2-rs (Rust) | MIT + Apache 2.0 |
| Syntax Highlighting | Monaco built-in (TextMate) | MIT |

**Features:**
- Multi-Tab Editor mit IntelliSense
- Hermes Chat Panel (Streaming, Think-Steps, Tool-Calls, File-Diffs)
- Terminal (mehrere Sessions)
- File Tree mit Git Status Badges
- Inline Agent-Edits (Accept/Reject/Edit)
- Persona Switcher (Dropdown)
- Multi-LLM Badge (welches Model antwortet)

### Tab 2: 📎 Paperclip

| Komponente | Technologie | Lizenz |
|-----------|-------------|--------|
| Paperclip UI | @paperclipai/ui (React) | MIT |
| Paperclip Server | Node.js + Embedded Postgres | MIT |
| Hermes Adapter | hermes-paperclip-adapter | MIT |

**Features (out-of-the-box von Paperclip):**
- Org Charts (Hierarchien, Rollen, Reporting Lines)
- Goal Alignment (Mission → Strategy → Tasks)
- Agent Budgets (Kosten pro Agent, monatliche Limits)
- Governance (Approvals, Overrides, Rollbacks)
- Ticket System (Conversations, Tool-Call Tracing, Audit Log)
- Heartbeats (Scheduled Agent Wake-ups)
- Multi-Company (Portfolio von AI-Companies)
- Skills Manager
- Clipmart (Company Templates importieren)

**Integration mit Hermes:**
- Hermes = "Employee" in Paperclip's Org Chart
- Hermes bekommt Tasks von Paperclip zugewiesen
- Hermes reportet Fortschritt über den hermes-paperclip-adapter
- CEO-Chat in Paperclip = Hermes Chat mit Governance
- Budgets in Paperclip steuern Hermes Token-Usage

### Tab 3: 📈 Marketing

| Komponente | Technologie | Lizenz |
|-----------|-------------|--------|
| Newsletter | Resend API | Proprietäre API |
| Social Media | upload-post.com API | Proprietäre API |
| Content DB | Supabase (ares-website) | Proprietäre API |
| Content Generation | Hermes (Persona: Draper) | MIT |

**10 Social Plattformen:**
TikTok, Instagram, LinkedIn, YouTube, Facebook, X, Threads, Pinterest, Reddit, Bluesky

**Workflow:**
1. Hermes Cron → neue Blog-Artikel aus Supabase laden
2. Hermes (Draper-Persona) → Newsletter-Copy generieren
3. AUTARCH Marketing Tab → Preview + Edit
4. [User Approve] → Resend API → Versand
5. Hermes → Plattform-spezifische Social Posts generieren
6. Review Queue → [Approve/Edit/Reject] → upload-post.com API

### Tab 4: 🤖 Agents

**Features:**
- Active Agents (Hermes-Instanzen, Status, Model, Token-Usage)
- Subagent Tree (visuelle Hierarchie)
- Approval Center (Agent-Anfragen an User)
- Task Queue (Running, Queued, Completed)
- History (vergangene Agent-Sessions)
- Combined View: Hermes Subagents + Paperclip Org Chart

### Tab 5: 📊 Dashboard

**Features:**
- LLM Usage (Tokens, Kosten, Provider-Verteilung)
- Memory Monitor (MEMORY.md Stats, Honcho Conclusions)
- Workspace Overview (Git Status, Last Activity)
- Cron Job Manager (Status, Next Run, History)
- Health Checks (Hermes, Paperclip, MCP Servers, APIs)
- Monthly Export (CSV/PDF)

### Tab 6: ⚙️ Options

**Features:**
- Hermes Config (Binary Path, Config Dir, SOUL.md Editor)
- Paperclip Config (Server URL, Company Selection)
- MCP Server Manager (Add/Remove/Restart/Config)
- IDE Engine Selector (Monaco, CodeMirror 6, External)
- API Key Manager (OS Keychain via keyring-rs)
- Theme Picker (Dark/Light/Custom)
- Module Manager (Tabs ein/ausblenden)

---

## IDE-Engine Adapter Pattern

```typescript
interface EditorAdapter {
  openFile(path: string): Promise<void>
  getContent(): string
  setContent(content: string): void
  getCursorPosition(): { line: number, col: number }
  setSelection(start: Position, end: Position): void
  addDecoration(range: Range, style: DecorationStyle): string
  removeDecoration(id: string): void
  setLanguage(lang: string): void
  onContentChange(callback: (content: string) => void): void
  onSave(callback: () => void): void
  mount(container: HTMLElement): void
  destroy(): void
}

// Default: Monaco Editor (VS Code Engine)
class MonacoAdapter implements EditorAdapter { ... }

// Alternative: CodeMirror 6 (lightweight)
class CodeMirrorAdapter implements EditorAdapter { ... }

// Alternative: External Editor (Zed, etc.)
class ExternalEditorAdapter implements EditorAdapter { ... }
```

---

## Tech-Stack

### Frontend (React 19 + Vite)
- **Monaco Editor** — Code Editor (MIT, ~5MB, IntelliSense, VS Code Feeling)
- **xterm.js** + WebGL Addon — Terminal Emulator (MIT)
- **Framer Motion** — Micro-Animations, Tab Transitions
- **TanStack Router** — Tab Navigation
- **TanStack React Query** — Data Fetching (Supabase, APIs)
- **Zustand** — State Management
- **Radix UI** — Accessible Components (schon in Paperclip!)
- **Lucide React** — Icons (schon in Paperclip!)
- **Recharts** — Dashboard Charts
- **Tailwind CSS v4** — Styling (schon in Paperclip!)
- **React 19** — (schon in Paperclip!)
- **react-router-dom v7** — (schon in Paperclip!)

### Backend (Tauri 2 + Rust)
- **tokio** — Async Runtime
- **portable-pty** — Terminal PTY Management
- **git2-rs** — Git Operations (libgit2 Bindings)
- **notify** — FSEvents File Watcher
- **serde_json** — JSON-RPC / ACP Parsing
- **reqwest** — HTTP Client (Resend, upload-post.com, Supabase)
- **keyring-rs** — OS Keychain für API Keys (AES-256)
- **tauri-plugin-shell** — Subprocess Management (Hermes, Paperclip)

### External Dependencies (User installiert separat)
- **Hermes Agent** — via `npm install -g hermes-agent`
- **Paperclip** — via `npx paperclipai onboard --yes`
- **MCP Servers** — Supabase, GitNexus, Honcho, GitHub
- **Ollama** — optional, für Offline-Modus

---

## Hermes Kontextbewusstsein

> **Weil ALLES in AUTARCH passiert, weiß Hermes IMMER:**

```
┌─ Hermes Agent System Prompt (automatisch injected) ────────────────┐
│                                                                     │
│  Du bist der Lead Architect im AUTARCH System.                     │
│                                                                     │
│  KONTEXT:                                                          │
│  - App: AUTARCH v4                                                 │
│  - Active Tab: IDE (oder Marketing, Paperclip, etc.)               │
│  - Active Workspace: /Users/mathiasheinke/Developer/ares-app       │
│  - Active File: src/engines/sleep/classifier.ts                    │
│  - Active Paperclip Company: ARES Bio.OS                           │
│  - Active Paperclip Task: "Optimize HRV classification"            │
│  - Available MCP Servers: Supabase ✅, GitNexus ✅, Honcho ✅       │
│  - Pending Approvals: 2                                            │
│  - Newsletter Status: Draft ready (14 April)                       │
│  - Social Queue: 3 posts pending review                            │
│                                                                     │
│  Du hast Zugriff auf ALLE Tabs und Module.                         │
│  Wenn der User nach Marketing fragt → Marketing-Kontext.           │
│  Wenn er nach Code fragt → IDE-Kontext + GitNexus.                 │
│  Wenn er nach Company Strategy fragt → Paperclip-Kontext.          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Kommerzielles Modell

| Aspekt | Antwort |
|--------|---------|
| **Lizenz** | Closed Source. 100% MIT/Apache 2.0 Dependencies |
| **Pricing Phase 1** | **FREE.** Komplett kostenlos um Nutzerbasis aufzubauen |
| **Revenue Module (später)** | Token-Revenue: AUTARCH routet LLM-Requests über eigenen Proxy → Margin auf Tokens |
| **Pricing Phase 2 (optional)** | Freemium: IDE + Paperclip gratis, Marketing + Dashboard = Pro |
| **Distribution** | Direct Download (DMG), kein App Store |
| **Hermes Dependency** | **Extern.** User installiert Hermes separat. Kein Lizenz-Risiko |
| **Paperclip Dependency** | **Extern.** AUTARCH startet Paperclip als Subprocess |

### Token-Revenue-Modul (Phase 2)
```
User → AUTARCH → Proxy (OpenRouter/eigener) → LLM Provider
                   ↑
                   └── Margin: 5-15% auf Token-Kosten
                       = passives Einkommen pro aktivem User
```

---

## Lizenz-Stack

| Komponente | Lizenz | Closed Source OK? |
|-----------|--------|-------------------|
| Tauri 2 | MIT + Apache 2.0 | ✅ |
| React 19 | MIT | ✅ |
| Monaco Editor | MIT | ✅ |
| xterm.js | MIT | ✅ |
| Framer Motion | MIT | ✅ |
| Radix UI | MIT | ✅ |
| Lucide React | ISC | ✅ |
| Tailwind CSS | MIT | ✅ |
| Zustand | MIT | ✅ |
| TanStack Query | MIT | ✅ |
| TanStack Router | MIT | ✅ |
| Recharts | MIT | ✅ |
| git2-rs | MIT + Apache 2.0 | ✅ |
| portable-pty | MIT | ✅ |
| tokio | MIT | ✅ |
| serde | MIT + Apache 2.0 | ✅ |
| reqwest | MIT + Apache 2.0 | ✅ |
| keyring-rs | MIT + Apache 2.0 | ✅ |
| Hermes Agent | MIT | ✅ (extern) |
| Paperclip | MIT | ✅ (extern) |

**Ergebnis: NULL Lizenz-Risiko. Alles Closed Source verkaufbar.**

---

## 24-Tage Roadmap

### Phase 1: Shell + IDE Tab (Tag 1-8)

- [ ] **Tag 1-2:** Tauri 2 Projekt Setup
  - `npx create-tauri-app` + React + Vite
  - Top-Nav mit 6 Tabs (Skeleton)
  - Status Bar (Hermes Connection, Paperclip Connection)
  - Rust Backend: Hermes subprocess starten (ACP/stdio)
  - Rust Backend: Paperclip subprocess starten (Node.js)
  
- [ ] **Tag 3-4:** IDE Tab — Monaco Editor
  - Monaco Editor Integration (Syntax Highlighting, Multi-Tab, IntelliSense)
  - File Tree (Rust FSEvents → Frontend via Tauri Events)
  - File öffnen/speichern (Rust `fs` → Monaco)
  - Git Status Badges im File Tree (`git2-rs`)

- [ ] **Tag 5-6:** IDE Tab — Chat + Terminal
  - Hermes Chat Panel (ACP Streaming, Think-Steps, Tool-Calls)
  - xterm.js Terminal (Rust `portable-pty`)
  - Bottom-Panel Tabs: [Chat] [Terminal] [Problems] [Output]
  - Persona Switcher (NOUS, Carmack, Draper, Karpathy...)

- [ ] **Tag 7-8:** IDE Tab — Agent-Features
  - File Diff View (Agent-Edits inline, Accept/Reject)
  - Tool-Call Log (MCP Server, Ergebnis, Latenz)
  - Multi-LLM Badge
  - Workspace Picker (Multi-Workspace)

### Phase 2: Paperclip + Marketing (Tag 9-16)

- [ ] **Tag 9-10:** Paperclip Tab
  - Paperclip Server als Subprocess starten
  - Paperclip UI Components in AUTARCH einbetten
  - hermes-paperclip-adapter konfigurieren
  - Org Chart + Task Board rendern
  - Company Selector (Multi-Company in einem Dropdown)

- [ ] **Tag 11-12:** Marketing Tab — Newsletter
  - Supabase Connection (Blog-Artikel laden)
  - Newsletter Composer (Hermes Draper generiert, User reviewt)
  - Resend Integration (Test-Send, Live-Send)
  - Subscriber Stats

- [ ] **Tag 13-14:** Marketing Tab — Social
  - Content Calendar (Kalenderansicht)
  - Post Composer (Persona-spezifisch pro Plattform)
  - upload-post.com API Integration (10 Plattformen)
  - Review Queue (Approve/Edit/Reject)
  - Fallback: Apify Actors für direkte API-Posts

- [ ] **Tag 15-16:** Agent Overview Tab + Dashboard Tab
  - Active Agents + Subagent Tree
  - Combined: Hermes Subagents + Paperclip Org Chart
  - Approval Center + Task Queue
  - LLM Usage Charts (Recharts)
  - Memory Monitor + Health Checks + Cron Manager

### Phase 3: Options + Polish (Tag 17-24)

- [ ] **Tag 17-18:** Options Tab
  - Hermes Config (Binary Path, SOUL.md Editor)
  - Paperclip Config (Server URL)
  - MCP Server Manager
  - IDE Engine Selector
  - API Key Manager (OS Keychain)
  - Theme Picker + Module Manager

- [ ] **Tag 19-20:** Mobile Access
  - Local HTTP/WebSocket Server in Rust
  - Responsive Web-UI
  - Tailscale Guide in Options

- [ ] **Tag 21-22:** Automation
  - Hermes Cron: Newsletter (Mo 06:00)
  - Hermes Cron: Social Posts (Daily)
  - Hermes Cron: Memory Dream
  - Paperclip Heartbeats konfigurieren

- [ ] **Tag 23-24:** Distribution
  - App Icon + Branding
  - DMG Packaging
  - Onboarding Flow (Hermes + Paperclip Install Check)
  - Landing Page Skeleton

---

## Warum AUTARCH anders ist

| Feature | Cursor/Windsurf | Zed | AUTARCH |
|---------|----------------|-----|---------|
| Code Editor | ✅ | ✅ | ✅ (Monaco) |
| Agent Chat | ✅ | ✅ | ✅ (Hermes) |
| AI Company Orchestration | ❌ | ❌ | ✅ (Paperclip) |
| Marketing Automation | ❌ | ❌ | ✅ |
| Newsletter Builder | ❌ | ❌ | ✅ |
| Social Media (10 Plattformen) | ❌ | ❌ | ✅ |
| Agent Budget Management | ❌ | ❌ | ✅ (Paperclip) |
| Org Charts / Goal Alignment | ❌ | ❌ | ✅ (Paperclip) |
| Multi-Company | ❌ | ❌ | ✅ (Paperclip) |
| Offline Mode | ❌ | ❌ | ✅ (Ollama) |
| Mobile Access | ❌ | ❌ | ✅ (Tailscale) |
| Token Revenue | N/A | N/A | ✅ (Proxy) |
| IDE Engine Swappable | ❌ | ❌ | ✅ (Adapter) |
| Closed Source Verkaufbar | ❌ (Fork) | ❌ (GPL) | ✅ |

---

## Offene Fragen (gelöst)

| Frage | Antwort |
|-------|---------|
| Kann man Paperclip einbetten? | ✅ Ja. React UI-Komponenten + Server als Subprocess |
| Sprechen Hermes und Paperclip miteinander? | ✅ Ja. `hermes-paperclip-adapter` existiert bereits |
| Weiß Hermes über alle Module Bescheid? | ✅ Ja. System-Prompt wird dynamisch mit Tab/Context angereichert |
| Ist das lizenzierbar? | ✅ Ja. 100% MIT/Apache 2.0 Stack |
| Hermes updatebar? | ✅ Ja. Extern installiert. ACP-Protokoll ist stabil |
| IDE austauschbar? | ✅ Ja. EditorAdapter Pattern → Monaco/CodeMirror/Future |
| Was wenn Zed MIT wird? | MonacoAdapter → ZedAdapter → fertig |

---

> **AUTARCH ist nicht "noch ein AI Editor."**  
> **AUTARCH ist die Kommandozentrale für AI-getriebene Unternehmen.**  
> Code, Marketing, Agent-Orchestration, Company Management — alles in einer App.  
> Das gibt es nirgendwo sonst auf diesem Planeten.

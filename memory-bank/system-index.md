# System Index — Autarch

> Boot-Index: Schnellzugriff auf alle Module, Dateien und Abhängigkeiten.
> Letzte Aktualisierung: 2026-04-13

---

## Projekt-Überblick

| Eigenschaft | Wert |
|-------------|------|
| **Name** | autarch-app |
| **Version** | 0.1.0 |
| **Stack** | Tauri 2 (Rust) + React 19 + Vite 7 + TypeScript 5.8 |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand 5 |
| **Editor** | Monaco Editor |
| **Terminal** | xterm.js 6 + tauri-pty |
| **Workflow** | @xyflow/react 12 |
| **Commit** | `49bda0b3` (master) |

---

## Dateistruktur (54 Source Files)

### `/src/` — Frontend (React + TypeScript)

#### Entry
| Datei | Zweck |
|-------|-------|
| `main.tsx` | React root mount |
| `App.tsx` | Router + Module Config + Layout |

#### `/src/components/layout/` — Layouts
| Datei | Zweck |
|-------|-------|
| `AgenticLayout.tsx` | IDE Hauptlayout (Editor + Terminal + Chat) |
| `AuxPanel.tsx` | Auxiliary panel container |
| `ContextPanel.tsx` | Right-side context panel |
| `EditorLayout.tsx` | Monaco + File Explorer split view |
| `SentinelOverlay.tsx` | Global notification overlay |
| `TopNav.tsx` | Tab navigation (IDE/Marketing/Dash/Settings/Workflow) |

#### `/src/components/views/` — Views (lazy loaded)
| Datei | Zweck |
|-------|-------|
| `AgentChat.tsx` | Hermes Chat Interface |
| `AgentInlineEditOverlay.tsx` | Cursor-like Cmd+K inline edit |
| `ApiKeysSettings.tsx` | API Key management (OS Keychain) |
| `ConversationList.tsx` | Chat session list |
| `FileExplorer.tsx` | File tree sidebar |
| `FleetPanel.tsx` | Fleet/device management |
| `MainStage.tsx` | Primary content area |
| `McpFeedPanel.tsx` | MCP event feed |
| `MemoryPanel.tsx` | Agent memory viewer |
| `ModelSwitcher.tsx` | LLM model selector |
| `MonacoEditor.tsx` | Code editor wrapper |
| `PhaseTracker.tsx` | Execution plan phase tracker |
| `SessionListPanel.tsx` | Session management sidebar |
| `SettingsModules.tsx` | Settings panel with module toggles |
| `SkillsBrowser.tsx` | Hermes skills browser |
| `Terminal.tsx` | PTY terminal (xterm.js) |
| `ToolCallBlock.tsx` | Tool call result renderer |

#### `/src/components/workflow/` — Workflow Engine
| Datei | Zweck |
|-------|-------|
| `WorkflowCanvas.tsx` | React Flow canvas + toolbar (Run/Resume) |
| `TriggerNode.tsx` | Trigger node component |
| `AgentNode.tsx` | Agent step node component |
| `OutputNode.tsx` | Output node component |
| `GateConfigPanel.tsx` | Gate mode selector panel |

#### `/src/hooks/`
| Datei | Zweck |
|-------|-------|
| `workflow/useWorkflowExecution.ts` | EventBus → Zustand reactive bridge |

#### `/src/stores/` — State Management (Zustand)
| Datei | Zweck |
|-------|-------|
| `hermesStore.ts` | Chat sessions, messages, model config |
| `editorStore.ts` | Open files, active tab, cursor state |
| `workflowStore.ts` | Workflow CRUD, execution state, dirty tracking |
| `terminalStore.ts` | Terminal instances, PTY handles |
| `layoutStore.ts` | Panel visibility, active tab |
| `moduleStore.ts` | Installed modules, install queue |
| `executionPlanStore.ts` | Execution plan phases, progress |

#### `/src/services/` — Business Logic
| Datei | Zweck |
|-------|-------|
| `hermesBridge.ts` | Hermes subprocess bridge + workflow executor |
| `hermesClient.ts` | Direct LLM API client |
| `hermesGateway.ts` | Gateway config (ACP/stdio) |
| `hermesProvisioner.ts` | Kit download + install |
| `eventBus.ts` | Type-safe event bus (6 workflow events) |
| `moduleInstaller.ts` | Module lifecycle manager |
| `planExecutor.ts` | Execution plan runner |
| `marketingApi.ts` | ⚠️ Orphaned (pending Marketing design) |
| `supabaseClient.ts` | ⚠️ Orphaned (pending Marketing design) |

#### `/src/presets/` — Module System
| Datei | Zweck |
|-------|-------|
| `index.ts` | Preset exports |
| `types.ts` | ModuleDefinition interface |
| `vanilla.ts` | Vanilla Core preset config |
| `modules/workflowModule.tsx` | Workflow module registration |

#### `/src/types/` — Type Definitions
| Datei | Zweck |
|-------|-------|
| `workflow.types.ts` | GateMode, NodeData, WorkflowDocument, ExecutionState |
| `executionPlan.types.ts` | Execution plan phase types |

---

### `/src-tauri/` — Backend (Rust)

| Datei | Zweck |
|-------|-------|
| `src/lib.rs` | Tauri commands: greet, get/set_keychain_secret |
| `Cargo.toml` | Rust dependencies |
| `capabilities/default.json` | Tauri permissions |

**Tauri Plugins registriert:**
- `tauri_plugin_opener`
- `tauri_plugin_shell`
- `tauri_plugin_pty`
- `tauri_plugin_os`
- `tauri_plugin_dialog`
- `tauri_plugin_fs`

**Custom Commands:**
- `get_keychain_secret(service, account) → String`
- `set_keychain_secret(service, account, secret) → ()`

---

### `/hermes-kit/` — Agent Config
| Datei | Zweck |
|-------|-------|
| `config.yaml` | Hermes Agent runtime config |

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.1.0 | UI Framework |
| `@xyflow/react` | ^12.10.2 | Workflow Canvas |
| `zustand` | ^5.0.12 | State Management |
| `@monaco-editor/react` | ^4.7.0 | Code Editor |
| `@xterm/xterm` | ^6.0.0 | Terminal |
| `tauri-pty` | ^0.2.1 | PTY Backend |
| `framer-motion` | ^12.38.0 | Animations |
| `@supabase/supabase-js` | ^2.103.0 | Supabase Client (Marketing) |
| `tailwindcss` | ^4.2.2 | Styling |
| `vite` | ^7.0.4 | Build Tool |
| `typescript` | ~5.8.3 | Type Checker |

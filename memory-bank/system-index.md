# System Index — Autarch

> Boot-Index: Schnellzugriff auf alle Module, Dateien und Abhängigkeiten.
> Letzte Aktualisierung: 2026-04-16 (Deep Research verifiziert)

---

## Projekt-Überblick

| Eigenschaft | Wert |
|-------------|------|
| **Name** | autarch-app |
| **Version** | 0.1.0 |
| **Stack** | Tauri 2.5 (Rust) + React 19 + Vite 6.3 + TypeScript 5.8 |
| **Styling** | Tailwind CSS v4.1.3 |
| **State** | Zustand 5.0.4 |
| **Editor** | Monaco Editor 0.52.2 |
| **Terminal** | xterm.js + tauri-pty 0.4.5 |
| **Workflow** | @xyflow/react 12.4.4 |
| **Animation** | Framer Motion 12.6.3 |
| **Panels** | react-resizable-panels 2.1.9 |
| **Personas** | 16 specialists + default (SOUL.md) |
| **Skills** | 15 bundled agents |

---

## Dateistruktur (50+ Source Files)

### `/src/` — Frontend (React + TypeScript)

#### Entry
| Datei | Zweck |
|-------|-------|
| `main.tsx` | React root mount |
| `App.tsx` | Lazy load + Mode switch (standard / agentic) |

#### `/src/components/layout/` — Layouts
| Datei | Zweck |
|-------|-------|
| `TopNav.tsx` | Core tabs + preset modules + Hermes status + ModelSwitcher |
| `ContextPanel.tsx` | Left sidebar: dynamic context nav per activeTab |
| `AgenticLayout.tsx` | 3-panel resizable (sessions / chat+terminal / explorer) |

#### `/src/components/views/` — Views (17 Components)
| Datei | Size | Zweck |
|-------|------|-------|
| `AgentChat.tsx` | 20KB | Full chat: install CTA → offline → online, streaming, tool calls |
| `ApiKeysSettings.tsx` | 40KB | API key management per provider, Keychain integration |
| `SettingsModules.tsx` | 26KB | Module installer UI |
| `MainStage.tsx` | 11KB | Dynamic view resolver per tab+contextView |
| `PhaseTracker.tsx` | 9KB | Execution plan visualization |
| `AgentInlineEditOverlay.tsx` | 7KB | Cursor-like inline edit with diff preview |
| `MonacoEditor.tsx` | 7KB | Monaco wrapper + Tauri FS integration |
| `ConversationList.tsx` | 5KB | Chat history sidebar |
| `ToolCallBlock.tsx` | 5KB | Tool call visualization |
| `FleetPanel.tsx` | 4KB | Agent fleet dashboard |
| `McpFeedPanel.tsx` | 4KB | MCP server status feed |
| `Terminal.tsx` | 4KB | xterm.js PTY terminal |
| `SkillsBrowser.tsx` | 3KB | Skill directory browser |
| `MemoryPanel.tsx` | 3KB | Memory bank viewer |
| `SessionListPanel.tsx` | 3KB | Session list (agentic mode) |
| `FileExplorer.tsx` | 3KB | Workspace file tree |
| `ModelSwitcher.tsx` | 3KB | Active model dropdown |

#### `/src/components/workflow/` — Workflow Engine
| Datei | Zweck |
|-------|-------|
| `WorkflowCanvas.tsx` | React Flow canvas + Run/Resume + execution status |
| `TriggerNode.tsx` | Trigger node component |
| `AgentNode.tsx` | Agent step node component |
| `OutputNode.tsx` | Output node component |
| `GateConfigPanel.tsx` | Gate mode selector (auto/human/agent-review) |

#### `/src/hooks/`
| Datei | Zweck |
|-------|-------|
| `workflow/useWorkflowExecution.ts` | EventBus → Zustand reactive bridge |

#### `/src/stores/` — State Management (7 Zustand Stores)
| Datei | Persisted | Zweck |
|-------|-----------|-------|
| `hermesStore.ts` | ✅ | Chat, messages, streaming, gateway process, tool calls |
| `layoutStore.ts` | ✅ | activeTab, contextView, mode (standard/agentic) |
| `executionPlanStore.ts` | ✅ | Plan history, phase tracking, streaming output |
| `editorStore.ts` | ❌ | Workspace files, open tabs, content |
| `terminalStore.ts` | ❌ | PTY state, Hermes install phase, reactive parser |
| `workflowStore.ts` | ❌ | Active workflow, React Flow state |
| `moduleStore.ts` | ❌ | Module registry, install progress |

#### `/src/services/` — Business Logic (6 Active + 2 Orphaned)
| Datei | Lines | Zweck |
|-------|-------|-------|
| `hermesBridge.ts` | 937 | YAML patching, persona injection, workflow execution |
| `hermesProvisioner.ts` | 619 | Kit deployment, OTA updates, version tracking |
| `moduleInstaller.ts` | 571 | Hermes/Zed auto-detection + installation |
| `planExecutor.ts` | 416 | Multi-phase execution, gate evaluation, context summary |
| `hermesClient.ts` | 267 | HTTP/SSE client for Hermes Gateway |
| `hermesGateway.ts` | 187 | Process lifecycle (start/stop/health) |
| `eventBus.ts` | 166 | Typed event bus (12 event types) |
| `marketingApi.ts` | — | ⚠️ Orphaned (pending Marketing design) |
| `supabaseClient.ts` | — | ⚠️ Orphaned (pending Marketing design) |

#### `/src/presets/` — Plugin System
| Datei | Zweck |
|-------|-------|
| `index.ts` | Single point: `activePreset = vanillaPreset` |
| `types.ts` | PresetConfig, ModuleDefinition, ContextItem, TabDefinition |
| `vanilla.ts` | Default preset (+ workflowModule) |
| `modules/` | Pluggable feature modules |

#### `/src/types/` — Type Definitions
| Datei | Zweck |
|-------|-------|
| `workflow.types.ts` | GateMode, NodeData unions, WorkflowDocument, ExecutionState |
| `executionPlan.types.ts` | ExecutionPlan, PhaseDefinition, GateResult, PersonaId |

#### `/src/styles/` — Design System
| Datei | Zweck |
|-------|-------|
| `globals.css` | Tailwind v4 @theme: 7 surface tiers, amber accent, typography tokens |

---

### `/src-tauri/` — Backend (Rust)

| Datei | Zweck |
|-------|-------|
| `src/lib.rs` | 3 Tauri commands: greet, get/set_keychain_secret |
| `Cargo.toml` | Dependencies: keyring, tauri-plugin-pty/shell/os/dialog/fs |
| `capabilities/default.json` | Security permissions (⚠️ broad shell access) |

**Tauri Plugins:** opener, shell, pty, os, dialog, fs

---

### `/hermes-kit/` — Agent OS Kit
| Datei | Zweck |
|-------|-------|
| `config.yaml` | 3-Tier LLM Cascading + 16 persona definitions |
| `SOUL.md` | Lead Architect identity prompt |
| `kit-manifest.json` | Version 1.0.0, remoteBaseUrl for OTA |
| `personas/` | (Empty — personas inline in config.yaml) |
| `skills/` | 15 skill directories (agentic-plan, fortress-audit, etc.) |

---

## Security Findings (Deep Research 2026-04-16)

| # | Finding | Severity |
|---|---------|----------|
| S-1 | Shell capabilities ohne scope-Filter | 🔴 HIGH |
| S-2 | Persona-Map doppelt definiert (DRY Violation) | 🟡 MEDIUM |
| S-3 | curl \| bash Installer ohne Checksum | 🟡 MEDIUM |
| S-5 | OTA Kit Update ohne SHA-256 Check | 🟡 MEDIUM |

---

## Architektur-Invarianten

1. **Autarch orchestriert, bündelt nicht** — Hermes ist extern
2. **Vanilla Core First** — Keine ARES deps im Core
3. **Preset Rule**: presets → modules → core (nie rückwärts)
4. **Non-destructive Config** — YAML-Patch, nie Overwrite
5. **Kit Versioning** — Semver in `~/.autarch/kit.json`
6. **Gate System** — Jeder Node: auto/human/agent-review
7. **Dual Layout** — standard (IDE) vs. agentic (3-Panel)
8. **Keychain-only Secrets** — Rust → macOS Keychain, nie localStorage

# Semantic Context — Autarch

> Destilliertes Systemverständnis: Architektur, Abhängigkeiten, Invarianten, Entscheidungen.
> Letzte Aktualisierung: 2026-04-16 (Deep Research verifiziert)

---

## Architektur-Invarianten

1. **Autarch orchestriert, bündelt nicht.** Hermes ist extern, Autarch nur UI/Config Layer.
2. **Vanilla Core First.** Keine ARES/Paperclip Imports im Core. Marketing wird nativ gebaut.
3. **Desktop-First.** Tauri v2 Commands statt HTTP. Offline-fähig.
4. **TypeScript strict.** `strict: true`, kein `any`, alle Module type-checked.
5. **Local-First Persistence.** Workflows → `~/.autarch/workflows/`, Sessions → localStorage, Keys → OS Keychain.
6. **Preset-basierte Module.** Jedes Feature ist ein `ModuleDefinition` in `presets/`. Dependency Rule: `presets → modules → core`, nie rückwärts.
7. **Non-destructive Config.** YAML-Patch für `config.yaml`, nie Overwrite.
8. **Keychain-only Secrets.** API Keys über Rust → macOS Keychain, nie localStorage.

---

## Module & Abhängigkeitsgraph

```
App.tsx (Lazy Load + Mode Switch: standard / agentic)
  ├── TopNav.tsx (Core tabs + Preset modules + Hermes Status + ModelSwitcher)
  ├── ContextPanel.tsx (Left sidebar: dynamic per activeTab)
  ├── MainStage.tsx (View resolver per tab + contextView)
  │
  ├── [standard mode]
  │     ├── MonacoEditor + FileExplorer
  │     ├── Terminal (xterm.js + PTY)
  │     ├── AgentChat.tsx (full state machine: install → offline → online)
  │     └── AgentInlineEditOverlay.tsx (Cmd+K)
  │
  ├── [agentic mode] → AgenticLayout.tsx
  │     ├── SessionListPanel (left)
  │     ├── AgentChat + PhaseTracker (center, split when activePlan)
  │     ├── Terminal (bottom)
  │     └── FileExplorer (right)
  │
  ├── WorkflowCanvas.tsx (via workflowModule preset)
  │     ├── TriggerNode / AgentNode / OutputNode
  │     ├── GateConfigPanel
  │     └── useWorkflowExecution (EventBus → Store bridge)
  │
  └── Settings: SettingsModules + ApiKeysSettings
```

### Store-Abhängigkeiten
```
hermesStore.ts (✅ persists)  ← AgentChat, hermesBridge, hermesClient, TopNav
layoutStore.ts (✅ persists)  ← AgenticLayout, TopNav, ContextPanel, MainStage, App
executionPlanStore.ts (✅ persists)  ← PhaseTracker, AgenticLayout, planExecutor
editorStore.ts ← MonacoEditor, FileExplorer, AgentInlineEditOverlay
workflowStore.ts ← WorkflowCanvas, all Node components, useWorkflowExecution
terminalStore.ts ← Terminal, AgentChat (install CTA)
moduleStore.ts ← moduleInstaller, SettingsModules
```

### Service-Abhängigkeiten
```
hermesBridge.ts (937 LOC) → hermesStore + eventBus + hermesClient + Tauri shell
hermesProvisioner.ts (619 LOC) → Tauri FS + Shell (kit deploy + OTA)
moduleInstaller.ts (571 LOC) → moduleStore + terminalStore + activePreset
planExecutor.ts (416 LOC) → executionPlanStore + hermesClient + eventBus
hermesClient.ts (267 LOC) → fetch (HTTP/SSE to Gateway :8642)
hermesGateway.ts (187 LOC) → Tauri shell (pgrep, nohup, SIGTERM/SIGKILL)
eventBus.ts (166 LOC) → (standalone, typed discriminated union, 12 events)
```

---

## Datenflüsse

### Chat Lifecycle
```
User Input → AgentChat → hermesStore.submitRun()
  → hermesClient.startRun() → POST :8642/v1/chat/completions
  → SSE stream → hermesEventBus → hermesStore (messages + toolCalls)
  → React re-render
```

### Hermes Installation FSM
```
Idle → installHermes() → window.confirm
  → PTY: curl | bash (NousResearch installer)
  → handlePtyOutput() reactive parser (pattern matching):
    'installing' → 'setup-wizard' → 'provisioning' → 'done'
  → hermesProvisioner.applyHermesKit()
    config.yaml → ~/.hermes/
    SOUL.md → ~/.hermes/
    skills/ → ~/.autarch/skills/
    kit.json → ~/.autarch/
```

### Workflow Execution
```
WorkflowCanvas "Run" → workflowStore → hermesBridge.executeWorkflow()
  → Topological sort (Kahn's O(V+E))
  → Per node: gather predecessor outputs → executeWithPersona() → evaluateGate()
  → Gate modes: auto (pass) / human (pause + resume) / agent-review (LLM jury)
  → Events: hermesEventBus → useWorkflowExecution → workflowStore → React
```

---

## Erkenntnisse-Log

### 2026-04-16 — Deep Research / Ground of Truth
**Analysiert:** 50+ Source-Dateien, vollständige Architektur
**Erkenntnisse:**
- EventBus hat 12 Event-Types (nicht 6 wie zuvor dokumentiert): tool.started/completed, message.chunk/complete, reasoning.token/complete, run.started/completed/failed, workflow.started/completed/failed, node.started/completed/suspended
- Persona Map ist in ZWEI Stellen definiert (hermesBridge.ts L31-48 + config.yaml L67-217) → DRY Violation mit Drift-Risiko
- Shell Capabilities sind maximally permissiv (execute + spawn + kill) ohne scope-Filtering → S-1 HIGH
- OTA Kit Update hat keinen SHA-256 Integrity Check → nur Version-Vergleich
- Preset System ist sauber: Uncle Bob Dependency Rule wird zur Compile-Zeit eingehalten
- AgentChat.tsx implementiert vollständige State Machine: install CTA → installing → setup-wizard → provisioning → offline → starting → online
- Design System nutzt 7 Surface Tiers (void → bright), Amber/Gold accent, 3 Fonts (Space Grotesk / Inter / JetBrains Mono)
- `greet` Tauri Command ist Developer-Platzhalter, nie aufgerufen

**Abhängigkeiten entdeckt:**
- `activePreset` wird von 3 Stellen konsumiert: App.tsx, TopNav.tsx, ContextPanel.tsx
- `moduleInstaller.ts` importiert `activePreset` für `hermesCloneUrl`
- `AgenticLayout` zeigt PhaseTracker nur wenn `activePlan` existiert (conditional split)

### 2026-04-13 — Workflow Engine Build + Audit
**Geänderte Module:** `workflow.types.ts`, `workflowStore.ts`, `eventBus.ts`, `hermesBridge.ts`, `WorkflowCanvas.tsx`, `TriggerNode.tsx`, `AgentNode.tsx`, `OutputNode.tsx`, `GateConfigPanel.tsx`, `workflowModule.tsx`, `useWorkflowExecution.ts`
**Erkenntnisse:**
- React Flow's `NodeProps` generic typing ist streng — `data` muss über documented cast (`as unknown as ConcreteType`) gemappt werden, da RF intern `Record<string, unknown>` erzwingt
- `onNodesChange` / `onEdgesChange` erfordern ebenfalls `Parameters<typeof>` Casts wegen RF's generischer Node-Signatur
- Topologischer Sort mit Kahn's Algorithm ist O(V+E), aber naive `nodes.find()` im Inner Loop macht es O(V²) → Pre-build `Map<string, Node>` ist essentiell
- EventBus muss strikt getypte payloads haben (discriminated union), sonst infiziert `any` den gesamten Listener-Stack
- `crypto.randomUUID()` existiert in allen modernen Browsern/Tauri-WebViews, Fallback auf `Date.now()` nur für Edge Cases
- LLM-Criteria müssen sanitized werden: Truncation + Control-Char-Stripping verhindert Prompt Injection via Gate Config
- Radio-Button `name` Attributes müssen per Node-ID namespaced werden, sonst kollidieren sie bei Multi-Panel-Rendering

**Entscheidungen:**
- Status-Ring-CSS wird inline in Node-Komponenten berechnet (nicht als utility), weil Zustand-Selektoren pro-Node re-rendern müssen
- `executionState` startet als `null` (nicht als leeres Objekt), um "noch nie gestartet" von "idle" zu unterscheiden

### 2026-04-17 — Ship: Omni-Overlay & Search Performance Hardening (Deep Audit)
**Geänderte Module:** `src-tauri/capabilities/default.json`, `commandRegistry.ts`
**Erkenntnisse:**
- Tauri native Shell Executions via `Command.create('grep')` scheitern in V2 ohne expliziten Allowlist-Eintrag (`default.json`).
- Zustand Store Re-renders und iterative Objekt-Zuweisung innerhalb des `CommandPalette` Loops verheddern den Main-Thread komplett, wenn Workspace Caching (`fileTree` Mapping) nicht referenziell gememoized wird.
**Entscheidungen:**
- Refactoring `commandRegistry.ts`: Strict Caching von `lastFileTreeRef`, was das Slice Limit sicher auf 2000 Files hebt. File-Mapping ist fortan O(1) nach initialem Load.

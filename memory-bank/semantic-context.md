# Semantic Context — Autarch

> Destilliertes Systemverständnis: Architektur, Abhängigkeiten, Invarianten, Entscheidungen.

---

## Architektur-Invarianten

1. **Vanilla Core Only.** Keine ARES/Paperclip Imports im Core. Marketing wird nativ gebaut.
2. **Hermes ist extern.** Autarch spawnt Hermes als Subprocess (stdio/ACP). Kein embedded Agent.
3. **Desktop-First.** Tauri v2 Commands statt HTTP. Offline-fähig.
4. **TypeScript strict.** `strict: true`, kein `any`, alle Module type-checked.
5. **Local-First Persistence.** Workflows → `~/.autarch/workflows/`, Sessions → localStorage, Keys → OS Keychain.
6. **Preset-basierte Module.** Jedes Feature ist ein `ModuleDefinition` in `presets/`. Vanilla Core = Standard-Set.

---

## Module & Abhängigkeitsgraph

```
App.tsx
  ├── TopNav.tsx (Tab Navigation: IDE / Marketing / Dashboard / Settings / Workflow)
  ├── AgenticLayout.tsx (IDE View)
  │     ├── EditorLayout.tsx (Monaco + File Explorer)
  │     ├── Terminal.tsx (xterm.js + PTY via Tauri)
  │     ├── AgentChat.tsx (Hermes Chat Interface)
  │     └── AgentInlineEditOverlay.tsx (Cmd+K Inline Edit)
  ├── WorkflowCanvas.tsx (Workflow Engine)
  │     ├── TriggerNode.tsx / AgentNode.tsx / OutputNode.tsx
  │     ├── GateConfigPanel.tsx
  │     └── useWorkflowExecution.ts (Reactive Bridge)
  └── SettingsModules.tsx / ApiKeysSettings.tsx
```

### Store-Abhängigkeiten
```
hermesStore.ts ← AgentChat, hermesBridge, hermesClient
editorStore.ts ← MonacoEditor, FileExplorer, AgentInlineEditOverlay
workflowStore.ts ← WorkflowCanvas, all Node components, useWorkflowExecution
terminalStore.ts ← Terminal
layoutStore.ts ← AgenticLayout, TopNav
moduleStore.ts ← ModuleInstaller, SettingsModules
executionPlanStore.ts ← PhaseTracker, planExecutor
```

### Service-Abhängigkeiten
```
hermesBridge.ts → hermesStore (chat), eventBus (workflow), Tauri shell (spawn)
hermesClient.ts → fetch (LLM API direct)
eventBus.ts → (standalone, no deps)
hermesProvisioner.ts → Tauri FS + Shell (kit download/install)
moduleInstaller.ts → moduleStore
planExecutor.ts → executionPlanStore
```

---

## Erkenntnisse-Log

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

**Abhängigkeiten entdeckt:**
- `useWorkflowExecution` Hook → `hermesEventBus` + `workflowStore` + `executeWorkflow()` (3-way bridge)
- `executeWorkflow()` emittiert Events → Hook subscribed → Store updated → Nodes re-render (unidirektionaler Datenstrom)

**Entscheidungen:**
- Status-Ring-CSS wird inline in Node-Komponenten berechnet (nicht als utility), weil Zustand-Selektoren pro-Node re-rendern müssen
- `executionState` startet als `null` (nicht als leeres Objekt), um "noch nie gestartet" von "idle" zu unterscheiden
- `getNodeStatusClass()` utility wurde erstellt und sofort gelöscht — inline computation ist performanter bei Zustand-Subscriptions

# Autarch Architecture — Kern-Wissen

**Primär-Personas:** 🏗️ NOUS, 🖥️ Carmack, 🧠 Karpathy
**Sekundär:** 🔍 Sherlock, 🎨 Rauno

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bei Architektur-Entscheidungen,
> neuen Modulen, Store-Änderungen und Service-Refactoring.

---

## System-Identität

Autarch ist eine **self-hosted Desktop-IDE** (Tauri 2 + React 19 + Vite) die den externen
**Hermes Agent** (NousResearch) um ein Persona-System, Visual Workflow Engine und OTA Kit
Provisioning erweitert.

**Kernprinzip:** Autarch orchestriert, bündelt nicht.

---

## Architektur-Invarianten

| # | Invariante | Enforcement |
|---|-----------|------------|
| 1 | Hermes ist extern (kein embedded agent) | hermesBridge → HTTP/SSE zu :8642 |
| 2 | Vanilla Core First (keine ARES deps) | Preset-System isoliert Features |
| 3 | Preset Dependency Rule: presets → modules → core | Uncle Bob, compile-time |
| 4 | Non-destructive Config | YAML-Patch, nie Overwrite |
| 5 | Keychain-only Secrets | Rust keyring → macOS Keychain |
| 6 | Kit Versioning via Semver | ~/.autarch/kit.json |
| 7 | Dual Layout Modes | standard (IDE) vs. agentic (3-Panel) |
| 8 | Gate System per Node | auto / human / agent-review |

---

## Service-Layer Patterns

### hermesBridge.ts (937 LOC — Largest File)
```
Responsibilities:
1. YAML patching: syncToHermes() → non-destructive merge to config.yaml
2. Persona injection: executeWithPersona() → system prompt prepend
3. Gate evaluation: executeGate() → LLM jury with criteria
4. Workflow execution: executeWorkflow() → topological sort + persona routing
```

**Warnung:** Persona Map (PERSONA_MAP) ist DUPLIZIERT in hermesBridge.ts UND config.yaml.
Änderungen müssen an BEIDEN Stellen gemacht werden bis DRY Fix.

### EventBus (166 LOC — 12 Event Types)
```typescript
// Typed discriminated union:
type HermesEvent =
  | { type: 'tool.started'; ... }
  | { type: 'tool.completed'; ... }
  | { type: 'message.chunk'; ... }
  | { type: 'message.complete'; ... }
  | { type: 'reasoning.token'; ... }
  | { type: 'reasoning.complete'; ... }
  | { type: 'run.started'; ... }
  | { type: 'run.completed'; ... }
  | { type: 'run.failed'; ... }
  | { type: 'workflow.started'; ... }
  | { type: 'workflow.completed'; ... }
  | { type: 'node.started' | 'node.completed' | 'node.suspended'; ... }
```

### Hermes Installation FSM (terminalStore.ts)
```
States: idle → installing → setup-wizard → provisioning → done
Trigger: Reactive PTY output parser (pattern matching)
Patterns:
  'Installing' → installing
  'Setup Wizard' / 'Choose your' → setup-wizard  
  'Setup complete' → provisioning (trigger kit apply)
  kit applied → done
```

---

## Preset System

```typescript
// presets/types.ts
interface PresetConfig {
  name: string;           // 'vanilla' | 'ares'
  modules: ModuleDefinition[];   // Plugin modules
  hermesCloneUrl?: string;       // Git clone URL
  hermesKitPath?: string;        // Bundle resource path
  kitUpdateUrl?: string;         // OTA base URL
  branding?: { appName?, footerLabel? };
}

interface ModuleDefinition {
  id: string;              // Matches tab ID
  tab: TabDefinition;      // TopNav config
  contextItems: ContextItem[];   // Left sidebar items
  resolveView: (viewId: string) => ReactNode | null;
}
```

**Aktuell:** Nur `vanillaPreset` implementiert (+ workflowModule).
**Geplant:** `aresPreset` (referenced in presets/index.ts comment aber nicht gebaut).

---

## Design System Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--color-surface-base` | #09090b | Main background |
| `--color-accent` | #f59e0b (Amber) | Primary interactive |
| `--color-accent-dim` | #d97706 | Secondary interactive |
| `--font-display` | Space Grotesk | Headlines, branding |
| `--font-body` | Inter | Body text |
| `--font-mono` | JetBrains Mono | Code, labels |

**Utility Classes:** `.glass-panel`, `.ghost-border`, `.accent-glow`, `.label-tag`

---

## Bekannte Technische Schulden

| Issue | Impact | Fix-Aufwand |
|-------|--------|-------------|
| Persona Map dupliziert (hermesBridge + config.yaml) | Drift-Risiko | ~2h |
| Orphaned: marketingApi.ts + supabaseClient.ts | Dead code | ~5min |
| `greet` Tauri command (placeholder) | Noise | ~1min |
| personas/ directory empty | Misleading structure | ~1min |
| EventBus uses `Function` type (eslint-disable) | Type safety gap | ~30min |
| Base64-Encoding für kit.json | Fragil bei Sonderzeichen | ~1h |

---

## Referenz-Dateien

| Datei | Zweck |
|-------|-------|
| `memory-bank/system-index.md` | Vollständiger Datei-Index |
| `memory-bank/semantic-context.md` | Abhängigkeiten, Datenflüsse |
| `AUTARCH-BLUEPRINT.md` | Architektur-Vision |
| `DESIGN.md` | Design System Spec |
| `hermes-kit/config.yaml` | 3-Tier LLM + 16 Personas |

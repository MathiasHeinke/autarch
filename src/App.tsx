import { Shell } from "./components/layout/SentinelOverlay";
import { IdeView, ModuleView } from "./components/views/MainStage";
import { AgentChat } from "./components/views/AgentChat";
import { SettingsModules } from "./components/views/SettingsModules";
import { ApiKeysSettings } from "./components/views/ApiKeysSettings";
import { MemoryPanel } from "./components/views/MemoryPanel";
import { SkillsBrowser } from "./components/views/SkillsBrowser";
import { AgenticLayout } from "./components/layout/AgenticLayout";
import { EditorLayout } from "./components/layout/EditorLayout";
import { useLayoutStore } from "./stores/layoutStore";
import { activePreset } from "./presets";

// ─── Placeholder configs for core tabs without dedicated views ──
const MODULE_CONFIG: Record<string, { title: string; subtitle: string }> = {
  company: { title: 'Company OS', subtitle: 'Paperclip integration — departments, employees, task queues' },
  agents: { title: 'Agent Fleet', subtitle: 'Multi-agent orchestration, persona profiles, execution traces' },
  fleet: { title: 'System Dashboard', subtitle: 'Token usage, model routing, workspace health metrics' },
};

/**
 * Resolves which main view to render based on the active tab
 * and (for IDE tab) the active context view.
 * 
 * Routing priority:
 * 1. Core tabs (ide, settings) — always available
 * 2. Preset modules — dynamically resolved via module.resolveView()
 * 3. Fallback — ModuleView placeholder
 */
function MainContent() {
  const { activeTab, activeContextView } = useLayoutStore();

  // ── Core: IDE tab ─────────────────────────────────────────
  if (activeTab === 'ide') {
    if (activeContextView === 'chat') {
      return <AgentChat />;
    }
    if (activeContextView === 'explorer') {
      return <EditorLayout />;
    }
    return <IdeView />;
  }

  // ── Core: Settings tab ────────────────────────────────────
  if (activeTab === 'settings') {
    if (activeContextView === 'keys' || activeContextView === 'mcp') {
      return <ApiKeysSettings />;
    }
    return <SettingsModules />;
  }

  // ── Core: Agents tab ──────────────────────────────────────
  if (activeTab === 'agents') {
    if (activeContextView === 'memory') {
      return <MemoryPanel />;
    }
    if (activeContextView === 'skills') {
      return <SkillsBrowser />;
    }
  }

  // ── Preset modules: resolve dynamically ───────────────────
  const presetModule = activePreset.modules.find(m => m.id === activeTab);
  if (presetModule) {
    const view = presetModule.resolveView(activeContextView);
    if (view) return <>{view}</>;
  }

  // ── Fallback: placeholder ─────────────────────────────────
  return (
    <ModuleView
      title={MODULE_CONFIG[activeTab]?.title ?? 'Unknown'}
      subtitle={MODULE_CONFIG[activeTab]?.subtitle ?? ''}
    />
  );
}

export default function App() {
  const { mode } = useLayoutStore();

  if (mode === 'agentic') {
    return <AgenticLayout />;
  }

  return (
    <Shell>
      <MainContent />
    </Shell>
  );
}

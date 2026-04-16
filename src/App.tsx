import { Suspense, lazy } from "react";
import { Shell } from "./components/layout/SentinelOverlay";
import { ModuleView } from "./components/views/MainStage";
// IdeView (mock) intentionally removed — EditorLayout is the real IDE
import { useLayoutStore } from "./stores/layoutStore";
import { activePreset } from "./presets";

// ── Dynamic Imports (Cypher SRE Bundle Splitting) ──
// IdeView mock deleted — all IDE routes use EditorLayout now
const AgentChat = lazy(() => import("./components/views/AgentChat").then(m => ({ default: m.AgentChat })));
const SettingsModules = lazy(() => import("./components/views/SettingsModules").then(m => ({ default: m.SettingsModules })));
const ApiKeysSettings = lazy(() => import("./components/views/ApiKeysSettings").then(m => ({ default: m.ApiKeysSettings })));
const MemoryPanel = lazy(() => import("./components/views/MemoryPanel").then(m => ({ default: m.MemoryPanel })));
const SkillsBrowser = lazy(() => import("./components/views/SkillsBrowser").then(m => ({ default: m.SkillsBrowser })));
const AgenticLayout = lazy(() => import("./components/layout/AgenticLayout").then(m => ({ default: m.AgenticLayout })));
const EditorLayout = lazy(() => import("./components/layout/EditorLayout").then(m => ({ default: m.EditorLayout })));

// ─── Placeholder configs for core tabs without dedicated views ──
const MODULE_CONFIG: Record<string, { title: string; subtitle: string }> = {
  agents: { title: 'Agent Fleet', subtitle: 'Multi-agent orchestration, persona profiles, execution traces' },
  fleet: { title: 'System Dashboard', subtitle: 'Token usage, model routing, workspace health metrics' },
};

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
    </div>
  );
}

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
    // All other IDE views (explorer, search, git) → real editor
    return <EditorLayout />;
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
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AgenticLayout />
      </Suspense>
    );
  }

  return (
    <Shell>
      <Suspense fallback={<LoadingFallback />}>
        <MainContent />
      </Suspense>
    </Shell>
  );
}

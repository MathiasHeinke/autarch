import { Shell } from "./components/layout/SentinelOverlay";
import { IdeView, ModuleView } from "./components/views/MainStage";
import { AgentChat } from "./components/views/AgentChat";
import { SettingsModules } from "./components/views/SettingsModules";
import { ApiKeysSettings } from "./components/views/ApiKeysSettings";
import { MarketingDashboard } from "./components/views/MarketingDashboard";
import { DraftEditor } from "./components/views/DraftEditor";
import { MarketingCalendar } from "./components/views/MarketingCalendar";
import { useLayoutStore } from "./stores/layoutStore";

const MODULE_CONFIG: Record<string, { title: string; subtitle: string }> = {
  company: { title: 'Company OS', subtitle: 'Paperclip integration — departments, employees, task queues' },
  agents: { title: 'Agent Fleet', subtitle: 'Multi-agent orchestration, persona profiles, execution traces' },
  fleet: { title: 'System Dashboard', subtitle: 'Token usage, model routing, workspace health metrics' },
};

/**
 * Resolves which main view to render based on the active tab
 * and (for IDE tab) the active context view.
 */
function MainContent() {
  const { activeTab, activeContextView } = useLayoutStore();

  // IDE tab has sub-views
  if (activeTab === 'ide') {
    if (activeContextView === 'chat') {
      return <AgentChat />;
    }
    return <IdeView />;
  }

  // Settings tab has sub-views
  if (activeTab === 'settings') {
    if (activeContextView === 'keys' || activeContextView === 'mcp') {
      return <ApiKeysSettings />;
    }
    return <SettingsModules />;
  }

  // Marketing tab — sub-view routing
  if (activeTab === 'marketing') {
    if (activeContextView === 'editor') {
      return <DraftEditor />;
    }
    if (activeContextView === 'calendar') {
      return <MarketingCalendar />;
    }
    return <MarketingDashboard />;
  }

  // All other tabs show their module placeholder
  return (
    <ModuleView
      title={MODULE_CONFIG[activeTab]?.title ?? 'Unknown'}
      subtitle={MODULE_CONFIG[activeTab]?.subtitle ?? ''}
    />
  );
}

export default function App() {
  return (
    <Shell>
      <MainContent />
    </Shell>
  );
}

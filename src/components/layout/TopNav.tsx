import { useEffect, useMemo } from 'react';
import { 
  TerminalSquare, 
  Building2, 
  Megaphone, 
  Cpu, 
  Activity, 
  Settings,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLayoutStore } from '../../stores/layoutStore';
import { useHermesStore } from '../../stores/hermesStore';
import { activePreset } from '../../presets';
import { ModelSwitcher } from '../views/ModelSwitcher';

// ─── Core tabs (always visible) ─────────────────────────────────
const CORE_TABS_BEFORE = [
  { id: 'ide', icon: TerminalSquare, label: 'IDE' },
  { id: 'company', icon: Building2, label: 'Company OS' },
];
const CORE_TABS_AFTER = [
  { id: 'agents', icon: Cpu, label: 'Agents' },
  { id: 'fleet', icon: Activity, label: 'Dashboard' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

// Icon lookup for preset modules (keeps icons in one place)
const MODULE_ICONS: Record<string, typeof Megaphone> = {
  marketing: Megaphone,
};

export function TopNav() {
  const { activeTab, setActiveTab, setActiveContextView, setMode } = useLayoutStore();
  const { status, startPolling } = useHermesStore();

  useEffect(() => {
    startPolling();
  }, [startPolling]);

  // Build tabs: core before + preset modules + core after
  const tabs = useMemo(() => {
    const presetTabs = activePreset.modules.map(m => ({
      id: m.tab.id,
      icon: MODULE_ICONS[m.id] ?? m.tab.icon,
      label: m.tab.label,
    }));
    return [...CORE_TABS_BEFORE, ...presetTabs, ...CORE_TABS_AFTER];
  }, []);

  return (
    <header 
      className="h-11 flex-shrink-0 flex items-center px-3 gap-1 select-none"
      style={{ 
        background: 'var(--color-surface-section)',
        borderBottom: '1px solid var(--color-border-ghost)',
      }}
    >
      {/* Brand Mark */}
      <div className="flex items-center gap-2.5 mr-5 pr-5" style={{ borderRight: '1px solid var(--color-border-ghost)' }}>
        <motion.div 
          className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))' }}
          onClick={() => setMode('agentic')}
          title="Switch to Agentic Mode"
          whileHover={{ scale: 1.1, boxShadow: '0 0 16px rgba(245,158,11,0.4)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring' as const, damping: 20, stiffness: 400 }}
        >
          <Zap className="w-3.5 h-3.5 text-black" strokeWidth={3} />
        </motion.div>
        <span 
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ 
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-secondary)',
          }}
        >
          AUTARCH
        </span>
      </div>

      {/* Module Tabs */}
      <nav className="flex items-center gap-1 flex-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-md"
              style={{
                background: isActive ? 'var(--color-surface-interactive)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                border: isActive ? '1px solid var(--color-border-active)' : '1px solid transparent',
                boxShadow: isActive ? '0 0 16px var(--color-accent-glow), inset 0 0 12px rgba(245,158,11,0.04)' : 'none',
              }}
              whileHover={!isActive ? { 
                backgroundColor: 'var(--color-surface-component)',
                color: 'var(--color-text-secondary)',
                transition: { duration: 0.15 },
              } : undefined}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring' as const, damping: 25, stiffness: 400 }}
            >
              <tab.icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.5 : 2} />
              <span 
                className="text-xs font-medium"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Model Switcher */}
      <ModelSwitcher className="ml-auto mr-2" />

      {/* Hermes Status — Hero Indicator (live health check) */}
      <motion.div 
        className="flex items-center gap-2.5 py-1 px-3 rounded-md cursor-pointer"
        style={{ 
          background: status.online ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
          border: `1px solid ${status.online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
        }}
        whileHover={{ 
          backgroundColor: status.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: status.online ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
          boxShadow: status.online ? '0 0 20px rgba(16, 185, 129, 0.1)' : '0 0 20px rgba(239, 68, 68, 0.1)',
        }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          setActiveTab('ide');
          setActiveContextView('chat');
        }}
        title={status.online ? `Hermes online · ${status.model ?? ''}` : 'Hermes offline — click to open chat'}
      >
        <div className="relative flex items-center justify-center">
          <div 
            className="absolute w-5 h-5 rounded-full"
            style={{ 
              background: status.online 
                ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
            }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              background: status.online ? 'var(--color-success)' : 'var(--color-error)',
              boxShadow: status.online 
                ? '0 0 8px var(--color-success), 0 0 16px rgba(16,185,129,0.3)'
                : '0 0 8px var(--color-error), 0 0 16px rgba(239,68,68,0.3)',
            }}
          />
          {status.online && (
            <div 
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{ background: 'var(--color-success)', opacity: 0.3 }}
            />
          )}
        </div>
        <span 
          className="text-[11px] font-medium tracking-wide"
          style={{ 
            fontFamily: 'var(--font-mono)', 
            color: status.online ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {status.online ? 'HERMES ONLINE' : 'HERMES OFFLINE'}
        </span>
      </motion.div>
    </header>
  );
}

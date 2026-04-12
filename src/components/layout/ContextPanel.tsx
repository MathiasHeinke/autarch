import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderTree, 
  MessageSquare, 
  GitBranch,
  Search,
  Key,
  Server,
} from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';

interface ContextPanelProps {
  activeTab: string;
}

const CONTEXT_ITEMS: Record<string, { icon: typeof FolderTree; label: string; id: string }[]> = {
  ide: [
    { icon: FolderTree, id: 'explorer', label: 'Explorer' },
    { icon: Search, id: 'search', label: 'Search' },
    { icon: GitBranch, id: 'git', label: 'Source Control' },
    { icon: MessageSquare, id: 'chat', label: 'Agent Chat' },
  ],
  company: [
    { icon: FolderTree, id: 'departments', label: 'Departments' },
    { icon: MessageSquare, id: 'tasks', label: 'Task Queue' },
  ],
  marketing: [
    { icon: FolderTree, id: 'pipeline', label: 'Content Pipeline' },
    { icon: Search, id: 'calendar', label: 'Calendar View' },
    { icon: MessageSquare, id: 'editor', label: 'Draft Editor' },
  ],
  agents: [
    { icon: FolderTree, id: 'fleet', label: 'Agent Fleet' },
    { icon: MessageSquare, id: 'logs', label: 'Execution Logs' },
  ],
  fleet: [
    { icon: FolderTree, id: 'metrics', label: 'System Metrics' },
    { icon: MessageSquare, id: 'health', label: 'Health Check' },
  ],
  settings: [
    { icon: FolderTree, id: 'modules', label: 'Modules' },
    { icon: Key, id: 'keys', label: 'API Keys' },
    { icon: Server, id: 'mcp', label: 'MCP Config' },
    { icon: GitBranch, id: 'models', label: 'Models' },
  ],
};

export function ContextPanel({ activeTab }: ContextPanelProps) {
  const items = CONTEXT_ITEMS[activeTab] ?? [];
  const { activeContextView, setActiveContextView } = useLayoutStore();

  // Reset to first item when tab changes and current view isn't in the new tab
  useEffect(() => {
    if (items.length > 0 && !items.find(i => i.id === activeContextView)) {
      setActiveContextView(items[0].id);
    }
  }, [activeTab, items, activeContextView, setActiveContextView]);

  return (
    <aside 
      className="h-full flex flex-col select-none overflow-hidden"
      style={{ 
        width: 220,
        background: 'var(--color-surface-section)',
        borderRight: '1px solid var(--color-border-ghost)',
      }}
    >
      {/* Panel Header */}
      <div 
        className="flex items-center px-4 h-9 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
      >
        <span className="label-tag" style={{ color: 'var(--color-accent)' }}>
          {activeTab.toUpperCase()}
        </span>
      </div>

      {/* Context Nav Items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeContextView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveContextView(item.id)}
              className="relative w-full flex items-center gap-2.5 pl-4 pr-3 py-2 text-left"
              style={{ 
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                background: isActive ? 'var(--color-surface-component)' : 'transparent',
              }}
              whileHover={!isActive ? {
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--color-text-secondary)',
                x: 2,
                transition: { duration: 0.12 },
              } : undefined}
            >
              {isActive && (
                <motion.div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ 
                    background: 'linear-gradient(to bottom, var(--color-accent), var(--color-accent-dim))',
                    boxShadow: '0 0 6px var(--color-accent-glow)',
                  }}
                  layoutId="context-indicator"
                  transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
                />
              )}
              <item.icon 
                className="w-4 h-4 flex-shrink-0" 
                strokeWidth={isActive ? 2.2 : 1.8}
                style={{ color: isActive ? 'var(--color-accent)' : undefined }}
              />
              <span className="text-[12px] flex-1 truncate font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Panel Footer */}
      <div 
        className="px-4 py-2.5 flex-shrink-0"
        style={{ borderTop: '1px solid var(--color-border-ghost)' }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--color-success)' }}
          />
          <span className="label-tag">workspace active</span>
        </div>
      </div>
    </aside>
  );
}

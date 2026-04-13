import { motion } from 'framer-motion';
import { MessageSquare, Clock, Hash } from 'lucide-react';
import clsx from 'clsx';

const MOCK_SESSIONS = [
  { id: 's1', name: 'Agentic Layout Optimization', workspace: 'Autarch', time: '10m ago', active: true },
  { id: 's2', name: 'Debug Bio.X Convergence', workspace: 'Autarch Core', time: '2h ago', active: false },
  { id: 's3', name: 'Implement Marketing Pipeline', workspace: 'Vanilla Setup', time: '1d ago', active: false },
  { id: 's4', name: 'Fix HealthKit Mutex', workspace: 'Autarch Core', time: '3d ago', active: false },
];

export function SessionListPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-surface-component)' }}>
      {/* Header */}
      <div 
        className="h-11 flex items-center justify-between px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <span 
            className="text-xs font-bold tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            Chat Sessions
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {MOCK_SESSIONS.map((session) => (
          <motion.button
            key={session.id}
            className={clsx(
              "w-full text-left p-3 rounded-lg flex flex-col gap-2 relative group transition-colors",
              session.active ? "bg-white/10" : "hover:bg-white/5"
            )}
            style={{ 
              border: `1px solid ${session.active ? 'rgba(245, 158, 11, 0.2)' : 'var(--color-border-ghost)'}`
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium pr-2 truncate" style={{ color: 'var(--color-text-primary)' }}>
                {session.name}
              </span>
              {session.active && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono opacity-60">
              <div className="flex items-center gap-1.5 text-emerald-400/80">
                <Hash className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{session.workspace}</span>
              </div>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" /> {session.time}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

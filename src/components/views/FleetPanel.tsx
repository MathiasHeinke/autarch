import { motion } from 'framer-motion';
import { Activity, Clock, Server, Play, Pause, RefreshCw } from 'lucide-react';

const MOCK_JOBS = [
  { id: 'j1', name: 'SEO Pipeline', status: 'running', lastRun: '2m ago', nextRun: 'in 58m' },
  { id: 'j2', name: 'Nightly Bio.X Sync', status: 'idle', lastRun: '4h ago', nextRun: 'in 20h' },
  { id: 'j3', name: 'Content Distribution', status: 'error', lastRun: '1h ago', nextRun: 'manual' },
  { id: 'j4', name: 'Knowledge Graph Re-index', status: 'paused', lastRun: '1d ago', nextRun: '-' },
];

export function FleetPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-surface-component)' }}>
      {/* Header */}
      <div 
        className="h-11 flex items-center justify-between px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
      >
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <span 
            className="text-xs font-bold tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            Fleet Control
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 border border-white/5">
             <Activity className="w-3 h-3 text-emerald-400" />
             <span className="text-[10px] font-mono text-emerald-400/80">3/4 ONLINE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {MOCK_JOBS.map((job) => (
          <motion.div
            key={job.id}
            className="p-3 rounded-lg flex flex-col gap-2 relative group"
            style={{ 
              background: 'var(--color-surface-hover)',
              border: `1px solid ${job.status === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border-ghost)'}`
            }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {job.name}
              </span>
              <div className="flex items-center gap-2">
                {/* Status Dot */}
                <div 
                  className={`w-2 h-2 rounded-full ${
                    job.status === 'running' ? 'bg-emerald-400 animate-pulse' : 
                    job.status === 'error' ? 'bg-red-400' :
                    job.status === 'idle' ? 'bg-blue-400' : 'bg-gray-500'
                  }`}
                  style={{
                    boxShadow: job.status === 'running' ? '0 0 8px rgba(52, 211, 153, 0.6)' : 'none'
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono opacity-60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Last: {job.lastRun}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Next: {job.nextRun}
                </span>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-emerald-400"><Play className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-amber-400"><Pause className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            
            {job.status === 'error' && (
              <div className="mt-1 text-[10px] text-red-400/80 font-mono">
                Error: TIMEOUT reading from Supabase Edge Function
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

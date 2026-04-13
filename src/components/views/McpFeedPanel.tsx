import { motion } from 'framer-motion';
import { Rss, Code, Database, Zap } from 'lucide-react';
import { useHermesStore } from '../../stores/hermesStore';

const EVENT_ICONS: Record<string, typeof Code> = {
  'read_file': Code,
  'run_command': Zap,
  'query_db': Database,
};

export function McpFeedPanel() {
  const { toolCalls } = useHermesStore();
  
  // Create feed from tool calls
  const feed = toolCalls.map(tc => {
    let content = 'Executing tool...';
    try {
      if (tc.input) {
         const parsed = JSON.parse(tc.input);
         content = parsed.toolAction || parsed.Action || content;
      }
    } catch {
       // Ignore
    }

    return {
      id: `tc-${tc.id}`,
      type: 'tool',
      name: tc.name,
      content,
      status: tc.status,
      timestamp: Date.now(),
    };
  }).reverse(); // Newest first
  
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      {/* Header */}
      <div 
        className="h-11 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
      >
        <div className="flex items-center gap-2">
          <Rss className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <span 
            className="text-xs font-bold tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            Global Feed
          </span>
          <div className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-400/10 text-amber-500 font-mono">LIVE</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {feed.length === 0 ? (
          <div className="text-center p-8 text-xs text-white/40 font-mono">
            Waiting for events...
          </div>
        ) : feed.map((item, i) => {
          const Icon = item.type === 'tool' ? (EVENT_ICONS[item.name as string] || Code) : Zap;
          const isError = item.type === 'tool' && item.status === 'error';
          
          return (
            <motion.div
              key={item.id + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 text-sm relative"
            >
              {/* Timeline dot/line */}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 z-10 ${
                    item.type === 'reasoning' ? 'bg-blue-500/10 text-blue-400' :
                    isError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {i < feed.length - 1 && (
                  <div className="w-px h-full bg-white/5 absolute top-6" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-white/70 uppercase">
                    {item.type === 'tool' ? `TOOL: ${item.name}` : 'REASONING'}
                  </span>
                </div>
                <div className={`text-xs ${item.type === 'reasoning' ? 'text-white/50 italic' : 'text-white/80 font-mono'} line-clamp-3`}>
                  {item.content as string}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

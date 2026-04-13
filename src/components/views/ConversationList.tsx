import { motion } from 'framer-motion';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import { useHermesStore } from '../../stores/hermesStore';

export function ConversationList() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    activeRunId,
  } = useHermesStore();

  const convList = Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-surface-component)' }}>
      <div 
        className="h-9 flex items-center justify-between px-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
      >
        <span 
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
        >
          Conversations
        </span>
        <motion.button
          onClick={createConversation}
          className="p-1 rounded flex items-center justify-center"
          style={{ color: 'var(--color-text-primary)' }}
          whileHover={{ background: 'var(--color-surface-interactive)' }}
          title="New Chat"
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {convList.map((conv) => {
          const isActive = activeConversationId === conv.id;
          const isRunning = isActive && activeRunId !== null;

          return (
            <motion.div
              key={conv.id}
              layout="position"
              onClick={() => setActiveConversation(conv.id)}
              className="group flex flex-col gap-1 p-2 rounded-md cursor-pointer transition-colors"
              style={{
                background: isActive ? 'var(--color-surface-interactive)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-border-active)' : 'transparent',
              }}
              whileHover={!isActive ? { background: 'var(--color-surface-hover)' } : undefined}
            >
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare 
                    className="w-3.5 h-3.5 flex-shrink-0" 
                    style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} 
                  />
                  <span 
                    className="text-[13px] truncate"
                    style={{ 
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 500 : 400
                    }}
                  >
                    {conv.title}
                  </span>
                </div>
                
                {/* Status or Delete */}
                <div className="flex items-center">
                  <div className={`transition-opacity ${isActive ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'}`}>
                    {isRunning && (
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }} />
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className={`absolute right-2 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity`}
                    style={{ color: 'var(--color-error)' }}
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-60">
                <Clock className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
                <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
        {convList.length === 0 && (
          <div className="text-center p-4">
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>No conversations</span>
          </div>
        )}
      </div>
    </div>
  );
}

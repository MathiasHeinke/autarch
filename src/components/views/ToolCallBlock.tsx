import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, CheckCircle2, XCircle, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import type { ToolCall } from '../../stores/hermesStore';

interface ToolCallBlockProps {
  toolCall: ToolCall;
}

export function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (toolCall.status) {
      case 'running': return 'var(--color-accent)';
      case 'completed': return 'var(--color-success)';
      case 'error': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'running': return <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: getStatusColor() }} />;
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: getStatusColor() }} />;
      case 'error': return <XCircle className="w-3.5 h-3.5" style={{ color: getStatusColor() }} />;
      default: return <Wrench className="w-3.5 h-3.5" style={{ color: getStatusColor() }} />;
    }
  };

  const hasDetails = !!toolCall.input || !!toolCall.output || !!toolCall.error;

  return (
    <div
      className="rounded-lg overflow-hidden my-2"
      style={{
        background: 'var(--color-surface-section)',
        border: '1px solid var(--color-border-ghost)',
      }}
    >
      <div 
        className={`flex items-center justify-between px-3 py-2 ${hasDetails ? 'cursor-pointer hover:bg-black/10 transition-colors' : ''}`}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span 
            className="text-[13px] font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
          >
            {toolCall.name}
          </span>
          {toolCall.duration && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {toolCall.duration}ms
            </span>
          )}
        </div>
        
        {hasDetails && (
          <div className="flex items-center">
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
            style={{ borderColor: 'var(--color-border-ghost)' }}
          >
            <div className="p-3 bg-black/20 space-y-3">
              {toolCall.input && (
                <div>
                  <div className="text-[10px] uppercase font-bold mb-1 tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Input</div>
                  <pre 
                    className="text-[11px] p-2 rounded overflow-x-auto whitespace-pre-wrap"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.3)' }}
                  >
                    {toolCall.input}
                  </pre>
                </div>
              )}
              
              {toolCall.error && (
                <div>
                  <div className="text-[10px] uppercase font-bold mb-1 tracking-wider" style={{ color: 'var(--color-error)' }}>Error</div>
                  <pre 
                    className="text-[11px] p-2 rounded overflow-x-auto whitespace-pre-wrap"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-error)', background: 'rgba(239,68,68,0.1)' }}
                  >
                    {toolCall.error}
                  </pre>
                </div>
              )}
              
              {toolCall.output && !toolCall.error && (
                <div>
                  <div className="text-[10px] uppercase font-bold mb-1 tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Output</div>
                  <pre 
                    className="text-[11px] p-2 rounded overflow-x-auto whitespace-pre-wrap"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.3)' }}
                  >
                    {toolCall.output}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

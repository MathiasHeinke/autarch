import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Trash2, WifiOff, Loader2 } from 'lucide-react';
import { useHermesStore } from '../../stores/hermesStore';
import { streamChat } from '../../services/hermesClient';

export function AgentChat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    status,
    messages,
    isStreaming,
    streamBuffer,
    addMessage,
    setStreaming,
    appendStreamChunk,
    finalizeStream,
    clearChat,
    startPolling,
  } = useHermesStore();

  // Start health polling on mount
  useEffect(() => {
    startPolling();
  }, [startPolling]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || !status.online) return;

    const userMsg = { role: 'user' as const, content: trimmed };
    addMessage(userMsg);
    setInput('');
    setStreaming(true);

    try {
      const allMessages = [...messages, userMsg];
      await streamChat(
        allMessages,
        (chunk) => appendStreamChunk(chunk),
        { systemPrompt: 'You are Hermes, an AI coding assistant running inside AUTARCH. Be concise, helpful, and precise.' }
      );
      finalizeStream();
    } catch (err) {
      finalizeStream();
      addMessage({
        role: 'assistant',
        content: `⚠️ Error: ${err instanceof Error ? err.message : 'Connection failed'}`,
      });
    }
  }, [input, isStreaming, status.online, messages, addMessage, setStreaming, appendStreamChunk, finalizeStream]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div
        className="h-9 flex items-center px-4 gap-3 flex-shrink-0 select-none"
        style={{
          background: 'var(--color-surface-elevated)',
          borderBottom: '1px solid var(--color-border-ghost)',
        }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            HERMES AGENT
          </span>
        </div>

        {/* Status Pill */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{
            background: status.online ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${status.online ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: status.online ? 'var(--color-success)' : 'var(--color-error)' }}
          />
          <span
            className="text-[10px] font-medium"
            style={{
              fontFamily: 'var(--font-mono)',
              color: status.online ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {status.online ? `online · ${status.model ?? ''}` : 'offline'}
          </span>
        </div>

        <div className="flex-1" />

        <motion.button
          onClick={clearChat}
          className="p-1 rounded"
          style={{ color: 'var(--color-text-tertiary)' }}
          whileHover={{ color: 'var(--color-text-secondary)' }}
          title="Clear chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ background: 'var(--color-surface-component)' }}
      >
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            {status.online ? (
              <>
                <Zap className="w-8 h-8" style={{ color: 'var(--color-accent-dim)' }} />
                <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)', maxWidth: 240 }}>
                  Hermes is ready. Ask anything about your codebase, run commands, or get help with architecture.
                </p>
              </>
            ) : (
              <>
                <WifiOff className="w-8 h-8" style={{ color: 'var(--color-error)' }} />
                <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)', maxWidth: 280 }}>
                  Hermes is not running. Start the agent with:
                </p>
                <code
                  className="text-[11px] px-3 py-1.5 rounded"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--color-surface-void)',
                    color: 'var(--color-accent-dim)',
                    border: '1px solid var(--color-border-ghost)',
                  }}
                >
                  hermes gateway
                </code>
              </>
            )}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-lg px-3.5 py-2.5"
                style={{
                  background: msg.role === 'user'
                    ? 'var(--color-surface-interactive)'
                    : 'var(--color-surface-section)',
                  border: msg.role === 'user'
                    ? '1px solid var(--color-border-active)'
                    : '1px solid var(--color-border-ghost)',
                }}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                    <span className="label-tag" style={{ color: 'var(--color-accent-dim)' }}>hermes</span>
                  </div>
                )}
                <p
                  className="text-[13px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming buffer */}
        {isStreaming && streamBuffer && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className="max-w-[85%] rounded-lg px-3.5 py-2.5"
              style={{
                background: 'var(--color-surface-section)',
                border: '1px solid var(--color-border-ghost)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                <span className="label-tag" style={{ color: 'var(--color-accent-dim)' }}>hermes</span>
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--color-accent-dim)' }} />
              </div>
              <p
                className="text-[13px] leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}
              >
                {streamBuffer}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ color: 'var(--color-accent)' }}
                >
                  ▌
                </motion.span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Streaming indicator without content yet */}
        {isStreaming && !streamBuffer && (
          <div className="flex justify-start">
            <div
              className="rounded-lg px-3.5 py-2.5 flex items-center gap-2"
              style={{
                background: 'var(--color-surface-section)',
                border: '1px solid var(--color-border-ghost)',
              }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Hermes is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="flex-shrink-0 p-3"
        style={{
          background: 'var(--color-surface-section)',
          borderTop: '1px solid var(--color-border-ghost)',
        }}
      >
        <div
          className="flex items-end gap-2 rounded-lg p-2"
          style={{
            background: 'var(--color-surface-component)',
            border: '1px solid var(--color-border-ghost)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={status.online ? 'Ask Hermes anything...' : 'Hermes is offline'}
            disabled={!status.online || isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:opacity-40"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              minHeight: 24,
              maxHeight: 120,
            }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || !status.online || isStreaming}
            className="p-1.5 rounded-md flex-shrink-0"
            style={{
              background: input.trim() && status.online ? 'var(--color-accent)' : 'transparent',
              color: input.trim() && status.online ? 'black' : 'var(--color-text-tertiary)',
              opacity: input.trim() && status.online ? 1 : 0.3,
            }}
            whileHover={input.trim() && status.online ? { scale: 1.05 } : undefined}
            whileTap={input.trim() && status.online ? { scale: 0.95 } : undefined}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="label-tag">⏎ send · ⇧⏎ newline</span>
        </div>
      </div>
    </div>
  );
}

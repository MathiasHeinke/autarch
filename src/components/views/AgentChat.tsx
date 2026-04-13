import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trash2, WifiOff, Loader2, Play, Square, ChevronUp, Plus, TriangleAlert, Mic, Download, ExternalLink, TerminalSquare } from 'lucide-react';
import { useHermesStore } from '../../stores/hermesStore';
import { ToolCallBlock } from './ToolCallBlock';
import { useTerminalStore } from '../../stores/terminalStore';
// import { streamChat } from '../../services/hermesClient';

export function AgentChat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    status,
    messages,
    isStreaming,
    streamBuffer,
    activeRunId,
    toolCalls,
    clearChat,
    startPolling,
    gatewayProcess,
    startGateway,
    stopGateway,
    submitRun,
    cancelRun,
  } = useHermesStore();

  const {
    hermesInstalled,
    installPhase,
    installHermes,
    installError,
  } = useTerminalStore();

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

    setInput('');
    // Start run via the store which handles SSE and activeRunId
    await submitRun(trimmed);
  }, [input, isStreaming, status.online, submitRun]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
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
        <div className="flex items-center gap-2">
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
              {status.online ? `online · ${status.model ?? ''}` : gatewayProcess === 'starting' ? 'starting...' : 'offline'}
            </span>
          </div>

          {status.online && (
            <motion.button
              onClick={stopGateway}
              className="flex items-center justify-center p-1 rounded-sm"
              style={{
                color: 'var(--color-error)',
                background: 'rgba(239,68,68,0.1)',
              }}
              whileHover={{ background: 'rgba(239,68,68,0.15)' }}
              title="Stop Agent"
            >
              <Square className="w-3 h-3 fill-current" />
            </motion.button>
          )}
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
          <div className="flex flex-col items-center justify-center h-full gap-3">
            {status.online ? (
              /* ── State 3: Hermes is online & ready ── */
              <div className="opacity-50 flex flex-col items-center gap-3">
                <Zap className="w-8 h-8" style={{ color: 'var(--color-accent-dim)' }} />
                <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)', maxWidth: 240 }}>
                  Hermes is ready. Ask anything about your codebase, run commands, or get help with architecture.
                </p>
              </div>
            ) : !hermesInstalled && installPhase !== 'done' ? (
              /* ── State 1: Hermes NOT installed ── */
              installPhase === 'installing' || installPhase === 'setup-wizard' ? (
                /* ── State 1b: Installation in progress ── */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 max-w-xs text-center"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-success)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                      {installPhase === 'setup-wizard' ? 'Setup Wizard Active' : 'Installing Hermes Engine...'}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      {installPhase === 'setup-wizard'
                        ? 'Complete the configuration wizard in the Terminal below. Choose your model provider and enter your API key.'
                        : 'Downloading and building the Hermes Agent kernel. This may take a few minutes.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <TerminalSquare size={12} style={{ color: 'var(--color-success)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                      ↓ See Terminal below
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* ── State 1a: Fresh install — CTA ── */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-5 max-w-sm text-center"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-ghost)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <span className="text-3xl">⚕</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                      Hermes Engine Required
                    </h2>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      The Hermes AI agent kernel powers your agentic workspace. Install it directly from NousResearch to enable chat, code generation, tool usage, and autonomous workflows.
                    </p>
                  </div>

                  {installError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}>
                      <TriangleAlert size={14} />
                      {installError}
                    </div>
                  )}

                  <button
                    onClick={installHermes}
                    className="px-5 py-2.5 rounded-lg flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                      color: 'var(--color-surface-void)',
                      boxShadow: '0 0 20px rgba(57, 184, 253, 0.2)',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      Install from NousResearch
                    </span>
                  </button>

                  <a
                    href="https://hermes-agent.nousresearch.com/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Learn more about Hermes Agent
                    <ExternalLink size={10} />
                  </a>
                </motion.div>
              )
            ) : (
              /* ── State 2: Installed but offline ── */
              <div className="opacity-50 flex flex-col items-center gap-3">
                <WifiOff className="w-8 h-8" style={{ color: 'var(--color-error)' }} />
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-text-tertiary)', maxWidth: 280 }}>
                  Hermes is not running.
                </p>
                <button
                  onClick={startGateway}
                  disabled={gatewayProcess === 'starting'}
                  className="px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-surface-void)',
                    opacity: gatewayProcess === 'starting' ? 0.7 : 1,
                    cursor: gatewayProcess === 'starting' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {gatewayProcess === 'starting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>Start Agent</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || `msg-${i}`}
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

        {/* Live Tool Calls for Active Run */}
        {activeRunId && toolCalls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start w-full"
          >
            <div className="w-full max-w-[85%]">
              {toolCalls.map(tc => (
                <ToolCallBlock key={tc.id} toolCall={tc} />
              ))}
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

      {/* Input Area - Antigravity Style */}
      <div className="flex-shrink-0 p-4 pb-6">
        <div 
          className="flex flex-col rounded-xl border shadow-2xl relative overflow-hidden transition-colors"
          style={{ 
            background: 'var(--color-surface-elevated)', 
            borderColor: 'var(--color-border-subtle)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Running Steps Accordion */}
          <div className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors hover:bg-white/5" style={{ background: 'var(--color-surface-component)', borderBottom: '1px solid var(--color-border-ghost)' }}>
            <span className="text-xs font-semibold text-slate-300">Running steps</span>
            <ChevronUp size={14} className="text-slate-400" />
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={status.online ? 'Ask anything, @ to mention, / for workflows' : 'Hermes is offline'}
            disabled={!status.online || isStreaming}
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 text-[14px] text-slate-200 outline-none placeholder:text-slate-600"
            style={{
              fontFamily: 'var(--font-body)',
              minHeight: 48,
              maxHeight: 200,
            }}
          />

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-transparent">
             <div className="flex items-center gap-4">
                <button className="text-slate-500 hover:text-slate-300 transition-colors"><Plus size={16} /></button>
                <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                   <ChevronUp size={14} />
                   <span className="text-[13px] font-medium">Planning</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                   <ChevronUp size={14} />
                   <span className="text-[13px] font-medium">{status.model ?? 'Gemini 3.1 Pro (High)'}</span>
                </div>
                {!status.online && (
                  <div className="flex items-center gap-1.5 text-amber-500 cursor-pointer pl-1">
                     <TriangleAlert size={14} />
                     <span className="text-[13px] font-semibold">MCP Error</span>
                  </div>
                )}
             </div>
             
             <div className="flex items-center gap-3">
               <button className="text-slate-500 hover:text-slate-300 transition-colors"><Mic size={16} /></button>
               {isStreaming ? (
                  <button 
                    onClick={() => { if (activeRunId) cancelRun(); else stopGateway(); }}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                   <div className="w-2.5 h-2.5 rounded-[2px] bg-red-400" />
                 </button>
               ) : (
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || !status.online}
                   className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
                 >
                   {input.trim() ? (
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                   ) : (
                     <div className="w-2.5 h-2.5 rounded-[2px] bg-red-400" />
                   )}
                 </button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

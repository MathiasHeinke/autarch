import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command as CommandIcon, FileText, Zap, Settings, Navigation, Bot } from 'lucide-react';
import { searchCommands, type CommandEntry, type CommandCategory } from '../../services/commandRegistry';

// ─── Category Icons & Labels ────────────────────────────────

const CATEGORY_META: Record<CommandCategory, { icon: typeof Zap; label: string }> = {
  action: { icon: Zap, label: 'Actions' },
  file: { icon: FileText, label: 'Files' },
  navigation: { icon: Navigation, label: 'Navigation' },
  setting: { icon: Settings, label: 'Settings' },
  agent: { icon: Bot, label: 'Agents' },
};

// ─── Component ──────────────────────────────────────────────

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'commands' | 'files'>('commands');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Keyboard shortcut listener ────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Skip if target is terminal or input (but allow our own input)
      const target = e.target as HTMLElement;
      const isTerminalInput = target.classList?.contains('xterm-helper-textarea');
      const isNativeInput = (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target !== inputRef.current;

      if (isTerminalInput || isNativeInput) return;

      // Cmd+Shift+P → Command Palette
      if (isMeta && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        setMode('commands');
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
        return;
      }

      // Cmd+P → Quick File Open
      if (isMeta && !e.shiftKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        setMode('files');
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
        return;
      }

      // Escape → close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handler, true); // capture phase
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // ── Search Results ────────────────────────────────────────

  const results = useMemo(() => {
    if (!isOpen) return [];
    return searchCommands(query, mode);
  }, [query, mode, isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // ── Keyboard Navigation ───────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const cmd = results[selectedIndex];
      if (cmd) {
        setIsOpen(false);
        cmd.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  }, [results, selectedIndex]);

  // ── Execute Command ───────────────────────────────────────

  const executeCommand = useCallback((cmd: CommandEntry) => {
    setIsOpen(false);
    cmd.action();
  }, []);

  // ── Click outside to close ────────────────────────────────

  const backdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-palette-item]');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // ── Group results by category ─────────────────────────────

  const grouped = useMemo(() => {
    const groups = new Map<CommandCategory, CommandEntry[]>();
    for (const cmd of results) {
      if (!groups.has(cmd.category)) {
        groups.set(cmd.category, []);
      }
      groups.get(cmd.category)!.push(cmd);
    }
    return groups;
  }, [results]);

  // Flat index mapping for keyboard navigation
  const flatResults = results;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={backdropClick}
        >
          <motion.div
            className="w-full max-w-[640px] overflow-hidden rounded-xl shadow-2xl"
            style={{
              background: 'rgba(14, 14, 17, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <CommandIcon size={16} className="text-emerald-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'files' ? 'Search files by name...' : 'Type a command or search...'}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-mono"
                autoComplete="off"
                spellCheck={false}
              />
              <span className="text-[10px] text-slate-600 font-mono flex-shrink-0 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                {mode === 'files' ? '⌘P' : '⇧⌘P'}
              </span>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
              {results.length === 0 && query.trim() && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No matching commands found.
                </div>
              )}

              {results.length === 0 && !query.trim() && (
                <div className="py-8 text-center text-sm text-slate-500">
                  {mode === 'files' ? 'Type to search workspace files...' : 'Type to search commands...'}
                </div>
              )}

              {/* Render grouped by category */}
              {Array.from(grouped.entries()).map(([category, commands]) => {
                const meta = CATEGORY_META[category];
                return (
                  <div key={category}>
                    {/* Category header */}
                    <div className="px-4 pt-2 pb-1 flex items-center gap-2">
                      <meta.icon size={11} className="text-slate-600" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{meta.label}</span>
                    </div>

                    {/* Items */}
                    {commands.map((cmd) => {
                      const flatIdx = flatResults.indexOf(cmd);
                      const isSelected = flatIdx === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          data-palette-item
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(flatIdx)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                          style={{
                            background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                            color: isSelected ? '#e2e8f0' : '#94a3b8',
                          }}
                        >
                          <cmd.icon
                            size={15}
                            className="flex-shrink-0"
                            style={{ color: isSelected ? '#10b981' : '#475569' }}
                          />
                          <span className="flex-1 text-sm truncate font-medium">{cmd.label}</span>
                          {cmd.shortcut && (
                            <span className="text-[10px] font-mono text-slate-600 flex-shrink-0 px-1.5 py-0.5 rounded bg-white/5">
                              {cmd.shortcut}
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] text-slate-600 flex-shrink-0">↵</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">esc</kbd> close
              </span>
              <div className="flex-1" />
              <span className="tabular-nums">{results.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

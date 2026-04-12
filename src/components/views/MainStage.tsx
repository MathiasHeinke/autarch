import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  FolderOpen,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';

// ─── Typewriter Hook ──────────────────────────────────────────────
function useTypewriter(lines: string[], speed = 30, lineDelay = 200) {
  const [displayed, setDisplayed] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        const line = lines[i];
        // Type each character
        for (let c = 0; c <= line.length; c++) {
          if (cancelled) return;
          setDisplayed((prev) => {
            const next = [...prev];
            next[i] = line.slice(0, c);
            return next;
          });
          await new Promise((r) => setTimeout(r, speed));
        }
        // Pause between lines
        await new Promise((r) => setTimeout(r, lineDelay));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return displayed;
}

// ─── Code Lines Config ──────────────────────────────────────────
const CODE_LINES = [
  { num: 1, code: 'import { Shell } from "./components/layout/SentinelOverlay";', color: 'var(--color-text-secondary)' },
  { num: 2, code: 'import { useLayoutStore } from "./stores/layoutStore";', color: 'var(--color-text-secondary)' },
  { num: 3, code: '', color: '' },
  { num: 4, code: '// AUTARCH v0.1.0 — The Tactical Orchestrator', color: 'var(--color-text-tertiary)' },
  { num: 5, code: '// Hermes Agent Subprocess: ONLINE', color: 'var(--color-success)' },
  { num: 6, code: '// ACP Protocol: CONNECTED', color: 'var(--color-success)' },
  { num: 7, code: '', color: '' },
  { num: 8, code: 'export default function App() {', color: 'var(--color-text-primary)' },
  { num: 9, code: '  const { activeTab } = useLayoutStore();', color: 'var(--color-text-secondary)' },
  { num: 10, code: '', color: '' },
  { num: 11, code: '  return (', color: 'var(--color-text-secondary)' },
  { num: 12, code: '    <Shell>', color: 'var(--color-accent)' },
  { num: 13, code: '      {/* Module views render here */}', color: 'var(--color-text-tertiary)' },
  { num: 14, code: '    </Shell>', color: 'var(--color-accent)' },
  { num: 15, code: '  );', color: 'var(--color-text-secondary)' },
  { num: 16, code: '}', color: 'var(--color-text-primary)' },
];

const TERMINAL_LINES = [
  '❯ hermes status',
  '✓ Hermes Agent v0.9.2 — subprocess active (pid: 48291)',
  '✓ ACP/stdio transport connected',
  '✓ 3 MCP servers registered (supabase, github, gitnexus)',
];

const TERMINAL_COLORS = [
  'var(--color-accent-dim)',
  'var(--color-success)',
  'var(--color-success)',
  'var(--color-success)',
];

// ─── IDE View ────────────────────────────────────────────────────
export function IdeView() {
  const { toggleAuxPanel, auxPanelOpen, toggleContextPanel, contextPanelOpen } = useLayoutStore();
  const terminalOutput = useTypewriter(TERMINAL_LINES, 18, 300);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor Toolbar */}
      <div 
        className="h-9 flex items-center px-3 gap-2 flex-shrink-0 select-none"
        style={{ 
          background: 'var(--color-surface-elevated)',
          borderBottom: '1px solid var(--color-border-ghost)',
        }}
      >
        <button 
          onClick={toggleContextPanel}
          className="p-1.5 rounded transition-colors duration-100"
          style={{ color: contextPanelOpen ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)' }}
          title="Toggle sidebar"
        >
          {contextPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
        </button>

        {/* File Tab Bar */}
        <div className="flex items-center gap-0.5 flex-1">
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs"
            style={{ 
              background: 'var(--color-surface-interactive)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              borderBottom: '2px solid var(--color-accent)',
              boxShadow: '0 2px 6px rgba(245,158,11,0.08)',
            }}
          >
            <Terminal className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
            main.tsx
          </div>
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs cursor-pointer transition-colors duration-100"
            style={{ 
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}
          >
            App.tsx
          </div>
        </div>

        <button 
          onClick={() => toggleAuxPanel('files')}
          className="p-1.5 rounded transition-colors duration-100"
          style={{ color: auxPanelOpen ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)' }}
          title="Toggle file panel"
        >
          {auxPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Editor Area — surface-component for tonal depth */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={{ background: 'var(--color-surface-component)' }}
      >
        {/* Code with generous breathing room */}
        <div 
          className="absolute inset-0 overflow-auto"
          style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '12.5px', 
            lineHeight: '1.9',
            padding: '24px 24px 24px 0',
          }}
        >
          {CODE_LINES.map((line) => (
            <div key={line.num} className="flex hover:bg-[rgba(255,255,255,0.015)] transition-colors duration-75">
              <span 
                className="w-14 flex-shrink-0 text-right pr-6 select-none"
                style={{ color: 'var(--color-text-tertiary)', opacity: 0.4 }}
              >
                {line.num}
              </span>
              <span style={{ color: line.color || 'var(--color-text-primary)' }}>{line.code}</span>
            </div>
          ))}
        </div>

        {/* Cursor blink */}
        <motion.div
          className="absolute"
          style={{ 
            left: 'calc(3.5rem + 28ch)', 
            top: 'calc(24px + 11 * 1.9 * 12.5px)',
            width: 2, 
            height: 18, 
            background: 'var(--color-accent)',
            boxShadow: '0 0 10px var(--color-accent-glow)',
            borderRadius: 1,
          }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      {/* Terminal — surface-void for maximum tonal separation */}
      <motion.div
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ 
          height: 130,
          background: 'var(--color-surface-void)', 
          borderTop: '1px solid var(--color-border-ghost)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', damping: 30 }}
      >
        <div 
          className="flex items-center h-7 px-4 gap-3 flex-shrink-0 select-none"
          style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3" style={{ color: 'var(--color-accent-dim)' }} />
            <span className="label-tag" style={{ color: 'var(--color-accent-dim)' }}>terminal</span>
          </div>
          <div 
            className="w-px h-3"
            style={{ background: 'var(--color-border-ghost)' }}
          />
          <span className="label-tag">hermes agent</span>
        </div>
        <div 
          className="flex-1 px-4 py-3 overflow-auto"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.8' }}
        >
          {terminalOutput.map((line, i) => (
            <div key={i} style={{ color: TERMINAL_COLORS[i] ?? 'var(--color-text-tertiary)' }}>
              {line}
            </div>
          ))}
          {terminalOutput.length >= TERMINAL_LINES.length && (
            <div style={{ color: 'var(--color-text-tertiary)' }}>
              <span style={{ color: 'var(--color-accent-dim)' }}>❯</span>{' '}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                _
              </motion.span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Module Placeholder ──────────────────────────────────────────
export function ModuleView({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-center gap-5 p-12"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
    >
      <div 
        className="w-16 h-16 rounded-xl flex items-center justify-center"
        style={{ 
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-ghost)',
        }}
      >
        <FolderOpen className="w-7 h-7" style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
      <div className="text-center">
        <h2 
          className="text-xl font-medium tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {title}
        </h2>
        <p className="text-xs mt-2 max-w-sm" style={{ color: 'var(--color-text-tertiary)', lineHeight: '1.6' }}>
          {subtitle}
        </p>
      </div>
      <div 
        className="mt-2 px-4 py-1.5 rounded-md label-tag"
        style={{ 
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-ghost)',
          color: 'var(--color-accent-dim)',
        }}
      >
        module offline — coming soon
      </div>
    </motion.div>
  );
}

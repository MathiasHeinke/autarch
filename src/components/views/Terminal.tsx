import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalSquare } from 'lucide-react';
import { useTerminalStore } from '../../stores/terminalStore';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  // We don't need the local destructuring of these properties anymore, 
  // since handlePtyOutput is called inside terminalStore itself now, 
  // and shellReady is checked internally.

  useEffect(() => {
    if (!terminalRef.current) return;

    // C-01 FIX: Prevent orphaned PTY processes on early unmount
    let cancelled = false;

    const term = new XTerm({
      theme: {
        background: '#09090B',
        foreground: '#E2E8F0',
        cursor: '#10B981',
        selectionBackground: 'rgba(16, 185, 129, 0.3)',
      },
      fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: 12,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    async function initTerminal() {
      if (cancelled) return;
      
      const {
        initGlobalPty,
        subscribeToPty,
        getPtyBuffer,
        resizeGlobalPty,
      } = await import('../../stores/terminalStore');

      // Setup global PTY if not started
      await initGlobalPty();
      if (cancelled) return;

      // Replay existing output buffer
      for (const chunk of getPtyBuffer()) {
        term.write(chunk);
      }

      // Re-fit after replay
      requestAnimationFrame(() => fitAddon.fit());

      // Subscribe to live output
      const unsubscribe = subscribeToPty((data) => {
        term.write(data);
      });

      // Forward keyboard input to global PTY
      term.onData((data) => {
        const store = useTerminalStore.getState();
        if (store.shellReady && store.ptyWriteFn) {
          store.ptyWriteFn(data);
        } else if (!store.shellReady) {
          // Allow restart on keypress if shell exited
          term.writeln('\x1b[1;36m↻ Restarting shell...\x1b[0m\r\n');
          initGlobalPty();
        }
      });

      // Synchronize resizes
      term.onResize(({ cols, rows }) => {
        resizeGlobalPty(cols, rows);
      });

      cleanupSub = unsubscribe;
    }

    let cleanupSub: (() => void) | null = null;
    initTerminal();

    // ── Resize Handling ─────────────────────────────────────
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddon.fit();
      });
    });

    resizeObserver.observe(terminalRef.current);

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (cleanupSub) cleanupSub();
      term.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-[#09090B] w-full">
      <div className="h-8 border-b border-white/5 flex items-center px-4 bg-[#0E0E11] text-slate-400 text-xs font-medium uppercase tracking-wider shrink-0 gap-2">
        <TerminalSquare size={14} className="text-emerald-500" />
        Terminal
      </div>
      <div className="flex-1 overflow-hidden relative p-2" ref={terminalRef} />
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalSquare } from 'lucide-react';
import { useTerminalStore } from '../../stores/terminalStore';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  const { setShellReady, setPtyWriteFn, handlePtyOutput } = useTerminalStore();

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

    // ── PTY Spawn ──────────────────────────────────────────
    let ptyProcess: Awaited<ReturnType<typeof import('tauri-pty')['spawn']>> | null = null;

    async function initPty() {
      try {
        const { spawn } = await import('tauri-pty');
        if (cancelled) return; // Guard: component already unmounted

        // W-02 FIX: Use Tauri OS detection instead of unreliable navigator.userAgent
        let shell = 'bash';
        try {
          const { platform } = await import('@tauri-apps/plugin-os');
          if (cancelled) return;
          shell = platform() === 'macos' ? 'zsh' : 'bash';
        } catch {
          // Fallback: if Tauri OS plugin unavailable, default to bash
          shell = 'bash';
        }

        ptyProcess = spawn(shell, [], {
          cols: term.cols,
          rows: term.rows,
        });

        // PTY → xterm (shell output → screen)
        // 🧩 Also feeds the reactive output parser for install phase detection
        ptyProcess.onData((data: Uint8Array) => {
          term.write(data);
          // Feed the reactive output parser (debounced by nature of PTY chunks)
          const text = new TextDecoder().decode(data);
          handlePtyOutput(text);
        });

        // xterm → PTY (keyboard input → shell)
        term.onData((data: string) => {
          ptyProcess?.write(data);
        });

        // Resize sync: xterm → PTY
        term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
          ptyProcess?.resize(cols, rows);
        });

        // W-01 FIX: Handle shell exit (user types 'exit' or shell crashes)
        ptyProcess.onExit(({ exitCode }: { exitCode: number }) => {
          term.writeln(`\r\n\x1b[1;33m⚠ Shell exited (code ${exitCode}).\x1b[0m`);
          term.writeln('  Press any key to restart the shell.');
          setShellReady(false);
          setPtyWriteFn(null);

          // Allow restart on any keypress
          const restartDisposable = term.onKey(() => {
            restartDisposable.dispose();
            term.writeln('\x1b[1;36m↻ Restarting shell...\x1b[0m\r\n');
            initPty();
          });
        });

        // Register write function in the terminal store for command injection
        setPtyWriteFn((data: string) => {
          ptyProcess?.write(data);
        });

        if (cancelled) {
          // Component unmounted during setup — kill the process we just spawned
          try { ptyProcess.kill(); } catch { /* noop */ }
          ptyProcess = null;
          return;
        }

        setShellReady(true);

        // Re-fit after PTY is initialized (content may shift)
        requestAnimationFrame(() => fitAddon.fit());
      } catch (err) {
        if (cancelled) return;
        // Graceful fallback: PTY not available (e.g. browser-only dev mode)
        console.warn('[Terminal] PTY spawn failed, running in read-only mode:', err);
        term.writeln('\x1b[1;33m⚠ PTY not available.\x1b[0m Running in display-only mode.');
        term.writeln('  This terminal requires the Tauri desktop runtime.');
        term.writeln('  Start with: npm run tauri dev');
        setShellReady(false);
      }
    }

    initPty();

    // ── Resize Handling ─────────────────────────────────────
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    // Observer handles dynamic resizing within react-resizable-panels
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddon.fit();
      });
    });

    resizeObserver.observe(terminalRef.current);

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelled = true; // Signal async initPty to abort
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      setPtyWriteFn(null);
      setShellReady(false);

      if (ptyProcess) {
        try { ptyProcess.kill(); } catch { /* already dead */ }
      }
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

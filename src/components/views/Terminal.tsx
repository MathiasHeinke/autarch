import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalSquare, AlertCircle, FileOutput, Plus, Trash2, SplitSquareHorizontal, MoreHorizontal, Maximize2 } from 'lucide-react';
import { useTerminalStore } from '../../stores/terminalStore';
import clsx from 'clsx';

type BottomTab = 'problems' | 'output' | 'terminal';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<BottomTab>('terminal');
  const [termState, setTermState] = useState<'running' | 'exited'>('running');

  useEffect(() => {
    // Only init xterm if we are actually rendering the terminal tab
    if (activeTab !== 'terminal' || !terminalRef.current) return;

    let cancelled = false;

    const term = new XTerm({
      theme: {
        background: '#09090B',
        foreground: '#E2E8F0',
        cursor: '#10B981',
        selectionBackground: 'rgba(16, 185, 129, 0.3)',
      },
      fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: 13,
      cursorBlink: true,
      scrollback: 5000,
      convertEol: true, // helps with \n vs \r\n formatting
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

      await initGlobalPty();
      if (cancelled) return;
      setTermState('running');

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
           // Normal writing
           store.ptyWriteFn(data);
        } else if (!store.shellReady) {
           // Restart mechanism
           setTermState('running');
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

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddon.fit();
      });
    });

    if (terminalRef.current) {
       resizeObserver.observe(terminalRef.current);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (cleanupSub) cleanupSub();
      term.dispose();
    };
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-[#09090B] w-full text-sm">
      {/* Tab Header (VS Code Style) */}
      <div className="h-9 border-b border-white/10 flex items-center justify-between px-2 bg-[#0E0E11] text-slate-400 shrink-0">
        
        {/* Left Side: Tabs */}
        <div className="flex items-center h-full gap-1">
          <button 
            onClick={() => setActiveTab('problems')}
            className={clsx(
              "px-3 h-full flex items-center gap-2 uppercase text-[11px] font-medium tracking-widest border-b-2 transition-colors",
              activeTab === 'problems' ? "border-emerald-500 text-emerald-400" : "border-transparent hover:text-slate-200"
            )}
          >
            <AlertCircle size={14} />
            Problems
          </button>
          
          <button 
            onClick={() => setActiveTab('output')}
            className={clsx(
              "px-3 h-full flex items-center gap-2 uppercase text-[11px] font-medium tracking-widest border-b-2 transition-colors",
              activeTab === 'output' ? "border-emerald-500 text-emerald-400" : "border-transparent hover:text-slate-200"
            )}
          >
            <FileOutput size={14} />
            Output
          </button>
          
          <button 
            onClick={() => setActiveTab('terminal')}
            className={clsx(
              "px-3 h-full flex items-center gap-2 uppercase text-[11px] font-medium tracking-widest border-b-2 transition-colors",
              activeTab === 'terminal' ? "border-emerald-500 text-emerald-400" : "border-transparent hover:text-slate-200"
            )}
          >
            <TerminalSquare size={14} />
            Terminal
          </button>
        </div>

        {/* Right Side: Terminal Toolbar */}
        {activeTab === 'terminal' && (
          <div className="flex items-center gap-1.5 px-2">
            <div className="flex items-center gap-2 px-2 text-xs text-slate-500 border-r border-white/10 pr-3 mr-1">
              <span className="flex items-center gap-1">
                <span className="text-emerald-500">{'>_'}</span> zsh {termState === 'exited' && '⚠️'}
              </span>
            </div>
            <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="New Terminal">
              <Plus size={14} />
            </button>
            <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="Split Terminal">
              <SplitSquareHorizontal size={14} />
            </button>
            <button 
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors" 
              title="Kill Terminal"
              onClick={() => setTermState('exited')}
            >
              <Trash2 size={14} />
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-1" />
            <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="More Actions">
              <MoreHorizontal size={14} />
            </button>
            <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="Maximize Panel">
              <Maximize2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'terminal' && (
          <div className="absolute inset-0 p-2" ref={terminalRef} />
        )}
        
        {activeTab === 'problems' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <AlertCircle size={32} className="mb-2 opacity-50" />
            <p>No problems have been detected in the workspace.</p>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <FileOutput size={32} className="mb-2 opacity-50" />
             <p>Select a task or extension to view output logs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

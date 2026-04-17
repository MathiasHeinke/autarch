import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalSquare, AlertCircle, FileOutput, Plus, Trash2, SplitSquareHorizontal, MoreHorizontal, Maximize2, X } from 'lucide-react';
import { useTerminalStore, clearTerminalOutput, killAndRestartPty } from '../../stores/terminalStore';
import clsx from 'clsx';

type BottomTab = 'problems' | 'output' | 'terminal';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<BottomTab>('terminal');
  const [termState, setTermState] = useState<'running' | 'exited'>('running');

  const tabs = useTerminalStore(state => state.tabs);
  const activeTabId = useTerminalStore(state => state.activeTabId);
  const createTab = useTerminalStore(state => state.createTab);
  const setActiveTabId = useTerminalStore(state => state.setActiveTabId);
  const closeTab = useTerminalStore(state => state.closeTab);

  // Initialize at least one tab on mount if it's empty
  useEffect(() => {
    if (tabs.length === 0) {
      createTab();
    }
  }, [tabs.length, createTab]);

  useEffect(() => {
    // Only init xterm if we are actually rendering the terminal tab and have an active session
    if (activeTab !== 'terminal' || !terminalRef.current || !activeTabId) return;

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
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    let cleanupSub: (() => void) | null = null;

    async function initTerminal() {
      if (cancelled) return;
      
      const {
        initPty,
        subscribeToPty,
        getPtyBuffer,
        resizePty,
      } = await import('../../stores/terminalStore');

      await initPty(activeTabId!);
      if (cancelled) return;
      setTermState('running');

      // Replay existing output buffer
      for (const chunk of getPtyBuffer(activeTabId!)) {
        term.write(chunk);
      }

      // Re-fit after replay
      requestAnimationFrame(() => fitAddon.fit());

      // Subscribe to live output
      const unsubscribe = subscribeToPty(activeTabId!, (data) => {
        term.write(data);
      });

      // Forward keyboard input to the active PTY
      term.onData((data) => {
        const store = useTerminalStore.getState();
        if (store.shellReady && store.ptyWriteFn) {
           store.ptyWriteFn(data);
        } else if (!store.shellReady) {
           setTermState('running');
           term.writeln('\x1b[1;36m↻ Restarting shell...\x1b[0m\r\n');
           initPty(activeTabId!);
        }
      });

      // Synchronize resizes
      term.onResize(({ cols, rows }) => {
        resizePty(activeTabId!, cols, rows);
      });

      cleanupSub = unsubscribe;
    }

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
  }, [activeTab, activeTabId]);

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
            <button onClick={() => { createTab(); }} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="New Terminal">
              <Plus size={14} />
            </button>
            <button onClick={() => window.alert('Terminal splitting coming soon!')} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="Split Terminal">
              <SplitSquareHorizontal size={14} />
            </button>
            <button 
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors" 
              title="Clear Terminal"
              onClick={() => {
                if (activeTabId) clearTerminalOutput(activeTabId);
              }}
            >
              <Trash2 size={14} />
            </button>
            <button 
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors" 
              title="Kill Terminal"
              onClick={() => {
                if (!activeTabId) return;
                setTermState('exited');
                killAndRestartPty(activeTabId);
              }}
            >
              <Trash2 size={14} className="hidden" /> {/* keeping the original class list struct for spacing parity */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-1" />
            <button onClick={() => window.alert('More Actions coming soon')} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="More Actions">
              <MoreHorizontal size={14} />
            </button>
            <button onClick={() => window.alert('Panel sizing coming soon')} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors" title="Maximize Panel">
              <Maximize2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'terminal' && (
          <div className="absolute inset-0 flex">
            {/* Terminal Window */}
            <div className="flex-1 p-2" ref={terminalRef} />
            
            {/* Terminal Tabs Sidebar */}
            <div className="w-[160px] border-l border-white/10 bg-[#0e0e11] flex flex-col py-2 px-1 gap-1 shrink-0 overflow-y-auto">
              {tabs.map((tab, idx) => (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={clsx(
                    "group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors",
                    activeTabId === tab.id ? "bg-white/10 text-emerald-400 font-medium" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <TerminalSquare size={13} className={activeTabId === tab.id ? "text-emerald-500" : "text-slate-500"} />
                    {tab.title} {idx + 1}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity p-0.5 rounded hover:bg-white/10"
                    title="Close session"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
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

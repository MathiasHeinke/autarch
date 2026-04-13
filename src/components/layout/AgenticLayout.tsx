import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useExecutionPlanStore } from '../../stores/executionPlanStore';
import { AgentChat } from '../views/AgentChat';
import { SessionListPanel } from '../views/SessionListPanel';
import { FileExplorer } from '../views/FileExplorer';
import { Terminal } from '../views/Terminal';
import { PhaseTracker } from '../views/PhaseTracker';

export function AgenticLayout() {
  const { setMode, agenticPanelSizes, setAgenticPanelSizes } = useLayoutStore();
  const { activePlan } = useExecutionPlanStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      {/* Reusing TopNav but modifying its context / could also just inject a "Back to IDE" button here */}
      <header className="h-11 flex-shrink-0 flex items-center px-3 justify-between" style={{ background: 'var(--color-surface-section)', borderBottom: '1px solid var(--color-border-ghost)' }}>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setMode('standard')}
             className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/10"
             style={{ color: 'var(--color-text-secondary)' }}
           >
             ← Core IDE Mode
           </button>
           <div className="h-4 w-px bg-white/10" />
           <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-emerald-400">AGENTIC NETWORK</span>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <PanelGroup 
          orientation="horizontal"
          onLayoutChanged={setAgenticPanelSizes}
        >
          {/* Left Panel: Chat Sessions */}
          <Panel 
            id="sessions"
            defaultSize={agenticPanelSizes['fleet'] ?? 20} 
            minSize={15} 
            maxSize={30}
          >
            <SessionListPanel />
          </Panel>

          <PanelResizeHandle className="w-1 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-col-resize active:bg-emerald-500" />

          {/* Center Panel: Primary Conversation & Phase Tracker */}
          <Panel 
            id="center-area"
            defaultSize={agenticPanelSizes['chat'] ?? 60} 
            minSize={40}
          >
            <PanelGroup orientation="vertical">
              <Panel id="chat" defaultSize={70} minSize={30}>
                {activePlan ? (
                  <PanelGroup orientation="horizontal">
                    <Panel id="chat-inner" defaultSize={40} minSize={30}>
                      <AgentChat />
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-col-resize active:bg-emerald-500" />
                    <Panel id="phase-tracker" defaultSize={60} minSize={30}>
                      <PhaseTracker />
                    </Panel>
                  </PanelGroup>
                ) : (
                  <AgentChat />
                )}
              </Panel>
              
              <PanelResizeHandle className="h-1 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-row-resize active:bg-emerald-500" />
              
              <Panel id="terminal" defaultSize={30} minSize={10} className="bg-[#0e0e11] border-t border-white/5">
                <Terminal />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-1 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-col-resize active:bg-emerald-500" />

          {/* Right Panel: Workspace File Tree */}
          <Panel 
            id="explorer"
            defaultSize={agenticPanelSizes['feed'] ?? 20} 
            minSize={15}
            maxSize={30}
          >
            <FileExplorer />
          </Panel>
        </PanelGroup>
      </div>

      <motion.footer
        className="h-6 flex-shrink-0 flex items-center px-3 gap-4 select-none"
        style={{
          background: 'var(--color-surface-section)',
          borderTop: '1px solid var(--color-border-ghost)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="label-tag text-emerald-400/80">swarm v2.0 (active)</span>
        <span className="label-tag">3 nodes running</span>
        <div className="flex-1" />
        <span className="label-tag">react-resizable-panels</span>
      </motion.footer>
    </div>
  );
}

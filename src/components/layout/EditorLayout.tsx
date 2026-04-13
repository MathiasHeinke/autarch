import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { TopNav } from './TopNav';
import { ContextPanel } from './ContextPanel';
import { AuxPanel } from './AuxPanel';
import { useLayoutStore } from '../../stores/layoutStore';
import { FileExplorer } from '../views/FileExplorer';
import { MonacoEditor } from '../views/MonacoEditor';
import { Terminal } from '../views/Terminal';

export function EditorLayout() {
  const { auxPanelOpen, activeTab } = useLayoutStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0A0A0C] text-slate-200">
      <TopNav />
      
      <div className="flex-1 overflow-hidden relative flex">
        {/* IDE Layout */}
        <PanelGroup orientation="horizontal">
          {/* File Explorer */}
          <Panel id="explorer" defaultSize={15} minSize={10} maxSize={30}>
            <FileExplorer />
          </Panel>

          <PanelResizeHandle className="w-1 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-col-resize active:bg-emerald-500" />

          {/* Editor + Terminal */}
          <Panel id="main-editor-area" defaultSize={85} minSize={50}>
            <PanelGroup orientation="vertical">
              {/* Monaco Editor */}
              <Panel id="editor" defaultSize={70} minSize={30}>
                <MonacoEditor />
              </Panel>

              <PanelResizeHandle className="h-1 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-row-resize active:bg-emerald-500" />

              {/* Terminal */}
              <Panel id="terminal" defaultSize={30} minSize={10}>
                <Terminal />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <ContextPanel activeTab={activeTab} />
      
      {auxPanelOpen && (
        <AuxPanel />
      )}
    </div>
  );
}

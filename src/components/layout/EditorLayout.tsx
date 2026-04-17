import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { FileExplorer } from '../views/FileExplorer';
import { GlobalSearch } from '../views/GlobalSearch';
import { MonacoEditor } from '../views/MonacoEditor';
import { Terminal } from '../views/Terminal';
import { useLayoutStore } from '../../stores/layoutStore';

/**
 * EditorLayout — The REAL IDE view.
 *
 * Layout:
 *   Shell ContextPanel (LEFT)  — Navigation (Explorer, Search, Git, Chat)
 *   EditorLayout (CENTER+RIGHT):
 *     ├── Monaco Editor + Terminal (CENTER) — real code editing via Tauri FS
 *     └── SidePanel (RIGHT)                — FileExplorer OR GlobalSearch
 */
export function EditorLayout() {
  const activeContextView = useLayoutStore((s) => s.activeContextView);

  // Determine which right-side panel to render
  const renderSidePanel = () => {
    switch (activeContextView) {
      case 'search':
        return <GlobalSearch />;
      case 'explorer':
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
      <PanelGroup id="editor-layout-v4" orientation="horizontal">
        {/* Editor + Terminal (CENTER) */}
        <Panel id="editor-column-v4" defaultSize={75} minSize={40}>
          <PanelGroup id="editor-terminal-v4" orientation="vertical">
            <Panel id="code-v4" defaultSize={70} minSize={20}>
              <MonacoEditor />
            </Panel>

            <PanelResizeHandle
              style={{ height: 6, background: 'rgba(255,255,255,0.04)', cursor: 'row-resize' }}
            />

            <Panel id="term-v4" defaultSize={30} minSize={10}>
              <Terminal />
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle
          style={{ width: 6, background: 'rgba(255,255,255,0.04)', cursor: 'col-resize' }}
        />

        {/* Side Panel (RIGHT) — contextual based on left nav selection */}
        <Panel id="files-v4" defaultSize={25} minSize={15}>
          {renderSidePanel()}
        </Panel>
      </PanelGroup>
    </div>
  );
}

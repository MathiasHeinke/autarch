import Editor, { Monaco } from '@monaco-editor/react';
import type { editor, IRange } from 'monaco-editor';
import { useEditorStore } from '../../stores/editorStore';
import { X, Eye, Code } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef } from 'react';
import { AgentInlineEditOverlay } from './AgentInlineEditOverlay';

export function MonacoEditor() {
  const { activeFilePath, openFiles, fileContents, hasUnsavedChanges, setActiveFile, closeFile, updateFileContent } = useEditorStore();
  const [markdownViewMode, setMarkdownViewMode] = useState<'source' | 'preview'>('source');
  
  // Overlay State
  const [editorInst, setEditorInst] = useState<editor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [overlayState, setOverlayState] = useState<{
    position: { top: number; left: number };
    selectedText: string;
    range: IRange;
  } | null>(null);

  if (!activeFilePath || openFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#0A0A0C] h-full w-full">
        <div className="text-center">
          <div className="text-4xl mb-4 font-light text-slate-700">Autarch IDE</div>
          <p className="text-sm">Select a file from the explorer to view its contents.</p>
        </div>
      </div>
    );
  }

  const ext = activeFilePath.split('.').pop() || '';
  const language = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'md': 'markdown',
  }[ext] || 'plaintext';

  const handleEditorMount = (ed: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    setEditorInst(ed);

    // Register Cmd+S
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      const state = useEditorStore.getState();
      if (state.activeFilePath) {
        await state.saveFile(state.activeFilePath);
      }
    });

    // Register Cmd+K 
    ed.addAction({
      id: 'autarch-inline-edit',
      label: 'Autarch: Inline Edit (Cmd+K)',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (ed: editor.IStandaloneCodeEditor) => {
        const selection = ed.getSelection();
        const model = ed.getModel();
        if (!model || !selection) return;
        const text = model.getValueInRange(selection) || '';
        
        const pos = ed.getScrolledVisiblePosition({ 
          lineNumber: selection.endLineNumber, 
          column: selection.endColumn 
        });
        
        if (pos) {
          setOverlayState({
            position: { top: pos.top + 20, left: pos.left },
            selectedText: text,
            range: selection,
          });
        }
      }
    });

    // Hide if user clicks elsewhere in the editor
    ed.onMouseDown(() => {
      setOverlayState(null);
    });
  };

  const applyEdit = (newText: string) => {
    if (editorInst && overlayState) {
      editorInst.executeEdits('autarch-agent', [{
        range: overlayState.range,
        text: newText,
        forceMoveMarkers: true,
      }]);
      setOverlayState(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1E1E1E]">
      {/* Editor Tabs */}
      <div className="flex items-center overflow-x-auto bg-[#0E0E11] border-b border-white/5 no-scrollbar shrink-0">
        {openFiles.map(path => {
          const isActive = path === activeFilePath;
          const fileName = path.split('/').pop() || path;
          return (
            <div 
              key={path}
              className={clsx(
                "group flex items-center gap-2 px-4 py-2 border-r border-white/5 min-w-[120px] max-w-[200px] cursor-pointer text-sm select-none",
                isActive ? "bg-[#1E1E1E] text-emerald-400 border-t-2 border-t-emerald-500" : "bg-transparent text-slate-400 hover:bg-white/5 border-t-2 border-t-transparent"
              )}
              onClick={() => setActiveFile(path)}
            >
              <span className="flex-1 truncate">{fileName}{hasUnsavedChanges[path] ? " *" : ""}</span>
              <button 
                className={clsx(
                  "p-0.5 rounded-sm hover:bg-white/10",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(path);
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
        
        <div className="flex-1" />
        
        {language === 'markdown' && (
          <div className="flex items-center gap-1 px-3">
            <button
              onClick={() => setMarkdownViewMode('source')}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                markdownViewMode === 'source' ? "bg-white/10 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
              title="View Source"
            >
              <Code size={14} />
            </button>
            <button
              onClick={() => setMarkdownViewMode('preview')}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                markdownViewMode === 'preview' ? "bg-white/10 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
              title="Preview Render"
            >
              <Eye size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div ref={editorContainerRef} className="flex-1 overflow-hidden relative pt-2">
        {language === 'markdown' && markdownViewMode === 'preview' ? (
          <div className="h-full w-full overflow-y-auto px-12 py-8 bg-[#18181A]">
            <article className="prose prose-invert prose-emerald max-w-4xl mx-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {fileContents[activeFilePath] || ''}
              </ReactMarkdown>
            </article>
          </div>
        ) : (
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            path={activeFilePath}
            value={fileContents[activeFilePath] || ''}
            onMount={handleEditorMount}
            onChange={(val) => {
              if (val !== undefined) updateFileContent(activeFilePath, val);
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
              wordWrap: "on",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
            }}
          />
        )}

        {overlayState && (
          <AgentInlineEditOverlay
            position={overlayState.position}
            selectedText={overlayState.selectedText}
            activeFilePath={activeFilePath}
            onApply={applyEdit}
            onCancel={() => setOverlayState(null)}
            editorContainerRef={editorContainerRef}
          />
        )}
      </div>
    </div>
  );
}

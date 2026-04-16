import { ChevronRight, ChevronDown, File, Plus, FolderPlus, Trash2, RefreshCw } from 'lucide-react';
import { useEditorStore, FileNode } from '../../stores/editorStore';
import clsx from 'clsx';
import { useState } from 'react';

function FileTreeItem({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const { activeFilePath, openFile, createFile, createDirectory, deleteEntry } = useEditorStore();
  const isSelected = activeFilePath === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      openFile(node.path);
    }
  };

  const handleCreateFile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = window.prompt("New File Name:");
    if (name) {
      const parentPath = node.type === 'directory' ? node.path : node.path.split('/').slice(0, -1).join('/');
      await createFile(`${parentPath}/${name}`);
    }
  }

  const handleCreateDir = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = window.prompt("New Folder Name:");
    if (name) {
      const parentPath = node.type === 'directory' ? node.path : node.path.split('/').slice(0, -1).join('/');
      await createDirectory(`${parentPath}/${name}`);
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${node.name}?`)) {
      await deleteEntry(node.path);
    }
  }

  return (
    <div>
      <div 
        className={clsx(
          "group flex items-center justify-between px-2 py-1 hover:bg-white/5 cursor-pointer text-sm select-none",
          isSelected && "bg-emerald-500/10 text-emerald-400 font-medium",
          !isSelected && "text-slate-300"
        )}
        style={{ paddingLeft: `${Math.max(0.5, level * 1)}rem` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1.5 min-w-0 pr-2 overflow-hidden">
          {node.type === 'directory' ? (
            <span className="text-slate-500 w-4 h-4 flex-shrink-0 flex items-center justify-center">
               {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
               <File size={12} className="text-slate-400" />
            </span>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1 opacity-60 flex-shrink-0">
            <button onClick={handleCreateFile} className="hover:text-emerald-400 p-0.5"><Plus size={14}/></button>
            <button onClick={handleCreateDir} className="hover:text-emerald-400 p-0.5"><FolderPlus size={14}/></button>
            <button onClick={handleDelete} className="hover:text-red-400 p-0.5"><Trash2 size={14}/></button>
        </div>
      </div>
      {node.type === 'directory' && isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map(child => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  const { fileTree, openWorkspace, workspaceRoot, refreshWorkspace } = useEditorStore();

  return (
    <div className="flex flex-col h-full bg-[#0E0E11] border-r border-white/5 overflow-y-auto w-full">
      <div className="p-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0E0E11] z-10">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Explorer</h3>
        {workspaceRoot && (
          <button onClick={() => refreshWorkspace()} className="text-slate-500 hover:text-white p-1">
             <RefreshCw size={14} />
          </button>
        )}
      </div>
      
      {!workspaceRoot ? (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-xs text-slate-500 text-center">No workspace opened.</p>
          <button 
            onClick={openWorkspace}
            className="w-full py-1.5 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            Open Folder
          </button>
        </div>
      ) : (
        <div className="py-2">
          {fileTree.map(node => (
            <FileTreeItem key={node.path} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

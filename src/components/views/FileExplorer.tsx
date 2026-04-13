import { ChevronRight, ChevronDown, File } from 'lucide-react';
import { useEditorStore, FileNode } from '../../stores/editorStore';
import clsx from 'clsx';
import { useState } from 'react';

function FileTreeItem({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const { activeFilePath, openFile } = useEditorStore();
  const isSelected = activeFilePath === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      openFile(node.path);
    }
  };

  return (
    <div>
      <div 
        className={clsx(
          "flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 cursor-pointer text-sm select-none",
          isSelected && "bg-emerald-500/10 text-emerald-400 font-medium",
          !isSelected && "text-slate-300"
        )}
        style={{ paddingLeft: `${Math.max(0.5, level * 1)}rem` }}
        onClick={handleClick}
      >
        {node.type === 'directory' ? (
          <span className="text-slate-500 w-4 h-4 flex items-center justify-center">
             {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center">
             <File size={12} className="text-slate-400" />
          </span>
        )}
        <span className="truncate">{node.name}</span>
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
  const fileTree = useEditorStore(state => state.fileTree);

  return (
    <div className="flex flex-col h-full bg-[#0E0E11] border-r border-white/5 overflow-y-auto">
      <div className="p-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0E0E11] z-10">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Explorer</h3>
      </div>
      <div className="py-2">
        {fileTree.map(node => (
          <FileTreeItem key={node.path} node={node} />
        ))}
      </div>
    </div>
  );
}

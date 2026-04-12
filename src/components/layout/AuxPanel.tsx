import { 
  FolderTree, 
  FileText, 
  Bot,
  ScrollText,
  X,
} from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';

const AUX_TABS = [
  { id: 'files' as const, icon: FolderTree, label: 'Files' },
  { id: 'artifacts' as const, icon: FileText, label: 'Artifacts' },
  { id: 'agents' as const, icon: Bot, label: 'Agents' },
  { id: 'logs' as const, icon: ScrollText, label: 'Logs' },
];

export function AuxPanel() {
  const { auxPanelContent, toggleAuxPanel, closeAuxPanel } = useLayoutStore();

  return (
    <aside 
      className="h-full flex flex-col select-none overflow-hidden"
      style={{ 
        width: 260,
        background: 'var(--color-surface-section)',
        borderLeft: '1px solid var(--color-border-ghost)',
      }}
    >
      {/* Panel Header with internal tabs */}
      <div 
        className="flex items-center h-8 flex-shrink-0 px-1"
        style={{ borderBottom: '1px solid var(--color-border-ghost)' }}
      >
        <div className="flex items-center gap-0.5 flex-1">
          {AUX_TABS.map((tab) => {
            const isActive = auxPanelContent === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => toggleAuxPanel(tab.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors duration-100"
                style={{
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                  background: isActive ? 'var(--color-surface-component)' : 'transparent',
                }}
              >
                <tab.icon className="w-3 h-3" strokeWidth={2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button 
          onClick={closeAuxPanel}
          className="p-1 rounded transition-colors duration-100 hover:bg-[var(--color-surface-component)]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <X className="w-3 h-3" strokeWidth={2} />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {auxPanelContent === 'files' && (
            <>
              <span className="label-tag mb-1">Project Files</span>
              {['src/', 'src-tauri/', 'package.json', 'DESIGN.md', 'AUTARCH-BLUEPRINT.md'].map((f) => (
                <div 
                  key={f}
                  className="flex items-center gap-2 px-2 py-1 rounded transition-colors duration-100 cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {f.endsWith('/') ? (
                    <FolderTree className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-accent-dim)' }} />
                  ) : (
                    <FileText className="w-3 h-3 flex-shrink-0" />
                  )}
                  <span className="text-xs truncate" style={{ fontFamily: 'var(--font-mono)' }}>{f}</span>
                </div>
              ))}
            </>
          )}
          {auxPanelContent === 'artifacts' && (
            <span className="label-tag">No artifacts yet</span>
          )}
          {auxPanelContent === 'agents' && (
            <span className="label-tag">No active agents</span>
          )}
          {auxPanelContent === 'logs' && (
            <span className="label-tag">System log empty</span>
          )}
        </div>
      </div>
    </aside>
  );
}

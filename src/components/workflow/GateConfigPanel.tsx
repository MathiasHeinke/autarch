import { useWorkflowStore } from '../../stores/workflowStore';
import type { GateMode } from '../../types/workflow.types';

export function GateConfigPanel() {
  const { activeNodeId, activeWorkflow, updateNodeData, setActiveNode } = useWorkflowStore();

  if (!activeNodeId || !activeWorkflow) return null;

  const node = activeWorkflow.nodes.find(n => n.id === activeNodeId);
  if (!node) return null;

  const gate = node.data.gate;

  const handleModeChange = (mode: GateMode) => {
    updateNodeData(activeNodeId, { gate: { ...gate, mode } });
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(activeNodeId, {
      gate: { ...gate, criteria: e.target.value }
    });
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-surface border border-surface-highlight rounded-lg shadow-xl shadow-black/50 text-text-primary p-4 z-50">
      <div className="flex items-center justify-between mb-4 border-b border-surface-highlight pb-2">
        <h3 className="font-semibold text-sm">Gate Configuration</h3>
        <button 
          onClick={() => setActiveNode(null)}
          className="text-text-secondary hover:text-text-primary"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Gate Mode</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-surface-highlight/50">
              <input 
                type="radio" 
                name={`gatemode-${activeNodeId}`}
                checked={gate?.mode === 'auto'}
                onChange={() => handleModeChange('auto')}
                className="accent-accent"
              />
              <span className="text-sm">Auto (Pass-through)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-surface-highlight/50">
              <input 
                type="radio" 
                name={`gatemode-${activeNodeId}`}
                checked={gate?.mode === 'human'}
                onChange={() => handleModeChange('human')}
                className="accent-accent"
              />
              <span className="text-sm">Human Approval</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-surface-highlight/50">
              <input 
                type="radio" 
                name={`gatemode-${activeNodeId}`}
                checked={gate?.mode === 'agent-review'}
                onChange={() => handleModeChange('agent-review')}
                className="accent-accent"
              />
              <span className="text-sm">Agent Verification</span>
            </label>
          </div>
        </div>

        {gate?.mode === 'agent-review' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Verification Criteria
            </label>
            <p className="text-xs text-text-secondary/70 mb-2">
              Explain exactly what the agent should check before allowing this phase to pass.
            </p>
            <textarea
              className="w-full h-24 bg-surface-darker border border-surface-highlight rounded-md p-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none placeholder:text-text-secondary/50"
              placeholder="e.g. Ensure the response format is strictly JSON."
              value={gate.criteria || ''}
              onChange={handleCriteriaChange}
              maxLength={2000}
            />
          </div>
        )}
      </div>
    </div>
  );
}

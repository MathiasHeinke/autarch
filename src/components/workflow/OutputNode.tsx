import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { OutputNodeData } from '../../types/workflow.types';

export function OutputNode({ id, data }: NodeProps) {
  const { setActiveNode, activeNodeId, executionState } = useWorkflowStore();
  const typedData = data as unknown as OutputNodeData;
  const isActive = activeNodeId === id;

  const nodeState = executionState?.nodeStates[id];
  const statusClass = nodeState?.status === 'running' ? 'ring-2 ring-accent/70 animate-pulse'
    : nodeState?.status === 'passed' ? 'ring-2 ring-green-500/70'
    : nodeState?.status === 'failed' ? 'ring-2 ring-red-500/70'
    : nodeState?.status === 'waiting-gate' ? 'ring-2 ring-yellow-500/70 animate-pulse'
    : nodeState?.status === 'skipped' ? 'opacity-50'
    : '';

  return (
    <div className={`bg-surface border border-surface-highlight rounded-lg shadow-sm p-4 w-64 text-text-primary transition-all duration-300 ${statusClass}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Output Node</h3>
          <p className="text-xs text-text-secondary">{typedData.outputType || 'Log'}</p>
        </div>
      </div>
      {nodeState?.status === 'passed' && (
        <div className="text-xs text-green-500 mb-1">✓ Output written</div>
      )}
      <div 
        onClick={() => setActiveNode(id)}
        className={`text-xs text-text-secondary border-t border-surface-highlight pt-2 mt-2 flex justify-between cursor-pointer hover:text-accent transition-colors ${isActive ? 'text-accent' : ''}`}
      >
        <span>Gate: {typedData.gate?.mode || 'auto'}</span>
      </div>
    </div>
  );
}

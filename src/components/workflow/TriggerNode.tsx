import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { TriggerNodeData } from '../../types/workflow.types';

export function TriggerNode({ id, data }: NodeProps) {
  const { setActiveNode, activeNodeId, executionState } = useWorkflowStore();
  const typedData = data as unknown as TriggerNodeData;
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
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Trigger Node</h3>
          <p className="text-xs text-text-secondary">{typedData.triggerType || 'Manual'}</p>
        </div>
      </div>
      {nodeState?.status === 'running' && (
        <div className="text-xs text-accent mb-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          Triggering...
        </div>
      )}
      {nodeState?.status === 'passed' && (
        <div className="text-xs text-green-500 mb-1">✓ Triggered</div>
      )}
      <div 
        onClick={() => setActiveNode(id)}
        className={`text-xs text-text-secondary border-t border-surface-highlight pt-2 mt-2 flex justify-between cursor-pointer hover:text-accent transition-colors ${isActive ? 'text-accent' : ''}`}
      >
        <span>Gate: {typedData.gate?.mode || 'auto'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-accent" />
    </div>
  );
}

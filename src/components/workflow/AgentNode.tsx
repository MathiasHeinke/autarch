import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { AgentNodeData } from '../../types/workflow.types';

export function AgentNode({ id, data }: NodeProps) {
  const { setActiveNode, activeNodeId, executionState } = useWorkflowStore();
  const typedData = data as unknown as AgentNodeData;
  const isActive = activeNodeId === id;
  
  // Execution status ring
  const nodeState = executionState?.nodeStates[id];
  const statusClass = nodeState?.status === 'running' ? 'ring-2 ring-accent/70 animate-pulse'
    : nodeState?.status === 'passed' ? 'ring-2 ring-green-500/70'
    : nodeState?.status === 'failed' ? 'ring-2 ring-red-500/70'
    : nodeState?.status === 'waiting-gate' ? 'ring-2 ring-yellow-500/70 animate-pulse'
    : nodeState?.status === 'skipped' ? 'opacity-50'
    : '';

  return (
    <div className={`bg-surface border border-surface-highlight rounded-lg shadow-sm p-4 w-64 text-text-primary transition-all duration-300 ${statusClass}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center text-green-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Agent Step</h3>
          <p className="text-xs text-text-secondary truncate">{typedData.prompt?.substring(0, 20) || 'No prompt'}</p>
        </div>
      </div>
      {nodeState?.status === 'running' && (
        <div className="text-xs text-accent mb-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          Running...
        </div>
      )}
      {nodeState?.status === 'passed' && (
        <div className="text-xs text-green-500 mb-1">✓ Completed</div>
      )}
      {nodeState?.status === 'failed' && (
        <div className="text-xs text-red-500 mb-1">✗ Failed</div>
      )}
      {nodeState?.status === 'waiting-gate' && (
        <div className="text-xs text-yellow-500 mb-1">⏸ Awaiting approval</div>
      )}
      <div 
        onClick={() => setActiveNode(id)}
        className={`text-xs text-text-secondary border-t border-surface-highlight pt-2 mt-2 flex justify-between cursor-pointer hover:text-accent transition-colors ${isActive ? 'text-accent' : ''}`}
      >
        <span>Gate: {typedData.gate?.mode || 'human'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
}

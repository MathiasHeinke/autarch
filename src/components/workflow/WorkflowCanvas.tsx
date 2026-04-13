import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../stores/workflowStore';
import { useWorkflowExecution } from '../../hooks/workflow/useWorkflowExecution';
import { TriggerNode } from './TriggerNode';
import { AgentNode } from './AgentNode';
import { OutputNode } from './OutputNode';
import { GateConfigPanel } from './GateConfigPanel';

export function WorkflowCanvas() {
  const { activeWorkflow, onNodesChange, onEdgesChange, onConnect, addNode, executionState } = useWorkflowStore();
  const { startExecution, resumeExecution, isRunning, isPaused } = useWorkflowExecution();

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    agent: AgentNode,
    output: OutputNode
  }), []);

  const handleAddTrigger = useCallback(() => addNode('trigger', { x: 100, y: 100 }), [addNode]);
  const handleAddAgent = useCallback(() => addNode('agent', { x: 300, y: 100 }), [addNode]);
  const handleAddOutput = useCallback(() => addNode('output', { x: 500, y: 100 }), [addNode]);

  if (!activeWorkflow) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-surface-darker text-text-secondary">
        <p>No workflow selected. Create or load one to begin.</p>
      </div>
    );
  }

  // Execution status label
  const statusLabel = executionState?.status === 'running' ? '● Running'
    : executionState?.status === 'paused' ? '⏸ Paused — Awaiting Gate'
    : executionState?.status === 'completed' ? '✓ Completed'
    : executionState?.status === 'failed' ? '✗ Failed'
    : null;

  const statusColor = executionState?.status === 'running' ? 'text-accent'
    : executionState?.status === 'paused' ? 'text-yellow-500'
    : executionState?.status === 'completed' ? 'text-green-500'
    : executionState?.status === 'failed' ? 'text-red-500'
    : '';

  return (
    <div className="h-full w-full bg-surface-darker relative flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-surface-highlight bg-surface">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">{activeWorkflow.name}</h2>
          {statusLabel && (
            <span className={`text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isRunning && !isPaused && (
            <button 
              onClick={() => startExecution()}
              disabled={activeWorkflow.nodes.length === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶ Run
            </button>
          )}
          {isPaused && (
            <button 
              onClick={() => resumeExecution()}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
            >
              ▶ Resume
            </button>
          )}
          {isRunning && (
            <span className="px-3 py-1.5 text-xs font-medium text-accent flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Executing...
            </span>
          )}
          <div className="w-px h-6 bg-surface-highlight mx-1" />
          <button 
            onClick={handleAddTrigger}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            + Trigger
          </button>
          <button 
            onClick={handleAddAgent}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
          >
            + Agent
          </button>
          <button 
            onClick={handleAddOutput}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
          >
            + Output
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <ReactFlow
          nodes={activeWorkflow.nodes}
          edges={activeWorkflow.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} color="#000" className="opacity-10" />
          <Controls className="bg-surface border-surface-highlight fill-text-primary" />
          <MiniMap 
            nodeColor={(n) => {
              // Reflect execution status in minimap
              const ns = executionState?.nodeStates[n.id];
              if (ns?.status === 'running') return '#8b5cf6';
              if (ns?.status === 'passed') return '#10b981';
              if (ns?.status === 'failed') return '#ef4444';
              if (ns?.status === 'waiting-gate') return '#eab308';
              if (n.type === 'trigger') return '#3b82f6';
              if (n.type === 'agent') return '#10b981';
              return '#8b5cf6';
            }}
            maskColor="rgba(0,0,0,0.4)"
            className="bg-surface border-surface-highlight"
          />
        </ReactFlow>
        <GateConfigPanel />
      </div>
    </div>
  );
}

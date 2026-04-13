/**
 * useWorkflowExecution
 * 
 * Reactive bridge between hermesEventBus and workflowStore.
 * Subscribes to workflow lifecycle events and maps them to 
 * Zustand execution state, providing real-time visual feedback on the canvas.
 */

import { useEffect, useCallback, useRef } from 'react';
import { hermesEventBus } from '../../services/eventBus';
import { executeWorkflow, type WorkflowExecutionContext } from '../../services/hermesBridge';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowDocument } from '../../types/workflow.types';

export function useWorkflowExecution() {
  const { setNodeExecutionStatus, activeWorkflow } = useWorkflowStore();
  const contextRef = useRef<WorkflowExecutionContext | null>(null);

  // Subscribe to hermesEventBus events and map to store
  useEffect(() => {
    const unsubNodeStarted = hermesEventBus.subscribe('node.started', (event) => {
      useWorkflowStore.getState().setNodeExecutionStatus(event.payload.nodeId, 'running');
    });

    const unsubNodeCompleted = hermesEventBus.subscribe('node.completed', (event) => {
      useWorkflowStore.getState().setNodeExecutionStatus(
        event.payload.nodeId, 
        'passed', 
        event.payload.result
      );
    });

    const unsubNodeSuspended = hermesEventBus.subscribe('node.suspended', (event) => {
      useWorkflowStore.getState().setNodeExecutionStatus(event.payload.nodeId, 'waiting-gate');
    });

    const unsubWorkflowStarted = hermesEventBus.subscribe('workflow.started', () => {
      // Initialize execution state when workflow starts
      const workflow = useWorkflowStore.getState().activeWorkflow;
      if (!workflow) return;
      
      const nodeStates: Record<string, { nodeId: string; status: 'idle' }> = {};
      workflow.nodes.forEach(n => {
        nodeStates[n.id] = { nodeId: n.id, status: 'idle' };
      });

      useWorkflowStore.setState({
        executionState: {
          workflowId: workflow.id,
          status: 'running',
          nodeStates,
          startedAt: new Date().toISOString(),
        }
      });
    });

    const unsubWorkflowCompleted = hermesEventBus.subscribe('workflow.completed', () => {
      const state = useWorkflowStore.getState().executionState;
      if (state) {
        useWorkflowStore.setState({
          executionState: {
            ...state,
            status: 'completed',
            completedAt: new Date().toISOString(),
          }
        });
      }
    });

    const unsubWorkflowFailed = hermesEventBus.subscribe('workflow.failed', (event) => {
      const state = useWorkflowStore.getState().executionState;
      if (state) {
        useWorkflowStore.setState({
          executionState: {
            ...state,
            status: 'failed',
            completedAt: new Date().toISOString(),
          }
        });
      }
      // Mark the failed node if context holds it
      if (contextRef.current?.failedNodeId) {
        useWorkflowStore.getState().setNodeExecutionStatus(
          contextRef.current.failedNodeId, 
          'failed', 
          event.payload.error
        );
      }
    });

    return () => {
      unsubNodeStarted();
      unsubNodeCompleted();
      unsubNodeSuspended();
      unsubWorkflowStarted();
      unsubWorkflowCompleted();
      unsubWorkflowFailed();
    };
  }, [setNodeExecutionStatus]);

  // Start workflow execution
  const startExecution = useCallback(async (workflow?: WorkflowDocument) => {
    const wf = workflow || activeWorkflow;
    if (!wf) return;

    contextRef.current = null;
    const result = await executeWorkflow(wf);
    contextRef.current = result;
    return result;
  }, [activeWorkflow]);

  // Resume a paused workflow
  const resumeExecution = useCallback(async () => {
    const wf = activeWorkflow;
    if (!wf || !contextRef.current) return;

    const result = await executeWorkflow(wf, contextRef.current);
    contextRef.current = result;
    return result;
  }, [activeWorkflow]);

  return {
    startExecution,
    resumeExecution,
    isRunning: useWorkflowStore((s) => s.executionState?.status === 'running'),
    isPaused: useWorkflowStore((s) => s.executionState?.status === 'paused'),
    executionState: useWorkflowStore((s) => s.executionState),
  };
}

import { create } from 'zustand';
import { readTextFile, writeTextFile, readDir, mkdir, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { applyNodeChanges, applyEdgeChanges, addEdge, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type { 
  WorkflowDocument, 
  WorkflowExecutionState,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  NodeExecutionStatus
} from '../types/workflow.types';

interface WorkflowStoreState {
  // ─── Active Workflow ──────────────────────────────────────
  activeWorkflow: WorkflowDocument | null;
  workflowList: { id: string; name: string; updatedAt: string }[];
  executionState: WorkflowExecutionState | null;
  
  // ─── Dirty tracking ──────────────────────────────────────
  isDirty: boolean;
  
  activeNodeId: string | null;
  
  // ─── Actions ──────────────────────────────────────────────
  createWorkflow: (name: string) => void;
  loadWorkflow: (id: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  refreshWorkflowList: () => Promise<void>;
  
  setActiveNode: (id: string | null) => void;
  
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (type: WorkflowNodeData['type'], position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setNodeExecutionStatus: (nodeId: string, status: NodeExecutionStatus, output?: string) => void;
}

// Use crypto.randomUUID when available (all modern browsers), fallback to Math.random
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 10);
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  activeWorkflow: null,
  workflowList: [],
  executionState: null,
  isDirty: false,
  activeNodeId: null,

  setActiveNode: (id) => set({ activeNodeId: id }),

  createWorkflow: (name: string) => {
    const id = generateId();
    const newWorkflow: WorkflowDocument = {
      version: 1,
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      nodes: [],
      edges: []
    };
    set({ activeWorkflow: newWorkflow, isDirty: true });
  },

  loadWorkflow: async (id: string) => {
    try {
      const contents = await readTextFile(`.autarch/workflows/${id}.json`, { baseDir: BaseDirectory.Home });
      const parsed = JSON.parse(contents) as WorkflowDocument;
      if (parsed.version === 1) {
        set({ activeWorkflow: parsed, isDirty: false });
      } else {
        console.warn('Unknown workflow version', parsed.version);
      }
    } catch (e) {
      console.error('Failed to load workflow:', e);
    }
  },

  saveWorkflow: async () => {
    const { activeWorkflow } = get();
    if (!activeWorkflow) return;

    try {
      // Check if directory exists
      const dirExists = await exists('.autarch/workflows', { baseDir: BaseDirectory.Home });
      if (!dirExists) {
        await mkdir('.autarch/workflows', { baseDir: BaseDirectory.Home, recursive: true });
      }

      const updatedWorkflow: WorkflowDocument = {
        ...activeWorkflow,
        revision: activeWorkflow.revision + 1,
        updatedAt: new Date().toISOString()
      };

      await writeTextFile(
        `.autarch/workflows/${updatedWorkflow.id}.json`,
        JSON.stringify(updatedWorkflow, null, 2),
        { baseDir: BaseDirectory.Home }
      );

      set({ activeWorkflow: updatedWorkflow, isDirty: false });
      get().refreshWorkflowList();
    } catch (e) {
      console.error('Failed to save workflow:', e);
    }
  },

  deleteWorkflow: async (id: string) => {
    try {
      const { remove } = await import('@tauri-apps/plugin-fs');
      await remove(`.autarch/workflows/${id}.json`, { baseDir: BaseDirectory.Home });
      get().refreshWorkflowList();
      const { activeWorkflow } = get();
      if (activeWorkflow?.id === id) {
        set({ activeWorkflow: null, isDirty: false });
      }
    } catch (e) {
      console.error('Failed to delete workflow:', e);
    }
  },

  refreshWorkflowList: async () => {
    try {
      const dirExists = await exists('.autarch/workflows', { baseDir: BaseDirectory.Home });
      if (!dirExists) {
        set({ workflowList: [] });
        return;
      }

      const entries = await readDir('.autarch/workflows', { baseDir: BaseDirectory.Home });
      const list = [];
      
      for (const entry of entries) {
        if (entry.name && entry.name.endsWith('.json')) {
          try {
            const contents = await readTextFile(`.autarch/workflows/${entry.name}`, { baseDir: BaseDirectory.Home });
            const parsed = JSON.parse(contents);
            list.push({
              id: parsed.id,
              name: parsed.name ?? 'Untitled',
              updatedAt: parsed.updatedAt ?? ''
            });
          } catch {
            // Skip invalid files
          }
        }
      }
      
      // Sort by newest first
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      set({ workflowList: list });
    } catch (e) {
      console.error('Failed to refresh workflow list:', e);
    }
  },

  onNodesChange: (changes) => {
    set((state) => {
      if (!state.activeWorkflow) return state;
      return {
        activeWorkflow: {
          ...state.activeWorkflow,
          // React Flow's applyNodeChanges has stricter generics than our WorkflowNode union.
          // These casts are required due to the mismatch between xyflow's internal Node<T>
          // and our discriminated WorkflowNode type. Verified safe at runtime.
          nodes: applyNodeChanges(changes as NodeChange[], state.activeWorkflow.nodes as Parameters<typeof applyNodeChanges>[1]) as WorkflowNode[]
        },
        isDirty: true
      };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      if (!state.activeWorkflow) return state;
      return {
        activeWorkflow: {
          ...state.activeWorkflow,
          // Same React Flow generic constraint workaround as onNodesChange above.
          edges: applyEdgeChanges(changes as EdgeChange[], state.activeWorkflow.edges as Parameters<typeof applyEdgeChanges>[1]) as WorkflowEdge[]
        },
        isDirty: true
      };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      if (!state.activeWorkflow) return state;
      return {
        activeWorkflow: {
          ...state.activeWorkflow,
          edges: addEdge(connection, state.activeWorkflow.edges) as WorkflowEdge[]
        },
        isDirty: true
      };
    });
  },

  addNode: (type, position) => {
    set((state) => {
      if (!state.activeWorkflow) return state;
      
      const id = generateId();
      let data: WorkflowNodeData;
      
      if (type === 'trigger') {
        data = { type: 'trigger', label: 'Trigger', triggerType: 'manual', gate: { mode: 'human' } };
      } else if (type === 'agent') {
        data = { type: 'agent', label: 'Agent Step', prompt: '', gate: { mode: 'human' } };
      } else {
        data = { type: 'output', label: 'Output', outputType: 'log', gate: { mode: 'auto' } };
      }

      const newNode: WorkflowNode = { id, type, position, data };

      return {
        activeWorkflow: {
          ...state.activeWorkflow,
          nodes: [...state.activeWorkflow.nodes, newNode]
        },
        isDirty: true
      };
    });
  },

  updateNodeData: (nodeId, data) => {
    set((state) => {
      if (!state.activeWorkflow) return state;
      
      const newNodes = state.activeWorkflow.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data } as WorkflowNodeData
          };
        }
        return node;
      });

      return {
        activeWorkflow: {
          ...state.activeWorkflow,
          nodes: newNodes
        },
        isDirty: true
      };
    });
  },

  setNodeExecutionStatus: (nodeId, status, output) => {
    set((state) => {
      if (!state.executionState) return state;
      
      const current = state.executionState.nodeStates[nodeId] || { nodeId, status: 'idle' };
      const updated = {
        ...current,
        status,
      };
      
      if (output !== undefined) {
        updated.output = output;
      }
      
      if (status === 'running' && current.status !== 'running') {
        updated.startedAt = new Date().toISOString();
      } else if (status === 'passed' || status === 'failed') {
        updated.completedAt = new Date().toISOString();
      }

      return {
        executionState: {
          ...state.executionState,
          nodeStates: {
            ...state.executionState.nodeStates,
            [nodeId]: updated
          }
        }
      };
    });
  }
}));

// ─── Gate System (Smart Trust) ──────────────────────────────────

/** Gate mode per workflow node */
export type GateMode = 'auto' | 'human' | 'agent-review';

export interface GateConfig {
  /** How this node's output is validated before passing to the next */
  mode: GateMode;
  /** Natural language criteria for the agent-review gate */
  criteria?: string;
  /** Which Hermes skill/persona should review (only for agent-review) */
  reviewerSkill?: string;
}

// ─── Node Data Payloads ─────────────────────────────────────────

export interface TriggerNodeData extends Record<string, unknown> {
  type: 'trigger';
  label: string;
  /** 'manual' = user clicks Run, 'cron' = scheduled, 'event' = on Hermes event */
  triggerType: 'manual' | 'cron' | 'event';
  /** Cron expression (only when triggerType === 'cron') e.g. "0 9 * * *" */
  cronExpression?: string;
  /** Event name (only when triggerType === 'event') */
  eventName?: string;
  gate: GateConfig;
}

export interface AgentNodeData extends Record<string, unknown> {
  type: 'agent';
  label: string;
  /** The prompt/instruction to send to Hermes */
  prompt: string;
  /** Optional: specific skill to invoke */
  skill?: string;
  /** Optional: specific MCP tool to call */
  mcpTool?: string;
  /** Optional: MCP tool parameters as key-value */
  mcpParams?: Record<string, string>;
  /** Secret references use $KEYCHAIN:key_name pattern — never inline */
  gate: GateConfig;
}

export interface OutputNodeData extends Record<string, unknown> {
  type: 'output';
  label: string;
  /** 'log' = write to workflow log, 'file' = write to disk, 'api' = POST to endpoint */
  outputType: 'log' | 'file' | 'api';
  /** File path (for 'file') or URL (for 'api') */
  destination?: string;
  gate: GateConfig;
}

export type WorkflowNodeData = TriggerNodeData | AgentNodeData | OutputNodeData;

// ─── Workflow Document ──────────────────────────────────────────

export interface WorkflowNode {
  /** React Flow node ID */
  id: string;
  /** Node type discriminator */
  type: 'trigger' | 'agent' | 'output';
  /** Position on the canvas */
  position: { x: number; y: number };
  /** Node-specific data payload */
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  /** React Flow edge ID */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
}

export interface WorkflowDocument {
  /** Schema version for forward-compat */
  version: 1;
  /** Unique workflow ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description */
  description?: string;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
  /** Optimistic locking counter — incremented on every save */
  revision: number;
  /** The visual graph */
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ─── Execution State ────────────────────────────────────────────

export type NodeExecutionStatus = 'idle' | 'running' | 'waiting-gate' | 'passed' | 'failed' | 'skipped';

export interface NodeExecutionState {
  nodeId: string;
  status: NodeExecutionStatus;
  output?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowExecutionState {
  workflowId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  nodeStates: Record<string, NodeExecutionState>;
  startedAt?: string;
  completedAt?: string;
}

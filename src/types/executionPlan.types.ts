// ─── Persona Identifier ─────────────────────────────────────────
/** Matches persona keys in hermes-kit/config.yaml */
export type PersonaId =
  | 'carmack' | 'karpathy' | 'uncle-bob' | 'hamilton'    // Engineering
  | 'sherlock' | 'ramsay' | 'mr-robot'                   // Quality
  | 'jobs' | 'elon' | 'rauno' | 'jonah'                  // Product
  | 'draper' | 'hormozi' | 'gary-vee'                    // Marketing
  | 'taleb' | 'kahneman'                                 // Strategy
  | 'default';                                           // SOUL.md baseline

// ─── Phase Status ────────────────────────────────────────────────
export type PhaseStatus =
  | 'pending'       // Not yet started
  | 'running'       // Currently executing
  | 'gate-running'  // Quality gate evaluation in progress
  | 'passed'        // Phase + gate passed
  | 'failed'        // Phase execution failed
  | 'gate-failed'   // Phase completed but gate rejected
  | 'skipped';      // Skipped (dependency failure)

// ─── Plan Status ─────────────────────────────────────────────────
export type PlanStatus =
  | 'draft'         // Plan created but not started
  | 'running'       // At least one phase executing
  | 'paused'        // User paused execution
  | 'completed'     // All phases passed
  | 'failed'        // A phase failed irrecoverably
  | 'aborted';      // User aborted

// ─── Gate Result ─────────────────────────────────────────────────
export interface GateResult {
  passed: boolean;                    // Overall verdict
  persona: PersonaId;                 // Who evaluated (e.g. 'sherlock')
  criteria: GateCriterion[];          // Individual criterion results
  summary: string;                    // LLM-generated summary
  timestamp: number;                  // Unix ms
  retryCount: number;                 // How many times gate was run (max 2 retries)
  rawResponse: string;                // Full LLM response for audit trail
}

export interface GateCriterion {
  id: string;                         // e.g. 'A1', 'R1'
  description: string;                // What was checked
  passed: boolean;                    // Result
  evidence: string;                   // Why it passed/failed
}

// ─── Phase Definition ────────────────────────────────────────────
export interface PhaseDefinition {
  id: string;                         // Unique within plan, e.g. 'phase-1'
  title: string;                      // Human-readable, e.g. 'Database Schema'
  description: string;                // What this phase accomplishes (2-4 sentences)
  prompt: string;                     // The actual prompt sent to Hermes
  persona: PersonaId;                 // Which persona executes this phase
  gatePersona: PersonaId | null;      // Which persona evaluates the gate (null = no gate)
  gateCriteria: string[];             // List of gate acceptance criteria
  dependsOn: string[];                // Phase IDs this depends on
  estimatedMinutes: number;           // Time estimate
  order: number;                      // Execution order (1-based)
}

// ─── Phase Result ────────────────────────────────────────────────
export interface PhaseResult {
  phaseId: string;                    // References PhaseDefinition.id
  status: PhaseStatus;
  startedAt: number | null;           // Unix ms
  completedAt: number | null;         // Unix ms
  output: string;                     // Full LLM output for this phase
  outputSummary: string;              // Compressed summary for context passing
  gateResult: GateResult | null;      // Gate evaluation result
  error: string | null;               // Error message if failed
  retryCount: number;                 // Number of retry attempts
}

// ─── Execution Plan ──────────────────────────────────────────────
export interface ExecutionPlan {
  id: string;                         // UUID
  title: string;                      // Plan name, e.g. 'Implement Auth System'
  description: string;                // What this plan achieves
  phases: PhaseDefinition[];          // Ordered list of phases
  createdAt: number;                  // Unix ms
  status: PlanStatus;
}

// ─── Execution State (Runtime) ───────────────────────────────────
export interface ExecutionState {
  planId: string;                     // References ExecutionPlan.id
  currentPhaseIndex: number;          // 0-based index into phases array
  results: Record<string, PhaseResult>; // PhaseId → Result
  startedAt: number | null;           // Plan start time
  completedAt: number | null;         // Plan completion time
  contextSummary: string;             // Rolling context summary for context window management
}

// ─── Config ──────────────────────────────────────────────────────
export interface ExecutionConfig {
  maxRetries: number;                 // Max retries per phase (default: 2)
  maxGateRetries: number;             // Max gate re-evaluations (default: 2)
  streamOutput: boolean;              // Stream LLM output to UI (default: true)
  autoAdvance: boolean;               // Auto-advance to next phase on gate pass (default: true)
  contextStrategy: 'summary' | 'raw'; // How to pass context between phases (default: 'summary')
  model: string;                      // Model override, e.g. 'claude-3-5-sonnet-20241022'
}

// ─── Plan Event Types (for EventBus) ─────────────────────────────
export type PlanEventType =
  | 'plan.started'
  | 'plan.completed'
  | 'plan.failed'
  | 'plan.paused'
  | 'plan.aborted'
  | 'phase.started'
  | 'phase.completed'
  | 'phase.failed'
  | 'phase.output.delta'
  | 'gate.started'
  | 'gate.passed'
  | 'gate.failed';

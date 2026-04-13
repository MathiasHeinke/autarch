import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  ExecutionPlan, 
  ExecutionState,
  ExecutionConfig 
} from '../types/executionPlan.types';
import { PlanExecutor } from '../services/planExecutor';

interface ExecutionPlanStoreState {
  // ─── State ────────────────────────────────────────────────────────
  activePlan: ExecutionPlan | null;
  activeState: ExecutionState | null;
  history: { plan: ExecutionPlan, finalState: ExecutionState }[];
  
  // Streaming/UI state
  activePhaseId: string | null;
  streamingOutput: string;
  executor: PlanExecutor | null;
  
  // ─── Actions ──────────────────────────────────────────────────────
  /** Generates and starts a new execution plan */
  startPlan: (plan: ExecutionPlan, config?: Partial<ExecutionConfig>) => Promise<void>;
  
  /** Cancels the currently running plan */
  cancelPlan: () => void;
  
  /** Triggers a retry of a failed phase */
  retryPhase: () => Promise<void>;
  
  /** Clears the active plan (moves to history if completed/failed) */
  clearActivePlan: () => void;
  
  // Internal actions for state machine binding
  __updateState: (state: ExecutionState) => void;
  __setStreamingOutput: (delta: string, reset?: boolean) => void;
  __setActivePhase: (phaseId: string | null) => void;
}

export const useExecutionPlanStore = create<ExecutionPlanStoreState>()(
  persist(
    (set, get) => ({
      activePlan: null,
      activeState: null,
      history: [],
      activePhaseId: null,
      streamingOutput: '',
      executor: null,

      startPlan: async (plan: ExecutionPlan, config?: Partial<ExecutionConfig>) => {
        const executor = new PlanExecutor(plan, config);

        // Bind events to store actions
        executor.on((event) => {
          const store = get();
          store.__updateState(executor.getState());

          switch (event.type) {
            case 'plan.started':
              set({ streamingOutput: '' });
              break;
            case 'phase.started':
              if (event.phaseId) {
                store.__setActivePhase(event.phaseId);
                set({ streamingOutput: '' });
              }
              break;
            case 'phase.output.delta':
              if (event.data?.delta && typeof event.data.delta === 'string') {
                store.__setStreamingOutput(event.data.delta);
              }
              break;
            case 'phase.completed':
            case 'phase.failed':
            case 'gate.started':
            case 'gate.passed':
            case 'gate.failed':
            case 'plan.completed':
            case 'plan.failed':
            case 'plan.aborted':
              // State updated above
              break;
          }
        });

        // Set initial state and start
        set({ activePlan: plan, activeState: executor.getState(), executor });
        await executor.execute();
      },

      cancelPlan: () => {
        const { executor } = get();
        if (executor) {
          executor.abort();
        }
      },

      retryPhase: async () => {
        const { executor } = get();
        if (executor) {
           await executor.execute(); // Simplistic resume
        }
      },

      clearActivePlan: () => {
        set((state) => {
          const newHistory = (state.activePlan && state.activeState) 
             ? [{ plan: state.activePlan, finalState: state.activeState }, ...state.history] 
             : state.history;
          return {
            activePlan: null,
            activeState: null,
            activePhaseId: null,
            streamingOutput: '',
            executor: null,
            history: newHistory,
          };
        });
      },

      __updateState: (execState: ExecutionState) => {
        set({ activeState: { ...execState } });
      },

      __setStreamingOutput: (delta, reset = false) => {
        set((state) => ({ streamingOutput: reset ? delta : state.streamingOutput + delta }));
      },

      __setActivePhase: (phaseId) => {
        set({ activePhaseId: phaseId });
      }
    }),
    {
      name: 'autarch-execution-plan-store',
      partialize: (state) => ({
        history: state.history,
        activePlan: state.activePlan,
        activeState: state.activeState,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { checkHermesHealth, type HermesStatus, type ChatMessage } from '../services/hermesClient';
import { hermesEventBus } from '../services/eventBus';
import {
  startGateway as startGatewayProcess,
  stopGateway as stopGatewayProcess,
  getGatewayStatus,
  type GatewayStatus,
} from '../services/hermesGateway';

export type GatewayProcessState = 'running' | 'stopped' | 'starting' | 'error';

export interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  input?: string;
  output?: string;
  duration?: number;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}
interface HermesState {
  // Connection
  status: HermesStatus;
  polling: boolean;
  
  // Gateway
  gatewayProcess: GatewayProcessState;
  
  // Hub / Agentic State
  activeRunId: string | null;
  activeRunSubscription: (() => void) | null;
  toolCalls: ToolCall[];
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  
  // Model State
  activeModel: string;
  setActiveModel: (model: string) => void;
  
  // Active Chat (legacy or current view)
  messages: ChatMessage[];
  isStreaming: boolean;
  streamBuffer: string;
  
  // Actions
  checkConnection: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  addMessage: (msg: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: () => void;
  clearChat: () => void;
  
  // Runs / Conversations Actions
  setActiveConversation: (id: string) => void;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
  setActiveRun: (runId: string | null) => void;
  submitRun: (input: string) => Promise<void>;
  cancelRun: () => void;
  initEventBusListener: () => void;
  
  // Gateway Actions
  startGateway: () => Promise<boolean>;
  stopGateway: () => Promise<boolean>;
  refreshGatewayStatus: () => Promise<void>;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useHermesStore = create<HermesState>()(
  persist(
    (set, get) => ({
      status: { online: false, url: 'http://localhost:8642' },
      polling: false,
      gatewayProcess: 'stopped',

      activeRunId: null,
      activeRunSubscription: null as (() => void) | null,
      toolCalls: [],
      conversations: {
        'default': { id: 'default', title: 'New Chat', messages: [], updatedAt: Date.now() }
      },
      activeConversationId: 'default',

      activeModel: 'claude-3-5-sonnet-20241022',
      setActiveModel: (model) => set({ activeModel: model }),

      messages: [],
      isStreaming: false,
      streamBuffer: '',

      checkConnection: async () => {
        const status = await checkHermesHealth();
        set({
          status,
          gatewayProcess: status.online ? 'running' : get().gatewayProcess === 'starting' ? 'starting' : 'stopped',
        });
      },

      startPolling: () => {
        if (get().polling) return;
        set({ polling: true });
        
        get().checkConnection();

        import('./terminalStore').then(({ useTerminalStore }) => {
          useTerminalStore.getState().checkHermesInstalled();
        }).catch(() => console.warn('[HermesStore] terminalStore import failed'));
        
        pollInterval = setInterval(() => {
          get().checkConnection();
        }, 5000);
      },

      stopPolling: () => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        set({ polling: false });
      },

      addMessage: (msg) => 
        set((s) => ({ messages: [...s.messages, { ...msg, id: crypto.randomUUID() }] })),

      setStreaming: (streaming) => 
        set({ isStreaming: streaming }),

      appendStreamChunk: (chunk) => 
        set((s) => ({ streamBuffer: s.streamBuffer + chunk })),

      finalizeStream: () => 
        set((s) => ({
          messages: [...s.messages, { role: 'assistant' as const, content: s.streamBuffer, id: crypto.randomUUID() }],
          streamBuffer: '',
          isStreaming: false,
        })),

      clearChat: () => 
        set({ messages: [], streamBuffer: '', isStreaming: false }),

      startGateway: async () => {
        set({ gatewayProcess: 'starting' });
        const success = await startGatewayProcess();
        set({ gatewayProcess: success ? 'running' : 'error' });
        if (success) {
          get().checkConnection();
        }
        return success;
      },

      stopGateway: async () => {
        const success = await stopGatewayProcess();
        set({ gatewayProcess: success ? 'stopped' : 'error' });
        if (success) {
          set({ status: { online: false, url: get().status.url } });
        }
        return success;
      },

      refreshGatewayStatus: async () => {
        const status: GatewayStatus = await getGatewayStatus();
        set({
          gatewayProcess: status === 'running' ? 'running' : status === 'error' ? 'error' : 'stopped',
        });
      },

      setActiveConversation: (id) => {
        const s = get();
        if (s.conversations[id]) {
          set({ 
            activeConversationId: id,
            messages: s.conversations[id].messages 
          });
        }
      },

      createConversation: () => {
        const id = Date.now().toString();
        const newConv: Conversation = { id, title: 'New Chat', messages: [], updatedAt: Date.now() };
        set((s) => ({
          conversations: { ...s.conversations, [id]: newConv },
          activeConversationId: id,
          messages: [],
        }));
      },

      deleteConversation: (id) => {
        set((s) => {
          const updated = { ...s.conversations };
          delete updated[id];
          const nextId = Object.keys(updated)[0] || null;
          return {
            conversations: updated,
            activeConversationId: nextId,
            messages: nextId ? updated[nextId].messages : [],
          };
        });
      },

      setActiveRun: (runId) => {
        set({ activeRunId: runId, toolCalls: [] });
      },

      submitRun: async (input: string) => {
        const s = get();
        if (s.isStreaming || !s.status.online) return;

        const userMsg: ChatMessage = { role: 'user', content: input };
        s.addMessage(userMsg);
        set({ isStreaming: true });

        try {
          const { startRun, subscribeToRun } = await import('../services/hermesClient');
          const { runId } = await startRun(input, { model: s.activeModel });
          s.setActiveRun(runId);
          
          const unsubscribe = subscribeToRun(runId);
          set({ activeRunSubscription: unsubscribe });
        } catch (err) {
          set({ isStreaming: false });
          s.addMessage({
            role: 'assistant',
            content: `⚠️ Error: ${err instanceof Error ? err.message : 'Failed to start run'}`,
          });
        }
      },

      cancelRun: () => {
        const s = get();
        if (s.activeRunSubscription) {
          s.activeRunSubscription();
          set({ activeRunSubscription: null, isStreaming: false, activeRunId: null });
        }
      },

      initEventBusListener: () => {
        hermesEventBus.subscribe('tool.started', (e) => {
          set((s) => ({
            toolCalls: [...s.toolCalls, { id: e.payload.tool, name: e.payload.tool, status: 'running', input: e.payload.preview }],
          }));
        });

        hermesEventBus.subscribe('tool.completed', (e) => {
          set((s) => ({
            toolCalls: s.toolCalls.map((tc) => 
              tc.name === e.payload.tool 
                ? { ...tc, status: e.payload.error ? 'error' : 'completed', duration: e.payload.duration, error: e.payload.error }
                : tc
            ),
          }));
        });

        hermesEventBus.subscribe('message.delta', (e) => {
          if (!get().isStreaming) set({ isStreaming: true });
          get().appendStreamChunk(e.payload.delta);
        });

        hermesEventBus.subscribe('run.completed', () => {
          get().finalizeStream();
          get().cancelRun();
          const s = get();
          if (s.activeConversationId) {
            set((state) => ({
              conversations: {
                ...state.conversations,
                [state.activeConversationId!]: {
                  ...state.conversations[state.activeConversationId!],
                  messages: state.messages,
                  updatedAt: Date.now(),
                }
              }
            }));
          }
        });

        hermesEventBus.subscribe('run.failed', (e) => {
          get().finalizeStream();
          get().addMessage({ role: 'assistant', content: `[Run Failed] ${e.payload.error}` });
          get().cancelRun();
        });
      },
    }),
    {
      name: 'hermes-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        messages: state.messages,
        activeModel: state.activeModel,
      }),
    }
  )
);

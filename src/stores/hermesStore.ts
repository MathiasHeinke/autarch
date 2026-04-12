import { create } from 'zustand';
import { checkHermesHealth, type HermesStatus, type ChatMessage } from '../services/hermesClient';

interface HermesState {
  // Connection
  status: HermesStatus;
  polling: boolean;
  
  // Chat
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
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useHermesStore = create<HermesState>((set, get) => ({
  status: { online: false, url: 'http://localhost:8642' },
  polling: false,
  messages: [],
  isStreaming: false,
  streamBuffer: '',

  checkConnection: async () => {
    const status = await checkHermesHealth();
    set({ status });
  },

  startPolling: () => {
    if (get().polling) return;
    set({ polling: true });
    
    // Immediate check
    get().checkConnection();
    
    // Then every 5 seconds
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
    set((s) => ({ messages: [...s.messages, msg] })),

  setStreaming: (streaming) => 
    set({ isStreaming: streaming }),

  appendStreamChunk: (chunk) => 
    set((s) => ({ streamBuffer: s.streamBuffer + chunk })),

  finalizeStream: () => 
    set((s) => ({
      messages: [...s.messages, { role: 'assistant' as const, content: s.streamBuffer }],
      streamBuffer: '',
      isStreaming: false,
    })),

  clearChat: () => 
    set({ messages: [], streamBuffer: '', isStreaming: false }),
}));

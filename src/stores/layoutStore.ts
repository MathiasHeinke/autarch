import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AuxContent = 'files' | 'artifacts' | 'agents' | 'logs' | null;
type ContextView = string; // e.g. 'explorer', 'chat', 'search', etc.
export type IdeMode = 'standard' | 'agentic';

interface LayoutState {
  activeTab: string;
  activeContextView: ContextView;
  contextPanelOpen: boolean;
  auxPanelOpen: boolean;
  auxPanelContent: AuxContent;
  mode: IdeMode;
  agenticPanelSizes: Record<string, number>; // Sizes for the 3 panels

  setActiveTab: (tab: string) => void;
  setActiveContextView: (view: ContextView) => void;
  toggleContextPanel: () => void;
  toggleAuxPanel: (content?: AuxContent) => void;
  closeAuxPanel: () => void;
  setMode: (mode: IdeMode) => void;
  setAgenticPanelSizes: (sizes: Record<string, number>) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      activeTab: 'ide',
      activeContextView: 'explorer',
      contextPanelOpen: true,
      auxPanelOpen: false,
      auxPanelContent: null,
      mode: 'standard',
      agenticPanelSizes: { fleet: 25, chat: 50, feed: 25 },

      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setActiveContextView: (view) => set({ activeContextView: view }),

      toggleContextPanel: () =>
        set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),

      toggleAuxPanel: (content) =>
        set((s) => {
          if (s.auxPanelOpen && s.auxPanelContent === content) {
            return { auxPanelOpen: false, auxPanelContent: null };
          }
          return { auxPanelOpen: true, auxPanelContent: content ?? 'files' };
        }),

      closeAuxPanel: () => set({ auxPanelOpen: false, auxPanelContent: null }),
      
      setMode: (mode) => set({ mode }),
      
      setAgenticPanelSizes: (sizes) => set({ agenticPanelSizes: sizes }),
    }),
    {
      name: 'autarch-layout-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        mode: state.mode,
        agenticPanelSizes: state.agenticPanelSizes
      }),
    }
  )
);

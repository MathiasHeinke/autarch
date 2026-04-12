import { create } from 'zustand';

type AuxContent = 'files' | 'artifacts' | 'agents' | 'logs' | null;
type ContextView = string; // e.g. 'explorer', 'chat', 'search', etc.

interface LayoutState {
  activeTab: string;
  activeContextView: ContextView;
  contextPanelOpen: boolean;
  auxPanelOpen: boolean;
  auxPanelContent: AuxContent;
  setActiveTab: (tab: string) => void;
  setActiveContextView: (view: ContextView) => void;
  toggleContextPanel: () => void;
  toggleAuxPanel: (content?: AuxContent) => void;
  closeAuxPanel: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  activeTab: 'ide',
  activeContextView: 'explorer',
  contextPanelOpen: true,
  auxPanelOpen: false,
  auxPanelContent: null,

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
}));

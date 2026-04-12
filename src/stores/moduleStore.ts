import { create } from 'zustand';
import { 
  type ModuleId, 
  type ModuleInfo, 
  type InstallProgress,
  detectAllModules, 
  installZed, 
  installHermes,
} from '../services/moduleInstaller';

interface ModuleState {
  // Module registry
  modules: Record<ModuleId, ModuleInfo>;
  
  // Installation state
  installing: ModuleId | null;
  progress: InstallProgress | null;
  
  // Actions
  detectAll: () => Promise<void>;
  installModule: (id: ModuleId) => Promise<void>;
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: {
    hermes: { id: 'hermes', name: 'Hermes Agent', status: 'checking' },
    zed: { id: 'zed', name: 'Zed Editor', status: 'checking' },
    monaco: { id: 'monaco', name: 'Monaco Editor', status: 'installed', version: 'built-in', path: 'embedded' },
  },
  installing: null,
  progress: null,

  detectAll: async () => {
    const detected = await detectAllModules();
    set({ modules: detected });
  },

  installModule: async (id: ModuleId) => {
    const { installing } = get();
    if (installing) return; // Prevent concurrent installs

    set({ installing: id, progress: null });

    const opts = {
      onProgress: (p: InstallProgress) => set({ progress: p }),
      onComplete: (info: ModuleInfo) => {
        set((state) => ({
          modules: { ...state.modules, [id]: info },
          installing: null,
          progress: null,
        }));
      },
      onError: (error: string) => {
        set((state) => ({
          modules: { 
            ...state.modules, 
            [id]: { ...state.modules[id], status: 'error' as const, error },
          },
          installing: null,
        }));
      },
    };

    try {
      switch (id) {
        case 'zed':
          await installZed(opts);
          break;
        case 'hermes':
          await installHermes(opts);
          break;
        default:
          opts.onError?.(`No installer available for ${id}`);
      }
    } catch (err) {
      opts.onError?.(String(err));
    }
  },
}));

import { create } from 'zustand';
import { readDir, readTextFile, writeTextFile, mkdir, remove } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
}

interface EditorState {
  workspaceRoot: string | null;
  fileTree: FileNode[];
  activeFilePath: string | null;
  openFiles: string[];
  fileContents: Record<string, string>;
  hasUnsavedChanges: Record<string, boolean>;
  
  openWorkspace: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  setActiveFile: (path: string) => void;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  saveFile: (path: string) => Promise<void>;
  createFile: (path: string) => Promise<void>;
  createDirectory: (path: string) => Promise<void>;
  deleteEntry: (path: string) => Promise<void>;
}

async function buildFileTree(path: string, name: string): Promise<FileNode> {
  try {
    const entries = await readDir(path);
    const children: FileNode[] = [];
    
    for (const entry of entries) {
      if (entry.name && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'target') {
        const fullPath = `${path}/${entry.name}`;
        if (entry.isDirectory) {
          children.push(await buildFileTree(fullPath, entry.name));
        } else {
          children.push({ name: entry.name, path: fullPath, type: 'file' });
        }
      }
    }
    
    return { name, path, type: 'directory', children: children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    }) };
  } catch (err) {
    console.error('Failed to read directory:', err);
    return { name, path, type: 'directory', children: [] };
  }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  workspaceRoot: null,
  fileTree: [],
  activeFilePath: null,
  openFiles: [],
  fileContents: {},
  hasUnsavedChanges: {},

  openWorkspace: async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === 'string') {
        set({ workspaceRoot: selected, fileTree: [], openFiles: [], activeFilePath: null, fileContents: {}, hasUnsavedChanges: {} });
        await get().refreshWorkspace();
      }
    } catch (e) {
      console.error('[EditorStore] Failed to open workspace:', e);
      window.alert(`[Dialog Error] Could not open dialog API. Check capabilities or try again. Details: ${e instanceof Error ? e.message : JSON.stringify(e)}`);
    }
  },

  refreshWorkspace: async () => {
    const root = get().workspaceRoot;
    if (!root) return;
    try {
      const folderName = root.split('/').pop() || 'Workspace';
      const rootNode = await buildFileTree(root, folderName);
      set({ fileTree: rootNode.children || [] });
    } catch(err) {
      console.error("Workspace refresh error", err);
    }
  },

  setActiveFile: (path) => set({ activeFilePath: path }),
  
  openFile: async (path) => {
    const state = get();
    if (!state.fileContents[path]) {
      try {
        const content = await readTextFile(path);
        set((s) => ({ fileContents: { ...s.fileContents, [path]: content }, hasUnsavedChanges: { ...s.hasUnsavedChanges, [path]: false } }));
      } catch (err) {
        console.error('Failed to read file:', err);
        return;
      }
    }
    
    set((s) => ({
      openFiles: s.openFiles.includes(path) ? s.openFiles : [...s.openFiles, path],
      activeFilePath: path,
    }));
  },
  
  closeFile: (path) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f !== path);
    return {
      openFiles: newOpenFiles,
      activeFilePath: state.activeFilePath === path ? (newOpenFiles[newOpenFiles.length - 1] || null) : state.activeFilePath
    };
  }),

  updateFileContent: (path, content) => {
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
      hasUnsavedChanges: { ...state.hasUnsavedChanges, [path]: true }
    }));
  },
  
  saveFile: async (path) => {
    const content = get().fileContents[path];
    if (content !== undefined) {
      try {
        await writeTextFile(path, content);
        set((state) => ({
          hasUnsavedChanges: { ...state.hasUnsavedChanges, [path]: false }
        }));
      } catch (err) {
        console.error('Failed to save file:', err);
      }
    }
  },

  createFile: async (path) => {
    try {
      await writeTextFile(path, '');
      await get().refreshWorkspace();
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  },

  createDirectory: async (path) => {
    try {
      await mkdir(path);
      await get().refreshWorkspace();
    } catch (err) {
      console.error('Failed to create dir:', err);
    }
  },

  deleteEntry: async (path) => {
    try {
      await remove(path, { recursive: true });
      await get().refreshWorkspace();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }
}));

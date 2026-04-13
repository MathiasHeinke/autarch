import { create } from 'zustand';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
}

interface EditorState {
  fileTree: FileNode[];
  activeFilePath: string | null;
  openFiles: string[];
  fileContents: Record<string, string>;
  
  setActiveFile: (path: string) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  fileTree: [
    {
      name: 'src',
      path: '/src',
      type: 'directory',
      children: [
        { name: 'App.tsx', path: '/src/App.tsx', type: 'file', language: 'typescript' },
        { name: 'main.tsx', path: '/src/main.tsx', type: 'file', language: 'typescript' },
        { 
          name: 'components', 
          path: '/src/components', 
          type: 'directory',
          children: [
            { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file', language: 'typescript' }
          ]
        }
      ]
    },
    { name: 'package.json', path: '/package.json', type: 'file', language: 'json' },
    { name: 'README.md', path: '/README.md', type: 'file', language: 'markdown' }
  ],
  activeFilePath: '/src/App.tsx',
  openFiles: ['/src/App.tsx'],
  fileContents: {
    '/src/App.tsx': 'export default function App() {\n  return <div>Hello Autarch</div>;\n}',
    '/src/main.tsx': 'import { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")).render(<App />);',
    '/src/components/Button.tsx': 'export function Button({ children }) {\n  return <button className="btn">{children}</button>;\n}',
    '/package.json': '{\n  "name": "autarch",\n  "version": "1.0.0"\n}',
    '/README.md': '# Autarch OS\n\nThe intelligent IDE for agentic engineering.'
  },

  setActiveFile: (path) => set({ activeFilePath: path }),
  openFile: (path) => set((state) => ({
    openFiles: state.openFiles.includes(path) ? state.openFiles : [...state.openFiles, path],
    activeFilePath: path,
  })),
  closeFile: (path) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f !== path);
    return {
      openFiles: newOpenFiles,
      activeFilePath: state.activeFilePath === path ? (newOpenFiles[newOpenFiles.length - 1] || null) : state.activeFilePath
    };
  }),
  updateFileContent: (path, content) => set((state) => ({
    fileContents: { ...state.fileContents, [path]: content }
  }))
}));

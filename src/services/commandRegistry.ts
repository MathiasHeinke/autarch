import type { LucideIcon } from 'lucide-react';
import {
  FolderTree,
  Search,
  GitBranch,
  MessageSquare,
  Settings,
  Key,
  Server,
  Zap,
  TerminalSquare,
  FileText,
  Layout,
  Database,
  Wrench,
  Eye,
} from 'lucide-react';
import { useLayoutStore } from '../stores/layoutStore';
import { useEditorStore, type FileNode } from '../stores/editorStore';

// ─── Types ──────────────────────────────────────────────────

export type CommandCategory = 'action' | 'file' | 'navigation' | 'setting' | 'agent';

export interface CommandEntry {
  id: string;
  label: string;
  category: CommandCategory;
  icon: LucideIcon;
  shortcut?: string;
  keywords: string[];
  action: () => void;
}

// ─── Fuzzy Search Score ─────────────────────────────────────

export function fuzzyScore(query: string, label: string, keywords: string[]): number {
  const q = query.toLowerCase();
  const l = label.toLowerCase();

  // Exact match → highest score
  if (l === q) return 1000;

  // Starts with → very high
  if (l.startsWith(q)) return 800;

  // Contains → high
  if (l.includes(q)) return 600;

  // Keyword match
  for (const kw of keywords) {
    if (kw.toLowerCase().includes(q)) return 400;
  }

  // Fuzzy character match (all chars in order)
  let qi = 0;
  for (let i = 0; i < l.length && qi < q.length; i++) {
    if (l[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 200;

  return 0; // no match
}

// ─── Static Commands ────────────────────────────────────────

let staticCommandsCache: CommandEntry[] | null = null;

function getStaticCommands(): CommandEntry[] {
  if (staticCommandsCache) return staticCommandsCache;

  staticCommandsCache = [
    // Navigation
    {
      id: 'nav:ide',
      label: 'Go to IDE',
      category: 'navigation',
      icon: Layout,
      shortcut: '⌘1',
      keywords: ['editor', 'code', 'ide'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('ide'); 
        layout.setActiveContextView('explorer'); 
      },
    },
    {
      id: 'nav:explorer',
      label: 'Go to Explorer',
      category: 'navigation',
      icon: FolderTree,
      keywords: ['files', 'tree', 'workspace'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('ide'); 
        layout.setActiveContextView('explorer'); 
      },
    },
    {
      id: 'nav:search',
      label: 'Go to Search',
      category: 'navigation',
      icon: Search,
      keywords: ['find', 'grep', 'search'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('ide'); 
        layout.setActiveContextView('search'); 
      },
    },
    {
      id: 'nav:git',
      label: 'Go to Source Control',
      category: 'navigation',
      icon: GitBranch,
      keywords: ['git', 'commit', 'branch', 'version'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('ide'); 
        layout.setActiveContextView('git'); 
      },
    },
    {
      id: 'nav:chat',
      label: 'Go to Agent Chat',
      category: 'navigation',
      icon: MessageSquare,
      keywords: ['hermes', 'ai', 'agent', 'chat'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('ide'); 
        layout.setActiveContextView('chat'); 
      },
    },
    {
      id: 'nav:agents',
      label: 'Go to Agents',
      category: 'navigation',
      icon: Zap,
      keywords: ['fleet', 'agents', 'swarm'],
      action: () => useLayoutStore.getState().setActiveTab('agents'),
    },
    {
      id: 'nav:settings',
      label: 'Go to Settings',
      category: 'navigation',
      icon: Settings,
      keywords: ['config', 'preferences'],
      action: () => useLayoutStore.getState().setActiveTab('settings'),
    },
    {
      id: 'nav:api-keys',
      label: 'Go to API Keys',
      category: 'setting',
      icon: Key,
      keywords: ['keychain', 'secrets', 'api'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('settings'); 
        layout.setActiveContextView('keys'); 
      },
    },
    {
      id: 'nav:mcp',
      label: 'Go to MCP Config',
      category: 'setting',
      icon: Server,
      keywords: ['mcp', 'server', 'tools'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('settings'); 
        layout.setActiveContextView('mcp'); 
      },
    },
    {
      id: 'nav:memory',
      label: 'Go to Memory Bank',
      category: 'agent',
      icon: Database,
      keywords: ['memory', 'context', 'knowledge'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('agents'); 
        layout.setActiveContextView('memory'); 
      },
    },
    {
      id: 'nav:skills',
      label: 'Go to Skills Registry',
      category: 'agent',
      icon: Wrench,
      keywords: ['skills', 'tools', 'capabilities'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('agents'); 
        layout.setActiveContextView('skills'); 
      },
    },

    // Actions
    {
      id: 'action:open-folder',
      label: 'Open Folder...',
      category: 'action',
      icon: FolderTree,
      shortcut: '⌘O',
      keywords: ['open', 'workspace', 'directory'],
      action: () => useEditorStore.getState().openWorkspace(),
    },
    {
      id: 'action:toggle-terminal',
      label: 'Toggle Terminal',
      category: 'action',
      icon: TerminalSquare,
      shortcut: '⌘`',
      keywords: ['terminal', 'console', 'shell', 'pty'],
      action: () => { 
        const layout = useLayoutStore.getState();
        layout.setActiveTab('ide'); 
        layout.setActiveContextView('explorer'); 
      },
    },
    {
      id: 'action:toggle-mode',
      label: 'Switch to Agentic Mode',
      category: 'action',
      icon: Eye,
      keywords: ['agentic', 'mode', 'standard', 'switch'],
      action: () => {
        const layout = useLayoutStore.getState();
        layout.setMode(layout.mode === 'standard' ? 'agentic' : 'standard');
      },
    },
  ];

  return staticCommandsCache;
}

// ─── Dynamic File Commands ──────────────────────────────────

let cachedFileCommands: CommandEntry[] = [];
let lastFileTreeRef: FileNode[] | null = null;
let lastWorkspaceRoot: string | null = null;

function getFileCommands(): CommandEntry[] {
  const { fileTree, workspaceRoot } = useEditorStore.getState();
  if (!workspaceRoot || !fileTree.length) return [];

  // Return cached result if the fileTree reference guarantees no changes.
  if (fileTree === lastFileTreeRef && workspaceRoot === lastWorkspaceRoot) {
    return cachedFileCommands;
  }

  const commands: CommandEntry[] = [];

  function flatten(nodes: FileNode[], depth = 0) {
    for (const node of nodes) {
      if (node.type === 'file' && depth < 6) {
        const relativePath = node.path.startsWith(workspaceRoot!)
          ? node.path.substring(workspaceRoot!.length + 1)
          : node.name;
        commands.push({
          id: `file:${node.path}`,
          label: relativePath,
          category: 'file',
          icon: FileText,
          keywords: [node.name, relativePath],
          action: () => useEditorStore.getState().openFile(node.path),
        });
      }
      if (node.children && depth < 6) {
        flatten(node.children, depth + 1);
      }
    }
  }

  flatten(fileTree);
  cachedFileCommands = commands.slice(0, 2000); // cap at 2000 files instead of 200
  lastFileTreeRef = fileTree;
  lastWorkspaceRoot = workspaceRoot;

  return cachedFileCommands;
}

// ─── Public API ─────────────────────────────────────────────

export function getAllCommands(): CommandEntry[] {
  return [...getStaticCommands(), ...getFileCommands()];
}

export function searchCommands(query: string, mode: 'commands' | 'files' = 'commands'): CommandEntry[] {
  let commands = getAllCommands();

  // Filter by mode
  if (mode === 'files') {
    commands = commands.filter(c => c.category === 'file');
  }

  if (!query.trim()) {
    // No query: show static commands first, then files
    if (mode === 'files') return commands.slice(0, 8);
    return commands.filter(c => c.category !== 'file').slice(0, 8);
  }

  // Score and sort
  const scored = commands
    .map(cmd => ({ cmd, score: fuzzyScore(query, cmd.label, cmd.keywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map(s => s.cmd);
}

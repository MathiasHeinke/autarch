import { create } from 'zustand';

// ── Types ────────────────────────────────────────────────────

export type InstallPhase = 'idle' | 'installing' | 'setup-wizard' | 'provisioning' | 'done' | 'error';

export type PtyWriteFn = ((data: string) => void) | null;

export interface TerminalTab {
  id: string;
  title: string;
}

interface TerminalState {
  tabs: TerminalTab[];
  activeTabId: string | null;

  shellReady: boolean;
  ptyWriteFn: PtyWriteFn;

  hermesInstalled: boolean;
  installPhase: InstallPhase;
  installError: string | null;

  createTab: () => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTabId: (id: string) => void;

  setShellReady: (ready: boolean) => void;
  setPtyWriteFn: (fn: PtyWriteFn) => void;

  injectCommand: (cmd: string) => void;
  handlePtyOutput: (text: string) => void;
  
  checkHermesInstalled: () => Promise<void>;
  installHermes: () => void;
}

// ── Hermes Configuration ─────────────────────────────────────
const HERMES_INSTALLER_URL = 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh';
const HERMES_INSTALL_CMD = [
  `curl -fsSL -o /tmp/hermes-install.sh "${HERMES_INSTALLER_URL}"`,
  '&& bash /tmp/hermes-install.sh',
  '&& rm -f /tmp/hermes-install.sh',
].join(' ');

const SETUP_WIZARD_PATTERNS = ['hermes setup', 'Configuration wizard', 'Select a provider', 'Enter your API key', 'Setup wizard'];
const INSTALL_DONE_PATTERNS = ['Setup complete', 'Installation complete', 'hermes is ready', 'Successfully installed'];
const INSTALL_ERROR_PATTERNS = ['error:', 'Error:', 'fatal:', 'Failed to', 'command not found', 'Permission denied'];

// ── Session Map ──────────────────────────────────────────────

export interface PtySessionState {
  id: string;
  process: any | null;
  buffer: Uint8Array[];
  subscribers: Set<(data: Uint8Array) => void>;
  mockMode: boolean;
  mockInputBuffer: string;
  writeFn: PtyWriteFn;
  shellReady: boolean;
}

const ptySessions = new Map<string, PtySessionState>();
let tabCounter = 1;

function getSession(id: string): PtySessionState {
  if (!ptySessions.has(id)) {
    ptySessions.set(id, {
      id,
      process: null,
      buffer: [],
      subscribers: new Set(),
      mockMode: false,
      mockInputBuffer: '',
      writeFn: null,
      shellReady: false,
    });
  }
  return ptySessions.get(id)!;
}

function updateGlobalStateFromSession(id: string) {
  const session = ptySessions.get(id);
  if (!session) return;
  useTerminalStore.getState().setShellReady(session.shellReady);
  useTerminalStore.getState().setPtyWriteFn(session.writeFn);
}

// ── Global PTY Functions ─────────────────────────────────────

export async function initPty(id: string) {
  const session = getSession(id);
  if (session.process || session.mockMode) return;
  
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  const enableMockTerminal = (reason: string) => {
    console.warn(`[Terminal] ${reason}. Booting Mock Terminal for ${id}.`);
    session.mockMode = true;
    session.shellReady = true;
    
    const sendOutput = (str: string) => {
      const msg = new TextEncoder().encode(str);
      session.buffer.push(msg);
      session.subscribers.forEach(cb => cb(msg));
      useTerminalStore.getState().handlePtyOutput(str);
    };

    sendOutput(`\r\n\x1b[1;36m[Autarch OS]\x1b[0m Browser Sandbox Mode Activated (${reason})\r\n`);
    sendOutput('\x1b[1;32mautarch@browser:~$\x1b[0m ');

    session.writeFn = (data: string) => {
      if (data.endsWith('\r')) {
        const payload = data.slice(0, -1);
        if (payload) { session.mockInputBuffer += payload; sendOutput(payload); }
        sendOutput('\r\n');
        const cmd = session.mockInputBuffer.trim();
        if (cmd === 'help') {
           sendOutput('Sandbox commands: help, ls, clear\r\n');
        } else if (cmd === 'ls') {
           sendOutput('bin  etc  home  lib  opt  sys  usr  var\r\n');
        } else if (cmd === 'clear') {
           session.buffer = [];
           sendOutput('\x1bc');
        } else if (cmd.startsWith('curl')) {
           sendOutput('Downloading...\r\n[OK] Hermes Mock Installer\r\n');
           setTimeout(() => sendOutput('Installation complete\r\n'), 1000);
        } else if (cmd.length > 0) {
           sendOutput(`zsh: command not found: ${cmd}\r\n`);
        }
        session.mockInputBuffer = '';
        sendOutput('\x1b[1;32mautarch@browser:~$\x1b[0m ');
      } else if (data === '\x7f' || data === '\b') {
        if (session.mockInputBuffer.length > 0) {
           session.mockInputBuffer = session.mockInputBuffer.slice(0, -1);
           sendOutput('\b \b');
        }
      } else {
         session.mockInputBuffer += data;
         sendOutput(data);
      }
    };

    if (useTerminalStore.getState().activeTabId === id) updateGlobalStateFromSession(id);
  };

  if (!isTauri) {
    enableMockTerminal('Not running in Tauri');
    return;
  }

  try {
    const { spawn } = await import('tauri-pty');
    session.process = await spawn('zsh', [], {
      cols: 80,
      rows: 24,
      env: {}
    });

    session.writeFn = (data: string) => {
      session.process?.write(data);
    };

    session.process.onData((data: Uint8Array) => {
      session.buffer.push(data);
      if (session.buffer.length > 1000) session.buffer.shift();
      session.subscribers.forEach(cb => cb(data));
      const text = new TextDecoder().decode(data);
      useTerminalStore.getState().handlePtyOutput(text);
    });

    session.process.onExit(({ exitCode }: { exitCode: number }) => {
      session.process = null;
      session.shellReady = false;
      session.writeFn = null;
      const msg = new TextEncoder().encode(`\r\n\x1b[1;33m⚠ Shell exited (code ${exitCode}).\x1b[0m\r\n  Press any key to restart the shell.\r\n`);
      session.buffer.push(msg);
      session.subscribers.forEach(cb => cb(msg));
      if (useTerminalStore.getState().activeTabId === id) updateGlobalStateFromSession(id);
    });

    session.shellReady = true;
    if (useTerminalStore.getState().activeTabId === id) updateGlobalStateFromSession(id);
  } catch (err) {
    enableMockTerminal('Tauri PTY Spawn Failed');
  }
}

export function subscribeToPty(id: string, cb: (data: Uint8Array) => void) {
  const session = getSession(id);
  session.subscribers.add(cb);
  return () => session.subscribers.delete(cb);
}

export function getPtyBuffer(id: string) {
  return getSession(id).buffer;
}

export function resizePty(id: string, cols: number, rows: number) {
  const session = getSession(id);
  if (session.process) session.process.resize(cols, rows);
}

export function clearTerminalOutput(id: string) {
  const session = getSession(id);
  session.buffer = [];
  const msg = new TextEncoder().encode('\x1b[2J\x1b[3J\x1b[H');
  session.subscribers.forEach(cb => cb(msg));
}

export function killAndRestartPty(id: string) {
  const session = getSession(id);
  if (session.process) {
    try { session.process.write('\x03\x04'); } catch {}
    session.process = null;
  }
  session.shellReady = false;
  session.writeFn = null;
  session.mockMode = false;
  clearTerminalOutput(id);
  if (useTerminalStore.getState().activeTabId === id) updateGlobalStateFromSession(id);
  setTimeout(() => initPty(id), 100);
}

// ── Store ────────────────────────────────────────────────────

export const useTerminalStore = create<TerminalState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  shellReady: false,
  ptyWriteFn: null,
  hermesInstalled: false,
  installPhase: 'idle',
  installError: null,

  createTab: async () => {
    const id = `term-${tabCounter++}`;
    get().setActiveTabId(id);
    set((state) => ({ tabs: [...state.tabs, { id, title: `zsh` }] }));
    await initPty(id);
  },

  closeTab: (id) => {
    const session = getSession(id);
    if (session.process) {
      try { session.process.write('\x03\x04'); } catch {}
    }
    ptySessions.delete(id);
    
    set((state) => {
      const tabs = state.tabs.filter(t => t.id !== id);
      const nextActiveId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
      return { tabs, activeTabId: nextActiveId };
    });
    
    const activeId = get().activeTabId;
    if (activeId) updateGlobalStateFromSession(activeId);
    else set({ shellReady: false, ptyWriteFn: null });
  },

  setActiveTabId: (id) => {
    set({ activeTabId: id });
    updateGlobalStateFromSession(id);
  },

  setShellReady: (ready) => {
    set({ shellReady: ready });
    if (ready) get().checkHermesInstalled();
  },

  setPtyWriteFn: (fn) => set({ ptyWriteFn: fn }),

  injectCommand: (cmd) => {
    const { ptyWriteFn, shellReady } = get();
    if (!shellReady || !ptyWriteFn) return;
    ptyWriteFn(cmd + '\r');
  },

  handlePtyOutput: (text) => {
    const { installPhase } = get();
    if (installPhase !== 'installing' && installPhase !== 'setup-wizard') return;

    if (installPhase === 'installing' && SETUP_WIZARD_PATTERNS.some(p => text.includes(p))) {
      set({ installPhase: 'setup-wizard' });
      return;
    }

    if (INSTALL_DONE_PATTERNS.some(p => text.includes(p))) {
      set({ installPhase: 'provisioning', hermesInstalled: true });
      import('../services/hermesProvisioner').then(({ applyHermesKit }) => {
        applyHermesKit().then(() => set({ installPhase: 'done' })).catch(() => set({ installPhase: 'done' }));
      });
      return;
    }

    if (installPhase === 'installing' && INSTALL_ERROR_PATTERNS.some(p => text.includes(p))) {
      console.warn('[TerminalStore] Possible install error detected:', text.slice(0, 200));
    }
  },

  checkHermesInstalled: async () => {
    try {
      const { Command } = await import('@tauri-apps/plugin-shell');
      const result = await Command.create('sh', ['-c', 'test -d "$HOME/.hermes/hermes-agent" && echo "INSTALLED" || echo "NOT_INSTALLED"']).execute();
      const installed = result.stdout.trim() === 'INSTALLED';
      set({ hermesInstalled: installed });
      if (installed) set({ installPhase: 'done' });
    } catch {
      set({ hermesInstalled: false });
    }
  },

  installHermes: () => {
    const { shellReady, ptyWriteFn, installPhase } = get();
    if (installPhase === 'installing' || installPhase === 'setup-wizard') return;

    if (!shellReady || !ptyWriteFn) {
      set({ installPhase: 'error', installError: 'Terminal shell is not ready.' });
      return;
    }

    const confirmed = window.confirm('Download and execute official Hermes Agent installer from NousResearch?');
    if (!confirmed) return;

    set({ installPhase: 'installing', installError: null });
    ptyWriteFn(HERMES_INSTALL_CMD + '\r');

    let pollCount = 0;
    const pollInstall = setInterval(async () => {
      pollCount++;
      const currentPhase = get().installPhase;
      if (currentPhase === 'done' || currentPhase === 'provisioning') { clearInterval(pollInstall); return; }

      await get().checkHermesInstalled();
      if (get().hermesInstalled) {
        clearInterval(pollInstall);
        if (get().installPhase === 'installing') {
          set({ installPhase: 'provisioning' });
          import('../services/hermesProvisioner').then(({ applyHermesKit }) => {
            applyHermesKit().then(() => set({ installPhase: 'done' })).catch(() => set({ installPhase: 'done' }));
          });
        }
      } else if (pollCount >= 60) {
        clearInterval(pollInstall);
      }
    }, 10_000);
  },
}));

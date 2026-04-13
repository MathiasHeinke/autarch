import { create } from 'zustand';

// ── Types ────────────────────────────────────────────────────

export type InstallPhase = 'idle' | 'installing' | 'setup-wizard' | 'provisioning' | 'done' | 'error';

type PtyWriteFn = ((data: string) => void) | null;

interface TerminalState {
  // PTY State
  shellReady: boolean;
  ptyWriteFn: PtyWriteFn;

  // Hermes Engine State
  hermesInstalled: boolean;
  installPhase: InstallPhase;
  installError: string | null;

  // PTY Actions (called by Terminal.tsx)
  setShellReady: (ready: boolean) => void;
  setPtyWriteFn: (fn: PtyWriteFn) => void;

  // Command Injection API
  injectCommand: (cmd: string) => void;

  // Reactive Output Parser — called by Terminal.tsx on every PTY output chunk
  handlePtyOutput: (text: string) => void;

  // Hermes Install Actions
  checkHermesInstalled: () => Promise<void>;
  installHermes: () => void;
}

// ── Hermes Install Command ───────────────────────────────────
// This is the official NousResearch installer from:
// https://hermes-agent.nousresearch.com/docs/getting-started/installation
const HERMES_INSTALL_CMD =
  'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash';

// ── Reactive Output Parser Patterns ──────────────────────────
// 🧩 Event-driven state transitions based on actual PTY output
// instead of blind timers. These patterns match the official
// Hermes Agent installer output.
const SETUP_WIZARD_PATTERNS = [
  'hermes setup',
  'Configuration wizard',
  'Select a provider',
  'Enter your API key',
  'Setup wizard',
];
const INSTALL_DONE_PATTERNS = [
  'Setup complete',
  'Installation complete',
  'hermes is ready',
  'Successfully installed',
];
const INSTALL_ERROR_PATTERNS = [
  'error:',
  'Error:',
  'fatal:',
  'Failed to',
  'command not found',
  'Permission denied',
];

// ── Store ────────────────────────────────────────────────────

export const useTerminalStore = create<TerminalState>((set, get) => ({
  // ── Initial State ──
  shellReady: false,
  ptyWriteFn: null,
  hermesInstalled: false,
  installPhase: 'idle',
  installError: null,

  // ── PTY Lifecycle ──

  setShellReady: (ready) => {
    set({ shellReady: ready });
    // When shell becomes ready, auto-check if Hermes is installed
    if (ready) {
      get().checkHermesInstalled();
    }
  },

  setPtyWriteFn: (fn) => {
    set({ ptyWriteFn: fn });
  },

  // ── Command Injection ──

  injectCommand: (cmd: string) => {
    const { ptyWriteFn, shellReady } = get();
    if (!shellReady || !ptyWriteFn) {
      console.warn('[TerminalStore] Cannot inject command: shell not ready');
      return;
    }
    // Write command + carriage return to execute
    ptyWriteFn(cmd + '\r');
  },

  // ── 🧩 Reactive Output Parser ──
  // Analyzes PTY output in real-time during installation to trigger
  // state transitions based on actual shell events instead of blind timers.

  handlePtyOutput: (text: string) => {
    const { installPhase } = get();

    // Only parse during active installation phases
    if (installPhase !== 'installing' && installPhase !== 'setup-wizard') return;

    // Check for setup wizard start
    if (installPhase === 'installing') {
      const isWizard = SETUP_WIZARD_PATTERNS.some((p) => text.includes(p));
      if (isWizard) {
        set({ installPhase: 'setup-wizard' });
        return;
      }
    }

    // Check for installation completion
    const isDone = INSTALL_DONE_PATTERNS.some((p) => text.includes(p));
    if (isDone) {
      set({ installPhase: 'provisioning', hermesInstalled: true });
      // Trigger Autarch OS kit provisioning
      import('../services/hermesProvisioner').then(({ applyHermesKit }) => {
        applyHermesKit().then((kitResult) => {
          console.warn(`[TerminalStore] Kit provisioned: ${kitResult.applied.length} files`);
          set({ installPhase: 'done' });
        }).catch(() => {
          set({ installPhase: 'done' }); // Hermes still works vanilla
        });
      });
      return;
    }

    // Check for errors (only flag if we haven't transitioned yet)
    const isError = INSTALL_ERROR_PATTERNS.some((p) => text.includes(p));
    if (isError && installPhase === 'installing') {
      // Don't immediately error — curl output may contain "error" in logs.
      // Only set error if the pattern appears after initial download phase.
      // We log it but don't break the flow — the poll will verify later.
      console.warn('[TerminalStore] Possible install error detected:', text.slice(0, 200));
    }
  },

  // ── Hermes Detection ──

  checkHermesInstalled: async () => {
    try {
      const { Command } = await import('@tauri-apps/plugin-shell');
      const result = await Command.create('sh', [
        '-c',
        'test -d "$HOME/.hermes/hermes-agent" && echo "INSTALLED" || echo "NOT_INSTALLED"',
      ]).execute();

      const installed = result.stdout.trim() === 'INSTALLED';
      set({ hermesInstalled: installed });

      if (installed) {
        set({ installPhase: 'done' });
      }
    } catch {
      // Tauri shell not available (browser dev mode) — assume not installed
      console.warn('[TerminalStore] Shell check failed, assuming not installed');
      set({ hermesInstalled: false });
    }
  },

  // ── Hermes Installation ──

  installHermes: () => {
    const { shellReady, ptyWriteFn, installPhase } = get();

    if (installPhase === 'installing' || installPhase === 'setup-wizard') {
      console.warn('[TerminalStore] Installation already in progress');
      return;
    }

    if (!shellReady || !ptyWriteFn) {
      set({
        installPhase: 'error',
        installError: 'Terminal shell is not ready. Please wait for the terminal to initialize.',
      });
      return;
    }

    // W-07 FIX: Confirmation before executing remote script
    const confirmed = window.confirm(
      'This will download and execute the official Hermes Agent installer from NousResearch (github.com/NousResearch/hermes-agent).\n\nThe script will be executed in your terminal. Continue?'
    );
    if (!confirmed) return;

    set({ installPhase: 'installing', installError: null });

    // Inject the official NousResearch install command into the terminal
    ptyWriteFn(HERMES_INSTALL_CMD + '\r');

    // 🧩 The reactive output parser (handlePtyOutput) handles phase transitions
    // in real-time. The fallback poll below catches edge cases where patterns
    // may not match (e.g. non-standard installer output).

    // Fallback: Poll for installation completion (check every 10s, max 10min)
    // This is a safety net — the reactive parser should catch most transitions.
    let pollCount = 0;
    const maxPolls = 60; // 60 * 10s = 10 minutes
    const pollInstall = setInterval(async () => {
      pollCount++;
      const currentPhase = get().installPhase;

      // If reactive parser already moved us to 'done' or 'provisioning', stop polling
      if (currentPhase === 'done' || currentPhase === 'provisioning') {
        clearInterval(pollInstall);
        return;
      }

      // Filesystem check as backup verification
      await get().checkHermesInstalled();
      if (get().hermesInstalled) {
        clearInterval(pollInstall);
        // Only provision if reactive parser hasn't already done it
        if (get().installPhase === 'installing') {
          set({ installPhase: 'provisioning' });
          import('../services/hermesProvisioner').then(({ applyHermesKit }) => {
            applyHermesKit()
              .then(() => set({ installPhase: 'done' }))
              .catch(() => set({ installPhase: 'done' }));
          });
        } else {
          set({ installPhase: 'done' });
        }
      } else if (pollCount >= maxPolls) {
        clearInterval(pollInstall);
      }
    }, 10_000);
  },
}));

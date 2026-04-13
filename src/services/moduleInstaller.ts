/**
 * Module Installer Service
 * 
 * Handles auto-detection and installation of external tools
 * using their official installation methods.
 * 
 * Philosophy: AUTARCH orchestrates, never bundles.
 * We use the same install commands the tool creators recommend.
 * 
 * ┌──────────┬──────────────────────────────────────────────────────┐
 * │ Module   │ Install Method                                      │
 * ├──────────┼──────────────────────────────────────────────────────┤
 * │ Hermes   │ git clone + ./setup-hermes.sh (Python/uv)           │
 * │ Zed      │ brew install --cask zed  OR  zed.dev/install.sh     │
 * │ Monaco   │ Built-in (bundled with AUTARCH)                     │
 * └──────────┴──────────────────────────────────────────────────────┘
 */

// ─── Types ──────────────────────────────────────────────────────

export type ModuleId = 'hermes' | 'zed' | 'monaco';

export type InstallStatus = 
  | 'checking' 
  | 'installed' 
  | 'connected'
  | 'offline'
  | 'not-installed' 
  | 'installing' 
  | 'error';

export interface ModuleInfo {
  id: ModuleId;
  name: string;
  status: InstallStatus;
  path?: string;
  version?: string;
  error?: string;
}

export interface InstallProgress {
  moduleId: ModuleId;
  step: string;
  percent: number;
  output: string[];
}

// ─── Detection Paths ────────────────────────────────────────────

/**
 * Zed detection:
 * - Homebrew installs to /Applications/Zed.app
 * - Direct download also goes to /Applications/Zed.app
 * - CLI is at /usr/local/bin/zed (installed via Zed > Install CLI)
 */
const ZED_PATHS_MACOS = [
  '/Applications/Zed.app/Contents/MacOS/zed',
  '/Applications/Zed Preview.app/Contents/MacOS/zed',
  '/usr/local/bin/zed',
  '/opt/homebrew/bin/zed',
];

/**
 * Hermes detection:
 * - setup-hermes.sh symlinks to ~/.local/bin/hermes
 * - Source lives at ~/Developer/hermes-agent/
 * - The binary is actually a Python entrypoint via uv venv
 */

// ─── Dynamic Home Directory ─────────────────────────────────────

let _cachedHome: string | null = null;

async function getHomeDir(): Promise<string> {
  if (_cachedHome) return _cachedHome;
  try {
    const { Command } = await import('@tauri-apps/plugin-shell');
    const cmd = Command.create('sh', ['-c', 'echo $HOME']);
    const result = await cmd.execute();
    _cachedHome = result.stdout.trim() || '/tmp';
  } catch {
    _cachedHome = '/tmp';
  }
  return _cachedHome;
}

function getHermesSourceDir(home: string): string {
  return `${home}/Developer/hermes-agent`;
}

function getHermesPaths(home: string): string[] {
  const sourceDir = getHermesSourceDir(home);
  return [
    `${sourceDir}/venv/bin/hermes`,     // venv entrypoint (primary)
    `${home}/.local/bin/hermes`,         // symlink from setup script
    '/usr/local/bin/hermes',
    '/opt/homebrew/bin/hermes',
  ];
}

// Clone URL comes from active preset (configurable per deployment)
import { activePreset } from '../presets';
const getHermesCloneUrl = () => activePreset.hermesCloneUrl ?? 'https://github.com/autarch/hermes-agent.git';


// ─── Shell Execution Helper ─────────────────────────────────────

/**
 * Execute a shell command via Tauri's shell API.
 * Falls back to console warning in browser dev mode.
 */
async function execCommand(
  command: string, 
  args: string[],
  options?: { cwd?: string }
): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    // Tauri shell API (production + dev with Tauri)
    const { Command } = await import('@tauri-apps/plugin-shell');
    const cmd = Command.create(command, args, { cwd: options?.cwd });
    const result = await cmd.execute();
    return {
      code: result.code ?? -1,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch {
    // Fallback for pure browser dev mode (no Tauri runtime)
    console.warn(`[ModuleInstaller] Tauri shell not available, using fallback for: ${command} ${args.join(' ')}`);
    return { code: 1, stdout: '', stderr: 'Tauri shell not available in browser' };
  }
}

/**
 * Execute a shell script (bash -c "...").
 * Used for multi-step install commands.
 */
async function execScript(
  script: string,
  options?: { cwd?: string }
): Promise<{ code: number; stdout: string; stderr: string }> {
  return execCommand('bash', ['-c', script], options);
}

/**
 * Check if a file exists at the given path.
 */
async function fileExists(path: string): Promise<boolean> {
  const result = await execCommand('test', ['-f', path]);
  return result.code === 0;
}

/**
 * Check if a directory exists.
 */
async function dirExists(path: string): Promise<boolean> {
  const result = await execCommand('test', ['-d', path]);
  return result.code === 0;
}

/**
 * Run `which` to find a binary in PATH.
 */
async function whichBinary(name: string): Promise<string | null> {
  const result = await execCommand('which', [name]);
  if (result.code === 0 && result.stdout.trim()) {
    return result.stdout.trim();
  }
  return null;
}

// ─── Module Detection ───────────────────────────────────────────

/**
 * Auto-detect Zed installation.
 * 
 * Detection order:
 * 1. Check /Applications/Zed.app (macOS standard location)
 * 2. Check PATH for `zed` CLI
 * 3. Check Homebrew paths
 */
export async function detectZed(): Promise<ModuleInfo> {
  const base: ModuleInfo = { id: 'zed', name: 'Zed Editor', status: 'checking' };

  // Check known paths
  for (const path of ZED_PATHS_MACOS) {
    if (await fileExists(path)) {
      // Get version via CLI
      const vResult = await execCommand(path, ['--version']);
      return {
        ...base,
        status: 'installed',
        path,
        version: vResult.code === 0 ? vResult.stdout.trim().split('\n')[0] : undefined,
      };
    }
  }

  // Check PATH
  const whichPath = await whichBinary('zed');
  if (whichPath) {
    const vResult = await execCommand(whichPath, ['--version']);
    return {
      ...base,
      status: 'installed',
      path: whichPath,
      version: vResult.code === 0 ? vResult.stdout.trim().split('\n')[0] : undefined,
    };
  }

  return { ...base, status: 'not-installed' };
}

/**
 * Auto-detect Hermes installation.
 * 
 * Detection order:
 * 1. Check if venv/bin/hermes exists in the source dir (built from source)
 * 2. Check ~/.local/bin/hermes (symlink from setup-hermes.sh)
 * 3. Check PATH for `hermes`
 * 
 * Note: Hermes is a Python project. The "binary" is a Python entrypoint
 * installed via `uv sync` or `pip install -e .` inside a venv.
 * The setup script symlinks it to ~/.local/bin/hermes.
 */
export async function detectHermes(): Promise<ModuleInfo> {
  const base: ModuleInfo = { id: 'hermes', name: 'Hermes Agent', status: 'checking' };
  const home = await getHomeDir();
  const hermesPaths = getHermesPaths(home);
  const hermesSourceDir = getHermesSourceDir(home);

  // Check known paths
  for (const path of hermesPaths) {
    if (await fileExists(path)) {
      // Get version: `hermes --version` or `hermes version`
      const vResult = await execCommand(path, ['--version']);
      const version = vResult.code === 0 
        ? vResult.stdout.trim().split('\n')[0] 
        : undefined;
      return {
        ...base,
        status: 'installed',
        path,
        version,
      };
    }
  }

  // Check PATH
  const whichPath = await whichBinary('hermes');
  if (whichPath) {
    const vResult = await execCommand(whichPath, ['--version']);
    return {
      ...base,
      status: 'installed',
      path: whichPath,
      version: vResult.code === 0 ? vResult.stdout.trim().split('\n')[0] : undefined,
    };
  }

  // Check if source exists but setup hasn't been run
  if (await dirExists(hermesSourceDir)) {
    const hasSetup = await fileExists(`${hermesSourceDir}/setup-hermes.sh`);
    if (hasSetup) {
      return {
        ...base,
        status: 'not-installed',
        path: hermesSourceDir,
        error: 'Source found but not set up. Run setup-hermes.sh.',
      };
    }
  }

  return { ...base, status: 'not-installed' };
}

/**
 * Detect all modules at once.
 */
export async function detectAllModules(): Promise<Record<ModuleId, ModuleInfo>> {
  const [hermes, zed] = await Promise.all([
    detectHermes(),
    detectZed(),
  ]);

  return {
    hermes,
    zed,
    monaco: {
      id: 'monaco',
      name: 'Monaco Editor',
      status: 'installed',
      version: 'built-in',
      path: 'embedded',
    },
  };
}

// ─── Module Installation ────────────────────────────────────────

export interface InstallOptions {
  onProgress?: (progress: InstallProgress) => void;
  onComplete?: (info: ModuleInfo) => void;
  onError?: (error: string) => void;
}

/**
 * Install Zed Editor.
 * 
 * Strategy:
 * 1. If Homebrew available → `brew install --cask zed`
 * 2. Fallback → official install script: `curl -fsSL https://zed.dev/install.sh | sh`
 * 
 * Post-install: Zed CLI (`/usr/local/bin/zed`) is installed separately
 * via Zed's command palette (Cmd+Shift+P → "cli: install").
 * We don't automate that step — it requires Zed to be running.
 * 
 * Official docs: https://zed.dev/download
 */
export async function installZed(opts: InstallOptions = {}): Promise<ModuleInfo> {
  const progress: InstallProgress = {
    moduleId: 'zed',
    step: 'Checking prerequisites...',
    percent: 0,
    output: [],
  };

  opts.onProgress?.({ ...progress });

  // Step 1: Check if Homebrew is available
  const brewPath = await whichBinary('brew');
  
  if (brewPath) {
    // ── Homebrew path (preferred) ────────────────────────────
    progress.step = 'Installing Zed via Homebrew...';
    progress.percent = 15;
    progress.output.push('$ brew install --cask zed');
    opts.onProgress?.({ ...progress });

    const result = await execCommand('brew', ['install', '--cask', 'zed']);
    
    if (result.code === 0) {
      progress.step = 'Zed installed successfully!';
      progress.percent = 90;
      if (result.stdout) progress.output.push(result.stdout.slice(0, 500));
      opts.onProgress?.({ ...progress });

      // Verify installation
      progress.step = 'Verifying installation...';
      progress.percent = 95;
      opts.onProgress?.({ ...progress });

      const info = await detectZed();
      progress.step = 'Complete!';
      progress.percent = 100;
      opts.onProgress?.({ ...progress });

      opts.onComplete?.(info);
      return info;
    } else {
      // Check if already installed
      if (result.stderr?.includes('already installed')) {
        progress.step = 'Zed is already installed!';
        progress.percent = 100;
        opts.onProgress?.({ ...progress });

        const info = await detectZed();
        opts.onComplete?.(info);
        return info;
      }

      const error = result.stderr || 'Homebrew installation failed';
      progress.output.push(`Error: ${error}`);
      opts.onError?.(error);
      return { id: 'zed', name: 'Zed Editor', status: 'error', error };
    }
  } else {
    // ── Fallback: official install script ────────────────────
    progress.step = 'No Homebrew found. Using official installer...';
    progress.percent = 10;
    progress.output.push('$ curl -fsSL https://zed.dev/install.sh | sh');
    opts.onProgress?.({ ...progress });

    const result = await execScript('curl -fsSL https://zed.dev/install.sh | sh');

    if (result.code === 0) {
      progress.step = 'Zed installed successfully!';
      progress.percent = 100;
      opts.onProgress?.({ ...progress });

      const info = await detectZed();
      opts.onComplete?.(info);
      return info;
    } else {
      const error = result.stderr || 'Install script failed';
      progress.output.push(`Error: ${error}`);
      opts.onError?.(error);
      return { id: 'zed', name: 'Zed Editor', status: 'error', error };
    }
  }
}

/**
 * Install Hermes Agent.
 * 
 * Strategy:
 * 1. If source dir exists → run setup-hermes.sh
 * 2. If no source → clone from GitHub, then run setup-hermes.sh
 * 
 * The setup script handles:
 * - uv installation (if missing)
 * - Python 3.11 provisioning (via uv)
 * - Virtual environment creation
 * - Dependency installation (uv sync --all-extras)
 * - Symlink to ~/.local/bin/hermes
 * - PATH configuration (~/.zshrc)
 * - Skills sync to ~/.hermes/skills/
 * 
 * Official: https://github.com/autarch/hermes-agent
 * Install:  ./setup-hermes.sh (non-interactive)
 */
export async function installHermes(opts: InstallOptions = {}): Promise<ModuleInfo> {
  const progress: InstallProgress = {
    moduleId: 'hermes',
    step: 'Checking prerequisites...',
    percent: 0,
    output: [],
  };

  opts.onProgress?.({ ...progress });

  // Resolve dynamic paths
  const home = await getHomeDir();
  const hermesSourceDir = getHermesSourceDir(home);
  const hermesCloneUrl = getHermesCloneUrl();

  // Step 1: Check if source directory exists
  const sourceExists = await dirExists(hermesSourceDir);

  if (!sourceExists) {
    // ── Clone the repository ────────────────────────────────
    progress.step = 'Cloning Hermes repository...';
    progress.percent = 5;
    progress.output.push(`$ git clone ${hermesCloneUrl} ${hermesSourceDir}`);
    opts.onProgress?.({ ...progress });

    // Check git is available
    const gitPath = await whichBinary('git');
    if (!gitPath) {
      const error = 'git not found. Please install git first (Xcode Command Line Tools).';
      opts.onError?.(error);
      return { id: 'hermes', name: 'Hermes Agent', status: 'error', error };
    }

    const cloneResult = await execCommand('git', [
      'clone', '--depth', '1',
      hermesCloneUrl,
      hermesSourceDir,
    ]);

    if (cloneResult.code !== 0) {
      const error = cloneResult.stderr || 'Git clone failed';
      progress.output.push(`Error: ${error}`);
      opts.onError?.(error);
      return { id: 'hermes', name: 'Hermes Agent', status: 'error', error };
    }

    progress.step = 'Repository cloned!';
    progress.percent = 20;
    progress.output.push('✓ Repository cloned');
    opts.onProgress?.({ ...progress });

    // Init submodules
    progress.step = 'Initializing submodules...';
    progress.percent = 25;
    opts.onProgress?.({ ...progress });

    await execCommand('git', [
      '-C', hermesSourceDir,
      'submodule', 'update', '--init', '--recursive',
    ]);
  } else {
    progress.step = 'Source directory found!';
    progress.percent = 20;
    progress.output.push(`✓ Source at ${hermesSourceDir}`);
    opts.onProgress?.({ ...progress });
  }

  // Step 2: Run setup-hermes.sh (non-interactive)
  // We pipe 'n' to skip the setup wizard prompt at the end
  progress.step = 'Running setup-hermes.sh...';
  progress.percent = 30;
  progress.output.push(`$ cd ${hermesSourceDir} && echo 'n' | ./setup-hermes.sh`);
  opts.onProgress?.({ ...progress });

  // Make setup script executable
  await execCommand('chmod', ['+x', `${hermesSourceDir}/setup-hermes.sh`]);

  // Run the setup script non-interactively:
  // - Set HERMES_SETUP_NONINTERACTIVE to skip prompts  
  // - Pipe 'n' for the ripgrep and wizard prompts
  const setupResult = await execScript(
    `cd "${hermesSourceDir}" && echo -e "n\\nn" | ./setup-hermes.sh 2>&1`,
  );

  if (setupResult.code === 0) {
    progress.step = 'Setup complete!';
    progress.percent = 90;
    // Capture last few lines of output
    const outputLines = setupResult.stdout.split('\n').filter(Boolean);
    const lastLines = outputLines.slice(-5);
    progress.output.push(...lastLines);
    opts.onProgress?.({ ...progress });

    // Step 3: Verify installation
    progress.step = 'Verifying installation...';
    progress.percent = 93;
    opts.onProgress?.({ ...progress });

    const info = await detectHermes();

    // Step 4: Apply Autarch OS Kit (personas, SOUL, skills)
    if (info.status === 'installed') {
      progress.step = 'Applying Autarch OS configuration...';
      progress.percent = 96;
      opts.onProgress?.({ ...progress });

      try {
        const { applyHermesKit } = await import('./hermesProvisioner');
        const kitResult = await applyHermesKit();
        if (kitResult.success) {
          progress.output.push(`✓ Kit v${kitResult.kitVersion}: ${kitResult.applied.join(', ')}`);
        } else {
          progress.output.push(`⚠ Kit partially applied: ${kitResult.errors.join(', ')}`);
        }
      } catch (e) {
        progress.output.push(`⚠ Kit provisioning skipped: ${e instanceof Error ? e.message : 'unknown'}`);
      }
    }

    progress.step = 'Complete!';
    progress.percent = 100;
    opts.onProgress?.({ ...progress });

    opts.onComplete?.(info);
    return info;
  } else {
    // The setup script may fail partially but still install hermes
    // Check if hermes was actually installed despite error code
    const info = await detectHermes();
    if (info.status === 'installed') {
      // Also try to provision even if setup had warnings
      try {
        const { applyHermesKit } = await import('./hermesProvisioner');
        await applyHermesKit();
      } catch { /* Kit provisioning is best-effort */ }

      progress.step = 'Setup completed with warnings';
      progress.percent = 100;
      opts.onProgress?.({ ...progress });
      opts.onComplete?.(info);
      return info;
    }

    const error = setupResult.stderr || setupResult.stdout.slice(-200) || 'Setup script failed';
    progress.output.push(`Error: ${error.slice(0, 300)}`);
    opts.onError?.(error);
    return { id: 'hermes', name: 'Hermes Agent', status: 'error', error };
  }
}

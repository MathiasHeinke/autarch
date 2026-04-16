/**
 * Hermes Profile Manager
 *
 * Manages Hermes Agent profiles for workspace isolation.
 * Each workspace gets its own profile with independent:
 *   - config.yaml (model settings, MCP servers)
 *   - MEMORY.md (project knowledge)
 *   - USER.md (user preferences)
 *   - state.db (session history)
 *   - skills/ (learned procedures)
 *
 * Profile directories follow Hermes convention:
 *   default:  ~/.hermes/
 *   named:    ~/.hermes-<name>/
 *
 * Entry Points:
 *   - getActiveProfile()        → Current profile name
 *   - setActiveProfile(name)    → Switch active profile
 *   - ensureProfile(name)       → Create if not exists
 *   - listProfiles()            → All available profiles
 *   - getHermesHome(profile?)   → Resolve ~/.hermes[-<name>] path
 */

// ─── Shell Helper (shared with hermesBridge) ────────────────────

async function execShell(cmd: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { Command } = await import('@tauri-apps/plugin-shell');
    const output = await Command.create(cmd, args).execute();
    return { code: output.code ?? 1, stdout: output.stdout, stderr: output.stderr };
  } catch {
    return { code: 1, stdout: '', stderr: 'Tauri shell not available' };
  }
}

async function getHomeDir(): Promise<string> {
  const result = await execShell('sh', ['-c', 'echo $HOME']);
  return result.stdout.trim() || '/tmp';
}

// ─── Profile State ──────────────────────────────────────────────

const PROFILE_STORAGE_KEY = 'autarch-hermes-profile';

/**
 * Get the currently active Hermes profile name.
 * Returns 'default' if none is set.
 */
export function getActiveProfile(): string {
  try {
    return localStorage.getItem(PROFILE_STORAGE_KEY) || 'default';
  } catch {
    return 'default';
  }
}

/**
 * Set the active Hermes profile.
 * Does NOT restart Hermes — caller must handle gateway lifecycle.
 */
export function setActiveProfile(name: string): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, name);
}

/**
 * Resolve the Hermes home directory for a profile.
 * - 'default' → ~/.hermes/
 * - 'ares'    → ~/.hermes-ares/
 */
export async function getHermesHome(profile?: string): Promise<string> {
  const home = await getHomeDir();
  const p = profile || getActiveProfile();
  return p === 'default' ? `${home}/.hermes` : `${home}/.hermes-${p}`;
}

/**
 * Create a new Hermes profile if it doesn't exist.
 * Copies base config from default profile.
 */
export async function ensureProfile(name: string): Promise<{ created: boolean; path: string }> {
  const home = await getHomeDir();
  const profileDir = name === 'default' ? `${home}/.hermes` : `${home}/.hermes-${name}`;

  // Check if profile already exists
  const checkResult = await execShell('test', ['-d', profileDir]);
  if (checkResult.code === 0) {
    return { created: false, path: profileDir };
  }

  // Create profile directory
  await execShell('mkdir', ['-p', profileDir]);
  await execShell('mkdir', ['-p', `${profileDir}/memories`]);

  // Copy config from default if available
  const defaultConfig = `${home}/.hermes/config.yaml`;
  const configExists = await execShell('test', ['-f', defaultConfig]);
  if (configExists.code === 0) {
    await execShell('cp', [defaultConfig, `${profileDir}/config.yaml`]);
  }

  // Copy .env from default if available
  const defaultEnv = `${home}/.hermes/.env`;
  const envExists = await execShell('test', ['-f', defaultEnv]);
  if (envExists.code === 0) {
    await execShell('cp', [defaultEnv, `${profileDir}/.env`]);
  }

  // Initialize empty memory files
  await execShell('bash', ['-c', `echo '# Project Memory — ${name}' > '${profileDir}/memories/MEMORY.md'`]);
  await execShell('bash', ['-c', `echo '# User Preferences' > '${profileDir}/memories/USER.md'`]);

  return { created: true, path: profileDir };
}

/**
 * List all available Hermes profiles.
 */
export async function listProfiles(): Promise<string[]> {
  const home = await getHomeDir();
  const result = await execShell('bash', [
    '-c',
    `ls -d ${home}/.hermes ${home}/.hermes-* 2>/dev/null | sed 's|.*/\\.hermes-||;s|.*/\\.hermes$|default|'`,
  ]);

  if (result.code !== 0 || !result.stdout.trim()) {
    return ['default'];
  }

  return result.stdout.trim().split('\n').filter(Boolean);
}

/**
 * Derive a profile name from a workspace path.
 * /Users/user/Developer/ares-app → 'ares-app'
 * /Users/user/Developer/autarch  → 'autarch'
 */
export function deriveProfileName(workspacePath: string): string {
  const parts = workspacePath.split('/').filter(Boolean);
  const name = parts[parts.length - 1] || 'default';
  // Sanitize: lowercase, alphanumeric + hyphens only
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

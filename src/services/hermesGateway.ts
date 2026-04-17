/**
 * Hermes Gateway Lifecycle Management
 *
 * Start, stop, and monitor the Hermes Agent Gateway process
 * directly from Autarch UI. No terminal required.
 *
 * Process management strategy:
 * - Start: `hermes gateway` via Tauri shell (detached)
 * - Stop: PID-based kill (graceful SIGTERM first)
 * - Status: Health endpoint polling (GET /health)
 */

const DEFAULT_HERMES_URL = 'http://localhost:8642';

// ─── Shell Helper ───────────────────────────────────────────────

async function execShell(
  command: string,
  args: string[]
): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { Command } = await import('@tauri-apps/plugin-shell');
    const cmd = Command.create(command, args);
    const result = await cmd.execute();
    return {
      code: result.code ?? -1,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch {
    console.warn('[HermesGateway] Tauri shell not available');
    return { code: 1, stdout: '', stderr: 'Tauri shell not available' };
  }
}

// ─── Gateway Status ─────────────────────────────────────────────

export type GatewayStatus = 'running' | 'stopped' | 'error';

/**
 * Check if the Hermes Gateway is running by hitting the health endpoint.
 * Returns 'running' if healthy, 'stopped' if unreachable, 'error' on unexpected responses.
 */
export async function getGatewayStatus(
  url: string = DEFAULT_HERMES_URL
): Promise<GatewayStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${url}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) return 'running';
    return 'error';
  } catch {
    return 'stopped';
  }
}

// ─── Gateway Start ──────────────────────────────────────────────

/**
 * Start the Hermes Gateway as a background process.
 *
 * Strategy:
 * 1. First check if already running (avoid double-start)
 * 2. Launch `hermes gateway` via shell (nohup + background)
 * 3. Poll health endpoint for up to 10 seconds
 * 4. Return true if gateway becomes healthy
 */
export async function startGateway(): Promise<boolean> {
  // Pre-check: already running?
  const currentStatus = await getGatewayStatus();
  if (currentStatus === 'running') {
    console.log('[HermesGateway] Already running');
    return true;
  }

  // Find hermes binary location
  const whichResult = await execShell('sh', ['-c', 'which hermes 2>/dev/null || if [ -f "$HOME/.hermes/bin/hermes" ]; then echo "$HOME/.hermes/bin/hermes"; else echo ""; fi']);
  const hermesBin = whichResult.stdout.trim();

  if (!hermesBin) {
    console.warn('[HermesGateway] hermes binary not found in PATH or ~/.hermes/bin');
    return false;
  }

  // Start gateway in background
  try {
    const startResult = await execShell('sh', [
      '-c',
      `nohup ${hermesBin} gateway > /tmp/hermes-gateway.log 2>&1 & echo $!`,
    ]);

    if (startResult.code !== 0) {
      console.warn('[HermesGateway] Failed to start:', startResult.stderr);
      return false;
    }

    const pid = startResult.stdout.trim();
    if (pid) {
      console.log(`[HermesGateway] Started with PID ${pid}`);
    }
  } catch (e) {
    console.warn('[HermesGateway] Start error:', e instanceof Error ? e.message : e);
    return false;
  }

  // Poll for health (max 10 seconds)
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const status = await getGatewayStatus();
    if (status === 'running') {
      console.log('[HermesGateway] Gateway is healthy');
      return true;
    }
  }

  console.warn('[HermesGateway] Gateway started but health check failed after 10s');
  return false;
}

// ─── Gateway Stop ───────────────────────────────────────────────

/**
 * Stop the Hermes Gateway process.
 *
 * Strategy:
 * 1. Find hermes gateway PID via `pgrep`
 * 2. Send SIGTERM (graceful shutdown)
 * 3. Wait up to 5 seconds for process to exit
 * 4. If still alive, SIGKILL as last resort
 */
export async function stopGateway(): Promise<boolean> {
  try {
    // Find gateway process PID
    const pgrepResult = await execShell('sh', [
      '-c',
      'pgrep -f "hermes gateway" 2>/dev/null || pgrep -f "hermes.*gateway" 2>/dev/null || echo ""',
    ]);

    const pids = pgrepResult.stdout.trim().split('\n').filter(Boolean);

    if (pids.length === 0) {
      console.log('[HermesGateway] No gateway process found');
      return true; // Already stopped
    }

    // Graceful shutdown: SIGTERM
    for (const pid of pids) {
      try {
        await execShell('kill', ['-TERM', pid]);
      } catch {
        // Process may have already exited
      }
    }

    // Wait for graceful shutdown (max 5 seconds)
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const status = await getGatewayStatus();
      if (status === 'stopped') {
        console.log('[HermesGateway] Gateway stopped gracefully');
        return true;
      }
    }

    // Force kill as last resort
    for (const pid of pids) {
      try {
        await execShell('kill', ['-9', pid]);
      } catch {
        // Already dead
      }
    }

    console.log('[HermesGateway] Gateway force-killed');
    return true;
  } catch (e) {
    console.warn('[HermesGateway] Stop error:', e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Hermes Config Bridge
 * 
 * Synchronizes MCP server configuration from Autarch UI (localStorage)
 * to Hermes' config.yaml (~/.hermes/config.yaml).
 * 
 * Strategy: Non-destructive YAML patching.
 * Only the `mcp_servers:` section is modified. All other config
 * (model, agent, cron, roles, etc.) is preserved byte-for-byte.
 * 
 * ┌──────────────┐        ┌─────────────────────┐
 * │ Autarch UI   │  sync  │ ~/.hermes/config.yaml│
 * │ localStorage │───────▶│   mcp_servers:       │
 * │ (JSON)       │        │     supabase: ...    │
 * └──────────────┘        └─────────────────────┘
 */

// ─── Types ──────────────────────────────────────────────────────

export interface McpServerEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerEntry>;
}

// ─── Shell Helpers (reusable from moduleInstaller pattern) ──────

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
    console.warn(`[HermesBridge] Tauri shell not available`);
    return { code: 1, stdout: '', stderr: 'Tauri shell not available' };
  }
}

async function getHomeDir(): Promise<string> {
  const result = await execShell('sh', ['-c', 'echo $HOME']);
  return result.stdout.trim() || '/tmp';
}

// ─── YAML Serialization (minimal, no dependency) ────────────────

/**
 * Serialize MCP config to YAML format matching Hermes' expected structure.
 * 
 * We intentionally avoid a full YAML library to keep bundle size minimal.
 * The MCP server config is simple enough for manual serialization.
 * 
 * Output format (matching Hermes config.yaml):
 * ```yaml
 * mcp_servers:
 *   server-name:
 *     command: npx
 *     args:
 *       - -y
 *       - @supabase/mcp-server
 *     env:
 *       SUPABASE_URL: "value"
 * ```
 */
function mcpConfigToYaml(config: McpConfig): string {
  const lines: string[] = ['mcp_servers:'];

  const entries = Object.entries(config.mcpServers);
  if (entries.length === 0) {
    lines.push('  {}');
    return lines.join('\n');
  }

  for (const [name, server] of entries) {
    lines.push(`  ${name}:`);
    lines.push(`    command: ${server.command}`);
    
    if (server.args && server.args.length > 0) {
      lines.push('    args:');
      for (const arg of server.args) {
        // Quote args that contain special YAML characters
        const needsQuote = /[:{}\[\],&*#?|<>=!%@`]/.test(arg) || arg.includes(' ');
        lines.push(`      - ${needsQuote ? `"${arg}"` : arg}`);
      }
    }

    if (server.env && Object.keys(server.env).length > 0) {
      lines.push('    env:');
      for (const [key, value] of Object.entries(server.env)) {
        // Use ${VAR} placeholder pattern if value looks like an env reference
        // Otherwise quote the literal value
        if (value.startsWith('${') && value.endsWith('}')) {
          lines.push(`      ${key}: "${value}"`);
        } else if (value === '') {
          // Empty values → use env var placeholder
          lines.push(`      ${key}: "\${${key}}"`);
        } else {
          lines.push(`      ${key}: "${value}"`);
        }
      }
    }
  }

  return lines.join('\n');
}

// ─── Config File Operations ─────────────────────────────────────

/**
 * Read the current Hermes config.yaml content.
 */
async function readHermesConfig(hermesHome: string): Promise<string | null> {
  const configPath = `${hermesHome}/config.yaml`;
  const result = await execShell('cat', [configPath]);
  if (result.code === 0) {
    return result.stdout;
  }
  return null;
}

/**
 * Write content to the Hermes config.yaml.
 * Uses a temp file + mv for atomic writes.
 */
async function writeHermesConfig(hermesHome: string, content: string): Promise<boolean> {
  const configPath = `${hermesHome}/config.yaml`;
  const tmpPath = `${hermesHome}/config.yaml.tmp`;

  // Write to temp file
  // Escape content for shell: base64 encode → decode on write
  const b64 = btoa(unescape(encodeURIComponent(content)));
  const writeResult = await execShell('sh', [
    '-c',
    `echo '${b64}' | base64 -d > "${tmpPath}" && mv "${tmpPath}" "${configPath}"`,
  ]);

  return writeResult.code === 0;
}

/**
 * Replace only the `mcp_servers:` section in the existing config.
 * Preserves all other sections (model, agent, cron, etc.)
 * 
 * Algorithm:
 * 1. Find the line starting with `mcp_servers:`
 * 2. Find the next top-level key (line without indentation, ending with `:`)
 * 3. Replace everything between those markers with new YAML
 * 4. If no `mcp_servers:` section exists, append it at the end
 */
function patchYamlSection(existingYaml: string, newSection: string): string {
  const lines = existingYaml.split('\n');
  
  // Find mcp_servers section boundaries
  let sectionStart = -1;
  let sectionEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('mcp_servers:')) {
      sectionStart = i;
      continue;
    }

    // If we're inside the section, look for the next top-level key
    if (sectionStart >= 0 && sectionEnd < 0) {
      // A top-level key: starts at column 0, not a comment, not empty, not indented
      if (line.length > 0 && !line.startsWith(' ') && !line.startsWith('#') && !line.startsWith('\t')) {
        sectionEnd = i;
      }
    }
  }

  if (sectionStart < 0) {
    // No existing mcp_servers section → append
    const separator = existingYaml.endsWith('\n') ? '' : '\n';
    return existingYaml + separator + '\n' + newSection + '\n';
  }

  // If section goes to end of file
  if (sectionEnd < 0) {
    sectionEnd = lines.length;
  }

  // Rebuild: before + new section + after
  const before = lines.slice(0, sectionStart);
  const after = lines.slice(sectionEnd);

  return [...before, newSection, '', ...after].join('\n');
}

// ─── Public API ─────────────────────────────────────────────────

export interface SyncResult {
  success: boolean;
  configPath: string;
  serversWritten: number;
  error?: string;
}

/**
 * Sync MCP config from Autarch localStorage to Hermes config.yaml.
 * 
 * This is the main bridge function. Call it whenever the user
 * saves MCP config in the Autarch UI.
 * 
 * @param mcpConfigJson - Raw JSON string from localStorage
 * @returns SyncResult with success/failure info
 */
export async function syncToHermes(mcpConfigJson: string): Promise<SyncResult> {
  const home = await getHomeDir();
  const hermesHome = `${home}/.hermes`;
  const configPath = `${hermesHome}/config.yaml`;

  try {
    // Parse the Autarch MCP config
    const config: McpConfig = JSON.parse(mcpConfigJson);
    const serverCount = Object.keys(config.mcpServers).length;

    // Generate new YAML section
    const newYaml = mcpConfigToYaml(config);

    // Read existing Hermes config
    const existingConfig = await readHermesConfig(hermesHome);

    if (!existingConfig) {
      // No existing config → can't sync (Hermes not installed)
      return {
        success: false,
        configPath,
        serversWritten: 0,
        error: 'Hermes config not found. Is Hermes installed?',
      };
    }

    // Patch the mcp_servers section
    const patchedConfig = patchYamlSection(existingConfig, newYaml);

    // Write back
    const written = await writeHermesConfig(hermesHome, patchedConfig);

    if (written) {
      console.log(`[HermesBridge] Synced ${serverCount} MCP servers to ${configPath}`);
      return { success: true, configPath, serversWritten: serverCount };
    } else {
      return {
        success: false,
        configPath,
        serversWritten: 0,
        error: 'Failed to write config file',
      };
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, configPath, serversWritten: 0, error };
  }
}

/**
 * Read the current MCP servers from Hermes config.yaml
 * and convert to Autarch's JSON format.
 * 
 * This enables initial population of the Autarch UI
 * from an existing Hermes setup.
 */
export async function readFromHermes(): Promise<McpConfig | null> {
  const home = await getHomeDir();
  const hermesHome = `${home}/.hermes`;

  const config = await readHermesConfig(hermesHome);
  if (!config) return null;

  try {
    // Parse the mcp_servers section from YAML
    // Simple parser for our known format
    const servers: Record<string, McpServerEntry> = {};
    const lines = config.split('\n');
    
    let inMcpSection = false;
    let currentServer: string | null = null;
    let inArgs = false;
    let inEnv = false;
    let currentEntry: McpServerEntry = { command: '', args: [] };

    for (const line of lines) {
      // Detect mcp_servers section
      if (line.startsWith('mcp_servers:')) {
        inMcpSection = true;
        continue;
      }

      // Detect end of section (next top-level key)
      if (inMcpSection && line.length > 0 && !line.startsWith(' ') && !line.startsWith('#') && !line.startsWith('\t')) {
        // Save last server
        if (currentServer) {
          servers[currentServer] = { ...currentEntry };
        }
        inMcpSection = false;
        break;
      }

      if (!inMcpSection) continue;

      // Server name (2 spaces indent)
      const serverMatch = line.match(/^  ([a-zA-Z0-9_-]+):$/);
      if (serverMatch) {
        // Save previous server
        if (currentServer) {
          servers[currentServer] = { ...currentEntry };
        }
        currentServer = serverMatch[1];
        currentEntry = { command: '', args: [], env: {} };
        inArgs = false;
        inEnv = false;
        continue;
      }

      if (!currentServer) continue;

      // Command (4 spaces indent)
      const cmdMatch = line.match(/^    command:\s*(.+)$/);
      if (cmdMatch) {
        currentEntry.command = cmdMatch[1].trim().replace(/^["']|["']$/g, '');
        inArgs = false;
        inEnv = false;
        continue;
      }

      // Args header
      if (line.match(/^    args:$/)) {
        inArgs = true;
        inEnv = false;
        continue;
      }

      // Env header
      if (line.match(/^    env:$/)) {
        inEnv = true;
        inArgs = false;
        continue;
      }

      // Arg value (6 spaces indent)
      if (inArgs) {
        const argMatch = line.match(/^      - (.+)$/);
        if (argMatch) {
          currentEntry.args.push(argMatch[1].trim().replace(/^["']|["']$/g, ''));
          continue;
        }
        // No longer in args if we see something else at 4-space indent
        if (line.match(/^    \S/)) inArgs = false;
      }

      // Env value (6 spaces indent)
      if (inEnv) {
        const envMatch = line.match(/^      ([A-Z_]+):\s*(.+)$/);
        if (envMatch) {
          if (!currentEntry.env) currentEntry.env = {};
          currentEntry.env[envMatch[1]] = envMatch[2].trim().replace(/^["']|["']$/g, '');
          continue;
        }
        if (line.match(/^    \S/)) inEnv = false;
      }
    }

    // Save last server
    if (currentServer && inMcpSection) {
      servers[currentServer] = { ...currentEntry };
    }

    return { mcpServers: servers };
  } catch {
    return null;
  }
}

/**
 * Check if Hermes config.yaml exists and is readable.
 */
export async function isHermesConfigAvailable(): Promise<boolean> {
  const home = await getHomeDir();
  const result = await execShell('test', ['-f', `${home}/.hermes/config.yaml`]);
  return result.code === 0;
}

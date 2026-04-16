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

import { streamChat, sendChat, type ChatResponse, type ChatMessage } from './hermesClient';
import type { PersonaId, GateResult } from '../types/executionPlan.types';

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

// ─── API Keys → .env Bridge ────────────────────────────────────

/** Keys that Autarch manages in ~/.hermes/.env */
const MANAGED_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENROUTER_API_KEY',
  'GEMINI_API_KEY',
  'GITHUB_PERSONAL_ACCESS_TOKEN',
] as const;

/**
 * Read existing .env file as key-value pairs.
 * Handles comments, empty lines, and quoted values.
 */
function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

/**
 * Serialize key-value pairs back to .env format.
 * Preserves ordering: existing keys first, new keys appended.
 */
function serializeEnvFile(
  existing: Record<string, string>,
  updates: Record<string, string>,
  originalContent: string
): string {
  const lines: string[] = [];
  const written = new Set<string>();

  // Preserve original ordering and comments
  for (const line of originalContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      lines.push(line);
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) {
      lines.push(line);
      continue;
    }
    const key = trimmed.slice(0, eqIdx).trim();
    // Use updated value if available, otherwise keep existing
    const value = key in updates ? updates[key] : existing[key];
    if (value !== undefined) {
      lines.push(`${key}="${value}"`);
      written.add(key);
    }
  }

  // Append new keys that weren't in the original file
  for (const [key, value] of Object.entries(updates)) {
    if (!written.has(key) && value) {
      lines.push(`${key}="${value}"`);
    }
  }

  // Ensure trailing newline
  const result = lines.join('\n');
  return result.endsWith('\n') ? result : result + '\n';
}

/**
 * Sync API keys from Autarch UI to ~/.hermes/.env
 *
 * Strategy: Non-destructive patching.
 * - Reads existing .env (preserves ALL keys Autarch doesn't manage)
 * - Only updates keys in MANAGED_ENV_KEYS
 * - Atomic write via temp file + mv
 * - Sets chmod 600 for security
 *
 * @param keys - Record of key names to values (only managed keys are written)
 */
export async function syncApiKeysToEnv(
  keys: Record<string, string>
): Promise<SyncResult> {
  const home = await getHomeDir();
  const hermesHome = `${home}/.hermes`;
  const envPath = `${hermesHome}/.env`;

  try {
    // Filter to only managed keys
    const managedUpdates: Record<string, string> = {};
    let keyCount = 0;
    for (const [key, value] of Object.entries(keys)) {
      if ((MANAGED_ENV_KEYS as readonly string[]).includes(key)) {
        managedUpdates[key] = value;
        if (value) keyCount++;
      }
    }

    // Read existing .env (may not exist yet)
    const existingResult = await execShell('cat', [envPath]);
    const existingContent = existingResult.code === 0 ? existingResult.stdout : '';
    const existingParsed = parseEnvFile(existingContent);

    // Merge: existing + updates
    const newContent = serializeEnvFile(existingParsed, managedUpdates, existingContent || '# Hermes Agent Environment\n# Managed by Autarch\n');

    // Atomic write: temp file → mv
    const tmpPath = `${hermesHome}/.env.tmp`;
    const b64 = btoa(unescape(encodeURIComponent(newContent)));
    const writeResult = await execShell('sh', [
      '-c',
      `echo '${b64}' | base64 -d > "${tmpPath}" && mv "${tmpPath}" "${envPath}" && chmod 600 "${envPath}"`,
    ]);

    if (writeResult.code === 0) {
      console.log(`[HermesBridge] Synced ${keyCount} API keys to .env`);
      return { success: true, configPath: envPath, serversWritten: keyCount };
    }

    return {
      success: false,
      configPath: envPath,
      serversWritten: 0,
      error: `Write failed: ${writeResult.stderr}`,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, configPath: envPath, serversWritten: 0, error };
  }
}

/**
 * Read API keys from ~/.hermes/.env for initial UI population.
 * Returns only MANAGED_ENV_KEYS — never exposes unknown keys.
 */
export async function readApiKeysFromEnv(): Promise<Record<string, string> | null> {
  const home = await getHomeDir();
  const envPath = `${home}/.hermes/.env`;
  const result = await execShell('cat', [envPath]);
  if (result.code !== 0) return null;

  const parsed = parseEnvFile(result.stdout);
  const managed: Record<string, string> = {};
  for (const key of MANAGED_ENV_KEYS) {
    if (parsed[key]) {
      managed[key] = parsed[key];
    }
  }
  return managed;
}

// ─── Persona Execution Bridge ───────────────────────────────────

// Persona prompts — Single Source of Truth (see personaPrompts.ts)
import { PERSONA_PROMPTS } from './personaPrompts';

/**
 * Execute a prompt with a specific Hermes persona via streaming.
 * Wraps streamChat() with persona system prompt injection.
 *
 * @param prompt - The task prompt
 * @param persona - Which persona to use
 * @param onDelta - Streaming callback for incremental output
 * @param options - Optional overrides (model, URL)
 * @returns Full ChatResponse
 *
 * Error: Hermes offline → rethrows with context
 * Edge Case: persona='default' → no system prompt (uses SOUL.md)
 */
export async function executeWithPersona(
  prompt: string,
  persona: PersonaId,
  onDelta: (delta: string) => void,
  options?: { model?: string; context?: string },
): Promise<ChatResponse> {
  const messages: ChatMessage[] = [];
  if (options?.context) {
    messages.push({ role: 'system', content: `Previous context:\n${options.context}` });
  }
  messages.push({ role: 'user', content: prompt });

  return streamChat(messages, onDelta, {
    model: options?.model,
    systemPrompt: PERSONA_PROMPTS[persona],
  });
}

/**
 * Execute a quality gate evaluation (non-streaming).
 * Sends the phase output + criteria to a gate persona (e.g. sherlock)
 * and parses the structured response into a GateResult.
 *
 * @param phaseOutput - The full output of the phase to evaluate
 * @param criteria - List of acceptance criteria
 * @param persona - Gate evaluator persona (e.g. 'sherlock', 'ramsay')
 * @param options - Optional model override
 * @returns GateResult with per-criterion verdicts
 *
 * Error: Unparseable response → returns failed gate with raw response
 * Edge Case: Empty criteria → returns passed gate immediately
 */
export async function executeGate(
  phaseOutput: string,
  criteria: string[],
  persona: PersonaId,
  options?: { model?: string },
): Promise<GateResult> {
  if (criteria.length === 0) {
    return {
      passed: true,
      persona,
      criteria: [],
      summary: 'No criteria defined — auto-pass',
      timestamp: Date.now(),
      retryCount: 0,
      rawResponse: '',
    };
  }

  const gatePrompt = `You are evaluating the output of a development phase. 
Review the following output and evaluate each criterion.

## Output to Evaluate:
${phaseOutput.slice(0, 8000)} 

## Criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Response Format (JSON only, no markdown formatting block like \`\`\`json):
{
  "passed": true/false,
  "criteria": [
    { "id": "C1", "description": "...", "passed": true/false, "evidence": "Why it passed or failed" }
  ],
  "summary": "Overall assessment in 1-2 sentences"
}`;

  try {
    const response = await sendChat(
      [{ role: 'user', content: gatePrompt }],
      { model: options?.model, systemPrompt: PERSONA_PROMPTS[persona] },
    );

    // Parse structured gate response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        passed: false,
        persona,
        criteria: criteria.map((c, i) => ({ id: `C${i + 1}`, description: c, passed: false, evidence: 'Unparseable response' })),
        summary: 'Gate evaluation failed — could not parse LLM response',
        timestamp: Date.now(),
        retryCount: 0,
        rawResponse: response.content,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      passed: parsed.passed === true,
      persona,
      criteria: (parsed.criteria || []).map((c: any, i: number) => ({
        id: c.id || `C${i + 1}`,
        description: c.description || criteria[i] || '',
        passed: c.passed === true,
        evidence: c.evidence || '',
      })),
      summary: parsed.summary || '',
      timestamp: Date.now(),
      retryCount: 0,
      rawResponse: response.content,
    };
  } catch (err) {
    return {
      passed: false,
      persona,
      criteria: criteria.map((c, i) => ({ id: `C${i + 1}`, description: c, passed: false, evidence: 'Execution error' })),
      summary: `Gate evaluation error: ${err instanceof Error ? err.message : 'Unknown'}`,
      timestamp: Date.now(),
      retryCount: 0,
      rawResponse: '',
    };
  }
}

/**
 * Requests an inline code edit for the Monaco Editor overlay.
 * Uses a strict system prompt to ensure Hermes only returns the raw replacement snippet.
 */
export async function requestInlineEdit(prompt: string, selectedText: string, filePath: string): Promise<string> {
  const systemPrompt = `You are Rauno Freiberg — pixel-perfectionist, UI engineer, and code wizard.
You are performing an INLINE CODE EDIT. 

USER PROMPT: ${prompt}

SELECTED CODE snippet from ${filePath} that needs replacement:
\`\`\`
${selectedText}
\`\`\`

CRITICAL RULE:
You must output ONLY the raw, exact replacement code.
Do NOT wrap your response in markdown code blocks (\`\`\`).
Do NOT include any conversational filler, greetings, or explanations.
Just the exact string that will visually replace the selected text. If no change is needed, output the exact original text.`;

  try {
    const response = await sendChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate the replacement code.` }
    ]);
    
    // Safety check: remove accidental markdown blocks if the LLM ignores instructions
    let text = response.content.trim();
    if (text.startsWith('```')) {
      const lines = text.split('\n');
      if (lines.length > 0) lines.shift(); // remove opening ```lang
      if (lines.length > 0 && lines[lines.length - 1].startsWith('```')) {
        lines.pop(); // remove closing ```
      }
      text = lines.join('\n');
    }

    return text;
  } catch (err) {
    console.error('[HermesBridge] Inline edit failed:', err);
    throw err;
  }
}

// ─── Workflow Orchestration ──────────────────────────────────────

import { hermesEventBus } from './eventBus';
import type { WorkflowDocument, WorkflowNode, WorkflowEdge, AgentNodeData, TriggerNodeData } from '../types/workflow.types';

export function sortNodesTopologically(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  const nodeMap = new Map<string, WorkflowNode>();
  
  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
    nodeMap.set(n.id, n);
  });
  
  edges.forEach(e => {
    if (adjList[e.source]) adjList[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });
  
  const queue: string[] = [];
  const sorted: WorkflowNode[] = [];
  
  Object.entries(inDegree).forEach(([id, degree]) => {
    if (degree === 0) queue.push(id);
  });
  
  while (queue.length > 0) {
    const currId = queue.shift()!;
    const node = nodeMap.get(currId);
    if (node) sorted.push(node);
    
    (adjList[currId] || []).forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  if (sorted.length !== nodes.length) {
    throw new Error('Cyclic dependency detected in workflow graph');
  }
  
  return sorted;
}

export interface WorkflowExecutionContext {
  workflowId: string;
  isPaused: boolean;
  nodeOutputs: Record<string, string>;
  failedNodeId?: string;
  error?: string;
}

/**
 * Executes a full workflow document autonomously via Hermes.
 * Supports Topological Sorting, Persona execution, and Gate checking.
 * 
 * You can resume a paused workflow by passing in the returned context.
 */
export async function executeWorkflow(
  workflow: WorkflowDocument,
  context: WorkflowExecutionContext = { workflowId: workflow.id, isPaused: false, nodeOutputs: {} }
): Promise<WorkflowExecutionContext> {
  const isResume = Object.keys(context.nodeOutputs).length > 0;
  if (!isResume) {
    hermesEventBus.emit({ type: 'workflow.started', payload: { workflowId: workflow.id } });
  }

  try {
    const sortedNodes = sortNodesTopologically(workflow.nodes, workflow.edges);
    context.isPaused = false; // Reset if we are resuming
    
    for (const node of sortedNodes) {
      if (context.isPaused) break;
      
      // Check if already completed (from earlier run)
      if (context.nodeOutputs[node.id]) continue;
      
      hermesEventBus.emit({ type: 'node.started', payload: { workflowId: workflow.id, nodeId: node.id } });
      
      let output = '';
      
      // 1. Gather upstream outputs via pre-built predecessor map
      const predecessorMap = new Map<string, string[]>();
      for (const e of workflow.edges) {
        if (!predecessorMap.has(e.target)) predecessorMap.set(e.target, []);
        predecessorMap.get(e.target)!.push(e.source);
      }
      const predecessorIds = predecessorMap.get(node.id) || [];
      const predecessorOutputs = predecessorIds
        .map(srcId => context.nodeOutputs[srcId])
        .filter(Boolean);
        
      // 2. Execute Node
      switch (node.type) {
        case 'trigger': {
          const data = node.data as TriggerNodeData;
          output = `Triggered by ${data.triggerType}`;
          break;
        }
        case 'agent': {
          const data = node.data as AgentNodeData;
          let prompt = data.prompt;
          if (predecessorOutputs.length > 0) {
            prompt += `\n\n### Upstream Context Data:\n${predecessorOutputs.join('\n\n--- \n\n')}`;
          }
          
          let resultText = '';
          await executeWithPersona(
            prompt,
            (data.skill as PersonaId) || 'default',
            (delta) => { resultText += delta; }
          );
          output = resultText;
          break;
        }
        case 'output': {
          // Future: route output based on (node.data as OutputNodeData).outputType / destination
          output = predecessorOutputs.join('\n\n');
          break;
        }
      }
      
      // 3. Evaluate Smart Gate Mode
      const gate = node.data.gate;
      
      if (gate.mode === 'human') {
         hermesEventBus.emit({ 
            type: 'node.suspended', 
            payload: { workflowId: workflow.id, nodeId: node.id, reason: 'Waiting for human review', gateMode: 'human' } 
         });
         context.nodeOutputs[node.id] = output; 
         context.isPaused = true;
         break;
      } 
      
      if (gate.mode === 'agent-review') {
         const rawCriteria = (gate.criteria || '').slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
         const criteria = rawCriteria.split('\n').filter(c => c.trim().length > 0);
         const gateRes = await executeGate(output, criteria, (gate.reviewerSkill as PersonaId) || 'sherlock');
         
         if (!gateRes.passed) {
            const err = new Error(`Gate evaluation failed on node [${node.id}]: ${gateRes.summary}`);
            context.failedNodeId = node.id;
            context.error = err.message;
            throw err;
         }
      }
      
      // Passed perfectly
      context.nodeOutputs[node.id] = output;
      hermesEventBus.emit({ 
        type: 'node.completed', 
        payload: { workflowId: workflow.id, nodeId: node.id, result: output } 
      });
    }
    
    if (!context.isPaused) {
       hermesEventBus.emit({ type: 'workflow.completed', payload: { workflowId: workflow.id, result: context.nodeOutputs } });
    }
    
    return context;
  } catch (err) {
    hermesEventBus.emit({ 
      type: 'workflow.failed', 
      payload: { workflowId: workflow.id, error: err instanceof Error ? err.message : 'Unknown error' } 
    });
    // Add to context if thrown explicitly
    context.error = context.error || (err instanceof Error ? err.message : 'Unknown error');
    return context;
  }
}


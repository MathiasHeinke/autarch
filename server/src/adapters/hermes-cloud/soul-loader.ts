import { readFile } from "node:fs/promises";
import { join, resolve, normalize } from "node:path";

/**
 * Soul Loader — Hermes Cloud Adapter
 *
 * Loads the SOUL.md persona profile for a given agent profile name
 * from the `workers/agents/{profileName}/` directory.
 *
 * Security: path traversal is prevented by resolving and asserting
 * the final path stays within the agents root directory.
 *
 * Non-fatal: returns null on any error (missing file, permission, etc.)
 * so the agent can run without a soul profile.
 */

// Resolve agents root relative to the monorepo root.
// server/ is two levels below the repo root via src/adapters/…
// At runtime __dirname is dist/adapters/hermes-cloud/ → 4 levels up = repo root.
// We use process.cwd() which Paperclip sets to the repo root.
const AGENTS_ROOT = resolve(process.cwd(), "workers", "agents");

export interface AgentSoulResult {
  profileName: string;
  soul: string;
  agents: string | null;
  heartbeat: string | null;
}

/**
 * Reads SOUL.md (and optionally AGENTS.md + HEARTBEAT.md) for a given profile.
 *
 * @param profileName  e.g. "don-draper", "hermes", "apollo"
 * @returns            Loaded content or null if not found / not configured
 */
export async function loadAgentSoul(profileName: string): Promise<AgentSoulResult | null> {
  if (!profileName || profileName.trim().length === 0) return null;

  // Sanitize: only allow [a-z0-9-_] in profile names to prevent path traversal.
  if (!/^[a-z0-9_-]+$/i.test(profileName)) {
    return null;
  }

  const profileDir = normalize(join(AGENTS_ROOT, profileName));

  // Security: ensure resolved path is inside AGENTS_ROOT
  if (!profileDir.startsWith(AGENTS_ROOT + "/") && profileDir !== AGENTS_ROOT) {
    return null;
  }

  try {
    const soulPath = join(profileDir, "SOUL.md");
    const soul = await readFile(soulPath, "utf-8");

    // Optional supplementary files — non-fatal if missing
    const agents = await readFile(join(profileDir, "AGENTS.md"), "utf-8").catch(() => null);
    const heartbeat = await readFile(join(profileDir, "HEARTBEAT.md"), "utf-8").catch(() => null);

    return { profileName, soul, agents, heartbeat };
  } catch {
    // Profile not found or unreadable — agent runs without soul profile
    return null;
  }
}

/**
 * Builds the system prompt prefix from a loaded soul profile.
 * SOUL.md is the persona. AGENTS.md adds org/role context. HEARTBEAT.md adds behavioral loop.
 *
 * Returns empty string if no soul is provided.
 */
export function buildSoulSystemPrompt(soul: AgentSoulResult | null): string {
  if (!soul) return "";

  const parts: string[] = [];

  parts.push("## Persona & Soul\n");
  parts.push(soul.soul.trim());

  if (soul.agents) {
    parts.push("\n\n## Agent Configuration\n");
    parts.push(soul.agents.trim());
  }

  if (soul.heartbeat) {
    parts.push("\n\n## Behavioral Loop (Heartbeat)\n");
    parts.push(soul.heartbeat.trim());
  }

  return parts.join("\n") + "\n\n";
}

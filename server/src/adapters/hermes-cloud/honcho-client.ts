/**
 * Honcho Client — Autonomous Insight Generation
 *
 * Integrates with Honcho (Plastic Labs) for reasoning-based
 * cross-session memory and user/agent modeling.
 *
 * Architecture:
 *  - Self-hosted Honcho instance (Docker/Cloud Run) for data sovereignty
 *  - Workspace per company (multi-tenant isolation)
 *  - Peer per agent (agent identity modeling)
 *  - Session per heartbeat run (conversation thread)
 *
 * Environment:
 *  - HONCHO_API_URL:  self-hosted Honcho endpoint
 *  - HONCHO_API_KEY:  API key for authentication
 *
 * API Version: Honcho v3 (validated against deployed OpenAPI spec)
 */

import { logger } from "../../middleware/logger.js";

// --------------------------------------------------------------------------
// Config
// --------------------------------------------------------------------------
const HONCHO_API_URL = process.env.HONCHO_API_URL ?? "";
const HONCHO_API_KEY = process.env.HONCHO_API_KEY ?? "";
const HONCHO_TIMEOUT_MS = 5_000; // Non-blocking: 5s timeout

export function isHonchoEnabled(): boolean {
  return HONCHO_API_URL.length > 0;
}

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
export interface HonchoMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HonchoInsight {
  content: string;
  queriedAt: string;
}

// --------------------------------------------------------------------------
// REST Client (thin wrapper — no SDK dependency)
// --------------------------------------------------------------------------
async function honchoFetch(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HONCHO_TIMEOUT_MS);

  try {
    const res = await fetch(`${HONCHO_API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(HONCHO_API_KEY ? { Authorization: `Bearer ${HONCHO_API_KEY}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown");
      throw new Error(`Honcho API ${method} ${path} returned ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fire a request that may 409 Conflict (resource already exists) — that's OK.
 */
async function honchoFetchIdempotent(
  path: string,
  method: "POST" | "PUT" = "POST",
  body?: unknown,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HONCHO_TIMEOUT_MS);

  try {
    const res = await fetch(`${HONCHO_API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(HONCHO_API_KEY ? { Authorization: `Bearer ${HONCHO_API_KEY}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    // 409 = already exists — perfectly fine for idempotent creates
    if (res.status === 409) {
      return { alreadyExists: true };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown");
      throw new Error(`Honcho API ${method} ${path} returned ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } finally {
    clearTimeout(timer);
  }
}

// --------------------------------------------------------------------------
// Workspace management (company-scoped)
// --------------------------------------------------------------------------
function workspaceId(companyId: string): string {
  return `autarch-company-${companyId}`;
}

function peerId(agentId: string): string {
  return `agent-${agentId}`;
}

// --------------------------------------------------------------------------
// Ensure workspace + peer exist
// --------------------------------------------------------------------------
async function ensureWorkspaceAndPeer(
  companyId: string,
  agentId: string,
): Promise<void> {
  const wsId = workspaceId(companyId);
  const pId = peerId(agentId);

  // Create workspace (POST /v3/workspaces with id in body)
  await honchoFetchIdempotent(`/v3/workspaces`, "POST", { id: wsId });

  // Create peer (POST /v3/workspaces/{ws}/peers with id in body)
  await honchoFetchIdempotent(`/v3/workspaces/${wsId}/peers`, "POST", { id: pId });
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Ingest a completed run's conversation into Honcho for reasoning.
 * This should be called after each successful hermes_cloud run
 * to feed the cross-session memory.
 */
export async function ingestRunConversation(
  companyId: string,
  agentId: string,
  runId: string,
  messages: HonchoMessage[],
): Promise<void> {
  if (!isHonchoEnabled() || messages.length === 0) return;

  try {
    await ensureWorkspaceAndPeer(companyId, agentId);

    const wsId = workspaceId(companyId);
    const pId = peerId(agentId);
    const sessionId = `run-${runId}`;

    // Create session (POST /v3/workspaces/{ws}/sessions with id in body)
    await honchoFetchIdempotent(
      `/v3/workspaces/${wsId}/sessions`,
      "POST",
      { id: sessionId, peers: [pId] },
    );

    // Add messages (POST /v3/workspaces/{ws}/sessions/{session}/messages)
    await honchoFetch(
      `/v3/workspaces/${wsId}/sessions/${sessionId}/messages`,
      "POST",
      {
        messages: messages.map((m) => ({
          peer: m.role === "assistant" ? pId : "user",
          content: m.content,
        })),
      },
    );

    logger.info(
      { companyId, agentId, runId, messageCount: messages.length },
      "Honcho: ingested run conversation",
    );
  } catch (err) {
    logger.warn(
      { err, companyId, agentId, runId },
      "Honcho: failed to ingest run conversation — non-fatal",
    );
  }
}

/**
 * Query Honcho for synthesized insights about the agent's context.
 * Used to generate high-quality context for the Externalized Brain.
 */
export async function queryAgentInsights(
  companyId: string,
  agentId: string,
  query: string = "Summarize the key context, preferences, and learned patterns for this agent. Focus on actionable insights.",
): Promise<HonchoInsight | null> {
  if (!isHonchoEnabled()) return null;

  try {
    await ensureWorkspaceAndPeer(companyId, agentId);

    const wsId = workspaceId(companyId);
    const pId = peerId(agentId);

    // POST /v3/workspaces/{ws}/peers/{peer}/chat
    const result = await honchoFetch(
      `/v3/workspaces/${wsId}/peers/${pId}/chat`,
      "POST",
      { query },
    );

    const content = typeof (result as Record<string, unknown>)?.content === "string"
      ? (result as Record<string, string>).content
      : JSON.stringify(result);

    return {
      content,
      queriedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.warn(
      { err, companyId, agentId },
      "Honcho: failed to query agent insights — non-fatal",
    );
    return null;
  }
}

/**
 * Get contextual information for a specific query.
 * Used for pre-run context enrichment.
 */
export async function getContext(
  companyId: string,
  agentId: string,
  _query: string,
): Promise<string | null> {
  if (!isHonchoEnabled()) return null;

  try {
    const wsId = workspaceId(companyId);
    const pId = peerId(agentId);

    // GET /v3/workspaces/{ws}/peers/{peer}/context (no body)
    const result = await honchoFetch(
      `/v3/workspaces/${wsId}/peers/${pId}/context`,
      "GET",
    );

    return typeof (result as Record<string, unknown>)?.content === "string"
      ? (result as Record<string, string>).content
      : null;
  } catch (err) {
    logger.warn(
      { err, companyId, agentId },
      "Honcho: failed to get context — non-fatal",
    );
    return null;
  }
}

/**
 * Honcho Client — Autonomous Insight Generation
 *
 * Integrates with Honcho (Plastic Labs) for reasoning-based
 * cross-session memory and user/agent modeling.
 *
 * Architecture:
 *  - Self-hosted Honcho instance (Docker) for data sovereignty
 *  - Workspace per company (multi-tenant isolation)
 *  - Peer per agent (agent identity modeling)
 *  - Session per heartbeat run (conversation thread)
 *
 * Environment:
 *  - HONCHO_API_URL:  self-hosted Honcho endpoint (default: http://localhost:8100)
 *  - HONCHO_API_KEY:  API key for authentication
 */

import { logger } from "../../middleware/logger.js";

// --------------------------------------------------------------------------
// Config
// --------------------------------------------------------------------------
const HONCHO_API_URL = process.env.HONCHO_API_URL ?? "http://localhost:8100";
const HONCHO_API_KEY = process.env.HONCHO_API_KEY ?? "";

function isHonchoEnabled(): boolean {
  return HONCHO_API_KEY.length > 0;
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
  method: "GET" | "POST" | "PUT" = "GET",
  body?: unknown,
): Promise<unknown> {
  const res = await fetch(`${HONCHO_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(HONCHO_API_KEY ? { Authorization: `Bearer ${HONCHO_API_KEY}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`Honcho API ${method} ${path} returned ${res.status}: ${text}`);
  }

  return res.json();
}

// --------------------------------------------------------------------------
// Workspace management (company-scoped)
// --------------------------------------------------------------------------
function workspaceId(companyId: string): string {
  return `autarch-company-${companyId}`;
}

function peerName(agentId: string): string {
  return `agent-${agentId}`;
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
    const wsId = workspaceId(companyId);

    // Create or get workspace/peer (Honcho is idempotent)
    await honchoFetch(`/v3/workspaces/${wsId}/peers/${peerName(agentId)}`, "PUT");

    // Create session and add messages
    const sessionId = `run-${runId}`;
    await honchoFetch(
      `/v3/workspaces/${wsId}/sessions/${sessionId}/messages`,
      "POST",
      {
        messages: messages.map((m) => ({
          peer: m.role === "assistant" ? peerName(agentId) : "user",
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
 * Used to generate high-quality memory entries for the Externalized Brain.
 */
export async function queryAgentInsights(
  companyId: string,
  agentId: string,
  query: string = "Summarize the key context, preferences, and learned patterns for this agent. Focus on actionable insights.",
): Promise<HonchoInsight | null> {
  if (!isHonchoEnabled()) return null;

  try {
    const wsId = workspaceId(companyId);
    const peer = peerName(agentId);

    const result = await honchoFetch(
      `/v3/workspaces/${wsId}/peers/${peer}/chat`,
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
  query: string,
): Promise<string | null> {
  if (!isHonchoEnabled()) return null;

  try {
    const wsId = workspaceId(companyId);
    const peer = peerName(agentId);

    const result = await honchoFetch(
      `/v3/workspaces/${wsId}/peers/${peer}/context`,
      "POST",
      { query },
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

import type { AdapterExecutionContext, AdapterExecutionResult } from "../types.js";
import { scrubContextMessages } from "./pii-scrub.js";

/**
 * Hermes Cloud Adapter — execute
 *
 * Sends a heartbeat execution request to the Hermes Cloud Run worker.
 * The worker runs Hermes v0.6.0 with Profiles for multi-tenant isolation.
 *
 * Response format: NDJSON stream parsed into stdout lines for Paperclip UI.
 */

// --- Config helpers ---
function asString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// --- Allowed toolsets (HARD WHITELIST — no terminal, no process) ---
const ALLOWED_TOOLSETS = new Set(["web", "file", "memory", "delegate_task"]);

function sanitizeToolsets(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["web", "file", "memory"];
  return raw.filter((t) => typeof t === "string" && ALLOWED_TOOLSETS.has(t));
}

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const { config, runId, agent, context, onLog } = ctx;

  // --- Required config ---
  const workerUrl = asString(config.workerUrl, process.env.HERMES_CLOUD_WORKER_URL ?? "");
  if (!workerUrl) {
    throw new Error("hermes_cloud adapter: missing workerUrl or HERMES_CLOUD_WORKER_URL env");
  }

  const model = asString(config.model, "hermes-4-405b");
  const maxIterations = Math.min(asNumber(config.maxIterations, 20), 50); // Hard cap: 50
  const costCapPerRun = asNumber(config.costCapPerRun, 5.0); // Default: $5.00
  const timeoutMs = asNumber(config.timeoutMs, 300_000); // Default: 5 min
  const enabledToolsets = sanitizeToolsets(config.enabledToolsets);
  const profileName = asString(config.profileName, `company-${agent.companyId ?? "default"}`);
  const systemPrompt = asString(config.systemPrompt, "");

  // --- PII Scrub context messages ---
  const contextMessages = Array.isArray((context as Record<string, unknown>)?.messages)
    ? (context as Record<string, unknown>).messages as Array<{ role: string; content: string }>
    : [];
  const { messages: scrubbedMessages, totalScrubbed } = scrubContextMessages(contextMessages);
  if (totalScrubbed > 0) {
    await onLog("stdout", `[pii-scrub] Redacted ${totalScrubbed} PII field(s) before worker call\n`);
  }

  // --- Build request payload ---
  const payload = {
    agentId: agent.id,
    runId,
    profileName,
    model,
    systemPrompt,
    context: { ...context, messages: scrubbedMessages },
    enabledToolsets,
    maxIterations,
    costCapPerRun,
  };

  // --- Execute with timeout ---
  const controller = new AbortController();
  const timer = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(`${workerUrl}/v1/execute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "unknown");
      throw new Error(`Hermes Cloud worker returned ${res.status}: ${errorText}`);
    }

    // --- Parse NDJSON response ---
    const body = await res.text();
    const lines = body.split("\n").filter((l) => l.trim().length > 0);

    let summary = `Hermes Cloud (${model})`;
    let exitCode = 0;

    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        if (event.type === "error") {
          exitCode = 1;
          summary = `Error: ${event.content ?? "unknown"}`;
        } else if (event.type === "response") {
          summary = `Hermes Cloud (${model}) — ${event.content?.substring(0, 80) ?? "done"}`;
        } else if (event.type === "usage") {
          // Check cost cap
          const runCost = typeof event.totalCostUsd === "number" ? event.totalCostUsd : 0;
          if (runCost > costCapPerRun) {
            await onLog("stderr", `[cost-cap] Run cost $${runCost.toFixed(4)} exceeded cap $${costCapPerRun.toFixed(2)}\n`);
          }
        }
        // Emit line as stdout for Paperclip transcript
        await onLog("stdout", line + "\n");
      } catch {
        // Non-JSON line — emit as raw stdout
        await onLog("stdout", line + "\n");
      }
    }

    return {
      exitCode,
      signal: null,
      timedOut: false,
      summary,
    };
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    if (isAbort) {
      return {
        exitCode: 1,
        signal: "SIGTERM",
        timedOut: true,
        summary: `Hermes Cloud timed out after ${timeoutMs / 1000}s`,
      };
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

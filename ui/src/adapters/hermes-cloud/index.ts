import type { UIAdapterModule } from "../types";
import type { TranscriptEntry, CreateConfigValues } from "@paperclipai/adapter-utils";
import { HermesCloudConfigFields } from "./config-fields";

/**
 * Parse NDJSON stdout lines from Hermes Cloud worker.
 */
function parseHermesCloudStdoutLine(line: string, ts: string): TranscriptEntry[] {
  try {
    const event = JSON.parse(line);

    switch (event.type) {
      case "thinking":
        return [{ kind: "thinking", ts, text: event.content ?? "" }];
      case "response":
        return [{ kind: "assistant", ts, text: event.content ?? "" }];
      case "tool_call":
        return [{ kind: "tool_call", ts, name: event.name ?? "tool", input: event.input ?? {} }];
      case "tool_result":
        return [{
          kind: "tool_result",
          ts,
          toolUseId: event.toolUseId ?? "",
          toolName: event.name,
          content: typeof event.content === "string" ? event.content : JSON.stringify(event.content ?? ""),
          isError: event.isError ?? false,
        }];
      case "usage":
        return [{
          kind: "result",
          ts,
          text: `Tokens: ${event.inputTokens ?? 0} in / ${event.outputTokens ?? 0} out — Cost: $${(event.totalCostUsd ?? 0).toFixed(4)}`,
          inputTokens: event.inputTokens ?? 0,
          outputTokens: event.outputTokens ?? 0,
          cachedTokens: 0,
          costUsd: event.totalCostUsd ?? 0,
          subtype: "usage",
          isError: false,
          errors: [],
        }];
      case "error":
        return [{ kind: "system", ts, text: `❌ ${event.content ?? "Unknown error"}` }];
      case "system":
        return [{ kind: "system", ts, text: event.content ?? "" }];
      default:
        return [{ kind: "stdout", ts, text: line }];
    }
  } catch {
    if (line.trim()) {
      return [{ kind: "stdout", ts, text: line }];
    }
    return [];
  }
}

/**
 * Build adapter config from create form values.
 */
function buildHermesCloudConfig(values: CreateConfigValues): Record<string, unknown> {
  return {
    workerUrl: values.url || undefined,
    model: values.model || "hermes-4-405b",
    maxIterations: values.maxTurnsPerRun || 20,
    costCapPerRun: 5.0,
    enabledToolsets: ["web", "file", "memory", "delegate_task"],
  };
}

export const hermesCloudUIAdapter: UIAdapterModule = {
  type: "hermes_cloud",
  label: "Hermes Cloud Agent",
  parseStdoutLine: parseHermesCloudStdoutLine,
  ConfigFields: HermesCloudConfigFields,
  buildAdapterConfig: buildHermesCloudConfig,
};

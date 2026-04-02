/**
 * Hermes Cloud — Memory Lifecycle
 *
 * Pre-loads agent memories from the Paperclip DB before execution
 * and post-persists any new memories extracted from the response.
 *
 * This module is the bridge between the stateless worker's
 * "Externalized Brain" and the Paperclip control plane's DB.
 *
 * NOTE: Since adapters don't receive the DB instance directly
 * (by design — they're isolated from the DB layer), memory
 * operations are injected into the request payload as
 * memorySnapshot/skillsIndex fields, and extraction from
 * responses happens asynchronously via NDJSON parsing.
 */
import { eq, and, desc } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { agentMemory } from "@paperclipai/db";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
export interface MemoryEntry {
  key: string;
  content: string;
  category: string;
  importance: number;
}

export interface MemoryLoadResult {
  memorySnapshot: MemoryEntry[];
  skillsIndex: MemoryEntry[];
}

// --------------------------------------------------------------------------
// Pre-load: fetch agent memories before execution
// --------------------------------------------------------------------------
const MAX_MEMORIES = 50; // Cap to avoid token bloat

export async function loadAgentMemories(
  db: Db,
  companyId: string,
  agentId: string,
): Promise<MemoryLoadResult> {
  const rows = await db
    .select({
      key: agentMemory.key,
      content: agentMemory.content,
      category: agentMemory.category,
      importance: agentMemory.importance,
    })
    .from(agentMemory)
    .where(
      and(
        eq(agentMemory.companyId, companyId),
        eq(agentMemory.agentId, agentId),
      ),
    )
    .orderBy(desc(agentMemory.importance))
    .limit(MAX_MEMORIES);

  const memorySnapshot: MemoryEntry[] = [];
  const skillsIndex: MemoryEntry[] = [];

  for (const row of rows) {
    const entry: MemoryEntry = {
      key: row.key,
      content: row.content,
      category: row.category,
      importance: row.importance,
    };

    if (row.category === "skill") {
      skillsIndex.push(entry);
    } else {
      memorySnapshot.push(entry);
    }
  }

  return { memorySnapshot, skillsIndex };
}

// --------------------------------------------------------------------------
// Post-persist: extract new memories from agent response and save
// --------------------------------------------------------------------------
export async function persistNewMemories(
  db: Db,
  companyId: string,
  agentId: string,
  runId: string,
  ndjsonLines: string[],
): Promise<number> {
  const newMemories: Array<{
    key: string;
    content: string;
    category: string;
    importance: number;
  }> = [];

  // ---- Helper: extract memory from a parsed tool-call input ----
  function extractMemoryFromInput(input: Record<string, unknown>): void {
    const name = (input.name as string) ?? "";
    // Accept both "memory" (correct) and "save_memory" (legacy)
    if (name !== "memory" && name !== "save_memory" && name !== "") return;

    const action = (input.action as string) ?? "add";
    if (action !== "add" && action !== "replace") return;

    newMemories.push({
      key: (input.key as string) ?? `auto-${Date.now()}`,
      content: (input.content as string) ?? (input.memory as string) ?? "",
      category: input.target === "user" ? "user" : ((input.category as string) ?? "memory"),
      importance: (input.importance as number) ?? 50,
    });
  }

  // ---- Regex for Hermes XML-style <tool_call> tags in response text ----
  const toolCallTagRe = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/g;

  for (const line of ndjsonLines) {
    try {
      const event = JSON.parse(line);

      // Path 1: Structured NDJSON tool_call events (OpenAI/Anthropic format)
      if (
        event.type === "tool_call" &&
        event.name === "memory" &&
        event.input
      ) {
        const action = event.input.action ?? "add";
        if (action === "add" || action === "replace") {
          newMemories.push({
            key: event.input.key ?? `auto-${Date.now()}`,
            content: event.input.content ?? event.input.memory ?? "",
            category: event.input.target === "user" ? "user" : (event.input.category ?? "memory"),
            importance: event.input.importance ?? 50,
          });
        }
      }

      // Path 2: Hermes-4-405B embeds tool_calls as <tool_call>{JSON}</tool_call>
      // in the response text.  This is the primary path for NousResearch models.
      if (event.type === "response" && typeof event.content === "string") {
        let match: RegExpExecArray | null;
        while ((match = toolCallTagRe.exec(event.content)) !== null) {
          try {
            const parsed = JSON.parse(match[1]);
            if (parsed.name === "memory" || parsed.name === "save_memory") {
              const args = parsed.arguments ?? parsed;
              extractMemoryFromInput({ name: parsed.name, ...args });
            }
          } catch {
            // Malformed JSON inside <tool_call> — skip
          }
        }
      }
    } catch {
      // Skip non-JSON lines
    }
  }

  if (newMemories.length === 0) return 0;

  // Upsert by key — newer memories overwrite older ones
  for (const mem of newMemories) {
    await db
      .insert(agentMemory)
      .values({
        companyId,
        agentId,
        key: mem.key,
        content: mem.content,
        category: mem.category,
        importance: mem.importance,
        sourceRunId: runId,
      })
      .onConflictDoNothing(); // Simple insert — upgrade to upsert when needed
  }

  return newMemories.length;
}

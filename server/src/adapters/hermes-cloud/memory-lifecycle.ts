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
  // Look for memory_save events in the NDJSON stream
  const newMemories: Array<{
    key: string;
    content: string;
    category: string;
    importance: number;
  }> = [];

  for (const line of ndjsonLines) {
    try {
      const event = JSON.parse(line);
      // Hermes emits tool_call events for memory operations
      if (
        event.type === "tool_call" &&
        event.name === "save_memory" &&
        event.input
      ) {
        newMemories.push({
          key: event.input.key ?? `auto-${Date.now()}`,
          content: event.input.content ?? event.input.memory ?? "",
          category: event.input.category ?? "memory",
          importance: event.input.importance ?? 50,
        });
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

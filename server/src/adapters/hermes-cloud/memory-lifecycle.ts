/**
 * Hermes Cloud — Memory Lifecycle
 *
 * Pre-loads agent memories from the Paperclip DB before execution
 * and post-persists any new memories extracted from the response.
 *
 * This module is the bridge between the stateless worker's
 * "Externalized Brain" and the Paperclip control plane's DB.
 *
 * Supported categories: memory | skill | lesson | research | user_preference | conversation
 *
 * NOTE: Since adapters don't receive the DB instance directly
 * (by design — they're isolated from the DB layer), memory
 * operations are injected into the request payload as
 * memorySnapshot/skillsIndex fields, and extraction from
 * responses happens asynchronously via NDJSON parsing.
 */
import { eq, and, desc, inArray } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { agentMemory, issues, agents, agentWakeupRequests, heartbeatRuns } from "@paperclipai/db";

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
const LOADABLE_CATEGORIES = ["memory", "skill", "lesson", "research", "user_preference"];

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
        inArray(agentMemory.category, LOADABLE_CATEGORIES),
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

/** Tool names that map to memory persistence */
const MEMORY_TOOL_NAMES = new Set(["memory", "save_memory"]);

/** Tool names that map to skill persistence */
const SKILL_TOOL_NAMES = new Set(["create_skill", "update_skill", "skill"]);

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

  const newIssues: Array<{
    assigneeAgentName: string;
    description: string;
  }> = [];

  const newAgents: Array<{
    name: string;
    role: string;
    instructions: string;
  }> = [];

  // ---- Helper: extract memory from a parsed tool-call input ----
  function extractMemoryFromInput(
    input: Record<string, unknown>,
    defaultCategory: string = "memory",
  ): void {
    const name = (input.name as string) ?? "";
    const action = (input.action as string) ?? "add";
    if (action !== "add" && action !== "replace") return;

    newMemories.push({
      key: (input.key as string) ?? `auto-${Date.now()}`,
      content: (input.content as string) ?? (input.memory as string) ?? "",
      category: input.target === "user"
        ? "user_preference"
        : ((input.category as string) ?? defaultCategory),
      importance: (input.importance as number) ?? 50,
    });
  }

  // ---- Regex for Hermes XML-style <tool_call> tags in response text ----
  const toolCallTagRe = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/g;

  for (const line of ndjsonLines) {
    try {
      const event = JSON.parse(line);

      // Path 1: Structured NDJSON tool_call events (OpenAI/Anthropic format)
      if (event.type === "tool_call" && event.input) {
        const toolName = event.name ?? "";

        // Memory tools
        if (MEMORY_TOOL_NAMES.has(toolName)) {
          const action = event.input.action ?? "add";
          if (action === "add" || action === "replace") {
            newMemories.push({
              key: event.input.key ?? `auto-${Date.now()}`,
              content: event.input.content ?? event.input.memory ?? "",
              category: event.input.target === "user"
                ? "user_preference"
                : (event.input.category ?? "memory"),
              importance: event.input.importance ?? 50,
            });
          }
        }

        // Skill tools
        if (SKILL_TOOL_NAMES.has(toolName)) {
          newMemories.push({
            key: event.input.name ?? event.input.key ?? `skill-${Date.now()}`,
            content: event.input.content ?? event.input.description ?? JSON.stringify(event.input),
            category: "skill",
            importance: event.input.importance ?? 70,
          });
        }

        // Delegate task
        if (toolName === "delegate_task") {
          newIssues.push({
            assigneeAgentName: event.input.agent ?? event.input.assignee ?? event.input.agent_name ?? "",
            description: event.input.task ?? event.input.description ?? JSON.stringify(event.input),
          });
        }

        // Hire employee
        if (toolName === "hire_employee" || toolName === "create_agent") {
          newAgents.push({
            name: event.input.name ?? "New Employee",
            role: event.input.role ?? "employee",
            instructions: event.input.instructions ?? event.input.description ?? "",
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
            const parsedName = parsed.name ?? "";
            const rawArgs = parsed.arguments ?? parsed;
            const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;

            if (MEMORY_TOOL_NAMES.has(parsedName)) {
              extractMemoryFromInput({ name: parsedName, ...args }, "memory");
            }
            if (SKILL_TOOL_NAMES.has(parsedName)) {
              extractMemoryFromInput({ name: parsedName, ...args }, "skill");
            }
            if (parsedName === "delegate_task") {
              newIssues.push({
                assigneeAgentName: args.agent ?? args.assignee ?? args.agent_name ?? "",
                description: args.task ?? args.description ?? JSON.stringify(args),
              });
            }
            if (parsedName === "hire_employee" || parsedName === "create_agent") {
              newAgents.push({
                name: args.name ?? "New Employee",
                role: args.role ?? "employee",
                instructions: args.instructions ?? args.description ?? "",
              });
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

  if (newMemories.length === 0 && newIssues.length === 0) return 0;

  let persisted = 0;

  // Upsert by key — newer memories overwrite older ones
  // Uses the unique index on (company_id, agent_id, key) for atomic upsert
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
      .onConflictDoUpdate({
        target: [agentMemory.companyId, agentMemory.agentId, agentMemory.key],
        set: {
          content: mem.content,
          category: mem.category,
          importance: mem.importance,
          sourceRunId: runId,
          updatedAt: new Date(),
        },
      });
    persisted++;
  }

  // Create hired employees
  for (const agentReq of newAgents) {
    if (!agentReq.name) continue;
    const [newAgent] = await db.insert(agents).values({
      companyId,
      name: agentReq.name,
      role: agentReq.role,
      adapterType: "hermes_cloud",
      status: "idle",
    }).returning({ id: agents.id });
    
    if (agentReq.instructions) {
      await db.insert(agentMemory).values({
        companyId,
        agentId: newAgent.id,
        key: "core_instructions",
        content: agentReq.instructions,
        category: "memory",
        importance: 100,
        sourceRunId: runId,
      });
    }
    persisted++;
  }

  // Create delegated tasks as user-level issues assigned to the target agent
  for (const issueReq of newIssues) {
    if (!issueReq.assigneeAgentName || !issueReq.description) continue;
    
    // Resolve assignee agent
    const targetAgentRows = await db.select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.companyId, companyId), eq(agents.name, issueReq.assigneeAgentName)))
      .limit(1);
      
    if (targetAgentRows.length > 0) {
      const assigneeAgentId = targetAgentRows[0].id;
      const [newIssue] = await db.insert(issues).values({
        companyId,
        title: `Delegated Task (from run ${runId.slice(0, 8)})`,
        description: issueReq.description,
        status: "todo",
        priority: "high",
        assigneeAgentId,
        createdByAgentId: agentId,
      }).returning({ id: issues.id });
      
      const [wakeup] = await db.insert(agentWakeupRequests).values({
        companyId,
        agentId: assigneeAgentId,
        source: "assignment",
        triggerDetail: "system",
        reason: `Delegated by agent ${agentId.slice(0, 8)}`,
        payload: { issueId: newIssue.id },
        requestedByActorType: "agent",
        requestedByActorId: agentId,
        status: "queued"
      }).returning({ id: agentWakeupRequests.id });
      
      const enrichedContextSnapshot = {
        issueId: newIssue.id,
        source: "assignment"
      };

      const [newRun] = await db.insert(heartbeatRuns).values({
        companyId,
        agentId: assigneeAgentId,
        invocationSource: "assignment",
        triggerDetail: "system",
        status: "queued",
        wakeupRequestId: wakeup.id,
        contextSnapshot: enrichedContextSnapshot,
      }).returning({ id: heartbeatRuns.id });

      await db.update(agentWakeupRequests)
        .set({ runId: newRun.id, updatedAt: new Date() })
        .where(eq(agentWakeupRequests.id, wakeup.id));
        
      persisted++;
    }
  }

  return persisted;
}

import { pgTable, uuid, text, timestamp, jsonb, index, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { agents } from "./agents.js";

/**
 * agent_memory — Externalized Brain for Hermes (and future agents)
 *
 * Instead of storing memories in ~/.hermes/memories/ on the worker,
 * all agent memory is persisted in the Paperclip control plane DB.
 * This enables multi-tenant isolation, cross-session continuity,
 * and full audit trail of agent knowledge evolution.
 *
 * Categories:
 * - "memory"          — Learned facts, insights, context (standard Hermes memory)
 * - "skill"           — Acquired skills, recipes, procedures
 * - "lesson"          — Lessons learned from failures/successes
 * - "research"        — Research findings from web/Apify tools
 * - "user_preference" — End-user preferences observed by the agent
 * - "conversation"    — Conversation summaries for context restoration
 */
export const agentMemory = pgTable(
  "agent_memory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    agentId: uuid("agent_id").notNull().references(() => agents.id),

    /** Category discriminator */
    category: text("category").notNull().default("memory"),

    /** Human-readable key for dedup (e.g. "python-file-io", "user-prefers-tabs") */
    key: text("key").notNull(),

    /** The actual memory content — markdown or plain text */
    content: text("content").notNull(),

    /** Structured metadata (source, confidence, tags, etc.) */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    /** Importance score 0-100 for retrieval prioritization */
    importance: integer("importance").notNull().default(50),

    /** Provenance: which run/session created this memory */
    sourceRunId: uuid("source_run_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** UNIQUE constraint — enables proper upsert by (company, agent, key) */
    companyAgentKeyUq: uniqueIndex("agent_memory_company_agent_key_uq").on(
      table.companyId,
      table.agentId,
      table.key,
    ),
    companyAgentCategoryIdx: index("agent_memory_company_agent_category_idx").on(
      table.companyId,
      table.agentId,
      table.category,
    ),
    importanceIdx: index("agent_memory_importance_idx").on(
      table.companyId,
      table.agentId,
      table.importance,
    ),
  }),
);

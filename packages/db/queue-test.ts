import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { heartbeatRuns, agentWakeupRequests } from "./src/schema/index.js";
import { eq } from "drizzle-orm";

const sql = postgres(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres");
const db = drizzle(sql);
import { randomUUID } from "crypto";

async function main() {
  const companyId = "b4eb2c07-2306-4e94-a0a8-fdfb9fdf5557";
  const agentId = "23b6704e-4f1b-4c63-87a4-110137f17d65"; // Hermes-E2E
  const issueId = "66bc0b35-47fd-4976-92e0-d9d9367be4ba";

  const [wakeup] = await db.insert(agentWakeupRequests).values({
    companyId,
    agentId,
    source: "assignment",
    triggerDetail: "system",
    reason: "force run",
    payload: { issueId },
    requestedByActorType: "system",
    status: "queued"
  }).returning({ id: agentWakeupRequests.id });
  
  const enrichedContextSnapshot = {
    issueId,
    source: "assignment"
  };

  const [newRun] = await db.insert(heartbeatRuns).values({
    companyId,
    agentId,
    invocationSource: "assignment",
    triggerDetail: "system",
    status: "queued",
    wakeupRequestId: wakeup.id,
    contextSnapshot: enrichedContextSnapshot,
  }).returning({ id: heartbeatRuns.id });

  await db.update(agentWakeupRequests)
    .set({ runId: newRun.id, updatedAt: new Date() })
    .where(eq(agentWakeupRequests.id, wakeup.id));

  console.log("Wakeup successfully queued for Hermes-E2E:", newRun.id);
}

main().catch(console.error).then(() => process.exit(0));

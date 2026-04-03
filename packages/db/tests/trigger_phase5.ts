import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const DATABASE_URL = "postgresql://postgres:Jimpoc-1cergy-nimjat@db.sdukmitswmvbcznhpskm.supabase.co:5432/postgres";
const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

const COMPANY_ID = "b4eb2c07-2306-4e94-a0a8-fdfb9fdf5557";
const CEO_AGENT_ID = "23b6704e-4f1b-4c63-87a4-110137f17d65";

async function main() {
  console.log("Creating delegation task for CEO...");

  // 1. Create Issue
  const [newIssue] = await sql`
    INSERT INTO issues (id, company_id, title, description, status, priority, assignee_agent_id)
    VALUES (
      gen_random_uuid(),
      ${COMPANY_ID},
      'Hire & Scrape Initiative',
      'Hire an employee named "Web Scraper" with the role "employee" and instructions to scrape web data. Then delegate a task to "Web Scraper" to scrape https://bio-os.io and save the result into our company memory.',
      'todo',
      'high',
      ${CEO_AGENT_ID}
    )
    RETURNING id;
  `;

  const issueId = newIssue.id;
  console.log("Created Issue:", issueId);

  // 2. Wakeup Request
  const [wakeup] = await sql`
    INSERT INTO agent_wakeup_requests (id, company_id, agent_id, source, trigger_detail, payload, status)
    VALUES (
      gen_random_uuid(),
      ${COMPANY_ID},
      ${CEO_AGENT_ID},
      'assignment',
      'test_script',
      ${JSON.stringify({ issueId })},
      'queued'
    )
    RETURNING id;
  `;
  const wakeupId = wakeup.id;
  console.log("Created Wakeup Request:", wakeupId);

  // 3. Heartbeat Run
  const [run] = await sql`
    INSERT INTO heartbeat_runs (id, company_id, agent_id, wakeup_request_id, invocation_source, trigger_detail, context_snapshot, status)
    VALUES (
      gen_random_uuid(),
      ${COMPANY_ID},
      ${CEO_AGENT_ID},
      ${wakeupId},
      'assignment',
      'test_script',
      ${JSON.stringify({ issueId, source: "assignment" })},
      'queued'
    )
    RETURNING id;
  `;
  console.log("Created Run:", run.id);

  await sql`
    UPDATE agent_wakeup_requests SET run_id = ${run.id} WHERE id = ${wakeupId}
  `;

  console.log("Trigger complete! To monitor logs, tail the Cloud Run logs.");
  
  process.exit(0);
}

main().catch(console.error);

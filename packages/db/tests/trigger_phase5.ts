/**
 * Phase 5 — Update CEO agent config with full toolsets + correct model
 * Then fire the E2E issue: "Hire Scout + scrape bio-os.io"
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://paperclip:paperclip@localhost:5432/paperclip";

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

async function main() {
  // 1. Find the CEO agent
  const agents = await pool.query(`
    SELECT id, name, role, adapter_type, adapter_config 
    FROM agents 
    WHERE name LIKE '%CEODeep%' 
    LIMIT 1
  `);
  
  if (agents.rows.length === 0) {
    console.error("❌ No CEODeep agent found");
    process.exit(1);
  }
  
  const ceo = agents.rows[0];
  console.log("🎯 CEO Agent:", ceo.name, "(", ceo.id, ")");
  console.log("📋 Current config:", JSON.stringify(ceo.adapter_config, null, 2));
  
  // 2. Update adapter_config with full toolsets + correct model + worker URL
  const updatedConfig = {
    ...ceo.adapter_config,
    model: "gemini-3.1-pro-preview",
    workerUrl: "https://hermes-cloud-worker-61066913791.europe-west1.run.app",
    enabledToolsets: ["web", "file", "memory", "delegate_task", "hire_employee", "mcp", "skills", "todo"],
    maxIterations: 30,
    costCapPerRun: 5.0,
  };
  
  await pool.query(
    `UPDATE agents SET adapter_config = $1, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(updatedConfig), ceo.id]
  );
  
  console.log("✅ CEO adapter_config updated:", JSON.stringify(updatedConfig, null, 2));
  
  // 3. Verify
  const verify = await pool.query(
    `SELECT adapter_config FROM agents WHERE id = $1`,
    [ceo.id]
  );
  console.log("✅ Verified:", JSON.stringify(verify.rows[0].adapter_config, null, 2));
  
  // 4. Get company_id for later use
  const company = await pool.query(
    `SELECT company_id FROM agents WHERE id = $1`,
    [ceo.id]
  );
  console.log("🏢 Company ID:", company.rows[0].company_id);
  
  await pool.end();
}

main().catch(console.error);

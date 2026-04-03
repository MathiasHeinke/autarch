import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  const result = await sql`SELECT id, name, role FROM agents WHERE company_id = 'b4eb2c07-2306-4e94-a0a8-fdfb9fdf5557'`;
  console.log("Agents in ARES Bio.OS:");
  console.table(result);
}
main().catch(console.error).then(() => process.exit(0));

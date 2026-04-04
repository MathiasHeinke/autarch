import { createDb } from "./client.js";
import { authUsers } from "./schema/index.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

console.log("Seeding deep-e2e user...");

await db
  .insert(authUsers)
  .values({
    id: "deep-e2e-bot-id",
    email: "deep-e2e@bio-os.io",
    name: "Deep E2E Bot",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  .onConflictDoNothing();

console.log("Seed user complete");
process.exit(0);

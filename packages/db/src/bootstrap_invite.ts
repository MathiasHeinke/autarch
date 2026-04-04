import { createHash, randomBytes } from "node:crypto";
import { createDb } from "./client.js";
import { invites } from "./schema/index.js";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL required");

const db = createDb(dbUrl);

const token = `pcp_bootstrap_${randomBytes(24).toString("hex")}`;
const tokenHash = createHash("sha256").update(token).digest("hex");
const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

await db.insert(invites).values({
  inviteType: "bootstrap_ceo",
  tokenHash,
  allowedJoinTypes: "human",
  expiresAt,
  invitedByUserId: "system",
});

console.log("Token:", token);
console.log("Invite URL: http://localhost:5173/invite/" + token);
console.log("Expires:", expiresAt.toISOString());
process.exit(0);

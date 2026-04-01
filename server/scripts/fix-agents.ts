import { db } from "../src/db/index.js";
import { agents } from "@paperclipai/db";
import { eq } from "drizzle-orm";

async function run() {
  const allAgents = await db.select({ id: agents.id, name: agents.name, adapterType: agents.adapterType, command: agents.command, runtimeConfig: agents.runtimeConfig }).from(agents);
  console.log("Current Agents:", JSON.stringify(allAgents, null, 2));
  
  // Fix the invalid adapter types
  let fixed = 0;
  for (const agent of allAgents) {
    if (agent.adapterType === "hermes") {
      console.log(`Fixing agent ${agent.name} (${agent.id}) -> changing adapterType to 'hermes_cloud'`);
      await db.update(agents).set({ adapterType: "hermes_cloud" }).where(eq(agents.id, agent.id));
      fixed++;
    }
  }
  
  if (fixed > 0) {
    console.log(`Successfully fixed ${fixed} agents.`);
  } else {
    console.log("No agents with adapterType 'hermes' found.");
  }
  
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });

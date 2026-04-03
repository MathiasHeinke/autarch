import { test, chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const supabaseUrl = "https://sdukmitswmvbcznhpskm.supabase.co";
const keys = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!keys) {
  console.log("No service role key provided in env. We need to fetch it or bypass auth.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, keys);

async function main() {
  console.log("Generating magic link for mathias@ares-bio.com...");
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: "mathias@ares-bio.com",
    options: {
      redirectTo: "https://autarch.app/dashboard"
    }
  });
  
  if (error || !data?.properties?.action_link) {
    console.error("Failed to generate magic link:", error);
    process.exit(1);
  }
  
  const magicLink = data.properties.action_link;
  console.log("Got magic link. Launching Chrome...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", msg => {
    console.log(`[CHROME CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on("pageerror", err => {
    console.error(`[CHROME UNCAUGHT ERROR]`, err);
  });

  console.log("Navigating to auth link...");
  await page.goto(magicLink);
  await page.waitForTimeout(5000); 

  console.log("Current URL:", page.url());
  
  // Navigate to ARES Bio.OS company if not already there
  // Assuming it's in the list
  try {
    await page.getByText("ARES Bio.OS").click({ timeout: 5000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log("Maybe already inside ARES Bio.OS or not found.");
  }

  // Go to Issues
  await page.goto("https://autarch.app/issues");
  await page.waitForTimeout(3000);
  
  console.log("Creating Issue for CEO...");
  // Fill the task
  await page.getByPlaceholder("e.g. Research competitor pricing").fill("Hire an employee to scrape https://bio-os.io and extract the core information into a markdown document. Assign this employee an issue with this task, ensure you get the document back and present it here.");
  
  // Select CEO
  // Try to find the assignee dropdown
  try {
    await page.getByRole("combobox", { name: /assign/i }).click();
    await page.getByText("Hermes-E2E").click();
  } catch(e) {
     console.log("Could not assign Hermes-E2E manually, maybe default.");
  }
  
  await page.getByRole("button", { name: /Create Issue/i }).click();
  console.log("Issue created! Monitoring for 60 seconds...");
  
  // Monitor the network and console
  await page.waitForTimeout(60000);
  
  await browser.close();
  console.log("Done.");
}

main().catch(console.error);

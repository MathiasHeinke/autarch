import { test, chromium } from "@playwright/test";

const authToken = process.env.BETTER_AUTH_TOKEN;

if (!authToken) {
  console.log("No BETTER_AUTH_TOKEN provided in env.");
  process.exit(1);
}

async function main() {
  console.log("Got auth token. Launching Chrome...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Set the Better Auth session token cookie
  await context.addCookies([{
    name: "better-auth.session_token",
    value: authToken,
    domain: "autarch.app",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax"
  }]);

  const page = await context.newPage();

  page.on("console", msg => {
    console.log(`[CHROME CONSOLE] ${msg.type().toUpperCase()}: ${msg.location().url} - ${msg.text()}`);
  });
  
  page.on("pageerror", err => {
    console.error(`[CHROME UNCAUGHT ERROR]`, err);
  });

  page.on("requestfailed", request => {
    // Only log API failures or JS failures, not just random analytics
    if (!request.url().includes('posthog') && !request.url().includes('google-analytics')) {
        console.log(`[NETWORK ERROR] ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  console.log("Navigating to https://autarch.app/ ...");
  const response = await page.goto("https://autarch.app/");
  console.log("Navigation response:", response?.status());
  await page.waitForTimeout(5000); 

  console.log("Current URL:", page.url());
  
  // Navigate to ARES Bio.OS company if not already there
  try {
    const aresBio = page.getByText("ARES Bio.OS");
    if (await aresBio.isVisible()) {
      await aresBio.click({ timeout: 5000 });
      await page.waitForTimeout(4000);
      console.log("Navigated into company dashboard");
    } else {
      console.log("ARES Bio.OS not found. Maybe already inside or list is empty.");
    }
  } catch (e) {
    console.log("Error finding ARES Bio.OS element:", e.message);
  }

  // Trigger the actual phase 5 logic manually via UI if needed, OR we can just observe since we injected via SQL
  // The user told me to monitor the console while I fix errors.
  
  console.log("Monitoring console for 90 seconds while background tasks run...");
  
  // Keep page alive 
  await page.waitForTimeout(90000);
  
  await browser.close();
  console.log("Done logging console.");
}

main().catch(console.error);

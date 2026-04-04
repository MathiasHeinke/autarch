import { chromium } from "@playwright/test";

async function main() {
  console.log("Starting Chrome for E2E Testing...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];

  page.on("console", msg => {
    const text = msg.text();
    const type = msg.type().toUpperCase();
    const url = msg.location().url || "unknown";
    
    // Ignore expected HTTP errors from the frontend checking session state, etc
    if ((type === "ERROR" || type === "WARNING") && (text.includes("status of 401") || text.includes("status of 403") || text.includes("status of 404") || text.includes("WebSocket is closed") || text.includes("Unexpected response code: 404") || text.includes("WebSocket connection to"))) {
      return;
    }

    console.log(`[CONSOLE] ${type}: ${url} - ${text}`);
    if (type === "ERROR" || type === "WARNING") {
      errors.push(`[${type}] ${text} (at ${url})`);
    }
  });

  page.on("pageerror", err => {
    console.log(`[PAGE ERROR] ${Math.floor(Date.now() / 1000)}: ${err.message}`);
    errors.push(`[PAGE ERROR] ${err.message}`);
  });

  page.on("requestfailed", request => {
    const errorText = request.failure()?.errorText;
    if (errorText) {
      console.log(`[REQUEST FAILED] ${request.url()} - ${errorText}`);
      errors.push(`[NETWORK ERR] ${request.url()} - ${errorText}`);
    }
  });

  try {
    console.log("Navigating to https://autarch.app/auth ...");
    const authRes = await page.goto("https://autarch.app/auth");
    if (!authRes?.ok && authRes?.status() !== 200) {
      console.log("Navigation failed with status:", authRes?.status());
    }

    // Give it time to load UI
    await page.waitForTimeout(3000);

    // Switch to Sign Up
    console.log("Switching to Sign Up mode...");
    try {
      await page.waitForTimeout(1000);
      const signUpBtn = page.locator('text="Create one"');
      await signUpBtn.click({ timeout: 2000 });
      console.log("Clicked Create one.");
      await page.waitForTimeout(1000);
    } catch(e) {
      console.log("Sign Up mode button not found, maybe already on sign up mode?", (e as Error).message);
    }
    // Capture non-200 API responses to help debug
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/") && !response.ok()) {
        console.log(`[API ERROR] ${response.request().method()} ${url} returned ${response.status()}`);
        try {
          const body = await response.json();
          console.log(`[API ERROR BODY]`, body);
        } catch(e) {
          try {
             const text = await response.text();
             console.log(`[API ERROR BODY TEXT]`, text.slice(0, 500));
          } catch(e2) {}
        }
      }
    });

    // We can use a random email so it doesn't collide
    const randId = Math.floor(Math.random() * 100000);
    const email = `test-ceo-${randId}@bio-os.io`;
    const pwd = "SecurePassword123!";

    console.log(`Creating user ${email}...`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', pwd);
    
    const nameInput = await page.$('input[name="name"]');
    if (nameInput) {
      console.log("Filling name...");
      await nameInput.fill("Test CEO");
    }
    
    // There shouldn't be an additional name field unless configured, wait let's just click Create Account or Sign In
    const submitBtn = await page.$("button[type='submit']");
    if (submitBtn) {
      await submitBtn.click();
    } else {
      console.log("Couldn't find submit button.");
    }

    console.log("Waiting for auth handling or navigation...");
    await page.waitForTimeout(5000);

    // We should be redirected to the dashboard or to an onboarding flow.
    const currentUrl = page.url();
    console.log(`Current URL after signup: ${currentUrl}`);

    // Removed explicit 10s wait, page.waitForURL or normal playwright waits should handle this

    console.log("Let's look for a 'Create Task' or equivalent button...");
    
    // Check if we are on onboarding
    if (page.url().includes("/onboarding")) {
      console.log("We are on onboarding. Creating company...");
      
      // If there is a Start Onboarding button, click it
      const startBtn = await page.$("text=Start Onboarding");
      if (startBtn) {
         await startBtn.click({ force: true });
         await page.waitForTimeout(1000);
      }

      await page.waitForTimeout(1000);
      const companyInput = await page.getByPlaceholder("Acme Corp");
      if (companyInput) await companyInput.fill("Bio-OS Evaluation Ltd");
      
      console.log("Clicking Next on Step 1...");
      const nextBtn1 = page.locator('button', { hasText: /^Next$/ });
      await nextBtn1.click();
      await page.waitForTimeout(3000);
      
      const step1Error = await page.$$eval(".text-destructive", els => els.map(e => e.textContent));
      if (step1Error.length > 0) {
        console.log("STEP 1 ERRORS:", step1Error);
      }
      
      // We will only do a tiny snippet of the body text so we don't flood the terminal
      let text = await page.locator("body").innerText();
      console.log("Current body text preview:", text.slice(0, 200).replace(/\n/g, " "));
      
      // Now it probably asks for the Agent Name
      const agentInput = await page.getByPlaceholder("CEO");
      await agentInput.fill("CEO Agent");
      
      console.log("Clicking Next on Step 2...");
      const nextBtn2 = page.locator('button', { hasText: /^Next$/ });
      await nextBtn2.click();
      await page.waitForTimeout(2000);

      // Task creation step
      const prompt = "Please crawl https://bio-os.io and create a document evaluating its SEO, marketing, and messaging strengths/weaknesses for the target audience. Import an employee to do the web crawling if necessary.";
      const taskInput = await page.locator("textarea");
      await taskInput.fill(prompt);

      // We are on Step 3 (Task). Click Next to go to Step 4 (Launch).
      console.log("Clicking Next on Step 3...");
      const nextBtn3 = page.locator('button', { hasText: /^Next$/ });
      await nextBtn3.click().catch(() => {});
      await page.waitForTimeout(2000);
      
      // Step 4 (Launch). Click Launch!
      const launchBtn = await page.$("button:has-text('Create & Open Issue')");
      if (launchBtn) {
         await launchBtn.click({ force: true });
      }
      
      console.log("Waiting for Launch to complete...");
      await page.waitForTimeout(10000);
      console.log("URL after launch:", page.url());
      
      const errorText = await page.$$eval(".text-destructive", els => els.map(e => e.textContent));
      if (errorText.length > 0) {
        console.log("ONBOARDING ERRORS:", errorText);
      }
    }

    const bodyText = await page.locator("body").innerText();
    console.log(`Body text snippet:\n${bodyText.slice(0, 300)}...`);

  } catch (err) {
    console.error("Script execution error:", err);
  } finally {
    console.log("Closing browser in 5 seconds...");
    await page.waitForTimeout(5000);
    await browser.close();
    
    if (errors.length > 0) {
      console.log("--- RECORDED ERRORS ---");
      errors.forEach(e => console.log(e));
      process.exit(1);
    } else {
      console.log("No console/network errors recorded!");
      process.exit(0);
    }
  }
}

main();

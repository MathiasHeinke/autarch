import puppeteer from 'puppeteer';
import { resolve } from 'node:path';

(async () => {
    console.log("Starting Puppeteer for E2E...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
        console.log("Navigating to http://localhost:5173/auth ...");
        await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });

        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', 'deep-e2e-3@bio-os.io');
        await page.type('input[name="password"]', 'Password123!');
        
        console.log("Clicking Sign In...");
        await page.click('button[type="submit"]');

        console.log("Waiting for navigation to either boarding or dashboard...");
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log("Navigation timeout, checking URL", e.message));

        console.log("Current URL:", page.url());
        await page.screenshot({ path: '/tmp/e2e_after_login.png' });

        // Onboarding Check
        if (page.url().includes('onboarding') || page.url().includes('auth')) {
            console.log("Onboarding screen detected. Completing wizard...");
            await page.waitForSelector('input[name="name"]', { timeout: 10000 }).catch(() => {});
            
            const inputs = await page.$$('input[name="name"]');
            if (inputs.length > 0) {
                await page.type('input[name="name"]', 'NOUS Architectures E2E');
                await page.click('button[type="submit"]');
                console.log("Clicked create company from onboarding");
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
                console.log("Current URL:", page.url());
                await page.screenshot({ path: '/tmp/e2e_after_company.png' });
            }
        }

        console.log("E2E Phase 2 Auth/Onboarding Complete!");
    } catch (err) {
        console.error("E2E Failed:", err);
        await page.screenshot({ path: '/tmp/e2e_error.png' });
    } finally {
        await browser.close();
    }
})();

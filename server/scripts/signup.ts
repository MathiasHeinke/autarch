import puppeteer from 'puppeteer';

(async () => {
    console.log("Starting Chrome...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    console.log("Navigating to http://localhost:5173 ...");
    await page.goto('http://localhost:5173');

    // Wait for the auth page to load
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    // Check if we are on Sign In or Sign Up
    const isSignIn = await page.evaluate(() => document.body.textContent.includes('Sign in to Paperclip'));
    
    if (isSignIn) {
        console.log("Currently on Sign In page. Trying to switch to Sign Up...");
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text === 'Create one') {
                await btn.click();
                break;
            }
        }
    }

    // Warten bis Name-Input da ist
    console.log("Waiting for Name input...");
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });

    console.log("Filling form...");
    // Einzigartige E-Mail erzeugen, damit Sign-Up nicht fehlschlägt, falls er existiert
    const uniqueEmail = `deep-e2e-${Date.now()}@bio-os.io`;
    console.log("Using email:", uniqueEmail);

    await page.type('input[name="name"]', 'Deep E2E Bot');
    await page.type('input[type="email"]', uniqueEmail);
    await page.type('input[type="password"]', 'Password123!');

    // Suchen wir den "Create Account" Button
    const buttons2 = await page.$$('button');
    let clicked = false;
    for (const btn of buttons2) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text?.includes('Create Account')) {
            await btn.click();
            clicked = true;
            break;
        }
    }

    console.log("Clicked Create Account:", clicked);
    
    console.log("Waiting for navigation...");
    await new Promise(r => setTimeout(r, 5000));
    const url = page.url();
    console.log("Neuer URL nach Sign-up:", url);

    // Mache einen Screenshot vom Ergebnis
    await page.screenshot({ path: '/tmp/after_signup.png' });

    await browser.close();
})();

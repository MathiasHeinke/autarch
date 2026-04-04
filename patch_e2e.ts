import fs from 'fs';
let code = fs.readFileSync('packages/db/tests/run_e2e_prod.ts', 'utf8');
code = code.replace(
  'const signUpBtn = await page.$("text=Create one");',
  'const signUpBtn = await page.waitForSelector("text=Create one", { timeout: 5000 }).catch(() => null);'
);
fs.writeFileSync('packages/db/tests/run_e2e_prod.ts', code);

const fs = require('fs');
const path = require('path');
const playwright = require('playwright');

(async () => {
  const outDir = path.resolve(__dirname, '../reports/screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const urls = [
    { url: 'http://127.0.0.1:8080/', name: 'home' },
    { url: 'http://127.0.0.1:8080/test-hourly-booking', name: 'hourly' },
    { url: 'http://127.0.0.1:8080/admin', name: 'admin' },
    { url: 'http://127.0.0.1:8080/account', name: 'account' }
  ];

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  for (const u of urls) {
    try {
      console.log('Loading', u.url);
      const resp = await page.goto(u.url, { waitUntil: 'networkidle', timeout: 15000 });
      if (!resp) console.log('No response for', u.url);
      await page.waitForTimeout(1000);
      const file = path.join(outDir, `${u.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('Saved screenshot', file);
    } catch (err) {
      console.error('Error loading', u.url, err && err.message);
    }
  }

  await browser.close();
  console.log('Done');
})();

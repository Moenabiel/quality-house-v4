import { chromium } from 'playwright';

async function checkConsole() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text: msg.text(), url: msg.location().url });
    }
  });
  
  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', text: err.message });
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      errors.push({ type: 'network', url: resp.url(), status: resp.status() });
    }
  });
  
  const urls = [
    'http://127.0.0.1:4400/',
    'http://127.0.0.1:4400/products/gum-arabic/',
    'http://127.0.0.1:4400/products/cotton/',
    'http://127.0.0.1:4400/products/seeds/'
  ];
  
  for (const url of urls) {
    errors.length = 0;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      console.log(`${url} - Errors: ${errors.length}`);
      if (errors.length > 0) {
        errors.forEach(e => console.log(`  [${e.type}] ${e.url || e.text}`));
      }
    } catch (e) {
      console.log(`${url} - NAV ERROR: ${e.message}`);
    }
  }
  
  await browser.close();
}

checkConsole().catch(console.error);
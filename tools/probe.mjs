import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`PAGEERROR: ${e.message}`));
page.on('requestfailed', (r) => logs.push(`REQFAIL: ${r.url()} ${r.failure()?.errorText}`));

const t0 = Date.now();
try {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  console.log('domcontentloaded', Date.now() - t0, 'ms');
} catch (e) {
  console.log('GOTO FAIL', e.message);
}
await page.waitForTimeout(6000);
const stats = await page.evaluate(() => {
  const c = document.querySelector('[data-tree]');
  return {
    canvas: c ? `${c.width}x${c.height}` : 'none',
    scrollH: document.body.scrollHeight,
  };
});
console.log(JSON.stringify(stats));
await page.screenshot({ path: 'shots/probe-1920.png' });
console.log(logs.slice(0, 20).join('\n'));
await browser.close();

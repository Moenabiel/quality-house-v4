import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const BASE = 'http://127.0.0.1:4322';
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const t of [
  { name: 'home', url: BASE + '/' },
  { name: 'gum', url: BASE + '/products/gum-arabic/' },
]) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.evaluate(AXE);
  const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
  for (const v of axe.violations) {
    console.log(`\n### ${t.name} — ${v.id} [${v.impact}] — ${v.help}`);
    v.nodes.slice(0, 5).forEach((n) => {
      console.log('  target: ' + n.target.join(' > '));
      (n.all || []).forEach((a) => console.log('  related: ' + (a.message || '')));
      console.log('  summary: ' + n.failureSummary.replace(/\n/g, ' | ').slice(0, 400));
    });
  }
  await page.close();
}
await browser.close();

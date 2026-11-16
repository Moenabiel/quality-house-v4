// axe.mjs — WCAG 2.1 A/AA accessibility audit for the v4 dossier pages.
// Serves whatever is running on http://127.0.0.1:4400 (npm run preview).
// Desktop pass on every page; mobile pass on home (axe applies the
// viewport-conditional rules there, e.g. fixed-stacking).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:4400';
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const RUNS = [
  { name: 'home-1920', url: BASE + '/', viewport: { width: 1920, height: 1080 } },
  { name: 'gum-1920', url: BASE + '/products/gum-arabic/', viewport: { width: 1920, height: 1080 } },
  { name: 'cotton-1920', url: BASE + '/products/cotton/', viewport: { width: 1920, height: 1080 } },
  { name: 'seeds-1920', url: BASE + '/products/seeds/', viewport: { width: 1920, height: 1080 } },
  { name: 'home-390', url: BASE + '/', viewport: { width: 390, height: 844 } },
];

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

let violationsTotal = 0;
for (const t of RUNS) {
  const page = await browser.newPage({ viewport: t.viewport });
  await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2200);
  await page.evaluate(AXE);
  const axe = await page.evaluate(() =>
    window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    })
  );
  console.log(`\n### ${t.name} — violations: ${axe.violations.length}`);
  for (const v of axe.violations) {
    violationsTotal++;
    console.log(`- ${v.id} [${v.impact}] ${v.help}`);
    v.nodes.slice(0, 4).forEach((n) => {
      console.log('    target: ' + n.target.join(' > '));
      console.log('    summary: ' + String(n.failureSummary || '').replace(/\n/g, ' | ').slice(0, 300));
    });
  }
  await page.close();
}
await browser.close();
console.log(`\nTOTAL violation rules across runs: ${violationsTotal}`);

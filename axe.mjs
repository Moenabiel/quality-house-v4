/**
 * axe.mjs — a11y gate: axe-core against dev BASE at 2 viewports.
 * Exit 0 = no serious/critical violations.
 * Usage: node axe.mjs
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4321';
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
let bad = 0;
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200); // preloader + reveals settle
  // Walk to load lazy content, then return to top for the scan.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  const { violations } = await builder.analyze();
  const serious = violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  console.log(
    `=== axe ${vp.name}: ${violations.length} violations (${serious.length} serious/critical) ===`
  );
  violations.forEach((v) => {
    const tag = v.impact || 'minor';
    console.log(`[${tag}] ${v.id}: ${v.help} — nodes: ${v.nodes.length}`);
    v.nodes.slice(0, 4).forEach((n) => console.log(`   -> ${n.target.join(' ')}`));
  });
  bad += serious.length;
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
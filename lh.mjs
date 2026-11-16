/**
 * lh.mjs — Lighthouse gate against the production preview (build output).
 * Requires: ASTRO PREVIEW RUNNING on :4322. Uses Playwright's Chromium via
 * the DevTools protocol (no Chrome install needed).
 * Exit 0 when performance ≥ 90 (mobile) and a11y/BP ≥ 90.
 */
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const URL = process.env.QH_BASE || 'http://127.0.0.1:4322/';
const DEBUG_PORT = 9222;

const browser = await chromium.launch({
  args: [`--remote-debugging-port=${DEBUG_PORT}`, '--headless=new'],
});
try {
  const result = await lighthouse(
    URL,
    {
      port: DEBUG_PORT,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      logLevel: 'error',
    },
    {
      extends: 'lighthouse:default',
      settings: { formFactor: 'mobile', screenEmulation: { disabled: false, mobile: true, width: 390, height: 844, deviceScaleFactor: 1.75 } },
    }
  );
  const lhr = result.lhr;
  for (const [k, cat] of Object.entries(lhr.categories)) {
    console.log(`  ${k}: ${Math.round(cat.score * 100)}`);
  }
  const audits = lhr.audits;
  console.log('  LCP:', audits['largest-contentful-paint']?.displayValue);
  console.log('  CLS:', audits['cumulative-layout-shift']?.displayValue);
  console.log('  TBT:', audits['total-blocking-time']?.displayValue);
  const failing = Object.entries(lhr.categories).filter(
    ([, c]) => (c.score ?? 1) < 0.9
  );
  process.exitCode = failing.length ? 1 : 0;
  if (failing.length) {
    console.log('FAILING:', failing.map(([k]) => k).join(', '));
  }
} finally {
  await browser.close();
}
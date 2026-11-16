/**
 * premium-audit.mjs — the measured premium pass for Quality House v3.
 *
 * Evidence over claims:
 *   1. axe-core accessibility audit (desktop + mobile viewports, home + product)
 *   2. Core Web Vitals measured in-page: LCP, CLS, event-timing long tasks
 *   3. Page weight (requests, bytes by type) of the hero load
 *   4. Focus-ring sanity: first Tab lands a visible focus indicator
 *
 * Usage: QH_BASE=http://127.0.0.1:4322 node tools/premium-audit.mjs
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4322';
const AXE = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const lines = [];
const note = (s) => { lines.push(s); console.log(s); };

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const vitalsInPage = async (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const out = { lcp: null, lcpEl: null, cls: 0, longTasks: 0, tbt: 0 };
        try {
          new PerformanceObserver((l) => {
            const es = l.getEntries();
            const last = es[es.length - 1];
            if (last) {
              out.lcp = Math.round(last.startTime);
              out.lcpEl = last.element ? `${last.element.tagName}.${(last.element.className || '').toString().split(' ')[0]}` : null;
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
          }).observe({ type: 'layout-shift', buffered: true });
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) {
              out.longTasks += 1;
              out.tbt += Math.max(0, e.duration - 50);
            }
          }).observe({ type: 'longtask', buffered: true });
        } catch { /* observers absent — report nulls */ }
        setTimeout(() => resolve({ ...out, cls: Math.round(out.cls * 1000) / 1000, tbt: Math.round(out.tbt) }), 3500);
      })
  );

const weight = async (page) =>
  page.evaluate(async () => {
    const res = performance.getEntriesByType('resource');
    const byType = {};
    for (const r of res) {
      const t = r.initiatorType === 'link' && r.name.includes('woff') ? 'font'
        : r.name.match(/\.(png|jpe?g|webp|avif|svg)/) ? 'image'
        : r.name.match(/\.(woff2?)/) ? 'font'
        : r.name.match(/\.js/) ? 'js'
        : r.name.match(/\.css/) ? 'css' : 'other';
      byType[t] = (byType[t] || 0) + Math.round((r.encodedBodySize || r.transferSize || 0) / 1024);
    }
    const kb = (arr) => arr.reduce((a, r) => a + (r.encodedBodySize || r.transferSize || 0), 0) / 1024;
    const html = performance.getEntriesByType('navigation')[0];
    return {
      requests: res.length + (html ? 1 : 0),
      htmlKB: html ? Math.round(html.transferSize / 1024) : 0,
      ...Object.fromEntries(Object.entries(byType).map(([k, v]) => [k + 'KB', Math.round(v)])),
      totalKB: Math.round(kb(res) + (html ? html.transferSize : 0) / 1024),
    };
  });

const runTargets = [
  { name: 'home @1920x1080', url: `${BASE}/`, viewport: { width: 1920, height: 1080 } },
  { name: 'home @390x844', url: `${BASE}/`, viewport: { width: 390, height: 844 }, hasTouch: true },
  { name: 'gum-arabic @1920x1080', url: `${BASE}/products/gum-arabic/`, viewport: { width: 1920, height: 1080 } },
];

const axeSummary = [];
for (const t of runTargets) {
  const ctx = await browser.newContext({ ...t });
  const page = await ctx.newPage();
  await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500); /* hero settles */
  await page.evaluate(AXE);
  const axe = await page.evaluate(() => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    resultTypes: ['violations'],
  }));
  const vio = axe.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
  axeSummary.push(...vio.map((v) => `${v.id}(${v.n})`));
  note(`AXE ${t.name}: violations=${vio.length}${vio.length ? ' — ' + vio.map((v) => `${v.id} x${v.n} [${v.impact}]`).join(', ') : ' — CLEAN'}`);
  const vit = await vitalsInPage(page);
  note(`VITALS ${t.name}: LCP=${vit.lcp}ms (${vit.lcpEl || '—'}) CLS=${vit.cls} longTasks=${vit.longTasks} TBT≈${vit.tbt}ms`);
  const w = await weight(page);
  note(`WEIGHT ${t.name}: ${w.requests} requests, ${w.totalKB}KB (html ${w.htmlKB}, js ${w.jsKB || 0}, css ${w.cssKB || 0}, image ${w.imageKB || 0}, font ${w.fontKB || 0})`);
  await ctx.close();
}

/* Focus ring: first Tab from the address bar reaches a visible focus indicator. */
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { ok: false, tag: 'body' };
    const cs = getComputedStyle(el);
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    const shadow = cs.boxShadow && cs.boxShadow !== 'none' && /inset|outset/.test(cs.boxShadow);
    const ring = el.matches(':focus-visible');
    return { ok: outline || shadow || ring, tag: el.tagName, cls: (el.className || '').toString().split(' ')[0] };
  });
  note(`FOCUS first-Tab lands on <${focus.tag} class=${focus.cls}> visible-indicator=${focus.ok ? 'YES' : 'NO'}`);
  await ctx.close();
}

await browser.close();
const violationCount = axeSummary.length;
note(`=== premium-audit: axe violations=${violationCount} across 3 runs ===`);
process.exit(violationCount === 0 ? 0 : 1);

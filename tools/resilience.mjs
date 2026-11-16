// resilience.mjs — adversarial scope-closure checks beyond the standard gates.
// 1) NO-JS: every page must render fully readable (no .js hook → nothing CSS-hidden,
//    no cover shelf) — count visible body text and capture proof shots.
// 2) REDUCED MOTION: with prefers-reduced-motion: reduce, content must be fully
//    visible with zero console errors; capture proof shots.
// 3) HTTP sweep: log any 4xx/5xx resource on every page (console-silent failures).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:4400';
const PAGES = ['/', '/products/gum-arabic/', '/products/cotton/', '/products/seeds/'];
mkdirSync('.qa/resilience', { recursive: true });

const vp = { width: 1440, height: 900 };

function collectErrors(page) {
  const errs = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 160));
  });
  page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 160)));
  page.on('response', (r) => {
    if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url().split('/').slice(-2).join('/'));
  });
  return errs;
}

async function textStats(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
      return true;
    };
    const texts = [...document.querySelectorAll('h1, h2, p, li, dd')].filter(vis);
    const hidden = [...document.querySelectorAll('[data-reveal], [data-reveal-media], img')].filter((el) => !vis(el));
    /* geometric occlusion: is a full-viewport fixed layer painted over the
       document center? (the DOM-level check cannot see this) */
    const occluder = document.elementFromPoint(Math.floor(innerWidth / 2), Math.floor(innerHeight * 0.4));
    const coverish = occluder && occluder.closest('[data-cover], [data-nav], footer');
    return {
      visibleTextBlocks: texts.length,
      chars: texts.map((t) => t.textContent.length).reduce((a, b) => a + b, 0),
      hiddenAtLoad: hidden.length,
      docHeight: document.documentElement.scrollHeight,
      topLayerAt40Pct: occluder ? occluder.tagName + '.' + (occluder.className || '').toString().split(' ')[0] : 'none',
      coverOccludes: !!(coverish && coverish.matches('[data-cover]')),
    };
  });
}

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

/* 1 — NO-JS */
console.log('\n=== no-JS pass ===');
{
  const ctx = await browser.newContext({ viewport: vp, javaScriptEnabled: false });
  const page = await ctx.newPage();
  const errs = collectErrors(page);
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 });
    const s = await textStats(page);
    const slug = p === '/' ? 'home' : p.slice(10, -1);
    console.log(`${p.padEnd(22)} visibleText=${String(s.visibleTextBlocks).padStart(3)} chars=${String(s.chars).padStart(5)} hiddenAtLoad=${s.hiddenAtLoad} docH=${s.docHeight} top40="${s.topLayerAt40Pct}" coverOccludes=${s.coverOccludes}`);
    await page.screenshot({ path: `.qa/resilience/nojs-1440-${slug}.png` });
  }
  console.log('console/page errors:', errs.length ? errs.join(' | ') : 'NONE');
  await ctx.close();
}

/* 2 — REDUCED MOTION */
console.log('\n=== reduced-motion pass ===');
{
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errs = collectErrors(page);
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1400);
    const s = await textStats(page);
    const coverGone = await page.evaluate(() => !document.querySelector('[data-cover]'));
    const loadingClass = await page.evaluate(() => document.documentElement.className);
    const slug = p === '/' ? 'home' : p.slice(10, -1);
    console.log(`${p.padEnd(22)} visible=${String(s.visibleTextBlocks).padStart(3)} hidden=${s.hiddenAtLoad} coverGone=${coverGone} htmlClass="${loadingClass}"`);
    await page.screenshot({ path: `.qa/resilience/reduced-1440-${slug}.png` });
  }
  console.log('console/page errors:', errs.length ? errs.join(' | ') : 'NONE');
  await ctx.close();
}

await browser.close();
console.log('\nresilience scan complete');

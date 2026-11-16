/**
 * qa.mjs — Quality House v2 QA gate (development rig).
 * Checks: HTTP 200, zero console/page errors, real content sections,
 * images resolve, horizontal overflow at 4 widths, no-JS usability.
 * Screenshots: 1920×1080 + 390×844 into shots/.
 * Usage: node qa.mjs  (BASE = http://127.0.0.1:4321)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4321';
const results = [];
let pageErrors = 0;

const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await chromium.launch();
try {
  // --- Main context (full JS) ------------------------------------------------
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  page.on('pageerror', () => {
    pageErrors++;
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') pageErrors++;
  });

  const res = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  check('HTTP 200', res && res.status() === 200, res ? `status ${res.status()}` : 'no response');
  await page.waitForTimeout(3500); // preloader + intro settle

  const revealGate = await page.evaluate(() => {
    const all = [...document.querySelectorAll('[data-reveal]')];
    const below = all.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    if (!below.length) return { detected: false, ok: false, note: 'no below-fold reveals at load' };
    const cs = getComputedStyle(below[0]);
    return {
      detected: true,
      ok: parseFloat(cs.opacity) < 0.05,
      note: `${below.length} below-fold reveals at load`,
    };
  });
  check(
    '.js-gated hidden states present before trigger',
    revealGate.ok,
    revealGate.note + (revealGate.detected ? '' : ' — page too short?')
  );

  // Walk the page so lazy images are requested before asserting on them.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  const sections = await page.evaluate(() => ({
    heroTitle: !!document.querySelector('.hero-title'),
    heroLines: document.querySelectorAll('[data-hero-line]').length,
    steps: document.querySelectorAll('[data-step]').length,
    products: document.querySelectorAll('.product-row').length,
    caps: document.querySelectorAll('.capability').length,
    companies: document.querySelectorAll('.company').length,
    formFields: document.querySelectorAll('.enquiry-form input, .enquiry-form select, .enquiry-form textarea').length,
    footer: !!document.querySelector('.footer'),
  }));

  // Lazy media under reveal latency: big JPEGs can decode slightly after
  // the walk, so poll until every image is decoded (8s deadline). Still
  // fails hard when an image never loads (404, blocked, corrupt).
  let images = [{ ok: false, src: '' }];
  const imgDeadline = Date.now() + 8000;
  while (Date.now() < imgDeadline) {
    images = await page.evaluate(
      () =>
        [...document.querySelectorAll('img')].map((i) => ({
          ok: i.naturalWidth > 0,
          src: (i.currentSrc || i.src || '').replace(location.origin, ''),
          complete: i.complete,
        }))
    );
    if (images.every((x) => x.ok)) break;
    await page.waitForTimeout(400);
  }
  sections.images = images;

  check('Hero masked headline (4 lines)', sections.heroTitle && sections.heroLines === 4, `${sections.heroLines} lines`);
  check('Journey stages (4)', sections.steps === 4, `${sections.steps}`);
  check('Product rows (3)', sections.products === 3, `${sections.products}`);
  check('Quality capabilities (3)', sections.caps === 3, `${sections.caps}`);
  check('Group companies (7)', sections.companies === 7, `${sections.companies}`);
  check('Enquiry form fields (8)', sections.formFields === 8, `${sections.formFields}`);
  check('Footer present', sections.footer);
  check(
    'All images load',
    sections.images.every((x) => x.ok),
    `${sections.images.filter((x) => x.ok).length}/${sections.images.length} — broken: ${sections.images.filter((x) => !x.ok).map((x) => x.src).join(', ')}`
  );

  // Overflow matrix
  for (const w of [390, 768, 1280, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check(`No horizontal overflow @${w}`, over <= 0, `${over}px`);
  }

  check('Zero console/page errors', pageErrors === 0, `${pageErrors} errors`);

  // Screenshots at the two contract viewports
  mkdirSync('shots', { recursive: true });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'shots/home-desktop.png' });
  await page.evaluate(() =>
    document.querySelector('#contact')?.scrollIntoView({ block: 'start' })
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/contact-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/home-mobile.png' });
  await page.evaluate(() =>
    document.querySelector('#journey')?.scrollIntoView({ block: 'start' })
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/journey-mobile.png' });
  await ctx.close();

  // --- No-JS gate --------------------------------------------------------------
  const noJSCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: false,
  });
  const np = await noJSCtx.newPage();
  await np.goto(BASE + '/', { waitUntil: 'load' });
  const noJs = await np.evaluate(() => {
    const pre = document.querySelector('[data-preloader]');
    const preDisplay = pre ? getComputedStyle(pre).display : 'absent';
    const h1 = document.querySelector('h1');
    const h1Visible = h1 ? getComputedStyle(h1).display !== 'none' : false;
    const firstReveal = document.querySelector('[data-reveal]');
    const revealOpacity = firstReveal ? getComputedStyle(firstReveal).opacity : 'n/a';
    const links = document.querySelectorAll('.nav-links a').length;
    const menuBtn = getComputedStyle(document.querySelector('.nav-toggle') || document.body).display;
    return {
      preDisplay,
      h1Visible,
      h1Text: h1 ? h1.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : '',
      revealOpacity,
      links,
      menuBtn,
    };
  });
  check('No-JS: preloader absent', noJs.preDisplay === 'none' || noJs.preDisplay === 'absent', noJs.preDisplay);
  check('No-JS: headline visible', noJs.h1Visible, noJs.h1Text);
  check('No-JS: reveals visible (opacity 1)', noJs.revealOpacity === '1', `opacity ${noJs.revealOpacity}`);
  check('No-JS: inline nav links present', noJs.links >= 5, `${noJs.links} links`);
  check('No-JS: mobile menu button hidden on desktop', noJs.menuBtn === 'none', noJs.menuBtn);
  await noJSCtx.close();
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n=== qa: ${results.length - failed.length}/${results.length} PASS ===`);
process.exit(failed.length ? 1 : 0);

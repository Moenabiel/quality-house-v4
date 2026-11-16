/* lab-probe.mjs — QA probe for sites/motion-lab (served on 127.0.0.1:4390).
   Gates: zero console errors · no horizontal overflow (1920/390) · no-JS readable ·
   reduced-motion honoured · reveals complete · axe-core clean · screenshots. */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.LAB_BASE || 'http://127.0.0.1:4390';
const OUT = 'E:/AI-CITY/sites/motion-lab/shots';
mkdirSync(OUT, { recursive: true });
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${detail}`); };

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

/* ---------- 1 · desktop run: console + overflow + reveals + shots ---------- */
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1600);

  check('console-errors-0', errors.length === 0, errors.slice(0, 3).join(' | '));
  const ov1 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no-overflow-1920', ov1 <= 0, `delta=${ov1}`);

  const heroIn = await page.evaluate(() => {
    const s = document.querySelector('.hero__title .line > span');
    return getComputedStyle(s).opacity;
  });
  check('hero-textReveal-completed', heroIn === '1', `opacity=${heroIn}`);

  const state = await page.textContent('#fieldState');
  check('field-state-live', /phase|reduced/.test(state), state.trim());

  await page.screenshot({ path: `${OUT}/fold-1920.png` });

  /* scroll to mid-morph (the field section is 300vh; land inside it) */
  const { morphTop, vh } = await page.evaluate(() => ({ morphTop: document.getElementById('morph').offsetTop, vh: window.innerHeight }));
  await page.evaluate((y) => window.scrollTo(0, y), morphTop + vh * 1.4);
  await page.waitForTimeout(900);
  const state2 = await page.textContent('#fieldState');
  check('morph-scrub-updates-state', state2.trim() !== state.trim(), state2.trim());
  await page.screenshot({ path: `${OUT}/morph-1920.png` });

  /* to the bottom: stepwise scroll so IntersectionObserver sees every section */
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, max);
  });
  await page.waitForTimeout(2500);
  const barOk = await page.evaluate(() =>
    [...document.querySelectorAll('.ladder__bar')].map((b) => {
      const m = getComputedStyle(b).transform;
      return m !== 'none' && new DOMMatrix(m).a > 0.01;
    }));
  check('ladder-bars-drawn', barOk.every(Boolean), `${barOk.filter(Boolean).length}/${barOk.length}`);
  const tilesIn = await page.evaluate(() =>
    [...document.querySelectorAll('.tile')].filter((t) => getComputedStyle(t).opacity === '1').length);
  check('tiles-revealed-12', tilesIn === 12, `${tilesIn}/12`);

  await page.evaluate(() => window.axe) || await page.evaluate(AXE);
  const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
  check('axe-1920-clean', axe.violations.length === 0,
    axe.violations.map((v) => `${v.id}x${v.nodes.length}`).join(',') || 'clean');
  await page.close();
}

/* ---------- 2 · mobile fold ---------- */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1400);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no-overflow-390', ov <= 0, `delta=${ov}`);
  await page.screenshot({ path: `${OUT}/fold-390.png` });
  await page.evaluate(AXE);
  const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
  check('axe-390-clean', axe.violations.length === 0,
    axe.violations.map((v) => `${v.id}x${v.nodes.length}`).join(',') || 'clean');
  check('console-errors-390-0', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

/* ---------- 3 · no-JS readability ---------- */
{
  const ctxNoJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1920, height: 1080 } });
  const page = await ctxNoJs.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 60000 });
  const op = await page.evaluate(() => {
    const s = document.querySelector('.hero__title .line > span');
    return getComputedStyle(s).opacity;
  }).catch(() => 'eval-failed');
  check('no-js-readable', op === '1', `opacity=${op}`);
  await page.screenshot({ path: `${OUT}/no-js-1920.png` });
  await ctxNoJs.close();
}

/* ---------- 4 · reduced motion ---------- */
{
  const ctxRm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1920, height: 1080 } });
  const page = await ctxRm.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(900);
  const op = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__title .line > span')).opacity);
  check('reduced-motion-hero-visible', op === '1', `opacity=${op}`);
  const st = await page.textContent('#fieldState');
  check('reduced-motion-field-static', /reduced motion honoured/.test(st), st.trim());
  await page.screenshot({ path: `${OUT}/reduced-1920.png` });
  await ctxRm.close();
}

await browser.close();

const fails = results.filter((r) => !r.ok);
writeFileSync(`${OUT}/probe.json`, JSON.stringify({ results, fails: fails.length, pass: results.length - fails.length }, null, 2));
console.log(`\n=== lab-probe: ${results.length - fails.length}/${results.length} PASS ===`);
process.exit(fails.length ? 1 : 0);

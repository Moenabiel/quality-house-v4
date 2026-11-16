/**
 * shoot.mjs - the "show-me" capture rig for Quality House v2.
 *
 * Per AGENTS.md Part 2.5 rule 6 (show-me test) and rule 7 (iterate to the bar),
 * every UI deliverable must be captured in full at desktop and mobile and
 * actually looked at before it can be called finished.
 *
 * Usage:
 *   node tools/shoot.mjs                       # home + 3 products, desktop+mobile full page
 *   node tools/shoot.mjs --sections            # also capture each section separately
 *   QH_BASE=http://127.0.0.1:4321 node tools/shoot.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4321';
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'gum-arabic', path: '/products/gum-arabic' },
  { slug: 'cotton', path: '/products/cotton' },
  { slug: 'seeds', path: '/products/seeds' },
];

const SECTIONS = ['top', 'story', 'products', 'roots', 'journey', 'quality', 'group', 'contact'];

const wantSections = process.argv.includes('--sections');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.slice('--only='.length) : '';
const browser = await chromium.launch();

try {
  for (const p of PAGES.filter((pg) => !ONLY || pg.slug === ONLY)) {
    const url = BASE + p.path;

    // --- desktop ---
    const dctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const dpage = await dctx.newPage();
    await dpage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // settle: boot fades, idle-mounted 3D, reveal-waves triggered by scroll
    await dpage.waitForTimeout(8000);
    await autoscroll(dpage);
    await dpage.waitForTimeout(2000);
    // Fold FIRST: a fullPage capture resizes the viewport and can leave large
    // text layers with a stale raster, which then ghosts into the next shot.
    await dpage.screenshot({ path: `${OUT}/${p.slug}-fold-1920.png`, fullPage: false });
    await dpage.waitForTimeout(500);
    await dpage.screenshot({ path: `${OUT}/${p.slug}-full-1920.png`, fullPage: true });

    if (wantSections && p.slug === 'home') {
      /* Sticky navs paint over whatever they overlap when the rig scrolls to
         a section — one ghosted the Board heading straight out of a section
         shot (2026-10-28). The fixed scroll-progress bar likewise bakes
         itself into the clip at the capture scroll depth. Scope the hide to
         the SITE NAV ONLY — a bare `header` selector also killed the five
         <header class="*-head"> section headings (products-head vanished
         from every products capture, 2026-10-28). */
      await dpage.addStyleTag({ content: 'header[data-nav], .skip-link, [data-progress] { display: none !important; }' });
      for (const id of SECTIONS) {
        const el = dpage.locator(`#${id}`).first();
        if ((await el.count()) === 0) continue;
        await el.scrollIntoViewIfNeeded();
        await dpage.waitForTimeout(700);
        await el.screenshot({ path: `${OUT}/section-${id}-1920.png` }).catch(() => {});
      }
    }
    await dctx.close();

    // --- mobile ---
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const mpage = await mctx.newPage();
    await mpage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await mpage.waitForTimeout(4000);
    await autoscroll(mpage);
    await mpage.waitForTimeout(1000);
    await mpage.screenshot({ path: `${OUT}/${p.slug}-fold-390.png`, fullPage: false });
    await mpage.waitForTimeout(350);
    await mpage.screenshot({ path: `${OUT}/${p.slug}-full-390.png`, fullPage: true });
    await mctx.close();

    console.log(`captured ${p.slug}`);
  }
} finally {
  await browser.close();
}

/** Scroll the whole page slowly so IntersectionObserver reveals fire, then return to top. */
async function autoscroll(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.75);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  // Lazy images: flip eager, then decode() every one of them before capture.
  // A fullPage stitch that beats the raster queue ghosts blank <img> boxes.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    imgs.forEach((im) => { im.loading = 'eager'; });
    await Promise.allSettled(imgs.map((im) => im.decode()));
  });
  // Deterministic captures: Lenis + fast IO steps can leave below-fold
  // reveals unset — the products-head vanished from a section capture
  // (2026-10-28). Pin every reveal to its final state for all captures,
  // and pin the journey rail scrub to its full state so captures show the
  // section's settled design, not an arbitrary scroll moment.
  await page.addStyleTag({ content: '.js [data-reveal], .js [data-reveal-media] { opacity: 1 !important; transform: none !important; } [data-rail-fill] { transform: none !important; }' });
  await page.waitForTimeout(600);
}

// 100x detail capture - full page at high DPR + section crops
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:4321';
const OUT = 'shots/100x';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'gum-arabic', path: '/products/gum-arabic' },
  { slug: 'cotton', path: '/products/cotton' },
  { slug: 'seeds', path: '/products/seeds' },
];

const SECTIONS = ['top', 'story', 'products', 'roots', 'journey', 'quality', 'group', 'contact'];

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
}

const browser = await chromium.launch();

for (const p of PAGES) {
  const url = BASE + p.path;

  // --- desktop @ 2x DPR (3840 wide) ---
  const dctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const dpage = await dctx.newPage();
  await dpage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dpage.waitForTimeout(3000);
  await autoscroll(dpage);
  await dpage.waitForTimeout(1200);
  await dpage.screenshot({ path: `${OUT}/${p.slug}-full-1920@2x.png`, fullPage: true });
  await dpage.screenshot({ path: `${OUT}/${p.slug}-fold-1920@2x.png`, fullPage: false });
  await dctx.close();

  // --- desktop @ 1x DPR for section crops ---
  const dctx1 = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const dpage1 = await dctx1.newPage();
  await dpage1.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dpage1.waitForTimeout(3000);
  await autoscroll(dpage1);
  await dpage1.waitForTimeout(1200);

  if (p.slug === 'home') {
    for (const id of SECTIONS) {
      const el = dpage1.locator(`#${id}`).first();
      if ((await el.count()) === 0) continue;
      await el.scrollIntoViewIfNeeded();
      await dpage1.waitForTimeout(700);
      await el.screenshot({ path: `${OUT}/section-${id}-1920.png` }).catch(() => {});
    }
  }
  await dctx1.close();

  // --- mobile ---
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await mpage.waitForTimeout(3000);
  await autoscroll(mpage);
  await mpage.waitForTimeout(1000);
  await mpage.screenshot({ path: `${OUT}/${p.slug}-full-390@2x.png`, fullPage: true });
  await mpage.screenshot({ path: `${OUT}/${p.slug}-fold-390@2x.png`, fullPage: false });
  await mctx.close();

  console.log(`captured ${p.slug} @ 2x + sections`);
}

await browser.close();
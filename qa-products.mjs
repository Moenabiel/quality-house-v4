/**
 * qa-products.mjs — QA gate for the three product pages.
 * Checks per page: HTTP 200, zero console/page errors, hero image actually
 * decodes, no horizontal overflow at 390/768/1920, chapter list present,
 * enquiry CTA present. Screenshots into shots/.
 * Usage: node qa-products.mjs  (BASE = http://127.0.0.1:4321)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4321';
const SLUGS = ['gum-arabic', 'cotton', 'seeds'];
mkdirSync('shots', { recursive: true });

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await chromium.launch();
try {
  for (const slug of SLUGS) {
    const url = `${BASE}/products/${slug}`;
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    let errors = 0;
    page.on('pageerror', () => errors++);
    page.on('console', (m) => m.type() === 'error' && errors++);

    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    check(`${slug}: HTTP 200`, res.status() === 200, `status ${res.status()}`);

    await page.waitForTimeout(1200);

    // Hero image must exist AND decode (naturalWidth > 0)
    const imgOk = await page.evaluate(() => {
      const img = document.querySelector('.product-media img');
      return img && img.complete && img.naturalWidth > 0;
    });
    check(`${slug}: hero image decodes`, Boolean(imgOk));

    // Chapter list
    const chapters = await page.locator('.chapter').count();
    check(`${slug}: chapters present`, chapters >= 3, `${chapters}`);

    // Facts list
    const facts = await page.locator('.attr-item').count();
    check(`${slug}: fact rows present`, facts >= 4, `${facts}`);

    // Enquiry CTA
    const cta = await page.locator('.product-close a.btn').count();
    check(`${slug}: enquiry CTA present`, cta >= 1);

    // Overflow at three widths
    for (const width of [390, 768, 1920]) {
      await page.setViewportSize({ width, height: width < 800 ? 844 : 1080 });
      await page.waitForTimeout(250);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      check(`${slug}: no overflow @${width}`, overflow <= 0, `${overflow}px`);
    }

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: `shots/product-${slug}-1920.png`, fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `shots/product-${slug}-390.png`, fullPage: false });

    check(`${slug}: zero console/page errors`, errors === 0, `${errors}`);
    await page.close();
  }
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n=== qa-products: ${passed}/${results.length} PASS ===`);
process.exit(passed === results.length ? 0 : 1);
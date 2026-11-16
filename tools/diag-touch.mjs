/**
 * diag-touch.mjs — does ANY touch event reach the page, and where?
 * Read-only diagnostic for the specimen pinch gesture.
 */
import { chromium } from 'playwright';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4322';
const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({
  viewport: { width: 900, height: 700 },
  deviceScaleFactor: 1,
  hasTouch: true,
});
const page = await ctx.newPage();
const client = await ctx.newCDPSession(page);

await page.goto(BASE + '/?debug-drag=1', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

await page.evaluate(() => {
  window.__t = [];
  const rec = (e) => {
    window.__t.push({
      type: e.type,
      target: e.target?.tagName + '.' + (e.target?.className || ''),
      touches: e.touches?.length,
      changed: e.changedTouches?.length,
      scrollY: Math.round(window.scrollY),
    });
  };
  for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
    document.addEventListener(type, rec, true);
  }
  window.__p = [];
  for (const type of ['pointerdown', 'pointermove', 'pointerup']) {
    document.addEventListener(
      type,
      (e) => window.__p.push({ type: e.type, ptype: e.pointerType, target: e.target?.tagName }),
      true
    );
  }
});

const canvas = page.locator('[data-tree-stage] canvas');
const box = await canvas.boundingBox();
const mx = box.x + box.width / 2;
const my = box.y + box.height / 2;
console.log('canvas box', box);
console.log('maxTouchPoints', await page.evaluate(() => navigator.maxTouchPoints));
console.log('ontouchstart', await page.evaluate(() => 'ontouchstart' in window));

const touch = (type, points) =>
  client.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: points.map((p, i) => ({
      x: p.x, y: p.y, id: p.id ?? i, radiusX: 8, radiusY: 8, force: 1,
    })),
  });

console.log('\n--- A: Playwright touchscreen.tap ---');
await page.touchscreen.tap(mx, my);
await page.waitForTimeout(300);
console.log('touch log:', JSON.stringify(await page.evaluate(() => window.__t)));
console.log('pointer log:', JSON.stringify(await page.evaluate(() => window.__p)));

await page.evaluate(() => { window.__t = []; window.__p = []; });

console.log('\n--- B: CDP single touchStart with 2 points ---');
await touch('touchStart', [
  { x: mx - 60, y: my, id: 0 },
  { x: mx + 60, y: my, id: 1 },
]);
await page.waitForTimeout(200);
await touch('touchMove', [
  { x: mx - 170, y: my, id: 0 },
  { x: mx + 170, y: my, id: 1 },
]);
await page.waitForTimeout(200);
console.log('touch log:', JSON.stringify(await page.evaluate(() => window.__t)));
console.log('pointer log:', JSON.stringify(await page.evaluate(() => window.__p)));
console.log('pinch state:', await page.evaluate(() => ({
  pinch: window.__qhTreeDrag?.pinch,
  zt: window.__qhTreeDrag?.zoomTarget,
})));

await browser.close();

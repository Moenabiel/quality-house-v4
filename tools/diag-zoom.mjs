/**
 * diag-zoom.mjs — per-event diagnostic for the specimen zoom. Read-only.
 * Logs the real event target of every wheel/touch event and the scroll state.
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

// Raise the touch point limit AFTER navigation (Playwright re-applies its own
// touch emulation with maxTouchPoints:1 on every navigation).
await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

console.log('maxTouchPoints =', await page.evaluate(() => navigator.maxTouchPoints));

await page.evaluate(() => {
  window.__log = [];
  const cv = document.querySelector('[data-tree-stage] canvas');
  for (const type of ['wheel', 'touchstart', 'touchmove', 'touchend', 'touchcancel']) {
    cv.addEventListener(
      type,
      (e) => {
        window.__log.push({
          type,
          target: e.target === cv ? 'CANVAS' : e.target?.tagName,
          touches: e.touches ? e.touches.length : undefined,
          deltaY: e.deltaY,
          prevented: e.defaultPrevented,
          scrollY: Math.round(window.scrollY),
          t: performance.now() | 0,
        });
      },
      true
    );
  }
  // Count ANY wheel on the document so we can see where the misses went.
  window.__docWheel = 0;
  window.__docWheelOnCanvas = 0;
  document.addEventListener(
    'wheel',
    (e) => {
      window.__docWheel++;
      if (e.target === cv) window.__docWheelOnCanvas++;
    },
    true
  );
});

const canvas = page.locator('[data-tree-stage] canvas');
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
console.log('canvas box', box);
console.log('elementFromPoint:', await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return el ? el.tagName + '.' + el.className : 'none';
}, [cx, cy]));

console.log('\n--- 8x wheel down (deltaY 300) via CDP ---');
for (let i = 0; i < 8; i++) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel', x: cx, y: cy, deltaX: 0, deltaY: 300, pointerType: 'mouse',
  });
  const s = await page.evaluate(() => ({
    z: +window.__qhTreeDrag.zoom.toFixed(3),
    zt: +window.__qhTreeDrag.zoomTarget.toFixed(3),
    scrollY: Math.round(scrollY),
    docWheel: window.__docWheel,
    onCanvas: window.__docWheelOnCanvas,
  }));
  console.log(`  ${i + 1}: ${JSON.stringify(s)}`);
}

await page.waitForTimeout(1200);
console.log('\n--- log ---');
console.log(JSON.stringify(await page.evaluate(() => window.__log), null, 1));

console.log('\n--- touch ---');
await page.evaluate(() => { window.__log = []; });
const b2 = await canvas.boundingBox();
const mx = b2.x + b2.width / 2;
const my = b2.y + b2.height / 2;
const touch = (type, points) =>
  client.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: points.map((p, i) => ({ x: p.x, y: p.y, id: i, radiusX: 5, radiusY: 5, force: 1 })),
  });

try {
  await touch('touchStart', [{ x: mx - 60, y: my }]);
  await touch('touchStart', [
    { x: mx - 60, y: my },
    { x: mx + 60, y: my },
  ]);
  await page.waitForTimeout(80);
  await touch('touchMove', [
    { x: mx - 170, y: my },
    { x: mx + 170, y: my },
  ]);
  await page.waitForTimeout(200);
  console.log('state:', await page.evaluate(() => ({
    pinch: window.__qhTreeDrag.pinch,
    zt: +window.__qhTreeDrag.zoomTarget.toFixed(3),
  })));
  await touch('touchEnd', []);
} catch (e) {
  console.log('touch dispatch error:', e.message);
}
console.log('touch log:', JSON.stringify(await page.evaluate(() => window.__log), null, 1));

await browser.close();

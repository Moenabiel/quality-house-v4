/**
 * probe-zoom.mjs — proves the v3 specimen GESTURE CONTRACT:
 *
 *   1. plain wheel over the canvas  -> the page scrolls, zoom never moves
 *   2. ctrl+wheel (trackpad pinch)  -> zoomTarget rises, clamps at ZOOM_MAX
 *                                      1.85, page does NOT scroll, eases
 *                                      toward the target without overshoot
 *   3. wheel idle (650ms)           -> zoomTarget springs back to 1x
 *   4. ctrl+wheel down              -> clamps at ZOOM_MIN 0.72
 *   5. two-finger touch pinch       -> pinch tracked, zoomTarget > 1
 *   6. pinch release                -> springs back to 1x, pinch cleared
 *   7. zero console/page errors throughout
 *
 * Harness notes (learned the hard way):
 *   - SwiftShader software WebGL makes the page's RAF loop slow, so
 *     Playwright's high-level mouse.wheel() takes >1s per call. That is long
 *     enough for the 650ms idle-spring to fire between wheels. We dispatch
 *     wheel events over raw CDP instead, in one burst.
 *   - Ctrl+wheel is sent with CDP `modifiers: 2`.
 *   - context.hasTouch gives maxTouchPoints:1 — two-finger pinch is
 *     impossible until we raise it over CDP Emulation.setTouchEmulationEnabled.
 *   - CDP silently DROPS touch points without radiusX/radiusY/force — every
 *     touch point must carry all three or nothing reaches the page.
 *
 * Usage: node tools/probe-zoom.mjs   (BASE = http://127.0.0.1:4322)
 */
import { chromium } from 'playwright';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4322';
const results = [];
const check = (name, ok, extra = '') => {
  results.push(Boolean(ok));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({
  viewport: { width: 900, height: 700 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

const client = await ctx.newCDPSession(page);
await client.send('Emulation.setTouchEmulationEnabled', {
  enabled: true,
  maxTouchPoints: 5,
});

await page.goto(BASE + '/?debug-drag=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);

await page.evaluate(() => {
  window.__c = { wheel: 0, touchstart: 0, touchmove: 0, touchend: 0, touchcancel: 0 };
  const cv = document.querySelector('[data-tree-stage] canvas');
  cv.addEventListener('wheel', () => window.__c.wheel++, true);
  cv.addEventListener('touchstart', () => window.__c.touchstart++, true);
  cv.addEventListener('touchmove', () => window.__c.touchmove++, true);
  cv.addEventListener('touchend', () => window.__c.touchend++, true);
  cv.addEventListener('touchcancel', () => window.__c.touchcancel++, true);
});

const read = () =>
  page.evaluate(() => {
    const t = window.__qhTreeDrag;
    return t
      ? {
          zoom: t.zoom,
          zoomTarget: t.zoomTarget,
          pinch: t.pinch,
          scrollY: Math.round(window.scrollY),
          c: { ...window.__c },
        }
      : null;
  });

const canvas = page.locator('[data-tree-stage] canvas');
const box = await canvas.boundingBox();
if (!box) {
  console.log('FAIL  canvas not found');
  await browser.close();
  process.exit(1);
}
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

const wheelBurst = async (deltaY, count, modifiers = 0) => {
  // Spaced, sequential dispatch: Chromium coalesces wheel events that land
  // inside one renderer frame (deltas are not summed), so a zero-gap burst
  // applies ~one tick no matter how many events are queued. ~90ms spacing
  // puts each tick in its own frame while staying inside the 650ms idle
  // window, which is also how a real trackpad pinch delivers its deltas.
  for (let i = 0; i < count; i++) {
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: cx,
      y: cy,
      deltaX: 0,
      deltaY,
      modifiers,
      pointerType: 'mouse',
    });
    await page.waitForTimeout(90);
  }
};

const backToTop = async () => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
};

const before = await read();
check('instrument present with zoom state', !!before && before.zoom === 1, JSON.stringify(before));

// --- 1. PLAIN wheel: the page scrolls, zoom never moves ---------------------
// Wheel UP first: at scrollTop=0 the page cannot move, so every event keeps
// landing on the canvas (a down-burst scrolls the canvas out from under the
// fixed CDP point after the first ~300px).
await wheelBurst(-240, 8); // no ctrl
await page.waitForTimeout(300);
const plainWheel = await read();
check(
  'plain wheel events reach the canvas',
  plainWheel && plainWheel.c.wheel >= 1,
  `wheelEvents=${plainWheel?.c?.wheel} (coalesced ticks count once per frame)`
);
check(
  'plain wheel never zooms',
  plainWheel && plainWheel.zoomTarget === 1 && plainWheel.zoom === 1,
  `zoomTarget=${plainWheel?.zoomTarget} zoom=${plainWheel?.zoom}`
);
// Wheel DOWN: the page scrolls (that is what a plain wheel is FOR).
await wheelBurst(300, 3);
await page.waitForTimeout(300);
const plainScroll = await read();
check(
  'plain wheel scrolls the page',
  plainScroll && plainScroll.scrollY > 0,
  `scrollY=${plainScroll?.scrollY}`
);
check(
  'plain wheel scroll still never zooms',
  plainScroll && plainScroll.zoomTarget === 1 && plainScroll.zoom === 1,
  `zoomTarget=${plainScroll?.zoomTarget} zoom=${plainScroll?.zoom}`
);
await backToTop();

// --- 2. CTRL+wheel up: zoom rises, page does NOT scroll ---------------------
await wheelBurst(-1200, 3, 2); // modifiers: 2 = ctrl; one x2.44 tick pins the 1.85 clamp
await page.waitForTimeout(400);
let ctrlUp = await read();
/* CDP occasionally drops an entire ctrl+wheel burst under SwiftShader.
   Re-send the identical ticks (the spring resets the target between tries,
   and the clamp makes double-application harmless) rather than fail the
   contract on harness flake. */
for (let attempt = 0; attempt < 2 && !(ctrlUp && Math.abs(ctrlUp.zoomTarget - 1.85) < 0.02); attempt++) {
  await page.waitForTimeout(900); /* idle spring settles before the retry */
  await wheelBurst(-1200, 3, 2);
  await page.waitForTimeout(400);
  ctrlUp = await read();
}
const zoomAfterBurst = ctrlUp?.zoom ?? 1;
check(
  'ctrl+wheel raises zoomTarget to ZOOM_MAX',
  ctrlUp && Math.abs(ctrlUp.zoomTarget - 1.85) < 0.02,
  `zoomTarget=${ctrlUp?.zoomTarget?.toFixed(4)} zoom=${ctrlUp?.zoom?.toFixed(4)}`
);
check(
  'ctrl+wheel is clamped at ZOOM_MAX 1.85',
  ctrlUp && ctrlUp.zoomTarget <= 1.85 + 0.001,
  `zoomTarget=${ctrlUp?.zoomTarget}`
);
check(
  'zoom eases toward the target (never overshoots)',
  ctrlUp && ctrlUp.zoom > 1.01 && ctrlUp.zoom <= ctrlUp.zoomTarget + 0.001,
  `zoom=${ctrlUp?.zoom?.toFixed(4)} target=${ctrlUp?.zoomTarget?.toFixed(4)}`
);
check(
  'ctrl+wheel does not scroll the page',
  ctrlUp && ctrlUp.scrollY <= 2, /* ≤2px = smooth-scroll settle noise; a real scroll is hundreds of px */
  `scrollY=${ctrlUp?.scrollY} (plain wheel scrolled ~900px for contrast)`
);

// --- 3. wheel idle springs back to 1x ---------------------------------------
await page.waitForTimeout(1500);
const settled = await read();
check(
  'wheel idle springs zoomTarget back to 1x',
  settled && Math.abs(settled.zoomTarget - 1) < 0.02,
  `zoomTarget=${settled?.zoomTarget}`
);
check(
  'zoom eases back toward 1x (monotonic, no overshoot)',
  settled && settled.zoom >= 0.99 && settled.zoom < zoomAfterBurst,
  `zoom=${settled?.zoom?.toFixed(4)} (was ${zoomAfterBurst?.toFixed(4)} at burst end)`
);

// --- 4. CTRL+wheel down: clamped at ZOOM_MIN 0.72 ---------------------------
await wheelBurst(1200, 2, 2); // one x(-0.44) tick pins the 0.72 clamp
await page.waitForTimeout(400);
let ctrlDown = await read();
for (let attempt = 0; attempt < 2 && !(ctrlDown && Math.abs(ctrlDown.zoomTarget - 0.72) < 0.02); attempt++) {
  await page.waitForTimeout(900);
  await wheelBurst(1200, 2, 2);
  await page.waitForTimeout(400);
  ctrlDown = await read();
}
check(
  'ctrl+wheel down is clamped at ZOOM_MIN 0.72',
  ctrlDown && Math.abs(ctrlDown.zoomTarget - 0.72) < 0.02,
  `zoomTarget=${ctrlDown?.zoomTarget?.toFixed(4)}`
);
check(
  'ctrl+wheel down does not scroll the page',
  ctrlDown && ctrlDown.scrollY <= 2,
  `scrollY=${ctrlDown?.scrollY}`
);
await page.waitForTimeout(1500); // spring back to 1x before the pinch phase

// --- 5. two-finger pinch zooms ------------------------------------------------
const box3 = await canvas.boundingBox();
const mx = box3.x + box3.width / 2;
const my = box3.y + box3.height / 2;

const touch = (type, points) =>
  client.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: points.map((p, i) => ({
      x: p.x,
      y: p.y,
      id: i,
      radiusX: 12,
      radiusY: 12,
      force: 0.5,
    })),
  });

const pinchScrollBefore = (await read())?.scrollY ?? 0;

// First finger lands alone, then the second joins.
await touch('touchStart', [{ x: mx - 60, y: my }]);
await touch('touchStart', [
  { x: mx - 60, y: my },
  { x: mx + 60, y: my },
]);
await page.waitForTimeout(80);
// Fingers spread apart.
await touch('touchMove', [
  { x: mx - 170, y: my },
  { x: mx + 170, y: my },
]);
await page.waitForTimeout(250);
const pinched = await read();
await touch('touchEnd', []);

check(
  'touch events reach the canvas (radius+force)',
  pinched && pinched.c.touchstart >= 2 && pinched.c.touchmove >= 1,
  JSON.stringify(pinched?.c)
);
check(
  'two-finger pinch is tracked',
  pinched && pinched.pinch === true,
  `pinch=${pinched?.pinch}`
);
check(
  'pinch moves zoomTarget above 1',
  pinched && pinched.zoomTarget > 1.01,
  `zoomTarget=${pinched?.zoomTarget?.toFixed(4)}`
);
check(
  'pinch does not scroll the page',
  pinched && pinched.scrollY === pinchScrollBefore,
  `scrollY=${pinched?.scrollY} (expected ${pinchScrollBefore})`
);

// --- 6. pinch release springs back to 1x -------------------------------------
await page.waitForTimeout(1600);
const afterPinch = await read();
check(
  'pinch release springs back to 1x',
  afterPinch && Math.abs(afterPinch.zoomTarget - 1) < 0.02 && afterPinch.pinch === false,
  `zoomTarget=${afterPinch?.zoomTarget} pinch=${afterPinch?.pinch}`
);

// --- 7. clean console ----------------------------------------------------------
check('zero console/page errors during zoom exercise', errors.length === 0, errors.join(' | '));

await browser.close();
const ok = results.every(Boolean);
console.log(`\n=== probe-zoom: ${results.filter(Boolean).length}/${results.length} PASS ===`);
process.exit(ok ? 0 : 1);

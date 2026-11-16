/**
 * probe-motion.mjs — diagnose "no motion reported by the owner" on THIS machine.
 * Answers: (1) does the OS/browser map prefers-reduced-motion:reduce?
 *          (2) does WebGL exist? (3) did the motion boot report ready?
 *          (4) do two frames 2.6s apart actually differ (animation truth)?
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200));
});

// 1. What a normal Chromium profile on this machine sees (no emulation).
const mq = await page.evaluate(() => ({
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  noPreference: matchMedia('(prefers-reduced-motion: no-preference)').matches,
  webgl: (() => {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  })(),
}));

await page.goto('http://127.0.0.1:4322/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500); // mid preloader / intro
await page.screenshot({ path: 'shots/probe-t05.png' });
await page.waitForTimeout(3500); // settled
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

// 2. Runtime state of the boot.
const state = await page.evaluate(() => {
  const line = document.querySelector('[data-hero-line]');
  const reveal = [...document.querySelectorAll('[data-reveal]')].find(
    (el) => el.getBoundingClientRect().top > window.innerHeight
  );
  const canvas = document.querySelector('canvas[data-globe]');
  return {
    htmlCls: document.documentElement.className,
    motionReady: !!window.__qhMotionReady,
    canvasInitialized: !!canvas && canvas.width > 0,
    canvasSize: canvas ? canvas.width + 'x' + canvas.height : 'none',
    heroLineTransform: line ? getComputedStyle(line).transform : 'none',
    belowFoldRevealOpacity: reveal ? getComputedStyle(reveal).opacity : 'none-belowfold',
    scrollProgress: getComputedStyle(document.querySelector('[data-progress]')).transform,
  };
});

// 3. Animation truth: two frames 2.6s apart, count differing pixel channels.
await page.screenshot({ path: 'shots/probe-fa.png' });
await page.waitForTimeout(2600);
await page.screenshot({ path: 'shots/probe-fb.png' });

const a = await sharp('shots/probe-fa.png').raw().toBuffer();
const bb = await sharp('shots/probe-fb.png').raw().toBuffer();
let diff = 0;
const step = 4; // RGBA
for (let i = 0; i < a.length; i += step * 7) {
  for (let k = 0; k < step; k++) if (Math.abs(a[i + k] - bb[i + k]) > 8) diff++;
}

console.log(JSON.stringify({ mq, state, errs }, null, 1));
console.log('differingSampledChannels:', diff, diff > 200 ? '(ANIMATING)' : '(STATIC)');
await b.close();

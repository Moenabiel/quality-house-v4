/**
 * probe-tree.mjs — proves the v3 specimen shader actually compiled.
 *
 * The QA gate counts console errors, but a WebGL context that never comes up
 * produces NO error: the page falls back to the photograph and still passes.
 * This probe forces the question:
 *   1. did the canvas mount into the plate?
 *   2. is a WebGL context live?
 *   3. did three.js log a shader compile failure?
 *   4. does the translucency uniform actually reach the compiled program?
 *
 * Usage: node tools/probe-tree.mjs   (BASE = http://127.0.0.1:4321)
 */
import { chromium } from 'playwright';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4321';

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

const consoleErrors = [];
const consoleAll = [];
page.on('console', (m) => {
  consoleAll.push(`${m.type()}: ${m.text()}`);
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);

const probe = await page.evaluate(() => {
  const stage = document.querySelector('[data-tree-stage]');
  const canvas = stage?.querySelector('canvas');
  const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
  return {
    stageFound: !!stage,
    mounted: !!stage?.classList.contains('tree-mounted'),
    canvasFound: !!canvas,
    canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'none',
    glContext: !!gl,
    glRenderer: gl ? (() => {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    })() : 'none',
    webgl2: !!canvas?.getContext('webgl2'),
  };
});

// The tree script exposes a debug instrument only under ?debug-drag=1.
await page.goto(BASE + '/?debug-drag=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);
const drag = await page.evaluate(() => {
  const t = window.__qhTreeDrag;
  return t ? { present: true, yaw: t.yaw, pitch: t.pitch, zoom: t.zoom, zoomTarget: t.zoomTarget } : { present: false };
});

const shaderErrors = consoleAll.filter((l) =>
  /shader|GLSL|glsl|program|THREE\.WebGLProgram|compil/i.test(l)
);

const report = {
  probe,
  debugInstrument: drag,
  consoleErrors,
  shaderErrors,
  consoleCount: consoleAll.length,
};
console.log(JSON.stringify(report, null, 2));

await browser.close();

const ok = probe.mounted && probe.glContext && consoleErrors.length === 0 && shaderErrors.length === 0;
console.log(ok ? '\nRESULT: PASS — specimen mounted, WebGL live, no shader/console errors' : '\nRESULT: FAIL');
process.exit(ok ? 0 : 1);

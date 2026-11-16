/**
 * duotone.mjs — map a public-domain photograph into the Quality House palette.
 *
 * Owner directive 2026-10-24: the site uses the house colours from
 * qualityhouseintl.com — cotton paper, Acacia Green, Port Sudan Bronze — not a
 * dark reinterpretation. So this is no longer an inverted "night optic" frame;
 * it is a warm brand print: the sky reads as the page's own paper, the tree as
 * deep green, the plain as bronze and sand.
 *
 * Why a photograph at all: a modelled tree has a realism ceiling; a real tree
 * does not. The brief asks for a real acacia in the brand's palette.
 *
 * The map is NON-inverted (unlike the discarded dark pass): bright sky → paper,
 * dark tree → green. The top stop is exactly --qh-paper, so the photograph's sky
 * and the page background are the same value and the full-bleed edge dissolves.
 *
 * Zero dependencies: Playwright (already in the repo) + a canvas.
 *
 * Usage: node tools/duotone.mjs
 * Output: public/media/acacia-vision.jpg
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = 'src/assets/media/acacia-pd-source.jpg';
const OUT_DIR = 'public/media';
const WIDTH = 2400;
const CROP_BOTTOM = 0.9; // trim the foreground bush so the horizon stays clean

/* --- Palette, read from the single source of truth ----------------------- */
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8');
const token = (name) => {
  const m = tokensCss.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!m) throw new Error(`token ${name} not found in tokens.css`);
  return m[1];
};

/** Blend two token hexes (t = 0 → a, 1 → b) so every colour still comes from tokens.css. */
const mix = (a, b, t) => {
  const rgb = (h) => {
    const s = h.replace('#', '');
    const v = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  };
  const [ca, cb] = [rgb(a), rgb(b)];
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/* Shadow → light ramp. Every stop is a brand token; the two ends are exact so
   the deepest branch is the green, and the brightest sky is the page paper. */
const STOPS = [
  [0.0, token('--qh-green')],
  [0.18, token('--qh-green-2')],
  [0.38, token('--qh-bronze-deep')],
  [0.58, token('--qh-bronze')],
  [0.78, token('--qh-sand')],
  [0.92, token('--qh-paper-2')],
  [1.0, token('--qh-paper')],
];

const src = readFileSync(SRC).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();

const result = await page.evaluate(
  async ({ b64, stops, width, cropBottom }) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${b64}`;
    await img.decode();

    const cropH = Math.round(img.height * cropBottom);
    const scale = width / img.width;
    const outW = width;
    const outH = Math.round(cropH * scale);

    const cv = document.createElement('canvas');
    cv.width = outW;
    cv.height = outH;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.width, cropH, 0, 0, outW, outH);

    const frame = ctx.getImageData(0, 0, outW, outH);
    const px = frame.data;

    const hex = (h) => {
      const s = h.replace('#', '');
      const v = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
      return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
    };
    const lut = stops.map(([t, h]) => [t, hex(h)]);

    const pick = (t) => {
      if (t <= lut[0][0]) return lut[0][1];
      for (let i = 1; i < lut.length; i++) {
        if (t <= lut[i][0]) {
          const [t0, c0] = lut[i - 1];
          const [t1, c1] = lut[i];
          const k = (t - t0) / (t1 - t0);
          return [
            c0[0] + (c1[0] - c0[0]) * k,
            c0[1] + (c1[1] - c0[1]) * k,
            c0[2] + (c1[2] - c0[2]) * k,
          ];
        }
      }
      return lut[lut.length - 1][1];
    };

    for (let i = 0; i < px.length; i += 4) {
      const luma = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
      /* A gentle S-curve: the silhouette separates from the sky without the
         leaves turning into a flat cut-out. */
      const t = Math.min(1, Math.max(0, 0.5 + (luma - 0.5) * 1.12));
      const c = pick(t);
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
    }
    ctx.putImageData(frame, 0, 0);

    /* No bloom pass. On a cream print a blurred screen layer bleeds the bright
       sky into the canopy and reads as a smudge; the optic in lens.ts adds the
       only glow the hero needs. */

    return {
      full: cv.toDataURL('image/jpeg', 0.9),
      w: outW,
      h: outH,
    };
  },
  { b64: src, stops: STOPS, width: WIDTH, cropBottom: CROP_BOTTOM }
);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, 'acacia-vision.jpg'), Buffer.from(result.full.split(',')[1], 'base64'));
console.log(`wrote public/media/acacia-vision.jpg ${result.w}x${result.h}`);

await browser.close();

/**
 * contrast.mjs — WCAG contrast calculator for design decisions.
 * Usage: node tools/contrast.mjs
 */
const srgb = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const hex = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const over = (fg, alpha, bg) => fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const PAPER = hex('#f8f4ec');
const PAPER2 = hex('#ede8de');
const SURFACE = hex('#fefcf7');
const GREEN = hex('#1a3d29');
const INK = hex('#151c17');
const ON_GREEN = hex('#faf6ef');
const SAND = hex('#d2c5b1');
const BRONZE = hex('#975c20');
const BRONZE_DEEP = hex('#7a4a19');

const r = (x) => x.toFixed(3);
const rows = [];
const add = (label, fg, bg) => rows.push([label, r(ratio(fg, bg))]);

add('bronze on paper', BRONZE, PAPER);
add('bronze on paper-2', BRONZE, PAPER2);
add('bronze-deep on paper', BRONZE_DEEP, PAPER);
add('bronze-deep on paper-2', BRONZE_DEEP, PAPER2);
add('bronze-deep on surface', BRONZE_DEEP, SURFACE);
add('sand on green', SAND, GREEN);
add('on-green on green', ON_GREEN, GREEN);
add('on-green 82% on green', over(ON_GREEN, 0.82, GREEN), GREEN);
add('on-green 62% on green', over(ON_GREEN, 0.62, GREEN), GREEN);

// Field edges: input sits on paper, surrounded by surface (#fefcf7).
for (const a of [0.28, 0.35, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7]) {
  const edge = over(INK, a, SURFACE);
  add(`edge ink@${a} vs surface`, edge, SURFACE);
  add(`edge ink@${a} vs paper`, edge, PAPER);
}
add('edge solid #707570 vs surface', hex('#707570'), SURFACE);
add('edge solid #707570 vs paper', hex('#707570'), PAPER);
add('edge ink-2 #545e56 vs surface', hex('#545e56'), SURFACE);

for (const [label, v] of rows) {
  console.log(`${v.padStart(7)}  ${v >= 4.5 ? 'AA ' : v >= 3 ? 'AA-lg' : 'FAIL'}  ${label}`);
}

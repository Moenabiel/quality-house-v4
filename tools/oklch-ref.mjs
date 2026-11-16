// OKLCH (as used by qualityhouseintl.com's live theme) -> sRGB hex.
const SRC = {
  background: [0.968, 0.011, 85.5],
  foreground: [0.216, 0.014, 155],
  card: [0.99, 0.006, 85],
  primary: [0.327, 0.055, 156],
  primaryForeground: [0.975, 0.01, 85],
  secondary: [0.406, 0.058, 137],
  muted: [0.932, 0.014, 84],
  mutedForeground: [0.47, 0.018, 150],
  sand: [0.83, 0.031, 79],
  sandForeground: [0.245, 0.02, 150],
  bronze: [0.53, 0.106, 62],
  bronzeForeground: [0.985, 0.008, 85],
  ivory: [0.968, 0.011, 85.5],
  deep: [0.216, 0.014, 155],
  deepForeground: [0.955, 0.012, 85],
  destructive: [0.505, 0.176, 27],
  border: [0.878, 0.016, 82],
  ring: [0.53, 0.106, 62],
};

const clamp = (v) => Math.min(1, Math.max(0, v));
const enc = (v) => {
  const c = clamp(v);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};
const hex = (rgb) =>
  '#' +
  rgb
    .map((v) => Math.round(clamp(enc(v)) * 255).toString(16).padStart(2, '0'))
    .join('');

const toHex = ([L, C, H]) => {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return hex([
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]);
};

for (const [k, v] of Object.entries(SRC)) console.log(k.padEnd(18), toHex(v));

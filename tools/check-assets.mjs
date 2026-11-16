// check-assets.mjs — every asset path referenced in src/ must exist in public/.
// Catches the class of defect where a page ships <img src="/assets/images/x.jpg">
// but the file was never added. Exit 0 = all references resolve.
// Usage: node tools/check-assets.mjs  (from the project root)

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = fs.realpathSync(process.cwd());
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

const SOURCE_EXTS = ['.ts', '.tsx', '.astro', '.css'];
const ASSET_PATTERN = /["'`](\/(?:assets|fonts|models)[^"'`\s)]+|qh-[\w.-]+\.(?:png|webp|svg))["'`]/g;

// Collect referenced asset paths
const referenced = new Map(); // path -> [files]

function walk(dir, depth = 0) {
  if (depth > 6) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, depth + 1);
    } else if (SOURCE_EXTS.includes(path.extname(entry.name).toLowerCase())) {
      const content = fs.readFileSync(full, 'utf-8');
      let m;
      while ((m = ASSET_PATTERN.exec(content)) !== null) {
        const ref = m[1];
        if (!referenced.has(ref)) referenced.set(ref, []);
        referenced.get(ref).push(path.relative(PROJECT_ROOT, full));
      }
    }
  }
}

walk(SRC_DIR);

// Verify each reference resolves to a file in public/
const missing = [];
const ok = [];
for (const [ref, files] of referenced) {
  // Normalise: refs starting with / resolve from public/; bare filenames from public/ too
  const rel = ref.startsWith('/') ? ref.slice(1) : ref;
  const candidates = [
    path.join(PUBLIC_DIR, rel),
    path.join(PUBLIC_DIR, 'assets', 'images', rel),
  ];
  const found = candidates.find((c) => fs.existsSync(c));
  if (found) {
    ok.push(ref);
  } else {
    missing.push({ ref, files: [...new Set(files)] });
  }
}

if (missing.length === 0) {
  console.log(`✅ ASSET CHECK: PASS — ${ok.length} referenced asset(s) all exist in public/`);
  process.exit(0);
} else {
  console.log(`❌ ASSET CHECK: FAIL — ${missing.length} missing reference(s):`);
  for (const m of missing) {
    console.log(`\n  ${m.ref}`);
    for (const f of m.files) console.log(`     referenced in: ${f}`);
  }
  process.exit(1);
}
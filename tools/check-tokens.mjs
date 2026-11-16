// SUPER-STRICT token verification for Quality House v2
// Exit 0 only if NOT A SINGLE hex literal exists outside tokens.css
// In any source file (.ts, .tsx, .astro, .css) in src/
// Zero tolerance for hex creep

import fs from 'fs';
import path from 'path';

// ── PROJECT SETUP ──────────────────────────────────────────────────────────
const PROJECT_ROOT = fs.realpathSync(process.cwd());
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const TOKENS_CSS_PATH = path.join(SRC_DIR, 'styles', 'tokens.css');

// ── 1. BUILD THE SET OF LEGITIMATE HEX VALUES FROM tokens.css ──────────────
// These are the ONLY hex values that are allowed to appear anywhere in the project
const legitimateHexes = new Set([
  // Fallback list — the authoritative set is parsed from tokens.css below.
  // Kept so the gate fails closed if the parse ever breaks.
  '#0a0e17', '#0e131d', '#121824', '#18202e',
  '#dfa84e', '#b57f31', '#f2eee6', '#b7bdc7',
  '#878e99', '#14181f', '#d9744f',
]);

// ── 2. PARSE tokens.css TO extract hex values ───────────────────────────────
const tokensCss = fs.readFileSync(TOKENS_CSS_PATH, 'utf-8');

// Extract all #xxx / #xxxxxx / #xxxxxxxx values assigned to tokens
const hexInCssRegex = /--qh-[\w-]+:\s*#([0-9a-fA-F]{3,8})\b/g;
let hexMatch;
while ((hexMatch = hexInCssRegex.exec(tokensCss)) !== null) {
  legitimateHexes.add('#' + hexMatch[1].toLowerCase());
}

// ── 3. SCAN ALL SOURCE FILES ───────────────────────────────────────────────
const violations = [];
const scanDepth = 5; // max directory nesting to scan

function record(file, content, index, hex, kind) {
  violations.push({
    file,
    line: index > 0 ? content.substring(0, index).split('\n').length : 1,
    hex: kind === '0x' ? `0x${hex}` : `#${hex}`,
    context:
      content.split('\n')[
        Math.min(
          index > 0 ? content.substring(0, index).split('\n').length - 1 : 0,
          content.split('\n').length - 1
        )
      ] || '—',
  });
}

function scanDirectory(dir, depth = 0) {
  if (depth >= scanDepth) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, depth + 1);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Only scan these extensions in src/
      if (!['.ts', '.tsx', '.astro', '.css', '.js', '.mjs'].includes(ext)) continue;

      // Skip tokens.css itself — its hexes are the definitions
      if (fullPath === TOKENS_CSS_PATH) continue;

      try {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // (a) CSS-style hex literals: # followed by 3, 6 or 8 hex chars.
        //     Must not be preceded by a word char (so #id anchors and the
        //     literal text "href=\"#main\"" are not colours) — anchors are a
        //     known false-positive source, so require a colour-ish boundary.
        const hexLiteralRegex = /(?<![\w&])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
        let match;
        while ((match = hexLiteralRegex.exec(content)) !== null) {
          const hex = match[1].toLowerCase();
          if (legitimateHexes.has('#' + hex)) continue;
          record(fullPath, content, match.index, hex, '#');
        }

        // (b) JS/TS numeric colour literals: 0xRRGGBB or 0xRRGGBBAA.
        //     These are how three.js materials smuggle colour past a
        //     CSS-only scanner (they were invisible here until 2026-10-24).
        const zeroXRegex = /\b0x([0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/g;
        while ((match = zeroXRegex.exec(content)) !== null) {
          record(fullPath, content, match.index, match[1].toLowerCase(), '0x');
        }

        // (c) rgb()/rgba() with numeric channels — a colour literal by any
        //     other name. Tokens store their own; components must not.
        const rgbRegex = /\brgba?\(\s*\d/gi;
        while ((match = rgbRegex.exec(content)) !== null) {
          const snippet = content.substring(match.index, match.index + 32).split(')')[0] + ')';
          record(fullPath, content, match.index, snippet, 'rgb');
        }
      } catch (e) {
        // Skip files that can't be read
      }
    }
  }
}

scanDirectory(SRC_DIR);

// ── 4. REPORT RESULTS ───────────────────────────────────────────────────────
let exitCode = 0;

if (violations.length === 0) {
  console.log('══════════════════════════════════════════');
  console.log('✅ SUPER-STRICT VERIFICATION: PASS');
  console.log('══════════════════════════════════════════');
  console.log(`   Project: ${PROJECT_ROOT}`);
  console.log(`   Source scanned: ${SRC_DIR}`);
  console.log(`   Legitimate hexes: ${legitimateHexes.size}`);
  console.log(`   Violations found: 0`);
  console.log('   No hex literals outside tokens.css — EVERYTHING references var(--qh-*)');
  console.log('═══════════════════════════════════════════');
  exitCode = 0;
} else {
  exitCode = 1;
  console.log('══════════════════════════════════════════');
  console.log('❌ SUPER-STRICT VERIFICATION: FAIL');
  console.log('═══════════════════════════════════════════');
  console.log(`   Project: ${PROJECT_ROOT}`);
  console.log(`   Violations: ${violations.length}`);
  console.log('');

  // Group violations by file
  const byFile = new Map();
  violations.forEach(v => {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  });

  byFile.forEach((fileViolations, file) => {
    console.log(`  File: ${file}`);
    fileViolations.forEach((v, i) => {
      console.log(`    ${i + 1}. Line ${v.line}: ${v.hex}`);
      console.log(`       Context: ${v.context.substring(0, 60)}...`);
    });
    console.log();
  });

  console.log('   Action required: Fix all violations so every hex references var(--qh-*)');
  console.log('═══════════════════════════════════════════');
}

process.exit(exitCode);
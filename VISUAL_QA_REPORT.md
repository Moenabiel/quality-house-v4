# VISUAL_QA_REPORT.md — Quality House v4 “The Consignment Dossier”

**Date:** 2026-11-03 · **Build:** `npm run build` PASS (4 pages) · `check:tokens` PASS (0 violations)
**Pages:** `/`, `/products/gum-arabic`, `/products/cotton`, `/products/seeds`
**Server:** `npx astro preview` on http://127.0.0.1:4400 (serves `dist/`, rebuilt per pass)
**Shots:** `C:\Users\sumay\AppData\Local\Temp\.playwright-mcp\` (v4b → v6 series)

---

## Verification gates (final state)

| Gate | Result | Evidence |
| --- | --- | --- |
| `npm run check:tokens` | **PASS** — 0 hex violations, every component reads `var(--qh-*)` | tokens.css sole authority |
| `npm run build` | **PASS** — 4 static pages | astro build log |
| Console (errors **and** warnings), every page, every viewport | **0 errors · 0 warnings** — a real gsap empty-target warning defect was found on product pages (4×) and fixed (guarded hero-line/fade tweens), re-verified clean | playwright console sweeps ×4 pages |
| axe-core WCAG 2.1 A/AA (`tools/axe.mjs`, 5 runs: 4 pages @1920 + home @390) | **PASS — 0 violation rules** | axe run log |

Tooling note: v4 initially inherited v3’s stale `package.json` qa scripts (port 4322, missing `qa.mjs`/`axe.mjs`). Cleaned to v4 truth: `preview` → 4400, `axe` → `tools/axe.mjs`, `gate` = tokens + assets + build.

## Responsive passes
- **1920×1080** — every section `QH/01`→`QH/08` + footer captured and reviewed; all three product folds.
- **1440×900** — fold/story/products/dest/quality/footer; sticky side plate verified engaging and releasing inside its column.
- **390×844** — home fold/story/products/memberships/footer + product fold + menu interaction test.

## Round-1 craft critique — 9 defects found, fixed, re-shot clean
1. Hero plate image not filling frame → `img { inline/block-size: 100%; object-fit: cover }`.
2. Products-row plates rendering neutral gray → root cause `<span class="duotone">` inline → `display: block`.
3. Duotone recipe murky → screen/multiply stack; grade steepened `contrast(1.22) brightness(1.06)`.
4. Group stamp collided with AHK text / Contact stamp overlapped headline → moved into `.m-head` flex row / onto enquiry sheet.
5. Pinned nav translucent bg showed photo seams → opaque `--qh-paper` when pinned.
6. Pale photos washed → grade steepened.
7. Quality sticky/relative duplicate rules → sticky desktop-only via `@media (min-width: 981px)`.
8. “Green bar” under dest photo → **gsap parsed stylesheet from-state `translateY(-8%)` as y-pixel baseline** that yPercent tweens never touch → tween `y: 0` explicitly; verified `gap=0`, transform identity.
9. Port photo’s genuinely dark bottom 15% (canvas-sampled gray 82 vs mid 151) → 8/5 window + `object-position: top`; verified flush to caption.

## Round-2 craft critique — 4 flaws found, fixed, re-shot clean
1. **Mobile footer seal was `display:none`** — signature device vanished on phones. Now stacks under the tagline.
2. **“· Sudan”/“· Egypt” orphaned at 390** → `.f-contact li { white-space: nowrap }`; single line verified.
3. **Mobile Menu never functionally tested** → tested: opens real panel, `aria-expanded=true`, visible focus ring.
4. **Quality sticky plate + methodology `<details>` unverified** → sticky engage/release verified; disclosure opens with honest-limits prose + correction-contact line; hint hides when open (by design).

## Round-3 (independent visual-critic verdict, then its contract executed)

Critic round-2 score: **83/100 CONDITIONAL PASS**, contract items M1/M3/M4/2m/m1/m3/m4/m5/m6/m7. Implementation:

1. **M1 — Registry unification.** Desktop nav carries the full register incl. **05 REGISTER**; mobile menu reordered 02→03→03·A (smaller sub-link nested directly under its parent, href fixed to `/products/gum-arabic`)→04–08 Contact. Footer already held 02–08.
2. **M3 — Per-form figure registry (no reused exposures).** Home keeps Fig. 01–07 single-owner. 03·A hero = the house’s real `quality-house-arabic-gum-powder-150g.webp` (Fig. 3A·01 — Arabic gum powder · 150 g pack · Khartoum, later tightened to a one-line caption); 03·B hero = `heritage-cotton-port.webp` (Fig. 3B·01 — Baled cotton at the port · Port Sudan); Quality plate = `cotton-field.webp` (Fig. 07 — Cotton at the field stage · Sudan); 03·C hero = square 1:1 window of the seed sacks with `object-position: 30% 30%` (`[data-slug='seeds']`) vs. the home row’s 4:3; home-row gum plate gets `object-position: 50% 100%` bottom cut (distinct from the 03·A-era hero crop).
3. **m1 — Caption grammar unified:** `{fig} — {name} · Sudan` → “FIG. 03 — GUM ARABIC · SUDAN” (was “gum arabic, Sudan”).
4. **m3 — QH/08 seal moved onto the enquiry instruction sheet** (`.contact-stamp` inside `.enquiry`, top-right corner, sheet `position: relative`).
5. **m4 — `.form-head-right { white-space: nowrap }`** globally.
6. **m5 — Mobile footer single-column stack** (`grid-template-columns: 1fr`), seal lives.
7. **m7 — Eyebrow register:** “Register 01 · Flagship” / “Register 02 · Origins” / “Register 03 · Improved & hybrid”.

**Dismissed with measured evidence (not defects):**
- **M2 nav-scrim claim:** pinned nav verified opaque over the dark acacia plate (`v5-1920-nav-dark.png`).
- **Ledger-mono claim:** all `.reg-v`/`.attr-value`/`.h-note` lines computed **IBM Plex Mono** via getComputedStyle (14px values / 12.5px uppercase keys); serif numerals are the display-figure layer by design, same pairing as QH/01 (`v5-1920-ledger.png`).
- **Footer label rules claim:** all three labels measured `border-bottom: 1px solid` at content width — identical.

**Critic re-verdict after evidence review: PASS — 92/100.** Axis deltas: visual system 19/20, typography 14/15, layout 14/15, photo grading 14/15, components+states 14/15, signature craft 17/20. Its one cosmetic residual (lone-word caption wrap) was fixed (`v6-1920-gum-fold.png`) with rebuild + gates re-run (tokens 0 / build PASS / axe 0 / console 0·0).

## Verified interactions
- Stamp device: SVG `currentColor`, textPath ring legend, feTurbulence bleed; `data-stamp` GSAP `back.out(2.2)` entrances verified; `stamp--on-green` in footer.
- Mobile menu toggle: functional (round-2 #3).
- Quality methodology `<details>`: functional, hint hides when open (by design).
- Mail form: static mailto-prep design; nothing is sent, no sending claims.

## Deliberate (not defects)
- Method-sheet right-half emptiness on product pages = the argument itself (“anything not documented appears here nowhere”).
- Section rhythm `--qh-section-py` breathing (~2×96px) between method sheet and closing CTA — same rhythm as home.
- Serif display numerals over mono labels (the measuring layer is mono everywhere).

## Honest disclosures — could not run / not run
- Lighthouse perf pass not executed this release — perf not yet gated; images are local assets with dimensions set, zero third-party JS.
- Reduced-motion path principle-checked in code (`prefers-reduced-motion` gates CSS at global.css 26/508 and JS at motion.ts) — not exercised in an OS-emulated session.
- Real-device phone check not performed; 390×844 covered via Playwright device-size emulation only.
- Critic scope note (verbatim): stills-only; hover choreography, desktop form validation/focus loops and motion remain unverified-by-capture; m4 nowrap fix rests on the CSS fix + absence of contrary evidence at 390.

## Final verdict
**PASS — 92/100 (independent visual-critic re-verdict).** All gates green: tokens 0, build PASS, axe 0 violations ×5 runs, console 0 errors/0 warnings ×4 pages. Three critique rounds executed with capture evidence; two critic claims dismissed with computed-style measurements. The dossier passes its own audit: one register, one grammar, one owner per plate.

---

## ALIVENESS IMPLEMENTATION — "go crazy" (2026-11-03)

**User directive:** Make the site "actually alive — moving, breathing" after the 92/100 critic verdict. Four parallel research agents mapped every viable technique × receipt × mount point × cost × guard. User's "go crazy" licensed all passes.

### P1 — Paper breathes (zero-dep, idle/time layer)
- **Animated grain** — full-page `feTurbulence` displacement (reused stamp recipe), baseFrequency animated on GSAP ticker.
- **Hero plate idle drift** — 12s slow scale yoyo 1→1.02 on `.plate-img img` (free `y` channel, not `data-reveal-media`).
- **Photo develop-in** — duotone arrives over-processed (`--qh-grade-filter-from`), settles to true grade (`--qh-grade-filter`) on scroll arrival via `[data-developed]`.
- **Form invalid-shake + valid-compose** — shake on empty submit (damped 2×, `--qh-dur-shake`); valid → button morphs "Prepare email → Preparing… → Ready ✓" (mail-to compose, nothing sent).
- **Native cross-document VT keyframes** — `@supports (view-transition-name)` peel/slide for MPA Chromium; no ClientRouter needed for base tier.

### P2 — Velocity layer (Lenis `velocity` + GSAP `quickTo`)
- **Velocity skew** — `.pr-plate`, `.statement-media`, `.dest-media`, `.quality-media` (sticky) shear ±2° clamped via `quickTo` elastic.out(1, 0.3). Receipt: GSAP forum #25971 + Awwwards showcase clones.
- **Velocity ticker** — honest mono strip `SOURCE · INSPECT · DOCUMENT · VERIFY ·` at z-35, direction flips with scroll velocity.
- **SplitText line-masks** — free since GSAP 3.13, a11y-safe (`mask: "lines"`, `autoSplit`, `aria-label` on source). Applied to all display headings (h1/h2/h3 + `.display-*`). Product h1 on dossier pages now hooked with `[data-hero-line]` equivalent via SplitText.

### P3 — Pointer cluster (`pointer: fine` gate, `prefers-reduced-motion` kill)
- **Magnetic CTAs** — `.btn` × quickTo elastic, delta = cursor − center × 0.35, elastic release. Recipe: blog.olivierlarose.com/tutorials/magnetic-button (verified gotchas: no `gsap.to` mixing).
- **Registration-mark cursor** — hand-built crop-mark motif, lagging via quickTo (z-70, free slot). blobity excluded (GPLv3 dual).
- **Stamp re-ink hover** — −7°→−4°, 1.04 scale, blur, elastic back. Respects "stamps rest" contract (hover only, no loops).

### P4 — Page transitions (Interlude, MIT, Astro-native)
- **ClientRouter + peel/tear/typewriter** (non-WebGL lazy) + ink/dither/dissolve (WebGL lazy, three.js ~240kB already in deps). Per-link `data-transition`, reduced-motion → none/fade, `transition:persist` on Nav/Footer.
- **Scripts re-init** on `astro:page-load` with `__qhMotionCleanup`/`__qhMotionBoot` guards (bundled scripts run once under ClientRouter — Interlude docs confirmed).

### Tokens contract upheld
- All new durations/eases/z-steps added to `tokens.css` first (`--qh-dur-skew`, `--qh-dur-shake`, `--qh-dur-cursor`, `--qh-ease-skew`, `--qh-ease-drift`, `--qh-z-cursor`, `--qh-z-ticker`, `--qh-skew-max`, `--qh-grade-filter-from`).
- Interlude transition colors tokenized (`--qh-transition-*`).
- `check:tokens` PASS (0 violations after remediation).

### Gates re-verified after aliveness
- `check:tokens` PASS — 0 violations
- `npm run build` PASS — 4 static pages
- `axe` 0 violations ×5 runs (1920×1080 ×4 + 390×844)
- Console 0 errors / 0 warnings ×4 pages (playwright sweep)
- Resilience script: no-JS cover hidden, reduced-motion instant, form validation clean, 404 sweep clean

### Deliverable tier
**portfolio-grade** — every technique receipted, licensed (MIT/Unlicense/CC0/OFL), mount-mapped, guarded. The dossier now breathes, responds to velocity, reacts to pointer, and turns pages like paper — all in service of the consignment metaphor.

---

## TREE ROTATION (QH/00) — ADDED 2026-11-03 12:05 UTC

**Component:** `src/components/TreeRotation.astro` (inserted after Hero on home page)
**Motion:** `setupTreeRotation()` in `motion.ts` — ScrollTrigger scrubs video `currentTime` (0–12s = 0–360°)
**Asset contract (waiting for Kling delivery):**

| Asset | Path | Spec |
|-------|------|------|
| Video (primary) | `public/assets/video/tree-rotation.webm` | 12s, 30fps, 360° loop, VP9, ≤15MB |
| Video (fallback) | `public/assets/video/tree-rotation.mp4` | Same, H.264 for Safari |
| Poster frame | `public/assets/images/tree-poster.webp` | First frame (0°), 1920×1080 |
| Frame sequence | `public/assets/frames/tree_000.png` … `tree_359.png` | 360 PNGs, 1° each |

**Behavior:**
- Video scrubs smoothly with scroll (scrub: 1)
- Empty/invalid video → auto-fallback to 360-frame sequence
- `prefers-reduced-motion` → shows poster frame only (no rotation)
- No-JS → shows poster frame (video never loads)
- Component only injects `<source>` tags if real video files exist (>1KB)

**Extract frames when video arrives:**
```bash
ffmpeg -i tree-rotation.mp4 -vf fps=30 public/assets/frames/tree_%03d.png
```

---

## FINAL PORTFOLIO SHOTS — 2026-11-03 05:32 UTC

**Location:** `C:\Users\sumay\AppData\Local\Temp\.playwright-mcp\qh-v4-final\`
**Count:** 24 PNGs (4 pages × 3 viewports × 2 captures each)

| Viewport | Pages | Captures |
|---|---|---|
| 1920×1080 | home, gum-arabic, cotton, seeds | full-page + above-fold |
| 1440×900 | home, gum-arabic, cotton, seeds | full-page + above-fold |
| 390×844 (mobile) | home, gum-arabic, cotton, seeds | full-page + above-fold |

All shots captured from `http://127.0.0.1:4400/` (serves `dist/` after final build). Animations allowed to settle (1.5s wait post-networkidle).

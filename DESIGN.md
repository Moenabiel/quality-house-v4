# Quality House v3 — Design Specification

**Version:** 2026-10-27  
**Status:** ACTIVE — SPECIMEN EVOLUTION  
**Owner:** Mohamed (Cairo, Egypt)  
**Budget:** $0 (CC0/OFL/MIT only)  
**Based on:** v2 (2026-10-25) — locked system, not re-litigated

---

## 1. Visual Theme (v3 Evolution)

**POV:** Calm archive search tool preserving institutional credibility; supported by United Carriers, Freight Consolidators, MTS Nafeza, Movexa.

**Signature Moment (v3):** The **living specimen plate** — a real acacia that turns under your hand, rendered in the brand palette with specimen-real materials (bark mottling, frond translucency, cotton bolls as harvest marks, seed furrow as sown evidence). The photograph is the no-WebGL/reduced fallback; the 3D specimen is the default truth. One tree, six chapters, from Sudan to the world. Quality you can trust.

**v2 → v3 Evolution:**
| v2 | v3 |
|----|----|
| Botanical plate + 3D tree (opt-in ?diorama=1) | **Living specimen plate DEFAULT** — the 3D tree IS the plate content; photo is pure fallback |
| "Vision glasses" optics pass (retired) | **Removed entirely** — true transparency, no window |
| "Quality" italic bronze in headline | **Scroll-driven bronze tint** — the word "Quality" drifts bronze → bronze-pressed via a registered custom property (`@property --qh-quality-tint`) on `animation-timeline: scroll(root block)`; colour-only, no italic, no colour font |
| 6200 frond cards, good canopy | **6200 frond cards + frond translucency + seasonal tint shift** — specimen reads alive |
| Drag-to-rotate (good) | **Drag-to-rotate + zoom gestures + auto-level return** — plain wheel scrolls the page (never trapped); ctrl+wheel (trackpad pinch) zooms the specimen, clamped 0.72–1.85, springs home after 650ms idle; two-finger touch pinch zooms and springs back on release |
| Bronze crop markers glow | **Bronze crop markers as specimen pins** — subtle, not emissive |
| Cotton heap, seed furrow | **Cotton heap + seed furrow + seasonal tint** — harvest evidence |

**Rejected (carried forward):** Dark deep-indigo/charcoal + gold, generic tech minimalism, glassmorphism as decoration, particle-glitch crowd effects, cool blue-greys as surfaces, neon, multi-stop gradients, glow as decoration, second accent, "modern and clean" as design argument.

---

## 1a. Design Schools — What We Adopt, What We Reject (Locked from v2)

| School | Verdict | What exactly we take | Where it ships |
|--------|---------|----------------------|----------------|
| **International Typographic Style (Swiss/ITS)** | **ADOPT — primary** | Mathematical grid; one flush-left edge; asymmetric two-column hero (copy 1.08fr / plate 0.92fr); hairline rules carry structure, not boxes; sentence-case labels with 0.03em tracking (uppercase label voice dropped in v3 — Hallmark 67); tabular-nums data | Hero grid, record strip, all sections' flush-left headlines |
| **Bauhaus** | **ADOPT — principles only** | Form follows function; honesty of material (specimen in a plate, not chrome); a small family of colors used with discipline; nothing decorative without information | LED dots state real pill state; plate is the content; zero-hex law |
| **Japanese aesthetics (Ma / Kanso / Shibui)** | **ADOPT — governing calm** | Ma: the mat around the specimen IS design — negative space is not waste; Kanso: omission as refinement (crease removed, glows removed); Shibui: understated details (6px LED, 1px rules) | Hero vertical rhythm, plate letterboxing, retired effect-soup |
| **Print/botanical-atlas tradition** | **ADOPT — the brand's natural home** | Figure numbering (Fig. 01 acacia; Fig. 02–04 product plates); plate + caption discipline; double-rule manifest frames on data strips; specimen naming in captions. **LIVING SPECIMEN**: the hero Fig. 01 is the interactive 3D acacia by default; the duotone photograph is the no-WebGL/reduced fallback; drag affordance named once in ITS small-tracked print type ("Drag to turn") | Hero plate caption + drag hint, product captions, record strip |
| **Aesop-school restraint (modern benchmark)** | **ADOPT — tone** | Withhold rather than over-explain; consistency breeds trust; no urgency, no noise | All copy tone; no animated noise layers |
| Art Deco (Port Sudan trade-era) | **PARTIAL — one element only** | The double hairline rule motif echoes 1920s trade documents | Record strip manifest frame only |

**Rule:** Every new visual element must name which adopted school it serves, or it does not ship.

---

## 2. Palette — Tokens + Provenance (Locked from v2)

**Single Source:** `src/styles/tokens.css` — Zero hex literals outside this file.

| Token | Name | OKLCH | sRGB | Use | Provenance |
|-------|------|-------|------|-----|------------|
| `--qh-paper` | Cotton Paper | `oklch(96.8% .011 85.5)` | `#f8f4ec` | Page ground (90% of site) | qualityhouseintl.com live theme |
| `--qh-paper-2` | Cotton Paper, shaded | `oklch(93.2% .014 84)` | `#ede8de` | Alternate band (ticker, ledger) | Derived |
| `--qh-surface` | Card Ivory | — | `#fefcf7` | Cards, panels, quote plates | Derived |
| `--qh-surface-2` | Card Ivory, warm | — | `#f3eee4` | Hover / raised row | Derived |
| `--qh-green` | Acacia Green | `oklch(32.7% .055 156)` | `#1a3d29` | **Closing CTA + footer ONLY** | qualityhouseintl.com |
| `--qh-green-2` | Acacia Green, lit | `oklch(40.6% .058 137)` | `#3a5131` | Hover on green, secondary green | Derived |
| `--qh-on-green` | Paper on Green | — | `#faf6ef` | Text on green bands | Derived |
| `--qh-bronze` | Port Sudan Bronze | `oklch(53% .106 62)` | `#975c20` | **Single accent**: CTAs, rules, active states, "Quality" color font | qualityhouseintl.com |
| `--qh-bronze-deep` | Bronze, pressed | — | `#7a4a19` | Pressed / dark aspect | Derived |
| `--qh-bronze-glow` | Bronze, halo | — | `rgba(151 92 32 / 0.16)` | Focus halo, quiet washes | Derived |
| `--qh-on-bronze` | Paper on Bronze | — | `#fdfaf4` | Text on bronze fills | Derived |
| `--qh-sand` | Sesame Sand | `oklch(83% .031 79)` | `#d2c5b1` | Warm neutral between paper and bronze | qualityhouseintl.com |
| `--qh-line` | Hairline | — | `rgba(21 28 23 / 0.14)` | Section rules, card borders | Derived |
| `--qh-line-strong` | Hairline, strong | — | `rgba(21 28 23 / 0.28)` | Emphasis rules | Derived |
| `--qh-line-soft` | Hairline, soft | — | `rgba(21 28 23 / 0.07)` | Internal dividers | Derived |
| `--qh-line-inverse` | Hairline on green | — | `rgba(250 246 239 / 0.22)` | Rules inside green bands | Derived |
| `--qh-error` | Kiln Red | `oklch(50.5% .176 27)` | `#b42826` | Form errors — text + icon carry state | WCAG 1.4.1 |

**Banned (enforced by `check-tokens.mjs`):** Cool blue-greys as surfaces, neon, multi-stop gradients, glow as decoration, second accent, "Port Sudan Night" inversion. The site is a paper archive with two green bands; photography supplies depth.

---

## 3. Typography (v3: scroll-driven bronze tint for "Quality")

**Display:** Instrument Serif Variable (OFL) — editorial serif, weight 400-700, optical sizing, upright (no italics in v3 — Hallmark 38)  
**Body/Data:** Manrope Variable (OFL) — tight, neutral, tabular numerals, weight 200-800  
**Display (v3):** Instrument Serif + **scroll-driven bronze tint** on the word "Quality" — a registered custom property the engine interpolates itself

**Scale (fluid via clamp):**
| Token | Value | Use |
|-------|-------|-----|
| `--qh-display-1` | `clamp(3.4rem, 8.4vw, 7.5rem)` | Hero lines |
| `--qh-display-2` | `clamp(2.5rem, 5.6vw, 5.25rem)` | Section headlines |
| `--qh-display-3` | `clamp(1.75rem, 3vw, 2.75rem)` | Sub-headlines |
| `--qh-lead` | `clamp(1.0625rem, 1.5vw, 1.3125rem)` | Lead paragraphs |
| `--qh-text` | `1rem` | Body text |
| `--qh-text-sm` | `0.9375rem` | Small text |
| `--qh-label` | `0.75rem` | Labels, eyebrows |

**Tracking:**
- `--qh-track-display: -0.02em` (display)
- `--qh-track-label: 0.03em` (labels, sentence case — Hallmark 67 caps the label voice at 0.03em)

**Measure:** `--qh-measure: 62ch` (prose), `--qh-measure-tight: 44ch` (tight blocks)  
**Lines:** 45-75 chars; headings balanced (`text-wrap: balance`), paragraphs pretty (`text-wrap: pretty`)

**Variable Font Animation (v3 Hero):**
- Weight: `--qh-font-display` weight animated on scroll via `font-variation-settings`
- **Color (v3):** the word "Quality" drifts between Port Sudan Bronze and bronze-pressed on the scroll timeline — `@property --qh-quality-tint` (registered in tokens.css, `initial-value` a literal colour) animated with `animation-timeline: scroll(root block)`. Fallback: static bronze, upright. No colour font — COLRv1/CPAL was explored and dropped (font tooling could not ship it honestly).

---

## 4. Components (v3 Refinements)

| Component | Source | v3 Adaptation |
|-----------|--------|---------------|
| Button | shadcn/ui | Re-theme to tokens; magnetic drift ≤6px (fine pointers only) |
| Dialog | shadcn/ui | Re-theme |
| Input | shadcn/ui | Re-theme |
| Accordion | shadcn/ui | Re-theme |
| Spotlight | Magic UI | Copy + re-theme — used for hero plate subtle vignette only |
| Text reveal | React Bits | Copy vanilla-JS, trim imports — for hero line masks |
| Scroll reveal | 21st.dev | Install via CLI — batched waves, cinematic tier |
| **3D Tree (v3)** | Custom | **Bespoke Three.js + WebGPU compute** — frond translucency, bark mottling, seasonal tint, pinch-zoom, auto-level |
| Crop Sequencer | Custom | Drum machine + Rive — arms on select, accents on second tap |
| Paper Crease | Custom | **RETIRED** (owner verdict 2026-10-26) |
| Optic Lens | Custom | **REMOVED** — the specimen renders direct |
| Product Plates | Custom | Fig. 02–04: duotone photographs in printed plates |
| Network Globe | Custom | WebGPU compute + RenderPipeline — lattice, routes, hubs |

---

## 5. Layout (Locked from v2)

**Container:** `90rem` max-width  
**Padding:** `clamp(1.25rem, 4vw, 3.5rem)` fluid  
**Gap:** `clamp(1.25rem, 3vw, 2.5rem)` fluid  
**Section padding:** `clamp(5rem, 11vw, 10rem)` fluid  
**Grid:** 12-column implicit, fluid columns  
**Rhythm:** 4px base (`--qh-s1` through `--qh-s32`)  
**Header height:** `5.25rem` (mobile `4.25rem`)

**Hero Composition:** Right-anchored 54% photo plate, 14% mask into Cotton Paper, caption bottom-right, full-bleed paper record strip below (Founded/Operations/Portfolio/Method).

---

## 6. Depth / Elevation (Locked from v2)

**Shadows (two only):**
- `--qh-shadow-sm: 0 8px 24px rgba(21 28 23 / 0.07)`
- `--qh-shadow-md: 0 24px 64px rgba(21 28 23 / 0.12)`
- `--qh-shadow-lg: 0 48px 128px rgba(21 28 23 / 0.18)` (hero only)

**Radius:** `0` everywhere except pills (`999px`). Sharp brand — trading house, not toy.

**Focus:** `2px solid var(--qh-bronze)` at `3px` offset — visible on every surface.

---

## 7. Animation (v3: Amplified Cinema + Specimen Life)

**Eases:**
- `--qh-ease-out: cubic-bezier(0.16, 1, 0.3, 1)` (entrances)
- `--qh-ease-soft: cubic-bezier(0.23, 1, 0.32, 1)` (scroll smoothing)
- `--qh-ease-panel: cubic-bezier(0.83, 0, 0.17, 1)` (wipes)
- `--qh-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` (magnetic)
- `--qh-ease-expo: cubic-bezier(0.19, 1, 0.22, 1)` (cinematic)

**Durations:**
- `--qh-dur-fast: 180ms` (hover, link arrows)
- `--qh-dur-micro: 240ms` (micro-interactions)
- `--qh-dur-enter: 950ms` (scroll reveals, batched waves)
- `--qh-dur-count: 1200ms` (preloader counter 00→100)
- `--qh-dur-draw: 1200ms` (route/line draw-on)
- `--qh-dur-panel: 600ms` (menu wipes)
- `--qh-dur-pin: 2000ms` (pinned section dwell)
- `--qh-dur-marquee: 36s` (product ticker, linear)
- `--qh-stagger: 70ms` (wave stagger)

**Travel:** `--qh-travel: clamp(56px, 8vw, 120px)`, `--qh-travel-lg: clamp(80px, 12vw, 180px)`

**Scroll Choreography:**
- Native CSS ScrollTimeline (85% support) for simple scrub/reveal
- GSAP ScrollTrigger for complex choreography (pin, snap, callbacks)
- View Transitions API for SPA navigation
- CSS Anchor Positioning + Popover API for tooltips/popovers

**Reduced Motion:** All durations → 0ms via `@media (prefers-reduced-motion: reduce)`. No from-states set. Static frames rendered.

---

## 8. Do's / Don'ts (v3: Stricter)

**Do:**
- One accent only (Port Sudan Bronze) — the resin cures to bronze
- Paper ground with two green bands only — a third breaks the system
- Photography supplies depth, not dark themes
- Non-inverted duotone: sky→paper, foliage→green, ground/bark→bronze
- Luminance LUT limitation: trunk and canopy share shadow band → bronze ground, not bronze trunk
- Single source of truth: `tokens.css` only
- Every asset logged with source + licence (CC0/OFL/MIT)
- **Specimen realism over effect**: bark mottling, frond translucency, cotton as harvest, seeds as sown
- **Scroll-driven bronze tint on "Quality"** — the one moving-colour moment (registered `@property`, no colour font)

**Don't:**
- Cool blue-greys as surfaces
- Neon, multi-stop gradients, glow as decoration
- Second accent
- Glassmorphism as decoration
- Emoji as icons
- Centered-everything layouts
- "Modern and clean" as design argument
- Hex literals outside tokens.css
- Fake metrics, placeholder content, stock photography as brand imagery
- **Any "effect" that isn't specimen behavior** (no particles, no shaders that aren't material)

---

## 9. Responsive (Locked from v2)

**Breakpoints:**
- `1280px` — desktop full
- `1024px` — tablet landscape
- `768px` — tablet portrait
- `640px` — mobile landscape
- `390px` — mobile portrait

**Mobile Patterns:**
- Hero: plate becomes composed band (42svh), mask vertical (180deg gradient)
- Crop sequencer: wraps, pills become rack
- Record strip: 2-column grid
- Crop pills: `<div popover>` + `position-anchor`
- Globe: simplified, no cargo beads
- Journey: stacked steps, rail vertical

**Accessibility:** WCAG 2.1 AA, keyboard nav, visible focus ring, reduced motion, no-JS readable.

---

## 10. 2026 Technology Stack (v3: WebGPU Compute + Scroll Timelines)

| Category | Technology | Version | Purpose | Fallback |
|----------|------------|---------|---------|----------|
| 3D Engine | Three.js | r183+ | Hero diorama, Journey globe | — |
| Render Pipeline | Three.js RenderPipeline | r183+ | Post-processing | EffectComposer (deprecated) |
| Compute | WebGPU (WGSL) | Chrome 113+/Firefox 141+/Safari 26+ | 6200 fronds, chromatophore, fluid | WebGL2 Transform Feedback |
| Post-Processing | pmndrs/postprocessing | 6.39.5+ | Bloom, DOF, SSR, CA, Noise | EffectComposer (deprecated) |
| Scroll | CSS ScrollTimeline + GSAP | Native 85% / GSAP 3.13+ | Reveal, rail, ticker, hero | GSAP only |
| SPA Transitions | View Transitions API | Chrome 115+/Safari 26+ | Home→Product, crop select, mobile nav | Fade+transform |
| Positioning | CSS Anchor Positioning + Popover | Chrome 125+/Safari 18+ | Crop pills, network hubs, mobile pills | JS absolute |
| Typography | `@property` scroll animation (registered custom property) | Chrome 115+/Firefox 110+ (`animation-timeline`), else static bronze | **Hero "Quality" scroll-driven bronze tint** | Static bronze |
| Interactive | Rive State Machines | @rive-app/web | Crop pills, globe loader, empty states | Lottie/dotLottie |
| Smooth Scroll | Lenis | 1.0.5+ | Smooth scroll + ScrollTrigger sync | Native scroll |
| Animation | GSAP 3.13+ | 3.13+ | Complex choreography, SplitText, MorphSVG, Flip | CSS transitions |
| 3D Instancing | InstancedMesh2 (Three.ez) | latest | 6200 fronds, frustum culling | InstancedMesh |
| Texture | KTX2 + Draco | latest | Production assets | PNG/JPG fallback |
| Images | AVIF + WebP | latest | Hero/product images | WebP/JPG fallback |
| Fonts | Variable (Instrument Serif, Manrope) | latest | Hero headlines, body text | Static WOFF2 |
| Moving Colour | **`@property --qh-quality-tint` + `animation-timeline: scroll()`** | Chrome 115+/Firefox 110+ | **Hero "Quality" bronze → bronze-pressed drift** | Static bronze, upright |

---

## 11. Enforcement (v3 Gates)

1. `node tools/check-tokens.mjs` (exit 0 required) — zero hex outside tokens.css
2. `python tools/protocol_check.py --runtime` (0 fail) — protocol compliance
3. `node tools/sloplint.mjs <output> --render` — Hallmark Floor + Reflex gates
4. Hallmark finish review (fresh context) — `gates.md` §6
5. Screenshots at 1920×1080 and 390×844 — critic PASS ≥ 8/10 all criteria
6. Zero console errors, Lighthouse ≥ 95, axe ≥ 95

**Process:** Hero first → sloplint render → hero review → sections → full page → sloplint render → finish review → material ask → ship.
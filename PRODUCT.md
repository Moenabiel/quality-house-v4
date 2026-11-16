# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 5 + TypeScript 5 + Vite 6 + Three.js r171 + GSAP 3.12 + Lenis 1.1. Zero external image deps. Static build to `/dist` served via Vite preview or any static host. No server, no API, no database.

## Users

**Primary:** International agricultural buyers (importers, processors, traders) sourcing gum arabic, cotton, and seeds from Sudan. They need verified quality, traceable origin, and reliable export execution. Decision window: 30-90 seconds on site to judge credibility.

**Secondary:** Sudanese stakeholders (farmers, cooperatives, government) verifying the house's standards and reach. **Tertiary:** Industry analysts, journalists, regulators checking compliance.

All users are professional, time-poor, on desktop (office) or mobile (field). English and Arabic readers.

## Product Purpose

Quality House (est. 1967, Port Sudan) is Sudan's agricultural export house — gum arabic (flagship), cotton, seeds. The site does not "market" — it proves. Every section is evidence: species, grades, origin, control, chain of custody. Success = a qualified enquiry from a buyer who trusts the house before first contact.

## Positioning

The only Sudanese exporter that puts the *entire verification chain* on the public web: species → grade → origin → inspection → documentation → export. Competitors show certificates; Quality House shows the process that earns them. The 3D hero diorama (real acacia, real cotton, real soil) is the visual thesis: one tree, six chapters, from Sudan to the world.

## Operating Context

Buyers evaluate against a mental checklist: species match? grade available? origin traceable? inspection documented? export logistics proven? The site answers each in order (Crown → Fruit → Roots → Routes → Proof → Enquiry). The enquiry form opens a pre-filled `mailto:` — no CRM, no tracking, no friction. Phone/email in footer for direct contact. Arabic mirror planned (separate build).

## Capabilities and Constraints

**Capabilities:**
- 4 pages: Home (6 chapters), 3 Product detail pages (gum arabic, cotton, seeds)
- Hero: 3D diorama (Three.js) with real acacia photograph → duotone mapped to brand palette → optic lens (barrel distortion, chromatic aberration, bloom, scanlines, grain, field-of-regard)
- Journey globe: accurate coastlines (Natural Earth 110m), bronze lattice, cargo arcs from Port Sudan to 7 partner hubs, cargo beads, click-to-orbit, pointer tilt
- Product pages: hero split (copy left, image right), attribute list, 3-chapter story, closing CTA
- Record strip: 4 metrics (Founded, Operations, Portfolio, Method) with count-up animation
- Preloader: opaque curtain, serif counter 00→100, curtain lift reveal
- Reduced motion: single static frame everywhere, no animation loops
- No-JS: all content readable, CSS never hides without `.js`

**Constraints:**
- $0 budget: all assets CC0/public domain/self-produced; Three.js/GSAP/Lenis via npm (MIT)
- Static only: no server, no API, no auth, no database
- Fonts: Instrument Serif (OFL) + Manrope (OFL variable), self-hosted
- Photography: owner-supplied (Port Sudan) + USFWS public domain (acacia)
- Performance: DPR ≤ 1.5, 60fps desktop, 30fps mobile; paused when tab hidden
- Accessibility: WCAG 2.1 AA, keyboard nav, focus rings, reduced motion, no-JS readable

## Brand Commitments

**Name:** Quality House (English) / بيت الجودة (Arabic)
**Established:** 1967, Port Sudan
**Tagline:** From Sudan to the world. Quality you can trust.
**Palette (from live qualityhouseintl.com, OKLCH → sRGB):**
- Ground: Cotton Paper `#f8f4ec` (oklch 96.8% .011 85.5)
- Text: Bark Ink `#151c17` (oklch 21.6% .014 155)
- Two dark bands only: Acacia Green `#1a3d29` (oklch 32.7% .055 156) + `#3a5131`
- Single accent: Port Sudan Bronze `#975c20` (oklch 53% .106 62)
- Warm neutral: Sesame Sand `#d2c5b1`
- Error: Kiln Red `#b42826`
**Typography:** Instrument Serif (display, roman+italic) + Manrope (body/data, tabular nums)
**Voice:** Precise, unadorned, evidence-first. No marketing adjectives. "We inspect" not "We ensure the highest quality."
**Principles:**
1. Evidence over claim — every statement traceable to a document or photo
2. One accent — the resin cures to bronze; a second accent means hierarchy is wrong
3. Paper archive aesthetic — the site is a document, not an app
4. Reduced motion is a first-class path, not a fallback
5. Sharp brand — radius 0 except pills; the house is a trading house, not a toy

## Evidence on Hand

- 12 portrait photos (team, board, exec) — compressed PNG→JPG, 93% size reduction
- 3 hero product photos (gum arabic tears, cotton field, seeds mix) — real, owner-supplied
- 1 public domain acacia photo (USFWS) — duotone mapped via `tools/duotone.mjs`
- Coastline data: Natural Earth 110m land polygons → `build-land.mjs` → `land-lines.json` (74KB)
- Network data: 12 nodes (Port Sudan, 4 branches, 7 partner hubs) in `src/data/network.ts`
- Product data: 3 products with full specs in `src/data/products.ts`
- All copy in `src/data/` — single source of truth

**Absences (must not fabricate):**
- No client testimonials, no certifications displayed, no volume metrics, no revenue claims
- No video, no 3D model downloads, no interactive configurator
- No Arabic build yet (planned separate)

## Product Principles

1. **The tree is the thesis** — one acacia, six chapters, top to bottom. The hero diorama is not decoration; it is the visual argument.
2. **Process is the product** — buyers buy traceability. The site shows the chain: source → inspect → document → export.
3. **Bronze is the resin** — one accent (Port Sudan Bronze). It appears on CTAs, rules, active states, focus rings, globe lattice, cargo arcs, crop markers. Nowhere else.
4. **Paper ground, two green bands** — 90% of the site is Cotton Paper. Acacia Green appears only on the closing CTA band and footer. A third green band breaks the system.
5. **Sharp, not soft** — radius 0 everywhere except pills. The house is a trading house, not a SaaS.
5. **Motion is visible, not implied** — 950ms reveals, 56px travel, batched waves, magnetic buttons, magnetic orbit panels. Reduced motion collapses all durations to 0ms and skips from-states entirely.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum (contrast ratios verified: Bark Ink on Cotton Paper 14:1, Paper on Green 9:1)
- Keyboard: skip link, visible bronze focus ring (2px, 3px offset), menu traps focus, Escape closes
- Reduced motion: `prefers-reduced-motion` respected at token layer AND in JS — all durations → 0ms, from-states never set, static frames rendered
- No-JS: `.js` class gates all motion; content never hidden without it; hero reads as type + facts + caption
- Arabic RTL support planned (separate build, not this repo)
# Quality House — MOTION.md — Motion brief (v2 cinematic rebuild)

Written before code, per owner brief. Reference study done via live Awwwards data (United
Carriers: Site of the Day Sep 2026, score 7.28, built with Webflow + **GSAP + Three.js**,
flagged elements: Preloader · 3D interactive hero · Scroll to explore · Page transition ·
Story-telling, palette discipline = ONE accent) plus the owner's descriptions of the other
references. Nothing was copied — qualities matched, not content.

## 1. What each reference contributes

| Reference | What it does | We take | We reject |
|---|---|---|---|
| **unitedcarriers.com** | Dark freight-forwarder, 3D hero, routes to destinations, one accent color, preloader → mask-reveal headline | Preloader → masked line-by-line headline; wireframe globe w/ draw-on routes + traveling cargo points; one-accent discipline | Electric blue branding, their content, endless loops |
| **freight-consolidators (parentheses.studio)** | Scroll-driven cargo journey (plane → ship → port → truck), transport transitions | Pinned journey: line draws, stages light up in sequence as you scroll | Full-engine vehicle animations we can't source honestly |
| **mts-nafeza (gusto.studio)** | Glowing data networks over dark trade infrastructure | Gold glow points + route glow on globe, scanline-quality dark surfaces | 3D environments/scenes beyond a web budget |
| **movexa (Dribbble)** | Modern B2B freight layout, clean service presentation | Asymmetric grids, hairline rules, generous whitespace, spec-sheet typography | Template stock layout feel |

## 2. Motion system — one philosophy

**Ship, don't decorate.** Every animation is information: where the cargo goes, what stage
comes next, what is interactive. Nothing spins, bounces, loops or floats for decoration.
Motion interrupts cleanly; nothing fights the scroll.

### Entrance
1. **Preloader** — brand core rises into place while a serif counter sweeps
   00→100 (aria-hidden digits) and the gold line fills; curtain wipes upward,
   headline enters through the lifted edge masked line-by-line. Animated path
   ≈ 1.9s preloader beat + ≈ 1.3s hero tail (~3.2s worst case on slow fonts
   because it is time-boxed to `document.fonts.ready` + a 600ms cap). A 3.4s
   inline failsafe can never trap the page; under reduced motion the curtain
   never shows. Without JS the preloader is display:none by default (never a
   gate). [Amplified 2026-10-23 — owner: motion must be visible, not implied.]
2. **Headline** — Instrument Serif, 4 masked lines (hero), each line rises
   110%→0 inside an `overflow:hidden` mask with 90ms stagger and the house
   ease; fades ride the same wave at 70ms stagger.
3. **Sections** — one reveal language site-wide, batched as waves: fade +
   56px rise (950ms `--qh-dur-enter`, 90ms intra-batch stagger). Media
   figures rise + their images unclip from `inset(14% 10%)` while scaling
   1.12→1 (border/hairline frame first). A decorative ticker strip
   (`Ticker.astro`) loops real product/origin names between hero and story
   (transform-only, pausable, static under reduced motion / `.motion-failed`).

### Scroll
4. **Hero globe** — Three.js wireframe sphere (dark, gold hairline lattice), gold route
   arcs Port Sudan → Gulf, Egypt, South Asia, West African coast, Europe; draw-on by
   `drawRange` (0.9s each, 180ms stagger — asserted); glowing cargo markers travel the
   live arc (×2 size/speed for visibility); the origin marker breathes; axial drift
   doubled to 0.09 rad/s + pointer tilt (±3°, eased) + gentle scrubbed scroll parallax;
   mount entrance = group scales 0.9→1 while the lattice fades up. Pause when
   hidden/offscreen; rAF-driven.
5. **Pinned journey** — Source → Load → Transit → Deliver. Pinned panel: a vertical gold
   line draws with scrub; each stage's number ring + label light as the line passes;
   stage copy cross-fades. Destinations row (Gulf · Egypt · South Asia · Europe as
   indicative lanes) closes the chapter.
6. **Heritage numbers** — count-up once on first view: 1967 (founding), 6 (specialised
   companies), 2 (countries). Rendered in static HTML; GSAP only animates the existing
   text node's value — content never injected by JS.
7. **Scroll progress** — 2px gold hairline, scaleX scrub across the full document.
8. **Nav state** — transparent over hero, charcoal + gold hairline after 40px; active
   section underlined via gold slide. Mobile menu: panel wipe, focus-trapped, Esc closes.

### Micro-interaction
9. **Hover** — buttons/text-links: gold border eases in 180ms, 1px inner offset grows,
   arrow nudges 4px, background fills on primary. Product media: 1.04 zoom + border ease.
10. **Magnetic buttons** — ≤ 6px magnetic drift toward cursor on heroes/CTAs, spring back
    on leave, disabled on touch + reduced-motion.
11. **Count-up** — see 6. **Focus** — visible 2px gold outline always, never suppressed.

### Exit / transitions
Single-page rebuild → no page transitions. Smooth anchor scrolling instead (Lenis, with
`ScrollTrigger.refresh()` on resize/images; native fallback via CSS `scroll-behavior`).
Anchor offset = header height via `scroll-padding-top`.

## 3. Timing contract (single source: tokens.css)

- **Durations** hover 180ms · micro 240ms · reveal (CSS) 700ms · scroll-enter 950ms
  (`--qh-dur-enter`) · route draw 1200ms · counter sweep 1200ms · ticker loop 36s ·
  preloader panels 600ms — all CSS vars (`--qh-dur-*`), no literals in components.
  JS tween seconds live in motion.ts/globe.ts by precedent (gsap timeline fields).
- **Eases** — standard `--qh-ease-out: cubic-bezier(0.16, 1, 0.3, 1)` for entrances,
  `--qh-ease-soft` for scroll scrub smoothing; linear ONLY for scrubbed position values
  and the ticker loop.
- **Stagger** — 70ms base (`--qh-stagger`), max 4 steps; batched reveal waves use
  90/120ms (motion.ts) so grouped elements read as one deliberate wave.
- **Durability** — tweens track composite-only properties (opacity, transform, clip-path,
  stroke/drawRange); will-change applied only during active animation and removed after.

## 4. Accessibility & honesty guardrails (hard)

- **prefers-reduced-motion: reduce** — Preloader skipped (removed instantly), globe renders
  one static frame (no rotation/parallax), reveals show final state (no from-states set),
  pins become stacked blocks, count-ups render final values, magnetic/hover zoom off.
  Enforced in one place (motion.ts) + CSS media query zeros all tokens.
- **No-JS** — every hidden-initial-state (opacity 0, scaleY 0, drawRange 0) is applied ONLY
  via JS (`motion-set` inline class + gsap.set inside the boot function). No CSS rule hides
  content without `.js` on `<html>`. If motion boot throws, a `finally` block removes all
  motion-state classes and the page is fully visible. The globe canvas is decorative:
  without JS the hero reads as type + record strip; nothing is lost.
- **Truthful UI** — routes are labeled *indicative trade lanes, not specific shipments*
  (copy carried from the current site). No invented cargo, metrics or destinations.
- **Axe-clean deltas** — horizontally scrollable containers (journey track on mobile)
  get `tabindex="0"`, `role="region"`, `aria-label`. Every contrast pair checked against
  the dark stage (gold ≥ #E1B552-class only on near-black; off-white text #F2EEE6).

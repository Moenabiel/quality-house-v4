# Quality House — PLAN.md — v2 premium cinematic rebuild

Owner brief (P0, this session): take the existing QH homepage design and rebuild as a
$10k-agency-grade, cinematic, import/export site. Dark dominant palette + single gold
accent, serif display + clean sans, real content only. Build in a DISJOINT directory so
the parallel session working `sites/quality-house` (Vite) is never touched.

## 1. Stack decision (Astro vs Next.js)

| | Astro | Next.js |
|---|---|---|
| Output for a content/marketing site | Static HTML, ships zero JS by default | React runtime + hydration on every page |
| No-JS gate (hard rule) | Trivially safe HTML + selective islands | Content renders but heavier JS story |
| Lighthouse 90+ mobile (hard rule) | Best-in-class static | Good, more effort |
| LGPL risk / complexity | None | Higher |

**Pick: Astro + TypeScript + plain CSS custom properties.** GSAP 3.13 (free incl. all
plugins since 3.13), Lenis, Three.js — verified free/public licenses. Fonts via
@fontsource (OFL): Instrument Serif (display) + Manrope (body/data).

## 2. Structure

```
sites/quality-house-v2/
  package.json  astro.config.mjs  PLAN.md  MOTION.md  LICENSES.md
  src/
    styles/tokens.css      ← THE single token file (colors, type, space, radii, durations, eases)
    styles/global.css      ← reset-lite, base type, focus, no-JS + reduced-motion guards
    layouts/Base.astro     ← <head>, fonts, a11y shell, noscript
    pages/index.astro      ← homepage (all sections)
    components/            ← scoped styles inside each component, tokens only
      Preloader · Nav · ScrollProgress · Hero(+GlobeClient) · RecordStrip
      Statement · Products · Journey · Destinations · Quality · Group · Contact · Footer
    scripts/
      motion.ts            ← GSAP+Lenis boot (single entry, failsafe design)
      globe.ts             ← Three.js wireframe globe + routes (lazy dynamic import)
  public/
    assets/images/**       ← copied from current site (already in repo, provenance in ASSETS.md)
    assets/logos/**        ← qh-mark + membership logos
```

Content = `CONTENT-SOURCE.md` (extracted 2026-10-23 from the live site's build source).
**Real copy only.** Homepage scope; subsites/other pages = follow-up lane.

## 3. Section order (homepage)

1. Preloader → hero: globe+routes+parallax, masked headline, record strip (1967 · Port Sudan
   / Sudan & Egypt / Gum arabic, cotton, seeds / Source · inspect · document)
2. Statement — acacia brand story ("We began with what could be checked."), big serif
3. Products — 3 asymmetric rows (gum arabic flagship / cotton / seeds) real copy + real images
4. Journey — PINNED: Source → Load → Transit → Deliver, gold line draws, stages light;
   destinations row (indicative lanes disclaimer retained)
5. Quality — "What is inspected is documented." + 3 capabilities (inspect/trace/export)
   + founder-blockquote + quality commitments hint
6. Group — "A group, not a single desk." + 6 real companies + memberships (AIPG/ICA/AHK)
7. Contact — CTA + real offices (Khartoum/Giza, phones, two emails) + mailto-only enquiry
   form (honest: "Nothing is sent from this website")
8. Footer

## 4. Tokens (single file contract)

All colors/typography/spacing/radii/durations/eases live in `src/styles/tokens.css`.
Components may use `var(--qh-*)` ONLY — no hex, no magic numbers. Critic gate includes
grepping components for hex literals.

## 5. Motion build order (+ per-section browser gate)

Foundation → hero+globe → journey pin → products → quality/group → contact+footer → polish.
After each major section: run dev server, 0 console errors, screenshot 1920×1080 + 390×844,
fix, continue. Final pass: no-JS, reduced-motion, keyboard, axe, Lighthouse.

## 6. Dependencies (versions pinned at install, verified)

- astro (latest stable) · gsap ^3.13 · lenis ^1.3 · three (current)
- @fontsource/instrument-serif · @fontsource/manrope (or fallback: existing in-repo
  Playfair/Inter woff2, also OFL)
- dev: playwright (already in repo root), lighthouse (added at test phase)

## 7. Correctness gates (hard, all must pass before "done")

1. `qa.mjs` — every section renders, 0 console/page errors, 0 horizontal overflow at
   390/768/1280/1920, all internal links resolve, images load
2. No-JS — with JS disabled: preloader absent, h1/nav/ALL content visible
3. Reduced-motion — emulated: final states only, preloader removed instantly
4. axe — 0 serious/critical on both viewports
5. Keyboard — focus-visible paths through nav → links → form; Esc closes menu; skip link
6. Contrast — text ≥ 4.5:1 (≥ 3:1 large) on the dark stage, verified by axe
7. Lighthouse perf ≥ 90 mobile (globe lazy, fonts subset/swapped, no layout shift)
8. No invented facts — every number/name traced to CONTENT-SOURCE.md

## 8. Risks

- Concurrent session owns `sites/quality-house` (Vite): mitigated by disjoint dir + board
  broadcast; their design mandate is the same direction (dark+gold), so the two converge.
- Lighthouse on dev server ≠ prod: Lighthouse runs against `astro build && astro preview`.
- Three.js on weak GPUs: capped DPR (≤1.5), ≤ ~2k tris, pauses when hidden, static frame
  under reduced motion — the hero also has a no-canvas graceful state.
- Form is mailto-composing (current site's honest pattern) — no backend, no invented
  claims about submission.

## 9. Implemented (2026-10-23) — outcomes, patterns, lessons

**Verified results** (production build via `astro preview`):

| Gate | Result |
|---|---|
| qa.mjs | 20/20 PASS (0 console errors, 0 overflow at 390/768/1280/1920, no-JS gate) |
| axe.mjs | 0 serious/critical at 1920×1080 and 390×844 |
| a11y.mjs | 10/10 (reduced-motion ×3, keyboard ×7: skip link, menu open/trap/Esc/refocus) |
| Lighthouse | **94 perf / 100 a11y / 100 BP / 100 SEO** — LCP 1.4s, CLS 0.01, TBT 290ms |

**Implemented patterns (differences from the original plan):**

1. **Journey = sticky rail, not a full pin.** The brief's scroll-driven storytelling is kept
   (gold rail scrubs, stages light as they pass, muted→bright full-alpha states — no opacity
   dimming after the axe contrast finding) — without pin gymnastics: without JS or reduced
   motion it is a plain stacked list, zero risk.
2. **State contract.** Below-fold reveal hiding lives in *unscoped* `global.css`(.js-gated);
   hero headline states are set by JS only, behind the opaque preloader (no CSS↔GSAP
   transform fights). `html.motion-failed` overrides + Base's 1.8s `__qhMotionReady` check +
   Preloader's own 2.6s timer = the page can never be trapped hidden.
3. **Astro scoped-style lesson (top lesson).** In `components/<Style>`, ancestor gates like
   `.js [data-preloader]` or `html:not(.js) ...` **silently never match** — Astro appends the
   component cid to the `.js` class part, and `<html>` never carries it. Correct form:
   `:global(html.js)` / `:global(html:not(.js))`. The keyboard a11y gate caught this (broken
   mobile menu + invisible preloader); CSS review alone did not.
4. **Font packages.** `@fontsource-variable/manrope` is a separate package; importing
   `@fontsource/manrope/variable.css` fails (dev 500). Fonts OFL, self-hosted.
5. **Perf levers, measured.** Globe dynamic import deferred to `requestIdleCallback`:
   TBT 1130→290 ms, perf 75→94. Brand mark downscaled via sharp (`qh-mark-sm.webp`, 171KB
   PNG → 3.4KB) for 28–48px uses. Rolldown still emits a large three.js chunk warning —
   acceptable at perf 94; revisit only if a future build regresses.
6. **Product links** point at the live `qualityhouseintl.com` product pages until v2
   subpages exist (honest destinations, no 404s).

## 9A. Amplified-cinema pass (2026-10-23 — owner: "motion must be visible, not implied")

Diagnosis first, not vibes: probe-motion.mjs proved frames WERE animating (29.3k diff channels)
but the restraint read as static — 0.045 rad/s globe, 0.7s small-travel reveals, quiet preloader.
Owner chose "Amplify — visible drama". Shipped, then verified in a court-style loop:

- **Entrance**: serif counter sweeps 00→100 while the brand row rises behind the curtain
  (word at `--qh-display-2`), curtain wipe starts inside the sweep tail (no dead hold-beat).
  Timeline ≈1.55s curtain + ≈2.8s hero tail; failsafe 3.4s; font-wait cap 600ms.
- **Scroll**: batched reveal waves (56px, 90–120ms stagger), media figures rise while their
  images unclip `inset(14% 10%)→0` × scale 1.12→1; Ticker band (CSS-only marquee, pauses on
  hover, aria-hidden, static under reduced-motion/`.motion-failed`).
- **Globe**: spin 0.09 rad/s, mount entrance (scale 0.9→1 + lattice fade-up), arcs draw 0.9s
  each at 0.85 opacity stagger 180ms, cargo ×2 size/speed, origin marker breathes, scrubbed
  scroll parallax (MOTION.md §4 debt repaid).
- **Loop findings fixed, not papered over**:
  1. Collapsed-lazy-image deadlock: `heritage-cotton-port.jpg` sat >3 screens deep with
     `block-size:auto` + `loading=lazy` → zero-box → never intersected → never requested →
     permanently empty figure. Fix: intrinsic width/height attrs on the two unboxed media
     images (statement acacia 1920×1200, quality cotton 1920×1280). qa image check upgraded
     to settle-polling (still hard-fails any never-loading image).
  2. Globe shader-compile + first-render measured as a 250–360ms long task that raced the
     LH trace window when deferred by rIC — moved to `onComplete` of the intro timeline.
  3. Redundant `ScrollTrigger.refresh()` on load measured ~360ms long task (redundant since
     intrinsic image dims froze layout) — batched into one deferred pass at load+500ms.
- **Gates on the final state**: qa 20/20 ×2 · axe 0 serious/critical ×2 viewports ·
  a11y 10/10 · Lighthouse **94** / 100 / 100 / 100 (LCP 1.3–1.7s, TBT 260–290ms — parity
  with the pre-amplify baseline: drama added at zero perf cost).
- Court case **C-2026-0004** carries the command + exhibit record; judge.py verdicts for
  `amp-pre-counter`/`amp-hero` recorded in `qa_runs` (provider queue made the judge slow —
  if a run verdict there is absent, treat as INCONCLUSIVE, never PASS-by-claim).

**Follow-up lane:** v2 subpages (about/products/quality/group), `.eml` out of the enquiry
 Flow, optional `/products` anchor targets if subpages land.

## §9B — judge repair + court verdict addendum (2026-10-23 evening)

- **Wipe mechanism rewritten:** clip-path wipe → transform lift (`yPercent -100`,
  `motion.ts`). Reason — judge's honest ITERATE (qa_runs id=42, 67.5) proved the
  bottom-up clip was amputating the counter and gold line mid-life. As a lift the
  digits ride the curtain to 100% and exit with it. Side effect: Lighthouse perf
  94→**100**, TBT 270→**90ms** (compositor-only beats clip repaint).
- **judge.py fixed end-to-end:** the 90b route stalled (16-token text-only calls
  hung 240s+) while VL-120B answered on the same endpoint via spare keys; repair =
  ladder + key rotation + reasoning headroom + Pillow payload shrink. Verdicts on
  the final build: preloader **PASS 90** (id=43), curtain-lift **PASS 90** (id=44),
  hero **PASS 87.5** (id=45), each `judged-by` recorded in `qa_runs.notes`.
- **Gates on the final state:** qa 20/20, axe 0 serious/critical ×2 viewports,
  a11y 10/10, LH **100/100/100/100** (LCP 1.4s, CLS 0.01, TBT 90ms).
- **Court C-2026-0004 round 4: PASS / SHIP 92.0%** — record_hash
  `7996326328ad131500e58f77528fd2a303dd4f132abfa76ba439c0444c216f5f`; jury PASS
  95% ×2 across two model families; E29-E36 retired (integrity-drift supersede,
  custody reasons on record), E38-E49 admitted with claim links. Rounds 2-3 were
  honest engine findings: post-admission re-captures (tamper-sealed) and a
  `--claim` parser that silently dropped prefixed refs — both repaired, verified
  failing-check-first.
- Capture bracket: 700/+420/+420ms — digits 38% → 97% with lift just begun →
  masked headline mid-rise ("Quality" clipped by its own mask mid-curve).

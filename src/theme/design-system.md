# Quality House v2 — Design System

**Single source of truth:** `src/styles/tokens.css`.
No hex literal may appear in any other file in `src/` — enforced by
`node tools/check-tokens.mjs` (exit 0 required before commit).

This document explains the *why*. The CSS file holds the *what*.

---

## The idea: one tree, six chapters

Quality House is Sudan's agricultural house, established 1967, exporting
gum arabic, cotton and seeds from Port Sudan. The site is not a brochure of
sections — it is **one acacia tree, read top to bottom**, the way the
business is read:

| Chapter | Section | The tree | What it says |
|---|---|---|---|
| **01 · CROWN** | Hero + Statement | The canopy | From Sudan to the world. Quality you can trust. |
| **02 · FRUIT** | Products + Ticker | What the tree gives | Gum arabic (flagship), cotton, seeds. |
| **03 · ROOTS** | RootsSection | The people | Owner, board, executive, team — the house is people. |
| **04 · ROUTES** | Journey | Pollination | Port Sudan → Gulf, Egypt, Europe. Inspected, documented, traced. |
| **05 · PROOF** | Quality + Group | Growth rings | Inspection, traceability, export controls; seven companies, one house. |
| **06 · ENQUIRY** | Contact | The seed leaves | Product, specification, destination — the conversation starts. |

Every section component owns one chapter. The chapter order is fixed in
`src/pages/index.astro`; moving a section means moving its chapter.

The **signature moment** is the crown itself: a rotating 3D diorama with the
acacia and the cotton growing in one soil, and the globe in Journey tracing
the same crops' route out of Port Sudan. Those two scenes are the only
non-photographic visuals on the site — everything else is real product
photography.

---

## Palette — the house colours, read off the live theme

Owner directive 2026-10-24: the house colours are the ones on
qualityhouseintl.com, not a dark reinterpretation. The live theme is authored
in OKLCH (`styles-BrMG1qsO.css`); the values below are those exact tokens
converted to sRGB, with no invented hues. The conversion table and source
triplets live here; the hexes live in `tokens.css` and nowhere else.

### Ground — cotton paper

| Token | Name | Value | Use |
|---|---|---|---|
| `--qh-paper` | **Cotton Paper** | `#f8f4ec` | Page ground; 90% of the site |
| `--qh-paper-2` | **Cotton Paper, shaded** | `#ede8de` | Alternate band (ticker, ledger) |
| `--qh-surface` | **Card Ivory** | `#fefcf7` | Cards, panels, quote plates |
| `--qh-surface-2` | **Card Ivory, warm** | `#f3eee4` | Hover / raised row |

### The two dark bands — Acacia Green

| Token | Name | Value | Use |
|---|---|---|---|
| `--qh-green` | **Acacia Green** | `#1a3d29` | Closing CTA + footer only |
| `--qh-green-2` | **Acacia Green, lit** | `#3a5131` | Hover on green, secondary green |
| `--qh-on-green` | **Paper on Green** | `#faf6ef` | Text on green |

The green is the tree, not a "dark mode". Exactly two bands use it; a third
would turn an accent into a theme.

### The one accent — Port Sudan Bronze

| Token | Name | Value | Use |
|---|---|---|---|
| `--qh-bronze` | **Port Sudan Bronze** | `#975c20` | The only accent: CTAs, rules, active states |
| `--qh-bronze-deep` | **Bronze, pressed** | `#7a4a19` | Pressed / dark aspect |
| `--qh-bronze-glow` | **Bronze, halo** | `rgb(151 92 32 / 0.16)` | Focus halo and quiet washes |
| `--qh-on-bronze` | **Paper on Bronze** | `#fdfaf4` | Text on bronze fills |

Gum arabic cures to amber-bronze; the accent is the resin. **One accent
only** — a second accent means the hierarchy, not the palette, is wrong.

### Ink — bark and leaf

| Token | Name | Value | Use |
|---|---|---|---|
| `--qh-ink` | **Bark Ink** | `#151c17` | Primary text on paper |
| `--qh-ink-2` | **Bark Ink, soft** | `#545e56` | Secondary text |
| `--qh-ink-mute` | **Bark Ink, dusted** | `#6b736b` | Labels, timestamps |
| `--qh-sand` | **Sesame Sand** | `#d2c5b1` | Warm neutral between paper and bronze |

### Lines and semantics

| Token | Name | Value | Use |
|---|---|---|---|
| `--qh-line` | **Hairline** | `rgb(21 28 23 / 0.14)` | Section rules, card borders |
| `--qh-line-strong` | **Hairline, strong** | `rgb(21 28 23 / 0.28)` | Emphasis rules |
| `--qh-line-soft` | **Hairline, soft** | `rgb(21 28 23 / 0.07)` | Internal dividers |
| `--qh-line-inverse` | **Hairline on green** | `rgb(250 246 239 / 0.22)` | Rules inside the two green bands |
| `--qh-error` | **Kiln Red** | `#b42826` | Form errors — text + icon carry the state, never colour alone (WCAG 1.4.1) |

### Provenance — OKLCH source → sRGB

| Live token | OKLCH | sRGB |
|---|---|---|
| background | `oklch(96.8% .011 85.5)` | `#f8f4ec` |
| foreground | `oklch(21.6% .014 155)` | `#151c17` |
| primary | `oklch(32.7% .055 156)` | `#1a3d29` |
| secondary | `oklch(40.6% .058 137)` | `#3a5131` |
| muted | `oklch(93.2% .014 84)` | `#ede8de` |
| sand | `oklch(83% .031 79)` | `#d2c5b1` |
| bronze | `oklch(53% .106 62)` | `#975c20` |
| border | `oklch(87.8% .016 82)` | `#dcd6cb` |
| destructive | `oklch(50.5% .176 27)` | `#b42826` |

The conversion is reproducible: `node tools/oklch-ref.mjs` (site-local, at
`sites/quality-house-v2/tools/`). No colour was picked by eye.

**Banned:** cool blue-greys as surfaces, neon, multi-stop gradients, glow as
decoration, a second accent, and the rejected "Port Sudan Night" inversion.
The site is a paper archive with two green bands; photography supplies the
depth, not a dark theme.

### Photography — a non-inverted duotone

The hero plate and chapter images are duotoned to the house palette:
**sky → Cotton Paper, foliage → Acacia Green, ground and bark → Port Sudan
Bronze.** The map is non-inverted: light stays light, and the subject keeps
its tonal order. There is no bloom pass and no shader vignette — the paper
ground is the contrast. A luminance LUT cannot separate a bronze trunk from a
green canopy when both sit in the same shadow band, so the brief asks for a
bronze ground, not a bronze trunk.


---

## Type — editorial serif over a technical sans

| Role | Face | Why |
|---|---|---|
| Display | **Instrument Serif** (OFL) | An export house with a 1967 heritage reads as editorial, not SaaS. The serif carries the archive; the italic carries the emphasis in headlines. |
| Body / data | **Manrope** (OFL variable) | Tight, neutral, tabular numerals — shipment figures and phone numbers line up. |

Scale (`--qh-display-1` … `--qh-label`) is fluid via `clamp()`:
`3.4rem → 8.75rem` for the hero, `1.75rem → 2.75rem` for sub-headlines.
Measure: `62ch` for prose, `44ch` for tight blocks. Lines are 45–75
characters; headings are balanced (`text-wrap: balance`), paragraphs are
pretty (`text-wrap: pretty`).

Label style is uppercase Manrope at `0.75rem` with `0.16em` tracking — used
for eyebrows, table keys, and the chapter numbers.

---

## Spacing — a 4px rhythm, not an 8px grid

The scale runs `--qh-s1: 0.25rem` (4px) through `--qh-s32: 8rem`, doubling
where the eye needs it. Section padding is fluid:
`clamp(5rem, 11vw, 10rem)`.

Why 4px base: at this type scale, 4px is the smallest step that survives
rounding on all DPRs, and halves cleanly for hairlines and label gaps.
Every margin, padding and gap in the codebase is a token — no magic numbers.

---

## Motion — visible, and honest

Amplified-cinema pass (owner brief 2026-10-23: motion must be *visibly*
present, not implied):

| Token | Value | Use |
|---|---|---|
| `--qh-dur-fast` | 180ms | Hover borders, link arrows |
| `--qh-dur-micro` | 240ms | Micro-interactions, nav state |
| `--qh-dur-enter` | 950ms | Scroll reveals (batched waves) |
| `--qh-dur-count` | 1200ms | Preloader counter 00→100 |
| `--qh-dur-draw` | 1200ms | Route / line draw-on |
| `--qh-dur-panel` | 600ms | Menu wipes |
| `--qh-dur-marquee` | 36s | Product ticker (linear, compositor-only) |
| `--qh-stagger` | 70ms | Wave stagger |

Eases: `--qh-ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` for entrances,
`--qh-ease-soft` for scroll smoothing, `--qh-ease-panel` for wipes. Never
`linear` except the ticker and marquee.

**Reduced motion is a first-class path, not a fallback:** every duration
collapses to `0ms` under `prefers-reduced-motion`, and `motion.ts` skips
from-states entirely — nothing is hidden, the globe renders one static
frame, the preloader is removed instantly. The site is complete without
motion and complete without JS.

**The three signature motions:**
1. **The crown turn** — the hero tree rotates on a turntable; picking a
   produce pill turns the diorama until that crop faces you (28s full turn,
   paused on interaction).
2. **The route draw** — the globe in Journey turns to each branch or partner
   hub picked in the network panel, and draws the lane to it.
3. **The reveal wave** — below-fold sections rise in staggered batches of
   ~56px travel at `power4.out`; media figures unclip from an inset frame.

---

## Layout

- Container `90rem`, fluid pad `clamp(1.25rem, 4vw, 3.5rem)`.
- Header `5.25rem` (mobile `4.25rem`); sticky rail offsets read the same
  token so nothing ever hides under the nav.
- Radius: **0** everywhere except pills (`999px`). Sharp brand — the house
  is a trading house, not a toy.
- Elevation: two shadows only (`--qh-shadow-sm`, `--qh-shadow-md`), and a
  shadow never substitutes for a hairline stroke.
- Focus: `2px solid var(--qh-bronze)` at `3px` offset — visible on every
  surface, never removed.

---

## Accessibility contract

- Text contrast ≥ 4.5:1 on every surface (Bark Ink on Cotton Paper is ~14:1;
  Bark Ink, dusted is used only at label sizes and still clears 4.5:1 on
  paper; Paper on Green clears 9:1).
- State is never colour alone — form errors carry text + icon.
- `prefers-reduced-motion` respected at the token layer **and** in JS.
- Keyboard: skip link, visible bronze focus ring, menu traps focus and closes
  on Escape, orbit panels respond to Enter/Space and Escape.
- No-JS: everything readable; CSS never hides content without `.js`.

---

## Enforcement

```bash
node tools/check-tokens.mjs   # exit 0 = no hex outside tokens.css
python tools/protocol_check.py --runtime  # city law + agent validity
```

Adding a colour, font, duration or spacing step means **editing
`tokens.css` first**, naming it after a real thing in the business, then
using the token. A hardcoded value anywhere else is a failed task.

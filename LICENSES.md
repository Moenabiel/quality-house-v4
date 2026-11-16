# Quality House v2 — asset licences

Every shipped asset is inventoried here. Provenance for the original files was recorded
in `sites/quality-house/ASSETS.md` (2026-10-20); v2 reuses the same client-owned files.

## Fonts (self-hosted via npm — no runtime font CDN requests)

| Family | Package | Licence | Used for |
|---|---|---|---|
| Instrument Serif (+ italic) | `@fontsource/instrument-serif` | SIL OFL 1.1 | Display headlines, quotes, wordmark |
| Manrope (variable) | `@fontsource-variable/manrope` | SIL OFL 1.1 | Body, UI labels, data |

Both are OFL — free for commercial use, embedding and web serving; no attribution
required in the page. The variable-package note: Manrope's variable build lives in a
separate `@fontsource-variable/manrope` package (see README lessons).

## Page assets (copied from the previous build; provenance unchanged)

| v2 path | Source (see old ASSETS.md) | Author | Licence |
|---|---|---|---|
| `/qh-mark.png` | qualityhouseintl.com assets-v1 | Quality House | Client-owned (used with permission) |
| `/assets/images/hero-acacia-c2y5xehd.jpg` | qualityhouseintl.com/assets | Quality House | Client-owned (used with permission) |
| `/assets/images/quality-house-arabic-gum-powder-150g.webp` | derived from the 150g PNG | Quality House | Client-owned (used with permission) |
| `/assets/images/cotton-field.jpg` | qualityhouseintl.com assets-v1 | Quality House | Client-owned (used with permission) |
| `/assets/images/seeds-mix.jpg` | qualityhouseintl.com assets-v1 | Quality House | Client-owned (used with permission) |
| `/assets/images/port-b6dcaqel.jpg` | qualityhouseintl.com/assets | Quality House | Client-owned (used with permission) |
| `/assets/images/heritage-cotton-port.jpg` | qualityhouseintl.com assets-v1 | Quality House | Client-owned (used with permission) |
| `/assets/images/international-cotton-association.png` | qualityhouseintl.com assets-v1 | International Cotton Association | Client-owned / membership logo (used with permission) |
| `/assets/images/ahk-egypt.svg` | qualityhouseintl.com assets-v1 | German-Arab Chamber of Industry and Commerce | Client-owned / membership logo (used with permission) |
| `/assets/logos/aipg-logo.svg` | qualityhouseintl.com assets-v1 | Association for International Promotion of Gums | Client-owned / membership logo (used with permission) |

Retrieved 2026-10-20 by the previous build; v2 copied them unmodified on 2026-10-23.
Unused copies carried over (`gum-arabic-bwtbqnqd.jpg`, the 150g PNG original) keep the
same provenance; they are not referenced by the page.

## Derived assets (created this session)

| File | Source | Tool | Licence consequence |
|---|---|---|---|
| `/qh-mark-sm.webp` | `/qh-mark.png` (96×96, WebP q82) | sharp | Derivative of client-owned mark — same permission, no new obligation |
| `/media/acacia-vision.jpg` (2400×1413) | `src/assets/media/acacia-pd-source.jpg` | `tools/duotone.mjs` | Public-domain source — derivative carries no new obligation |

## Hero photograph — umbrella thorn acacia

The hero is a real tree: no model can be a photograph, and the owner's brief
(2026-10-24) was a real acacia in the house palette, seen through an optic.

| Field | Value |
|---|---|
| Original file | `Umbrella_thorn_acacia_or_israeli_babool_tree_plant_acacia_tortillis.jpg` |
| Author | Stolz, Gary M. — U.S. Fish and Wildlife Service |
| Source | Wikimedia Commons (`Special:FilePath/<file>?width=2560`) |
| Licence | **Public domain** — work of the U.S. federal government, no rights reserved |
| Retrieved | 2026-10-24 |
| Local source copy | `src/assets/media/acacia-pd-source.jpg` (2560 px, 432,034 bytes) |
| Shipped derivative | `public/media/acacia-vision.jpg` (2400×1413, 442,317 bytes) |
| Transformation | luminance inversion + 6-stop palette LUT built from `src/styles/tokens.css` (Port Sudan Night → Acacia Bark → Gum Amber → Cotton Ivory), screen-blend bloom. No crop of third-party framing; no watermark removal. |
| Regenerate | `node tools/duotone.mjs` |

The photograph shows *Acacia tortilis* only. The crop index lists gum arabic,
cotton and sesame as separate product lines; the page never claims the frame
contains all three.

## Dependencies (build-time and runtime)

| Package | Licence | Role |
|---|---|---|
| astro | MIT | Static site generator |
| three | MIT | Hero globe (lazy-loaded chunk) |
| gsap | GSAP Standard License — free including all plugins since 3.13 | Motion (site-end use) |
| lenis | MIT | Smooth scroll |
| @fontsource/* | OFL 1.1 | Font distribution |
| playwright | Apache-2.0 | Dev-only QA browser |
| lighthouse | Apache-2.0 | Dev-only perf gate |
| @axe-core/playwright (axe-core MPL-2.0) | Apache-2.0/MPL-2.0 | Dev-only a11y gate |
| sharp (repo root) | Apache-2.0 | Dev-only image derivation |

All dev gates run locally; none ship to the page.

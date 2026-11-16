# Quality House v2 — premium cinematic one-pager

Rebuild of the Quality House homepage: dark + single gold accent, Instrument Serif +
Manrope, real content only (`CONTENT-SOURCE.md`). Built in a disjoint directory so the
parallel session owning `sites/quality-house` (Vite) is never touched.

## Quickstart

```powershell
npm install          # once
npm run dev          # http://127.0.0.1:4321
npm run build        # static build → dist/
npm run preview      # serves dist/ at http://127.0.0.1:4322
```

## Gates (all required before "done")

Prereq: dev server on :4321 (or export `$env:QH_BASE = 'http://127.0.0.1:4322/'` for gates
against the production preview).

```powershell
node qa.mjs          # 20 checks: sections, images, overflow ×4 widths, no-JS gate, 0 console errors
node axe.mjs         # axe-core, 0 serious/critical at 1920×1080 + 390×844
node a11y.mjs        # reduced-motion + keyboard (skip link, menu trap, Esc)
node lh.mjs          # Lighthouse against :4322 via Playwright Chromium (no Chrome install needed)
```

Current verified results: qa 20/20 · axe 0 violations (both viewports) · a11y 10/10 ·
Lighthouse **94 perf / 100 a11y / 100 best-practices / 100 SEO** (LCP 1.4s, CLS 0.01, TBT 290ms).

## Architecture notes

- **Token contract**: every color/typography/space/ease value lives in
  `src/styles/tokens.css`. Components reference `var(--qh-*)` only.
- **No-JS contract**: nothing is hidden by CSS without `<html class="js">`. The preloader
  is `display:none` by default; below-fold `[data-reveal]` hiding lives in the *unscoped*
  `global.css`; `html.motion-failed` (set by a 1.8s inline failsafe unless
  `window.__qhMotionReady`) and reduced-motion force everything visible.
- **Astro scoped-style trap**: ancestor class gates inside `<style>` must be written
  `:global(html.js)` / `:global(html:not(.js))` — scoped styles append the component cid to
  the `.js` selector part itself, which `<html>` never carries, so plain `.js ...` rules
  silently never match. This broke the preloader + mobile menu until the keyboard gate
  caught it.
- **Fonts**: Manrope's variable build is the separate `@fontsource-variable/manrope`
  package (`variable.css` under `@fontsource/manrope` does not exist).
- **Perf**: the Three.js globe is a dynamic import deferred to `requestIdleCallback`
  (TBT 1130→290ms, perf 75→94). The brand mark ships as a 3.4KB 96px WebP.
- **Count-ups** render their final values in static HTML; JS only animates them.
- Provenance: `LICENSES.md`. Content: `CONTENT-SOURCE.md`. Motion spec: `MOTION.md` / `PLAN.md`.

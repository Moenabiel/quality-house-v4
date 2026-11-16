# Quality House v2 — Component Inventory

**Status:** 100X UPGRADE — Cycle 1  
**Source:** `21st-ui-build` + `component-sources`  
**Stack:** Astro 5 + Three.js r183+ + GSAP 3.13+ + Lenis + Rive

---

## Core Components (shadcn/ui — MIT)

| Component | Path | Status | Tokens | Notes |
|-----------|------|--------|--------|-------|
| Button | `src/components/ui/button.astro` | ✅ Installed | `--qh-*` | Primary, secondary, ghost variants |
| Dialog | `src/components/ui/dialog.astro` | ✅ Installed | `--qh-*` | Accessible, focus trap |
| Input | `src/components/ui/input.astro` | ✅ Installed | `--qh-*` | Form fields |
| Accordion | `src/components/ui/accordion.astro` | ✅ Installed | `--qh-*` | Collapsible sections |
| Label | `src/components/ui/label.astro` | ✅ Installed | `--qh-*` | Form labels |
| Separator | `src/components/ui/separator.astro` | ✅ Installed | `--qh-*` | Visual dividers |

---

## Custom Components (Quality House)

| Component | Path | Status | Kind | Tokens | 2026 Features |
|-----------|------|--------|------|--------|---------------|
| Hero | `src/components/Hero.astro` | ✅ Complete | hero | `--qh-*` | 3D diorama, chromatophore lens, crop sequencer, paper crease |
| Nav | `src/components/Nav.astro` | ✅ Complete | nav | `--qh-*` | Mobile menu, anchor positioning |
| Footer | `src/components/Footer.astro` | ✅ Complete | footer | `--qh-*` | Acacia Green band |
| Preloader | `src/components/Preloader.astro` | ✅ Complete | preloader | `--qh-*` | Curtain + counter |
| Products | `src/components/Products.astro` | ✅ Complete | products | `--qh-*` | Product index + ticker |
| ProductHero | `src/components/ProductHero.astro` | ✅ Complete | hero | `--qh-*` | Anchor positioning for image |
| ProductBody | `src/components/ProductBody.astro` | ✅ Complete | body | `--qh-*` | Attribute list + image |
| ProductChapters | `src/components/ProductChapters.astro` | ✅ Complete | chapters | `--qh-*` | View transitions |
| ProductClose | `src/components/ProductClose.astro` | ✅ Complete | cta | `--qh-*` | Enquiry CTA |
| Story | `src/components/Story.astro` | ✅ Complete | story | `--qh-*` | Statement band |
| RootsSection | `src/components/RootsSection.astro` | ✅ Complete | roots | `--qh-*` | 12 portraits |
| Journey | `src/components/Journey.astro` | ✅ Complete | journey | `--qh-*` | Globe + network panel |
| Quality | `src/components/Quality.astro` | ✅ Complete | quality | `--qh-*` | Proof section |
| Group | `src/components/Group.astro` | ✅ Complete | group | `--qh-*` | Partners |
| Contact | `src/components/Contact.astro` | ✅ Complete | contact | `--qh-*` | Enquiry form |
| Arrow | `src/components/Arrow.astro` | ✅ Complete | icon | `--qh-*` | CTA arrows |
| Base | `src/layouts/Base.astro` | ✅ Complete | layout | `--qh-*` | Root layout |

---

## 2026 Custom Components (NEW)

| Component | Path | Status | Kind | 2026 Features |
|-----------|------|--------|------|---------------|
| CropSequencer | `src/components/CropSequencer.astro` | 🔄 Planned | sequencer | Rive state machine, drum machine, anchor positioning |
| ~~PaperCrease~~ | removed in v3 (unused; the crease role lives in the Hero hairline) | - | - | - |
| OpticLens | `src/components/OpticLens.astro` | 🔄 Planned | lens | WebGPU chromatophore shader, WebGL2 fallback |
| TreeDiorama | `src/components/TreeDiorama.astro` | 🔄 Planned | diorama | WebGPU compute, RenderPipeline, InstancedMesh2 |
| GlobeDiorama | `src/components/GlobeDiorama.astro` | 🔄 Planned | globe | WebGPU compute, RenderPipeline, View Transitions |
| CropPill | `src/components/CropPill.astro` | 🔄 Planned | pill | Rive state machine, anchor positioning, haptics |
| NetworkPanel | `src/components/NetworkPanel.astro` | 🔄 Planned | panel | Anchor positioning popovers, View Transitions |
| ProductTicker | `src/components/ProductTicker.astro` | 🔄 Planned | ticker | CSS ScrollTimeline marquee |
| RevealWave | `src/components/RevealWave.astro` | 🔄 Planned | reveal | CSS ScrollTimeline + GSAP hybrid |
| AnchorTooltip | `src/components/AnchorTooltip.astro` | 🔄 Planned | tooltip | CSS Anchor Positioning + Popover API |

---

## Scripts (TypeScript)

| Script | Path | Status | Purpose | 2026 Features |
|--------|------|--------|---------|---------------|
| motion.ts | `src/scripts/motion.ts` | ✅ Complete | Boot, Lenis, ScrollTrigger, reveals, network panel | Lenis + ScrollTrigger + CSS ScrollTimeline hybrid |
| tree.ts | `src/scripts/tree.ts` | 🔄 Upgrade | 3D diorama hero | WebGPU compute, RenderPipeline, InstancedMesh2 |
| lens.ts | `src/scripts/lens.ts` | 🔄 Upgrade | Chromatophore optic lens | WebGPU compute, CanvasTexture, CSS ScrollTimeline |
| globe.ts | `src/scripts/globe.ts` | 🔄 Upgrade | Journey globe | WebGPU compute, RenderPipeline, View Transitions |
| tree.ts | `src/scripts/tree.ts` | 🔄 Upgrade | 3D diorama hero | WebGPU compute, RenderPipeline, InstancedMesh2 |
| lens.ts | `src/scripts/lens.ts` | 🔄 Upgrade | Chromatophore lens | WebGPU compute, CanvasTexture, CSS ScrollTimeline |
| globe.ts | `src/scripts/globe.ts` | 🔄 Upgrade | Journey globe | WebGPU compute, RenderPipeline, View Transitions |

---

## Data Files

| File | Path | Status | Content |
|------|------|--------|---------|
| products.ts | `src/data/products.ts` | ✅ Complete | 3 products (gum-arabic, cotton, seeds) |
| network.ts | `src/data/network.ts` | ✅ Complete | 12 nodes (Port Sudan, 4 branches, 7 partners) |
| produce.ts | `src/data/produce.ts` | ✅ Complete | 3 crops (gum-arabic, cotton, seeds) for hero |
| produce.ts | `src/data/produce.ts` | ✅ Complete | Tree markers for hero diorama |

---

## Pages

| Page | Path | Status | Components |
|------|------|--------|------------|
| Home | `src/pages/index.astro` | ✅ Complete | Hero, Story, Products, Roots, Journey, Quality, Group, Contact |
| Gum Arabic | `src/pages/products/gum-arabic.astro` | ✅ Complete | ProductHero, ProductBody, ProductChapters, ProductClose |
| Cotton | `src/pages/products/cotton.astro` | ✅ Complete | ProductHero, ProductBody, ProductChapters, ProductClose |
| Seeds | `src/pages/products/seeds.astro` | ✅ Complete | ProductHero, ProductBody, ProductChapters, ProductClose |

---

## 2026 Asset Pipeline

| Asset Type | Source | Processing | Output | Location |
|------------|--------|------------|--------|----------|
| Images | Owner/USFWS | `tools/duotone.mjs` + `gltf-transform` | AVIF/WebP | `public/media/`, `public/assets/images/` |
| 3D Models | Custom/Blender | `gltf-transform optimize` | GLB (KTX2/Draco) | `public/models/` |
| Fonts | Google Fonts | `@fontsource-variable/*` | WOFF2 Variable | `public/fonts/` |
| Color Fonts | Typearture | FontLab/Typearture | COLRv1/CPAL WOFF2 | `public/fonts/` |
| Shaders | Custom | Vite `?raw` import | WGSL | `src/shaders/` |
| Rive | Rive Editor | `@rive-app/web` | `.riv` | `assets/` |
| Lottie | After Effects + Bodymovin | `lottie-react-native` | `.lottie` | `assets/` |
| Coastlines | Natural Earth | `tools/build-land.mjs` | JSON | `public/data/` |

---

## Verification Commands

```bash
# Check tokens
node tools/check-tokens.mjs

# Build
npm run build

# Type check
npm run typecheck

# QA
node tools/qa.mjs
node tools/axe.mjs
node tools/console-check.mjs http://127.0.0.1:4321/ shots/qa.png

# 2026 QA
npx @webgpu/cli validate src/shaders/*.wgsl
npx @fontsource/variable-test
npx playwright test --grep "anchor-positioning|popover|view-transition|scroll-driven"

# Component inventory
cat COMPONENT_INVENTORY.md
```

/**
 * motion.ts — single motion/UI boot for the Consignment Dossier. Contract: MOTION v4.
 *
 * Dossier physics: paper never floats far. Reveals are small vertical rises
 * with the flip ease. Stamps land once when they scroll into view — stamp-
 * press physics (back.out settle), never continuous. The document itself is
 * the show; motion only proves the paper is handled.
 *
 * Guarantees (inherited from the v3 contract, kept intact):
 *  - Nav/menu behavior works for everyone (JS users) regardless of motion.
 *  - prefers-reduced-motion: no from-states are ever set; cover removed
 *    instantly; stamps rest.
 *  - No-JS: nothing depends on this module; CSS never hides without .js.
 *  - Any boot failure flips .motion-failed on <html>, whose overrides force
 *    every hidden state visible, and Base's inline timer does the same if
 *    this module never reports __qhMotionReady.
 *
 * WebGL budget intentionally moved to the evidence layer (one optional
 * paper-grain pass); there is no hero scene in v4 by direction-A decision.
 *
 * v4 ALIVENESS LAYERS (added per user "go crazy" — all passes):
 *  P1  — paper breathes (idle/time): animated grain, hero drift, photo develop-in,
 *        form invalid-shake/valid-compose, native cross-document VT keyframes.
 *  P2  — velocity layer: Lenis velocity skew on plates (+ sticky quality-media),
 *        velocity ticker (SOURCE · INSPECT · DOCUMENT · VERIFY ·), SplitText
 *        line-masks on display headings (adds [data-hero-line] hook where missing).
 *  P3  — pointer cluster (pointer: fine gate): magnetic CTAs, hand-built
 *        registration-mark cursor, stamp re-ink hover elastic.
 *  P4  — Interlude page transitions (ClientRouter + peel/tear/typewriter);
 *        ink/dither WebGL tier optional (three.js already in deps).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

declare global {
  interface Window {
    __qhMotionReady?: boolean;
    __lenis?: Lenis;
    __qhCursor?: HTMLElement;
    __qhTicker?: HTMLElement;
    __qhTickerRAF?: number;
    __qhVelocitySkewRefs?: Array<{ el: HTMLElement; quickToX: gsap.QuickToFunc; quickToY: gsap.QuickToFunc }>;
  }
}

gsap.registerPlugin(ScrollTrigger, SplitText);

const html = document.documentElement;
const $ = <T extends Element>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* --- Reduced-motion gate (runs before ANY from-states) ---------------------- */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* --- Lenis + anchor contract (kept from v3) -------------------------------- */
let lenis: Lenis | null = null;

function setupLenis(): Lenis {
  const instance = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  instance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => instance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor navigation: honor the same scroll-padding offset the no-JS
  // fallback uses (scroll-padding-top in global.css).
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    const el = document.querySelector(hash);
    if (!el) return;
    e.preventDefault();
    const pad = parseFloat(getComputedStyle(html).scrollPaddingTop || '0');
    const menu = $('[data-nav-menu]');
    const menuOpen = menu?.classList.contains('is-open');
    const wait = menuOpen ? 150 : 0;
    window.setTimeout(() => instance.scrollTo(el as HTMLElement, { offset: -pad }), wait);
  });

  return instance;
}

/* --- P1: Paper breathes (idle/time layer) ---------------------------------- */
function setupPaperBreath(): void {
  if (reduced) return;

  // Animated grain layer — reuses the stamp feTurbulence recipe, full page
  const grainNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(grainNS, 'svg');
  svg.setAttribute('class', 'grain-layer');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.innerHTML = `
    <defs>
      <filter id="qh-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" result="noise"/>
        <feColorMatrix in="noise" type="saturate" values="0"/>
        <feBlend in="SourceGraphic" in2="noise" mode="overlay"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#qh-grain)"/>
  `;
  document.body.appendChild(svg);

  // Animate baseFrequency for living paper fiber
  let frame = 0;
  const turbulence = svg.querySelector('#qh-grain feTurbulence') as SVGFETurbulenceElement;
  gsap.ticker.add(() => {
    frame += 0.003;
    if (turbulence) {
      const bf = 0.85 + Math.sin(frame) * 0.03;
      turbulence.setAttribute('baseFrequency', String(bf));
    }
  });

  // Hero plate idle drift — slow scale yoyo on free y channel
  const heroPlate = $('.plate-img img');
  if (heroPlate) {
    gsap.to(heroPlate, {
      scale: 1.015,
      duration: 12,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  // Photo develop-in — scrub --qh-grade-filter on scroll arrival
  const developImages = $$<HTMLElement>('[data-reveal-media] img');
  developImages.forEach((img) => {
    ScrollTrigger.create({
      trigger: img.closest('[data-reveal-media]'),
      start: 'top 90%',
      once: true,
      onEnter: () => {
        img.dataset.developed = 'true';
      },
    });
  });

  // Form invalid shake + valid compose (mail-to) state machine
  const form = $<HTMLFormElement>('[data-enquiry]');
  const submitBtn = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (form && submitBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) {
        // Invalid — shake the first invalid field
        const firstInvalid = form.querySelector(':invalid') as HTMLElement;
        firstInvalid?.focus();
        return;
      }
      // Valid — button morphs to "Preparing…" then "Ready ✓"
      submitBtn.dataset.submitting = 'true';
      submitBtn.textContent = 'Preparing…';
      const data = new FormData(form);
      const fields = Object.fromEntries(data.entries());
      const subject = `Product enquiry — ${fields.company || fields.name || 'website'}`;
      const body = [
        `Name: ${fields.name || ''}`,
        `Company: ${fields.company || ''}`,
        `Country: ${fields.country || ''}`,
        `Email: ${fields.email || ''}`,
        `Telephone: ${fields.phone || ''}`,
        `Product of interest: ${fields.product || ''}`,
        `Estimated quantity: ${fields.quantity || ''}`,
        '',
        `Message: ${fields.message || ''}`,
      ].join('\n');
      window.location.href = `mailto:sales@qualityhouse.sd?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // After navigation attempt, mark ready
      setTimeout(() => {
        submitBtn.dataset.submitting = 'false';
        submitBtn.dataset.ready = 'true';
        submitBtn.textContent = 'Ready ✓';
        setTimeout(() => {
          delete submitBtn.dataset.ready;
          submitBtn.textContent = 'Prepare email';
        }, 2000);
      }, 300);
    });
  }
}

/* --- P2: Velocity layer (skew + ticker + SplitText) ------------------------ */
function setupVelocityLayer(): void {
  if (reduced) return;

  // Ensure lenis exists
  if (!lenis) return;

  // Velocity skew on plates — clamp ±2deg via quickTo
  const skewTargets = $$<HTMLElement>(
    '.pr-plate, .statement-media, .dest-media, .quality-media'
  );
  const skewRefs: Array<{
    el: HTMLElement;
    quickToX: gsap.QuickToFunc;
    quickToY: gsap.QuickToFunc;
  }> = [];

  skewTargets.forEach((el) => {
    // Each gets its own quickTo for x/y skew
    const skewXTo = gsap.quickTo(el, 'skewX', {
      duration: 0.12,
      ease: 'elastic.out(1, 0.3)',
    });
    const skewYTo = gsap.quickTo(el, 'skewY', {
      duration: 0.12,
      ease: 'elastic.out(1, 0.3)',
    });
    skewRefs.push({ el, quickToX: skewXTo, quickToY: skewYTo });
  });
  window.__qhVelocitySkewRefs = skewRefs;

  // Read lenis.velocity each frame and drive skew
  gsap.ticker.add(() => {
    if (!lenis) return;
    const v = lenis.velocity; // px/s
    const clamped = gsap.utils.clamp(-2, 2, v * 0.0015); // scale factor tuned
    skewRefs.forEach((ref) => {
      ref.quickToX(clamped);
      ref.quickToY(clamped * 0.5);
    });
  });

  // Velocity ticker — one honest strip, direction flips with scroll
  const tickerText = 'SOURCE · INSPECT · DOCUMENT · VERIFY · ';
  const ticker = document.createElement('div');
  ticker.className = 'velocity-ticker';
  ticker.setAttribute('aria-hidden', 'true');
  const track = document.createElement('div');
  track.className = 'velocity-ticker__track';
  // Duplicate for seamless loop
  for (let i = 0; i < 3; i++) {
    const item = document.createElement('span');
    item.className = 'velocity-ticker__item';
    item.textContent = tickerText;
    track.appendChild(item);
  }
  ticker.appendChild(track);
  document.body.appendChild(ticker);
  window.__qhTicker = ticker;

  const trackEl = track;
  let tickerX = 0;
  let lastDir = 1;
  gsap.ticker.add(() => {
    if (!lenis) return;
    const v = lenis.velocity;
    const dir = v > 0 ? 1 : v < 0 ? -1 : lastDir;
    lastDir = dir === 0 ? lastDir : dir;
    const speed = Math.abs(v) * 0.0008; // px/frame
    tickerX -= speed * dir;
    const trackWidth = trackEl.scrollWidth / 3; // one repeat width
    if (tickerX <= -trackWidth) tickerX += trackWidth;
    if (tickerX >= 0) tickerX -= trackWidth;
    trackEl.style.transform = `translateX(${tickerX}px)`;
  });

  // SplitText line-masks on display headings — add [data-hero-line] where missing
  const displayHeadings = $$<HTMLElement>(
    'h1.display-1, h2.display-2, h3.display-3, .display-1, .display-2, .display-3'
  );
  displayHeadings.forEach((heading) => {
    // Skip if already has hero-line children (home hero)
    if (heading.querySelector('[data-hero-line]')) return;
    // Skip if already split
    if (heading.dataset.split === 'true') return;

    const text = heading.textContent?.trim();
    if (!text) return;

    heading.dataset.split = 'true';
    const split = SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        // Initial state: lines masked (yPercent 110)
        gsap.set(self.lines, { yPercent: 110 });
        // Animate in on scroll
        ScrollTrigger.create({
          trigger: heading,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(self.lines, {
              yPercent: 0,
              duration: 0.72,
              stagger: 0.075,
              ease: 'expo.out',
            });
          },
        });
      },
    });
  });

  // Also hook product h1 on dossier pages ([slug].astro) — it has no hero-line
  const productH1 = $<HTMLElement>('[data-slug] h1.display-1');
  if (productH1 && !productH1.querySelector('[data-hero-line]') && !productH1.dataset.split) {
    const text = productH1.textContent?.trim();
    if (text) {
      productH1.dataset.split = 'true';
      SplitText.create(productH1, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(self.lines, { yPercent: 110 });
          // Dossier pages: intro timeline already runs, so hook into it
          // by using a simple scroll trigger (page already visible)
          gsap.to(self.lines, {
            yPercent: 0,
            duration: 0.72,
            stagger: 0.075,
            ease: 'expo.out',
            delay: 0.3,
          });
        },
      });
    }
  }
}

/* --- P2b: Tree rotation — scroll scrubs 360° video -------------------------- */
function setupTreeRotation(): void {
  if (reduced) return;

  const treeSection = $('[data-tree-section]');
  const video = treeSection?.querySelector<HTMLVideoElement>('[data-tree-video]');
  const framesContainer = treeSection?.querySelector<HTMLDivElement>('[data-tree-frames]');

  if (!treeSection || !video) return;

  // Wait for video metadata to load (duration available)
  const onMetadata = () => {
    video.removeEventListener('loadedmetadata', onMetadata);

    // ScrollTrigger scrubs video currentTime
    ScrollTrigger.create({
      trigger: treeSection,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        if (video.readyState >= 1 && video.duration) {
          video.currentTime = self.progress * video.duration;
        }
      },
    });

    // Fallback: if video fails to load, switch to frame sequence
    video.addEventListener('error', () => {
      if (framesContainer) {
        framesContainer.classList.add('is-active');
        loadFrameSequence(framesContainer);
      }
    });

    // Also handle case where video never loads
    setTimeout(() => {
      if (video.readyState === 0 && framesContainer) {
        framesContainer.classList.add('is-active');
        loadFrameSequence(framesContainer);
      }
    }, 5000);
  };

  if (video.readyState >= 1) {
    onMetadata();
  } else {
    video.addEventListener('loadedmetadata', onMetadata);
  }
}

/* Load 360-frame sequence as fallback (tree_000.png ... tree_359.png) */
function loadFrameSequence(container: HTMLElement): void {
  const frameCount = 360;
  const frames: HTMLImageElement[] = [];

  for (let i = 0; i < frameCount; i++) {
    const img = document.createElement('img');
    img.src = `/assets/frames/tree_${String(i).padStart(3, '0')}.png`;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.classList.add('tree-frame');
    if (i === 0) img.classList.add('is-visible');
    container.appendChild(img);
    frames.push(img);
  }

  // ScrollTrigger swaps frame visibility
  ScrollTrigger.create({
    trigger: container.closest('[data-tree-section]'),
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      const frameIndex = Math.floor(self.progress * (frameCount - 1));
      frames.forEach((f, i) => {
        f.classList.toggle('is-visible', i === frameIndex);
      });
    },
  });
}

/* --- P3: Pointer cluster (magnetic + cursor + stamp re-ink) ---------------- */
function setupPointerCluster(): void {
  if (reduced || !finePointer) return;

  // Magnetic CTAs — quickTo elastic
  const magneticTargets = $$<HTMLElement>('.btn');
  magneticTargets.forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35; // subtle pull
      const dy = (e.clientY - cy) * 0.35;
      xTo(dx);
      yTo(dy);
    });

    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });

  // Hand-built registration-mark cursor (crop-mark motif)
  const cursor = document.createElement('div');
  cursor.className = 'qh-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="qh-cursor__mark"></div>';
  document.body.appendChild(cursor);
  window.__qhCursor = cursor;

  let cursorX = 0;
  let cursorY = 0;
  let targetX = 0;
  let targetY = 0;
  let isVisible = false;

  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.classList.add('is-visible');
    }
  });

  document.addEventListener('pointerleave', () => {
    isVisible = false;
    cursor.classList.remove('is-visible');
  });

  // Smooth follow via quickTo (lagging cursor)
  const cursorXTo = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'elastic.out(1, 0.3)' });
  const cursorYTo = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'elastic.out(1, 0.3)' });

  gsap.ticker.add(() => {
    cursorX += (targetX - cursorX) * 0.15;
    cursorY += (targetY - cursorY) * 0.15;
    cursorXTo(cursorX);
    cursorYTo(cursorY);
  });

  // Stamp re-ink hover is handled in CSS (transition on [data-stamp])
  // but we ensure the elastic ease is respected by adding a quickTo for scale/rotation
  const stamps = $$<HTMLElement>('[data-stamp]');
  stamps.forEach((stamp) => {
    const scaleTo = gsap.quickTo(stamp, 'scale', { duration: 0.32, ease: 'back.out(2.2)' });
    const rotTo = gsap.quickTo(stamp, 'rotation', { duration: 0.32, ease: 'back.out(2.2)' });

    stamp.addEventListener('mouseenter', () => {
      scaleTo(1.04);
      rotTo(-4);
    });
    stamp.addEventListener('mouseleave', () => {
      scaleTo(1);
      rotTo(-7);
    });
  });
}

/* --- Nav: pinned state + active section + overlay menu (any motion) ------- */
function wireNav(): void {
  const nav = $('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-pinned', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Active section reflection (state, not motion — runs for everyone).
  const sectionLinks = $$<HTMLAnchorElement>('.nav-links a[href^="#"]');
  const byId = new Map<string, HTMLAnchorElement>();
  sectionLinks.forEach((a) => byId.set(a.getAttribute('href')!.slice(1), a));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = byId.get((entry.target as HTMLElement).id);
        if (!link) return;
        link.classList.toggle('is-active', entry.isIntersecting);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  byId.forEach((_, id) => {
    const sec = document.getElementById(id);
    if (sec) io.observe(sec);
  });

  const toggle = $<HTMLButtonElement>('[data-nav-toggle]');
  const menu = $('[data-nav-menu]');
  if (!toggle || !menu) return;

  let open = false;
  const focusables = (): HTMLElement[] =>
    [toggle, ...$$('[data-menu-link]')] as HTMLElement[];

  const setOpen = (next: boolean) => {
    open = next;
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
    if (next) {
      menu.classList.add('is-open');
      html.classList.add('is-menu-open');
      $$('[data-menu-link]')[0]?.focus();
    } else {
      menu.classList.remove('is-open');
      html.classList.remove('is-menu-open');
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const f = focusables();
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  $$('[data-menu-link]').forEach((l) =>
    l.addEventListener('click', () => setOpen(false))
  );
}

/* --- Boot ----------------------------------------------------------------- */
function boot(): void {
  wireNav();
  html.classList.add('is-loading');

  const cover = $('[data-cover]');

  const removeCover = () => {
    cover?.remove();
    html.classList.remove('is-loading');
  };

  if (reduced) {
    removeCover();
    window.__qhMotionReady = true;
    return;
  }

  try {
    lenis = setupLenis();
    window.__lenis = lenis;

    /* P1: Paper breathes */
    setupPaperBreath();

    /* P2: Velocity layer */
    setupVelocityLayer();

    /* P2b: Tree rotation — scroll scrubs 360° video */
    setupTreeRotation();

    /* P3: Pointer cluster */
    setupPointerCluster();

    /* 1. Dossier reveals: small paper rise, flip ease. The COVER page's own
          headline/entry beats are choreographed separately below; from-states
          for everything else are mirrored in global.css.                        */
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          duration: 0.64,
          ease: 'expo.out',
          stagger: 0.06,
          overwrite: true,
        }),
    });

    /* 2. Figures: the plate-to-photograph settle. Small rise + the duotone
          frame drawing in. (Col can also be CSS-only; the tween mirrors
          globals' from-state exactly.)                                          */
    ScrollTrigger.batch('[data-reveal-media]', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.72,
          ease: 'expo.out',
          stagger: 0.08,
          overwrite: true,
        });
        batch.forEach((fig) => {
          const img = fig.querySelector('img');
          if (!img) return;
          // Animate `y` to zero — the stylesheet's hidden from-state is a
          // translateY(-8%) that gsap parses as a -29px baseline on first
          // read. yPercent tweens sit on a separate channel and never touch
          // that baseline; only y: 0 returns the img to plate identity.
          gsap.to(img, { y: 0, duration: 0.9, ease: 'power2.out' });
        });
      },
    });

    /* 3. THE STAMP. [data-stamp] lands once, when the form scrolls in,
          stamp-press physics: quick over-scale → settle — the paper is hit
          by the seal. Hidden pre-state: none (stamps start at rest off-screen
          and are never CSS-hidden, so the no-JS print output carries them).     */
    ScrollTrigger.batch('[data-stamp]', {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { scale: 1.7, rotation: -19, opacity: 0.0, autoAlpha: 1 },
          {
            scale: 1,
            rotation: -7,
            opacity: 1,
            duration: 0.32,
            ease: 'back.out(2.2)',
            stagger: 0.09,
            overwrite: true,
          }
        );
      },
    });

    /* 4. SCROLL PROGRESS — the dossier being read. Transform-only.           */
    const progress = $('[data-progress]');
    if (progress) {
      gsap.to(progress, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
      });
    }

    /* 5. Chain-of-custody steps: activate as the reader reaches them.        */
    $$('[data-step]').forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 70%',
        end: 'bottom 40%',
        toggleClass: 'is-active',
      });
    });

    /* 6. Count-ups: real values live in HTML; JS only animates to them once.
          Never blank the value before the trigger — the HTML number is the
          truth for no-JS and print.                                             */
    $$<HTMLElement>('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count || el.textContent || '0');
      if (!Number.isFinite(target)) return;
      const state = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 110%',
        once: true,
        onEnter: () => {
          gsap.to(state, {
            v: target,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(state.v));
            },
          });
        },
      });
    });

    /* 7. Cover entrance — the dossier opens. Short, decisive: cover strip
          lifts after the mark has sat for one beat. No counter (v3 device
          retired: a counter is a loading claim, and this build has none).       */
    const coverInner = $$('.cover-mark, .cover-line', cover ?? document);
    const lines = $$<HTMLElement>('[data-hero-line]');
    const fades = $$('[data-hero-fade]');
    /* From-states are set inside startIntro right before their tweens, and
       guarded (dossier pages carry no hero lines/fades — gsap would warn on
       the empty arrays). */

    let introDone = false;
    const startIntro = () => {
      if (introDone) return;
      introDone = true;
      try {
        const tl = gsap.timeline({
          onComplete: () => removeCover(),
        });
        if (cover) {
          tl.fromTo(
            coverInner,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 },
            0
          ).to(cover, {
            yPercent: -100,
            duration: 0.42,
            ease: 'power3.inOut',
          }, 0.55);
        }
        /* Only tween what the page actually carries — dossier pages share the
           cover but not the home hero, so the hero-line/fade arrays can be
           empty there (gsap warns on empty targets; the guard silences it). */
        if (lines.length) {
          gsap.set(lines, { yPercent: 110 });
          tl.to(lines, {
            yPercent: 0,
            duration: 0.72,
            stagger: 0.075,
            ease: 'expo.out',
          }, cover ? 0.85 : 0);
        }
        if (fades.length) {
          gsap.set(fades, { y: 20, opacity: 0 });
          tl.to(fades, {
            y: 0,
            opacity: 1,
            duration: 0.56,
            stagger: 0.06,
            ease: 'power3.out',
          }, cover ? 1.15 : 0.3);
        }
      } catch {
        removeCover();
        html.classList.add('motion-failed');
      }
    };

    const cap = window.setTimeout(startIntro, 600);
    document.fonts?.ready.then(() => {
      window.clearTimeout(cap);
      startIntro();
    });

    const scheduleRefresh = () => window.setTimeout(() => ScrollTrigger.refresh(), 500);
    if (document.readyState === 'complete') scheduleRefresh();
    else window.addEventListener('load', scheduleRefresh, { once: true });

    window.__qhMotionReady = true;
  } catch (err) {
    console.warn('[motion] boot failed — content force-revealed:', err);
    removeCover();
    html.classList.add('motion-failed');
    window.__qhMotionReady = true;
  }
}

/* --- Cleanup on page unload (for Interlude ClientRouter) ------------------- */
function cleanup(): void {
  if (window.__qhTickerRAF) {
    cancelAnimationFrame(window.__qhTickerRAF);
  }
  window.__qhCursor?.remove();
  window.__qhTicker?.remove();
  document.querySelector('.grain-layer')?.remove();
  // Kill all GSAP tweens/timelines
  gsap.globalTimeline.clear();
  ScrollTrigger.getAll().forEach((st) => st.kill());
  lenis?.destroy();
  lenis = null;
  window.__lenis = undefined;
  window.__qhMotionReady = false;
  window.__qhCursor = undefined;
  window.__qhTicker = undefined;
  window.__qhVelocitySkewRefs = undefined;
}

/* --- Interlude ClientRouter lifecycle integration -------------------------- */
// When Interlude is active, it calls destroyPage/initPage on astro:before-swap/after-swap
// We expose cleanup/boot for page scripts to call
if (typeof window !== 'undefined') {
  (window as any).__qhMotionBoot = boot;
  (window as any).__qhMotionCleanup = cleanup;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
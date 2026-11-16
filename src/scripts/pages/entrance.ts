/**
 * Page entrance animations — wired via Interlude's onPage() API.
 * Runs on every client-side navigation and first load.
 * Marks elements with data-entrance for staggered reveals.
 */
import { onPage } from '../../lib/interlude';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

// Every page: content entrance on reveal/load
onPage(() => true, {
  init(main: HTMLElement) {
    // Scope queries to the page's <main> — the old page's still copy
    // can have the same classes and live in the layer above.
    const entranceEls = main.querySelectorAll<HTMLElement>('[data-entrance]');
    const entranceLines = main.querySelectorAll<HTMLElement>('[data-entrance="lines"]');
    const entranceImages = main.querySelectorAll<HTMLElement>('[data-entrance="image"]');

    // Helper: animate elements in
    const animateEntrance = (els: NodeListOf<HTMLElement>, from: string) => {
      gsap.fromTo(
        els,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.06,
        }
      );
    };

    // Helper: line-mask reveal for headlines
    entranceLines.forEach((heading) => {
      if (heading.dataset.split === 'true') return;
      heading.dataset.split = 'true';
      SplitText.create(heading, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(self.lines, { yPercent: 110 });
          gsap.to(self.lines, {
            yPercent: 0,
            duration: 0.72,
            stagger: 0.075,
            ease: 'expo.out',
          });
        },
      });
    });

    // Image frame reveal
    entranceImages.forEach((figure) => {
      const img = figure.querySelector('img');
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.08, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }
        );
      }
    });

    return () => {
      // Cleanup: kill any running entrance tweens
      gsap.killTweensOf([...entranceEls, ...entranceLines, ...entranceImages]);
    };
  },

  enter(context: any) {
    // Called alongside the transition's reveal; the transition tells us
    // when its cover is out of the way via `context.entrance` (seconds).
    // We just let the init() animations run; they start immediately.
    // If a transition wants content to wait, it sets entrance: X in its config.
  },

  leave(context: any) {
    // Called alongside the transition's cover; we don't animate content out
    // — the transition covers the page.
  },

  destroy() {
    // Page is being removed from DOM (navigation away)
  },
});

// Home page specific: hero choreography is handled by motion.ts intro,
// but we add data-entrance to sections below the hero for scroll reveals
onPage('home', {
  init(main: HTMLElement) {
    // The hero is choreographed by motion.ts cover intro.
    // Add data-entrance to the first section below hero for scroll-triggered entry.
    const firstSection = main.querySelector('section:not(.hero)');
    if (firstSection) firstSection.setAttribute('data-entrance', 'true');
  },
});

// Product pages: the cover is the first thing, chapters reveal on scroll
onPage(/^product-/, {
  init(main: HTMLElement) {
    // Product cover h1 already has data-hero-line (handled by motion.ts)
    // Add data-entrance to chapter list items
    const chapters = main.querySelectorAll('.chapter');
    chapters.forEach((ch, i) => {
      ch.setAttribute('data-entrance', 'true');
      ch.style.setProperty('--entrance-delay', `${i * 0.06}s`);
    });
  },
});
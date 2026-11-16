/**
 * probe-repair.mjs — surgical diagnostics for the Hallmark repair pass.
 * Reports the exact geometry behind each open finding so the fix is measured,
 * not guessed. Read-only: it never writes to the site.
 *
 * Usage: node tools/probe-repair.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || process.env.QH_BASE || 'http://127.0.0.1:4322/';
const browser = await chromium.launch();

async function at(width, height, fn) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(fn);
  await ctx.close();
  return out;
}

const hero = await at(1280, 800, () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), h: Math.round(b.height), w: Math.round(b.width) };
  };
  const h1 = document.querySelector('h1');
  const scope = h1?.closest('section, header, main, div') || document.body;
  const cta = [...scope.querySelectorAll('a, button')].find((c) => (c.textContent || '').trim());
  const heroSec = document.querySelector('section.hero') || document.querySelector('section');
  const lines = [...document.querySelectorAll('.hero-title .line')].map((el) => ({ t: el.textContent.trim(), ...r(el) }));
  return {
    h1: r(h1),
    ctaText: cta?.textContent?.trim(),
    cta: r(cta),
    hero: r(heroSec),
    lines,
    titleFs: h1 ? getComputedStyle(h1).fontSize : null,
    copy: r(document.querySelector('.hero-copy')),
    plate: r(document.querySelector('.hero-plate')),
    lede: r(document.querySelector('.hero-lede')),
    actions: r(document.querySelector('.hero-actions')),
    crop: r(document.querySelector('.crop-sequencer')),
    strip: r(document.querySelector('.hero-strip')),
  };
});
console.log('=== 1280x800 hero ===');
console.log(JSON.stringify(hero, null, 2));

const hero1440 = await at(1440, 900, () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), h: Math.round(b.height), w: Math.round(b.width) };
  };
  const heroSec = document.querySelector('section.hero');
  let cBottom = -Infinity;
  for (const c of heroSec.querySelectorAll('*')) {
    const cs = getComputedStyle(c);
    const painted = (c.innerText || '').trim() || /^(SVG|IMG|CANVAS|VIDEO|PICTURE)$/.test(c.tagName) || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0;
    if (!painted || /fixed|sticky/.test(cs.position)) continue;
    const b = c.getBoundingClientRect();
    cBottom = Math.max(cBottom, b.bottom + scrollY);
  }
  return {
    hero: r(heroSec),
    contentBottom: Math.round(cBottom),
    copy: r(document.querySelector('.hero-copy')),
    plate: r(document.querySelector('.hero-plate')),
    lines: [...document.querySelectorAll('.hero-title .line')].map((el) => ({ t: el.textContent.trim(), ...r(el) })),
  };
});
console.log('=== 1440x900 hero ===');
console.log(JSON.stringify(hero1440, null, 2));

const words = await at(1440, 900, () => {
  const out = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  const list = [];
  while ((n = tw.nextNode())) {
    const p = n.parentElement;
    if (!p || !p.getBoundingClientRect().height) continue;
    if (p.closest('script, style, noscript, svg, [data-slot], [data-credits]')) continue;
    const t = n.textContent.trim();
    if (!t) continue;
    const pr = p.getBoundingClientRect();
    const c = t.split(/\s+/).filter((w) => /[A-Za-z]{2,}/.test(w)).length;
    if (c) list.push({ top: pr.top + scrollY, bottom: pr.bottom + scrollY, c, text: t.slice(0, 60), tag: p.tagName, cls: p.className?.toString?.().slice(0, 40) });
  }
  for (const y of [12550, 12600, 12650, 12700, 12800, 12850, 12900, 12950, 13000]) {
    const w = Math.round(list.reduce((a, x) => {
      const h = Math.max(1, x.bottom - x.top);
      const ov = Math.max(0, Math.min(x.bottom, y + 900) - Math.max(x.top, y));
      return a + x.c * Math.min(1, ov / h);
    }, 0));
    out.push({ y, w });
  }
  const inWindow = list.filter((x) => x.bottom > 12850 && x.top < 13750);
  return { out, inWindow, sections: [...document.querySelectorAll('section, footer')].map((s) => ({ id: s.id || s.className.slice(0, 30), top: Math.round(s.getBoundingClientRect().top + scrollY), bottom: Math.round(s.getBoundingClientRect().bottom + scrollY) })) };
});
console.log('=== word windows ===');
console.log(JSON.stringify(words.out));
console.log('--- text in the 12850-13750 window ---');
words.inWindow.forEach((x) => console.log(`  ${x.tag}.${x.cls} [${Math.round(x.top)}-${Math.round(x.bottom)}] ${x.c}w :: ${x.text}`));
console.log('--- sections ---');
words.sections.forEach((s) => console.log(`  ${s.id}: ${s.top}-${s.bottom}`));

const contrast = await at(1440, 900, () => {
  const pick = (sel) => [...document.querySelectorAll(sel)].map((el) => {
    const cs = getComputedStyle(el);
    let bg = 'none', q = el;
    while (q) {
      const c = getComputedStyle(q).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = c; break; }
      q = q.parentElement;
    }
    const b = el.getBoundingClientRect();
    return {
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      color: cs.color, bg, border: cs.borderTopColor, borderW: cs.borderTopWidth,
      fs: cs.fontSize, weight: cs.fontWeight,
      rect: `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)}`,
      parentCls: el.parentElement?.className?.toString?.().slice(0, 40),
    };
  });
  return {
    citeLabels: pick('cite'),
    footerTextLinks: pick('footer a.text-link, footer .text-link'),
    inputs: pick('input, select, textarea'),
    cropSteps: pick('.crop-step').map((c) => ({ text: c.text, h: c.rect })),
    allTextLinks: pick('a.text-link'),
  };
});
console.log('=== contrast targets ===');
console.log(JSON.stringify(contrast, null, 2));

await browser.close();

/**
 * a11y.mjs — behavior gates beyond axe:
 *  1. Reduced motion: preloader never appears, reveals/copy fully visible
 *     at load below the fold, count-ups show final values immediately.
 *  2. Keyboard: skip link first, nav reachables, mobile menu opens with
 *     Enter, traps Tab focus, closes on Escape, focus returns to toggle.
 * Exit 0 = all pass.
 */
import { chromium } from 'playwright';

const BASE = process.env.QH_BASE || 'http://127.0.0.1:4321';
const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await chromium.launch();

// --- 1. Reduced motion ------------------------------------------------------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const rm = await page.evaluate(() => {
    const pre = document.querySelector('[data-preloader]');
    const hidden = [...document.querySelectorAll('[data-reveal]')].filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight
    );
    const anyHidden = hidden.some((el) => parseFloat(getComputedStyle(el).opacity) < 0.5);
    const count = document.querySelector('[data-count="1967"]');
    const loading = document.documentElement.classList.contains('is-loading');
    return {
      preloaderGone: !pre || getComputedStyle(pre).display === 'none',
      anyHidden,
      countValue: count ? count.textContent : '',
      loading,
    };
  });
  check(
    'Reduced: preloader absent immediately',
    rm.preloaderGone && !rm.loading,
    rm.loading ? 'is-loading stuck' : ''
  );
  check('Reduced: below-fold copy fully visible at load', !rm.anyHidden);
  check('Reduced: count-up shows final value immediately', rm.countValue === '1967', rm.countValue);
  await ctx.close();
}

// --- 2. Keyboard ------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);

  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({
    cls: document.activeElement.className,
    href: document.activeElement.getAttribute('href'),
  }));
  check('Keyboard: skip link is first tabstop', first.cls.includes('skip-link'), first.href);

  // Tab through to a nav link, then jump to contact section anchor.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const nav = await page.evaluate(
    () => !!document.activeElement.closest('.nav-links, .brand')
  );
  check('Keyboard: nav reachable', nav);

  // Mobile menu behavior at phone width.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-nav-toggle]')?.focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const opened = await page.evaluate(() => ({
    expanded: document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded'),
    menuVisible: getComputedStyle(document.querySelector('[data-nav-menu]')).visibility,
    focusInMenu: !!document.activeElement.closest('[data-nav-menu]'),
  }));
  check('Keyboard: Enter opens menu (aria-expanded)', opened.expanded === 'true');
  check('Keyboard: menu visible + focus inside', opened.menuVisible === 'visible' && opened.focusInMenu);

  // Focus trap: Shift+Tab from first item cycles to the toggle, not page.
  await page.keyboard.press('Shift+Tab');
  const trapTop = await page.evaluate(() => document.activeElement.className);
  check('Keyboard: Tab wrap at top of menu', /nav-toggle/.test(trapTop), trapTop);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(900); // visibility flips at end of the 600ms exit
  const closed = await page.evaluate(() => ({
    expanded: document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded'),
    hidden: getComputedStyle(document.querySelector('[data-nav-menu]')).visibility,
    focus: document.activeElement.className,
  }));
  check('Keyboard: Escape closes menu', closed.expanded === 'false' && closed.hidden === 'hidden');
  check('Keyboard: focus returns to toggle', /nav-toggle/.test(closed.focus), closed.focus);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n=== a11y behavior: ${results.length - failed}/${results.length} PASS ===`);
process.exit(failed ? 1 : 0);
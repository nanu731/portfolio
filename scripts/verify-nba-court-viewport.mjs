/** Local-browser regression: full NBA courts fit without cropping or scrolling inside a plot.
 * Use existing tooling: PROJECT_STANDARD_PLAYWRIGHT and PROJECT_STANDARD_CHROMIUM.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require(process.env.PROJECT_STANDARD_PLAYWRIGHT || 'playwright');
const engine = process.env.COURT_BROWSER || 'chromium';
const browser = await ({ chromium, firefox, webkit }[engine]).launch({
  headless: true,
  ...(engine === 'chromium' && process.env.PROJECT_STANDARD_CHROMIUM ? { executablePath: process.env.PROJECT_STANDARD_CHROMIUM } : {}),
});
const base = process.env.COURT_URL || 'http://127.0.0.1:4473';
const captures = process.env.COURT_CAPTURES;
if (captures) await mkdir(captures, { recursive: true });
const errors = [], failures = [], results = [];
try {
  for (const [width, height] of [[1440, 760], [1470, 820], [1280, 650], [1920, 760], [768, 700], [375, 667], [320, 568], [844, 390], [720, 380]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message));
    for (const slug of ['nba-shot-selection-analytics', 'nba-player-comparison']) {
      await page.goto(`${base}/projects/${slug}/`);
      await page.waitForFunction(() => [...document.querySelectorAll('[data-explorer-stage]')].every(e => e.getAttribute('aria-busy') === 'false'));
      await page.evaluate(() => document.fonts.ready);
      const comparison = slug === 'nba-player-comparison';
      if (comparison) {
        await page.getByRole('button', { name: 'Change player B', exact: true }).click();
        await page.locator('#std-picker-search').fill('Stephen Curry');
        await page.locator('[data-std-option]').filter({ hasText: 'Stephen Curry' }).first().click();
        await page.waitForFunction(() => document.querySelector('[data-comparison-slot=B]')?.currentPlayer?.player_name === 'Stephen Curry');
      }
      const slider = page.locator(comparison ? '[data-shared-slider]' : '[data-relocation-slider]');
      const actualSlider = await slider.count() ? slider : page.locator('input[type=range]').first();
      for (const mode of ['combined', 'ability', 'movement']) {
        await actualSlider.evaluate(e => { e.value = '25'; e.dispatchEvent(new Event('input', { bubbles: true })); });
        await page.locator(`input[name=${comparison ? 'comparison-view' : 'court-view'}][value=${mode}]`).check();
        const courts = await page.locator('svg[data-court]:visible, [data-flow-court]:visible').evaluateAll(nodes => nodes.map(e => {
          const r = e.getBoundingClientRect(), vb = e.viewBox.baseVal;
          return { width: r.width, height: r.height, ratio: vb.width / vb.height,
            overflow: getComputedStyle(e.parentElement).overflow, viewBox: e.getAttribute('viewBox') };
        }));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        for (const court of courts) {
          // Leave a fifth of the visible window for labels, keys and focus clearance.
          if (court.height > height * .8 || Math.abs(court.width / court.height - court.ratio) > .02 || court.width > width || court.width < 1) failures.push({ slug, width, height, mode, court });
        }
        if (overflow || !courts.length) failures.push({ slug, width, height, mode, overflow, missing: !courts.length });
        if (!comparison && width >= 1024) {
          const beside = await page.evaluate(() => {
            const controls = document.querySelector('.std-context-controls').getBoundingClientRect();
            const plot = document.querySelector('.explorer-plot').getBoundingClientRect();
            return controls.right <= plot.left;
          });
          if (!beside) failures.push({ slug, width, height, mode, reason: 'Controls must sit beside the desktop court' });
        }
        const summaryOverlap = await page.evaluate(() => [...document.querySelectorAll('.explorer-plot')].some(plot => {
          const detail = plot.querySelector('[data-cell-detail]:not([hidden])');
          const disclaimer = plot.querySelector('.disclaimer');
          if (!detail || !disclaimer) return false;
          const text = document.createRange(); text.selectNodeContents(detail);
          return text.getBoundingClientRect().bottom > disclaimer.getBoundingClientRect().top;
        }));
        if (summaryOverlap) failures.push({ slug, width, height, mode, reason: 'Overlapping chart summary' });
        results.push({ slug, width, height, mode, courts: courts.length, maxHeight: Math.round(Math.max(...courts.map(c => c.height))) });
        if (captures && (width === 1440 || width === 375) && mode !== 'movement') {
          await page.locator('[data-court]').first().evaluate(e => {
            const heading = e.closest('.court-panel').querySelector('.court-title-row');
            window.scrollTo(0, window.scrollY + heading.getBoundingClientRect().top - 16);
          });
          await page.screenshot({ path: `${captures}/${slug}-${width}-${mode}.png` });
        }
      }
    }
    await page.close();
  }
  assert.deepEqual(errors, [], 'Application errors');
  assert.equal(failures.length, 0, `${failures.length} court fit failures; first: ${JSON.stringify(failures[0])}`);
  console.log(JSON.stringify({ engine, cases: results.length, errors, maxCourtHeight: Math.max(...results.map(r => r.maxHeight)) }));
} finally { await browser.close(); }

/** Local, non-delivering browser checks. Start serve-release-review with CONTACT_REVIEW_MODE=simulation. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, webkit, firefox } = require(process.env.PROJECT_STANDARD_PLAYWRIGHT || 'playwright');
const engine = process.env.CONTACT_BROWSER || 'chromium';
const browser = await ({ chromium, webkit, firefox }[engine]).launch({ headless: true, ...(engine === 'chromium' && process.env.PROJECT_STANDARD_CHROMIUM ? { executablePath: process.env.PROJECT_STANDARD_CHROMIUM } : {}) });
const base = process.env.CONTACT_REVIEW_URL || 'http://127.0.0.1:4478';
assert.equal(new URL(base).hostname, '127.0.0.1', 'Run only against the local non-delivering simulation');
const errors = [], cases = [];
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const open = async () => {
    await page.goto(base + '/contact/');
    await page.getByText('Local preview: messages are not emailed.', { exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  for (const [width, height] of [[1440, 900], [1280, 720], [768, 900], [375, 812], [320, 700], [1920, 1080]]) {
    await page.setViewportSize({ width, height }); await open();
    for (const scale of [1, 2]) {
      await page.evaluate(scale => document.documentElement.style.fontSize = 16 * scale + 'px', scale);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      for (const name of ['Name', 'Email', 'Message']) assert.equal(await page.getByLabel(name, { exact: true }).getAttribute('required'), '');
      assert.equal(await page.getByRole('button', { name: 'Send message', exact: true }).isEnabled(), true);
      assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
      cases.push({ width, scale });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 }); await open();
  await page.getByLabel('Name', { exact: true }).focus(); await page.keyboard.press('Tab');
  assert.equal(await page.getByLabel('Email', { exact: true }).evaluate(e => e === document.activeElement), true);
  await page.getByLabel('Email', { exact: true }).fill('invalid');
  assert.equal(await page.getByLabel('Email', { exact: true }).evaluate(e => e.validity.typeMismatch), true);
  const fill = async () => {
    await page.getByLabel('Name', { exact: true }).fill('Local review');
    await page.getByLabel('Email', { exact: true }).fill('review@example.test');
    await page.getByLabel('Message', { exact: true }).fill('Local test. No real email.');
  };
  await fill(); await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByText('Preview complete. No email was sent.', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('Message', { exact: true }).inputValue(), '');
  const submissions = [];
  let succeed = false;
  await page.route('**/api/contact', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    submissions.push(route.request().postDataJSON());
    return route.fulfill({ status: succeed ? 201 : 502, contentType: 'application/json', body: JSON.stringify(succeed ? { accepted: true, preview: true } : { message: 'We could not confirm delivery. Your message is still here. Please try again.' }) });
  });
  await fill(); await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByLabel('Message', { exact: true }).inputValue(), 'Local test. No real email.');
  succeed = true; await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByText('Preview complete. No email was sent.', { exact: true }).waitFor();
  assert.equal(submissions.length, 2, 'Only explicit submissions may send requests');
  assert.deepEqual(submissions[0], submissions[1], 'A manual retry preserves the message');
  assert.deepEqual(Object.keys(submissions[0]).sort(), ['email', 'message', 'name', 'website']);
  await page.unroute('**/api/contact');
  for (const [contentType, body] of [
    ['application/json', '{"error":{"code":"429","message":"Too Many Requests"}}'],
    ['text/html', '<h1>Too Many Requests</h1>'],
  ]) {
    await page.route('**/api/contact', route => route.request().method() === 'POST'
      ? route.fulfill({ status: 429, contentType, body }) : route.continue());
    await fill(); await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await page.getByText('Too many attempts. Please try again shortly. Your message is still here.', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Message', { exact: true }).inputValue(), 'Local test. No real email.');
    await page.unroute('**/api/contact');
  }
  await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"available":false}' }));
  await page.reload(); await page.getByText('Message delivery is unavailable. Please try again later.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Send message', exact: true }).isDisabled(), true);
  await page.unroute('**/api/contact');
  if (process.env.CONTACT_CAPTURES) {
    const { mkdir } = await import('node:fs/promises'); await mkdir(process.env.CONTACT_CAPTURES, { recursive: true });
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 812 }); await open();
      await page.screenshot({ path: `${process.env.CONTACT_CAPTURES}/contact-${width}.png`, fullPage: true });
    }
  }
  assert.deepEqual(errors, []); console.log(JSON.stringify({ engine, layoutCases: cases.length, validation: true, keyboard: true, simulatedSuccess: true, failurePreservesText: true, manualRetry: true, unavailable: true, errors }));
} finally { await browser.close(); }

async page => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  await page.goto(origin + '/projects/nba-economics/');
  const opener = page.getByRole('button', { name: 'Change player', exact: true });
  const search = page.locator('#std-picker-search');
  const status = page.locator('#std-picker-status');
  const results = page.locator('#std-picker-results button');
  const index = '**/data/moneyball/v1/index.json';
  await page.waitForFunction(() => document.querySelector('.std-change-player:enabled'));
  await page.route(index, route => route.fulfill({ status: 503, body: '' }));
  await opener.click();
  await status.filter({ hasText: 'try again' }).waitFor();
  await search.fill('Jokić');
  await search.press('Enter');
  check((await status.innerText()).includes('try again'), 'Typing erased the recovery message');
  await search.press('Escape');
  await page.unroute(index);

  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route(index, async route => { await gate; await route.continue(); });
  await opener.click();
  try {
    await search.fill('Jokić');
    await search.press('Enter');
    check(await status.innerText() === 'Loading player names…', 'Enter erased the loading message');
  } finally { release(); }
  await results.first().waitFor();
  const accented = await results.allTextContents();
  await search.fill('Jokic');
  check(JSON.stringify(await results.allTextContents()) === JSON.stringify(accented), 'Accent handling differs');
  await search.fill('!!!');
  await search.press('Enter');
  check(await results.count() === 0 && await search.isVisible(), 'Punctuation selected a player');
  await search.fill(' ');
  check(await results.count() > 1, 'Clearing the search failed to restore the roster');
  await search.press('Escape');
  check(await opener.evaluate(el => el === document.activeElement), 'Focus did not return');

  await page.goto(origin + '/projects/tennis-shots-and-errors/');
  await page.locator('#change-selection button').first().click();
  const query = page.locator('#query');
  check(await query.evaluate(el => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', isComposing: true, bubbles: true }));
    return document.activeElement === el;
  }), 'A composing arrow moved focus');
  await query.fill('!!!');
  await query.press('Enter');
  check(await query.isVisible() && await page.locator('#options button').count() === 0, 'Punctuation selected a tennis result');
  await query.fill('');
  check(await page.locator('#options button').count() > 0, 'Clearing the tennis search failed');
}

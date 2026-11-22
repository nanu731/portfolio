// Uses the existing authoring Playwright install; argument is a built site origin.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.argv[2] || 'http://127.0.0.1:4387';
const screenshots = process.argv[3];
(async () => {
  const browser = await chromium.launch({channel:'chrome'});
  try {
    for (const [width,height,guessRank] of [[390,844,6],[1440,900,5],[320,568,1]]) {
      const page = await browser.newPage({viewport:{width,height}});
      const errors=[],historical=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('request',r=>{if(r.url().includes('/round-'))historical.push(r.url());});
      await page.goto(base+'/projects/nba-statistical-twins/');
      await page.locator('#first-reason').waitFor();
      await page.evaluate(()=>document.fonts.ready);
      assert.deepEqual(historical,[]);
      const r=await page.locator('#first-reason').boundingBox();
      assert.ok(r.y+r.height<height);
      const season='2015-16';
      const cohort=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/twins-source/data/round-'+season+'.json')));
      const index=cohort.findIndex(p=>p.name==='Stephen Curry');
      // Select a real, reproducible player and season for the boundary tests.
      await page.evaluate(({index,length})=>{
        const values=[5.5/14,(index+.5)/length];
        const random=Math.random;
        Math.random=()=>values.length?values.shift():random();
      },{index,length:cohort.length});
      const entry=page.getByRole('button',{name:'Guess the Statistical Twin'});
      if(screenshots && width===390) await page.screenshot({path:path.join(screenshots,'entry.png')});
      await entry.click();
      await page.waitForFunction(()=>document.querySelector('#game-subject').textContent==='Stephen Curry');
      assert.match(await page.locator('#game-season').innerText(),/2015–16/);
      assert.equal(await page.locator('#game-clues tbody tr').count(),8);
      assert.equal(await page.locator('#game-roster option').count(),cohort.length-1);
      assert.ok(!(await page.locator('#game-roster option').evaluateAll(opts=>opts.map(o=>o.value))).some(v=>v.startsWith('Stephen Curry ·')));
      if(screenshots && width===390) await page.screenshot({path:path.join(screenshots,'round.png')});
      const ranked=await page.evaluate(({cohort,index})=>NBA_MODEL.rank(cohort[index],cohort),{cohort,index});
      const guess=ranked[guessRank-1];
      await page.locator('#guess-name').fill('Stephen Curry');
      await page.getByText('Lock in guess',{exact:true}).click();
      assert.ok(await page.locator('#guess-name').evaluate(e=>!e.validity.valid));
      await page.locator('#guess-name').fill(guess.player.name);
      await page.getByText('Lock in guess',{exact:true}).click();
      assert.equal(await page.locator('#result-title').innerText(),guessRank<=5?'You found a top-five twin!':'Outside the top five');
      const expected=guess.player.name+' ranked #'+guessRank+' of '+ranked.length+' · '+guess.score.toFixed(1)+'/100 similarity.';
      assert.equal(await page.locator('#game-rank').innerText(),expected);
      assert.equal(await page.locator('#game-five li').count(),5);
      assert.equal(await page.locator('#guess-column').innerText(),guess.player.name);
      assert.ok(await page.locator('#game-five').innerText().then(text=>text.includes('Your guess')===(guessRank<=5)));
      assert.equal(await page.locator('#twin-game').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
      if(screenshots && width===1440) await page.screenshot({path:path.join(screenshots,'result.png')});
      await page.keyboard.press('Escape');assert.ok(await entry.evaluate(e=>document.activeElement===e));
      await entry.click();assert.ok(await page.locator('#game-result').isVisible());
      await page.locator('#game-next').click();await page.locator('#guess-name').waitFor();assert.ok(await page.locator('#game-result').isHidden());
      await page.getByRole('button',{name:'Close game'}).click();
      assert.match(await page.locator('#first-twin').innerText(),/Stephen Curry.*Immanuel Quickley/);
      assert.deepEqual(errors,[]); console.log(width,expected);await page.close();
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

// Uses the existing authoring Playwright installation via NODE_PATH.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:4367';
(async () => {
  const browser = await chromium.launch({channel:'chrome'});
  try {
    for (const [width,height] of [[320,568],[375,667],[390,844],[768,900],[1440,900]]) {
      const page = await browser.newPage({viewport:{width,height}});
      const errors=[];
      page.on('pageerror', e=>errors.push(e.message));
      page.on('console', m=>{if(m.type()==='error')errors.push(m.text());});
      await page.goto(base+'/projects/nba-statistical-twins/');
      const surprise=page.getByRole('button',{name:'Surprise me: choose a random player'});
      await surprise.waitFor();
      await page.waitForFunction(()=>document.querySelector('.std-selected-name')?.textContent.includes('Curry'));
      assert.equal(await page.locator('.std-selection-area #surprise').count(),1);
      await page.evaluate(()=>document.fonts.ready);
      assert.match(await page.locator('#first-twin').innerText(), /Stephen Curry.*Immanuel Quickley/);
      assert.match(await page.locator('#first-reason').innerText(), /5.6 assists per 36 minutes.*6.0/);
      const evidence=await page.locator('#first-difference').boundingBox();
      assert.ok(evidence && evidence.y+evidence.height<=height);
      assert.equal(await page.evaluate(()=>scrollY),0);
      console.log(`Opening result and both stat sentences end at ${Math.ceil(evidence.y+evidence.height)} of ${height}px at ${width}px wide`);
      await page.screenshot({path:`/tmp/twins-answer-${width}.png`});
      const bounds=await surprise.boundingBox();
      assert.ok(bounds.width>=44 && bounds.height>=44);
      const name=()=>page.locator('.std-selected-name').innerText();
      const original=await name();
      await surprise.focus(); await surprise.press('Enter');
      await page.waitForFunction(previous=>document.querySelector('.std-selected-name').textContent!==previous,original);
      const random=await name();
      assert.equal(await page.locator('.match').count(),5);
      assert.ok((await page.locator('#announce').textContent()).includes(random));
      assert.equal(await page.evaluate(()=>document.activeElement.id),'surprise');
      assert.ok(await page.locator('.pixel-ball').evaluate(el=>el.getAnimations().length>0));
      await page.reload();
      await page.waitForFunction(expected=>document.querySelector('.std-selected-name')?.textContent===expected,random);
      await page.goBack();
      await page.waitForFunction(expected=>document.querySelector('.std-selected-name')?.textContent===expected,original);
      await page.emulateMedia({reducedMotion:'reduce'});
      await surprise.focus(); await surprise.press('Space');
      await page.waitForFunction(previous=>document.querySelector('.std-selected-name').textContent!==previous,original);
      assert.equal(await page.locator('.pixel-icon').evaluate(el=>el.getAnimations({subtree:true}).length),0);
      await page.locator('.std-change-player').click();
      await page.locator('#std-picker-search').fill('jokic');
      await page.locator('#std-picker-results button').first().click();
      await page.waitForFunction(()=>document.querySelector('.std-selected-name').textContent.includes('Joki'));
      await page.locator('.match').last().click();
      await page.reload();
      assert.match(await page.locator('#view-pair').innerText(),/match 5 of 5/);
      await page.locator('#stats > summary').click();
      assert.ok(await page.locator('#stat-rows').isVisible());
      assert.equal(await page.locator('#stat-rows tr').count(),8);
      await page.locator('.back-matches').click();
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.rank),'4');
      await page.locator('.twins-map > summary').click();
      assert.ok(await page.locator('#map').isVisible());
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.deepEqual(errors,[]);
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:`/tmp/twins-integrated-${width}.png`});
      await page.close();
      console.log(`Twins interaction passed at ${width}px`);
    }
    const page=await browser.newPage();
    for(const slug of ['nba-economics','nba-shot-selection-analytics','nfl-qbs-re-evaluated','tennis-point-phases']) {
      await page.goto(base+'/projects/'+slug+'/');
      await page.locator('.std-change-player').first().waitFor();
      assert.equal(await page.locator('#surprise').count(),0);
    }
    console.log('Other project player controls remain present; no Surprise me outside Twins.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

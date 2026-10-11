async page => {
 let states=0;const routes=[];const errors=[];const failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),failure:r.failure()}));
 for(const width of [1440,375]) for(const comparison of [false,true]) {
 await page.setViewportSize({width,height:width===1440?1000:812});
 const route=comparison?'nba-player-comparison':'nba-shot-selection-analytics';
 await page.goto('http://127.0.0.1:4345/projects/'+route+'/');
 await page.waitForFunction(()=>[...document.querySelectorAll('spatial-shot-explorer')].every(e=>e.querySelector('[data-explorer-stage]').getAttribute('aria-busy')==='false'));
 if(comparison){await page.locator('#comparison-B-player-search').fill('Stephen Curry');await page.locator('[data-comparison-controls=B] [role=option]').first().click();await page.waitForFunction(()=>document.querySelector('[data-comparison-slot=B]').currentPlayer?.player_name==='Stephen Curry');}
 for(const season of ['2025-26','2024-25','2023-24','2022-23','2021-22']){
 await page.locator(comparison?'[data-shared-season]':'[data-season-select]').selectOption(season);
 await page.waitForFunction(s=>[...document.querySelectorAll('spatial-shot-explorer')].every(e=>e.currentPlayer?.season===s&&e.querySelector('[data-explorer-stage]').getAttribute('aria-busy')==='false'),season);
 const before=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('/data/')).length);
 for(const share of [0,5,10,15,20,25])for(const view of ['combined','ability','movement']){
 await page.evaluate(({comparison,share,view})=>{
 const root=comparison?document.querySelector('player-comparison'):document.querySelector('spatial-shot-explorer');
 const slider=root.querySelector(comparison?'[data-shared-slider]':'[data-slider]');slider.value=String(share);slider.dispatchEvent(new Event('input',{bubbles:true}));
 const radio=root.querySelector(comparison?'input[name=comparison-view][value='+view+']':'[data-view-controls] input[value='+view+']');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
 },{comparison,share,view});
 const result=await page.evaluate(({share,view})=>({overflow:document.documentElement.scrollWidth>innerWidth,explorers:[...document.querySelectorAll('spatial-shot-explorer')].map(e=>({ready:e.querySelector('[data-explorer-stage]').getAttribute('aria-busy')==='false',view:e.courtView,share:Number(e.querySelector('[data-slider]').value),player:e.currentPlayer?.player_name,error:e.querySelector('[data-status]').dataset.kind}))}),{share,view});
 if(result.overflow||result.explorers.some(e=>!e.ready||e.view!==view||e.share!==share||!e.player||e.error==='error'))throw Error(JSON.stringify({width,route,season,share,view,result}));
 states++;
 }
 const after=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('/data/')).length);
 if(before!==after)throw Error('Slider/view caused new data requests');
 }
 routes.push({width,height:width===1440?1000:812,route,states:90});
 }
 if(errors.length||failed.length)throw Error(JSON.stringify({errors,failed}));
 return {states,routes,errors,failed};
}

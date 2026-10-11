async page => {
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin='http://127.0.0.1:4345';
 const ready=()=>page.waitForFunction(()=>[...document.querySelectorAll('[data-explorer-stage]')].every(e=>e.getAttribute('aria-busy')==='false'));
 const geometry=()=>page.evaluate(()=>{
  const selectors=document.querySelector('.comparison-selections'),r=selectors.getBoundingClientRect();
  const regions=[...document.querySelectorAll('[data-comparison-slot]')].map(e=>{
   const main=e.querySelector('[data-court]').getBoundingClientRect(),flow=e.querySelector('[data-movement]').getBoundingClientRect();
   return {name:e.currentPlayer?.player_name??'none',top:main.width?main.top:flow.top,width:main.width||flow.width};
  });
  return {viewport:innerWidth,content:r.width,left:r.left,gap:parseFloat(getComputedStyle(selectors).columnGap),copy:document.querySelector('main > .band-inner > p').getBoundingClientRect().width,regions,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 for(const width of [1024,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.goto(origin+'/projects/nba-player-comparison/');await ready();await page.evaluate(()=>document.fonts.ready);
  for(const name of [null,'Stephen Curry','Victor Wembanyama','Aaron Nesmith','Chris Paul']){
   if(name==='Chris Paul'){await page.locator('[data-shared-season]').selectOption('2024-25');await ready();}
   if(name){await page.locator('#comparison-B-player-search').fill(name);await page.locator('[data-comparison-controls=B] [role=option]').first().click();await page.waitForFunction(name=>document.querySelector('[data-comparison-slot=B]').currentPlayer?.player_name===name,name);await ready();}
   if(name==='Chris Paul'){await page.locator('[data-shared-season]').selectOption('2025-26');await ready();}
   for(const mode of ['combined','ability','movement']){
    await page.locator('[data-shared-slider]').evaluate(e=>{e.value='25';e.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.locator('input[name=comparison-view][value='+mode+']').check();
    const g=await geometry();if(g.overflow||Math.abs(g.regions[0].top-g.regions[1].top)>1)throw Error(JSON.stringify({name,mode,...g}));
    if(g.left!==40||g.gap!==40||g.copy!==Math.min(width-80,1008)||(width>=1440&&g.content!==1200))throw Error('Measures '+JSON.stringify(g));results.push({width,name:name??'empty',mode,...g});
   }
  }
 }
 for(const width of [320,375,768,1024,1280,1440,1920]){
  for(const scale of [1,2]){
   await page.setViewportSize({width,height:1000});await page.goto(origin+'/projects/nba-player-comparison/');await ready();await page.evaluate(scale=>document.documentElement.style.fontSize=16*scale+'px',scale);
   const g=await geometry();if(g.overflow)throw Error('Reflow '+JSON.stringify({scale,...g}));results.push({scale,...g});
  }
 }
 if(errors.length)throw Error(JSON.stringify(errors));return {results,errors};
}

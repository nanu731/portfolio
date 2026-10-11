async page => {
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin='http://127.0.0.1:4345';
 const ready=()=>page.waitForFunction(()=>[...document.querySelectorAll('spatial-shot-explorer')].every(e=>e.querySelector('[data-explorer-stage]').getAttribute('aria-busy')==='false'));
 const choose=async (search,options,name)=>{await page.locator(search).fill(name);await page.locator(options+' [role=option]').first().click();await ready();};
 for(const width of [1440,375]){
 await page.setViewportSize({width,height:width===1440?1000:812});
 await page.goto(origin+'/');await page.evaluate(()=>document.fonts.ready);
 await page.locator('.rows a').focus();
 const row=await page.evaluate(()=>{const a=document.querySelector('.rows a');return {direction:getComputedStyle(a).flexDirection,focus:getComputedStyle(a).outlineStyle,visible:document.querySelector('.row-meta').getBoundingClientRect().top>document.querySelector('.row-title').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}});
 if(row.direction!=='column'||!row.visible||row.focus==='none'||row.overflow)throw Error('Home row '+JSON.stringify(row));
 await page.goto(origin+'/projects/nba-shot-selection-analytics/');await ready();
 const search=page.locator('[data-player-search]');await search.focus();await page.keyboard.press('Tab');if(await search.getAttribute('aria-expanded')!=='false')throw Error('Dismissal');
 await search.focus();await search.fill('Stephen Curry');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await ready();
 if(await page.locator('[data-player-name]').textContent()!=='Stephen Curry')throw Error('Keyboard selection');
 await choose('[data-player-search]','[data-player-suggestions]','LeBron James');
 await page.locator('[data-view-controls] input[value=ability]').check();
 await page.locator('[data-court]').focus();const detail=await page.locator('[data-cell-detail]').textContent();await page.keyboard.press('ArrowRight');
 if(await page.locator('[data-cell-detail]').textContent()===detail)throw Error('Court inspection');
 await page.locator('[data-term=range] .definition-trigger').focus();const name=await page.locator('[data-term=range] .definition-trigger').getAttribute('aria-label');if(!name.includes('Estimated Range (90%)')||!name.includes('2025–26'))throw Error('Range name');
 await page.keyboard.press('Escape');if(await page.locator('[data-term=range] .definition-trigger').getAttribute('aria-expanded')!=='false')throw Error('Help Escape');
 await page.locator('[data-term=range] .definition-trigger').click();await search.click();if(await page.locator('[data-term=range] .definition-trigger').getAttribute('aria-expanded')!=='false')throw Error('Help outside');
 await page.goto(origin+'/projects/nba-player-comparison/');await ready();
 const selectorWidths=await page.evaluate(()=>[...document.querySelectorAll('[data-comparison-controls]')].map(e=>({field:e.querySelector('[data-player-search]').getBoundingClientRect().width,column:e.getBoundingClientRect().width,display:getComputedStyle(e).display})));
 if(selectorWidths.some(e=>e.display!=='block'||Math.abs(e.field-e.column)>1))throw Error('Comparison selector width '+JSON.stringify(selectorWidths));
 await page.locator('#comparison-A-player-search').focus();await page.keyboard.press('Tab');if(await page.evaluate(()=>document.activeElement.id)!=='comparison-B-player-search')throw Error('Selector keyboard order');await page.keyboard.press('Escape');
 const identifiers=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return {unique:new Set(ids).size===ids.length,shared:[...document.querySelectorAll('[data-shared-season],[data-shared-slider]')].every(e=>e.id&&e.name)}});if(!identifiers.unique||!identifiers.shared)throw Error('Control identifiers');
 await choose('#comparison-B-player-search','[data-comparison-controls=B]','LeBron James');if(!(await page.locator('[data-comparison-status]').textContent()).includes('different player'))throw Error('Duplicate rejection');
 await choose('#comparison-B-player-search','[data-comparison-controls=B]','Stephen Curry');
 await page.locator('[data-shared-slider]').evaluate(e=>{e.value='25';e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.locator('[data-shared-season]').selectOption('2024-25');await ready();
 const persist=await page.evaluate(()=>({players:[...document.querySelectorAll('spatial-shot-explorer')].map(e=>e.currentPlayer?.player_name),share:document.querySelector('[data-shared-slider]').value}));if(persist.players.join('|')!=='LeBron James|Stephen Curry'||persist.share!=='0')throw Error('Persistence '+JSON.stringify(persist));
 await page.locator('[data-shared-season]').selectOption('2025-26');await ready();
 await choose('#comparison-B-player-search','[data-comparison-controls=B]','Victor Wembanyama');await page.locator('[data-shared-slider]').evaluate(e=>{e.value='25';e.dispatchEvent(new Event('input',{bubbles:true}));});
 const cap=await page.evaluate(()=>{const e=document.querySelector('[data-comparison-slot=B]'),r=e.currentPlayer.sliders.find(s=>s.requested_share===.25);return {actual:r.actual_relocated_share,cap:!e.querySelector('[data-cap-note]').hidden};});if(cap.actual>=.25||!cap.cap)throw Error('Cap '+JSON.stringify(cap));
 await choose('#comparison-B-player-search','[data-comparison-controls=B]','Aaron Nesmith');if(!(await page.locator('[data-comparison-slot=B] [data-comparison-values]').textContent()).includes('Unavailable'))throw Error('Unavailable estimates');
 await page.locator('[data-shared-season]').selectOption('2024-25');await ready();await choose('#comparison-B-player-search','[data-comparison-controls=B]','Chris Paul');await page.locator('[data-shared-season]').selectOption('2025-26');await ready();
 const unavailable=await page.evaluate(()=>{const e=document.querySelector('[data-comparison-slot=B]');return {title:e.querySelector('[data-court-title]').textContent,description:e.querySelector('[data-court-description]').textContent,detail:e.querySelector('[data-cell-detail]').textContent,noPlayer:!e.currentPlayer,hiddenMetrics:e.querySelector('[data-comparison-metrics]').hidden}});if(!unavailable.title.includes('Analysis unavailable')||unavailable.detail.includes('Loading')||unavailable.description!==unavailable.detail||!unavailable.noPlayer||!unavailable.hiddenMetrics)throw Error('Unavailable court '+JSON.stringify(unavailable));
 const layout=await page.evaluate(()=>{const courts=[...document.querySelectorAll('[data-court]')].map(e=>e.getBoundingClientRect().top);const a=document.querySelector('#comparison-A-player-search').getBoundingClientRect(),b=document.querySelector('#comparison-B-player-search').getBoundingClientRect(),r=document.querySelector('.comparison-columns').getBoundingClientRect();return {aligned:Math.abs(courts[0]-courts[1])<1,beforeResults:b.bottom<r.top,gap:b.top-a.top,overflow:document.documentElement.scrollWidth>innerWidth}});if(layout.overflow||!layout.beforeResults||(width===1440&&!layout.aligned)||(width===375&&layout.gap>812))throw Error('Layout '+JSON.stringify(layout));
 await page.locator('[data-comparison-reset]').click();await ready();const reset=await page.evaluate(()=>({share:document.querySelector('[data-shared-slider]').value,season:document.querySelector('[data-shared-season]').value,b:document.querySelector('[data-comparison-slot=B]').dataset.selectedId,view:document.querySelector('input[name=comparison-view]:checked').value}));if(reset.share!=='0'||reset.season!=='2025-26'||reset.b!==''||reset.view!=='combined')throw Error('Reset '+JSON.stringify(reset));
 results.push({width,height:width===1440?1000:812,row,identifiers,persist,cap,unavailable,layout,reset});
 }
 await page.setViewportSize({width:320,height:812});await page.goto(origin+'/projects/nba-player-comparison/');await ready();await page.evaluate(()=>document.documentElement.style.fontSize='32px');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('320px enlarged reflow');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+'/projects/nba-shot-selection-analytics/');await ready();const reduced=await page.evaluate(()=>({preference:matchMedia('(prefers-reduced-motion:reduce)').matches,animations:document.getAnimations().length}));if(!reduced.preference||reduced.animations)throw Error('Reduced motion');
 if(errors.length)throw Error(JSON.stringify(errors));return {results,reduced,errors};
}

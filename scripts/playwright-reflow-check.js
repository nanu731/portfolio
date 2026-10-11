async page => {
 const result=[];
 for(const route of ['/','/about/','/projects/','/blog/','/projects/nba-shot-selection-analytics/','/projects/nba-player-comparison/']) for(const width of [320,375]) {
 await page.setViewportSize({width,height:812}); await page.goto('http://127.0.0.1:4345'+route); await page.evaluate(()=>document.fonts.ready);
 const normal=await page.evaluate(()=>{
 const rects=()=>[...document.querySelectorAll('header h2,header .internal-links,header .internal-links a')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});
 const before=rects();document.querySelector('header').style.containerType='normal';const baseline=rects();document.querySelector('header').style.removeProperty('container-type');
 return {same:JSON.stringify(before)===JSON.stringify(baseline),overflow:document.documentElement.scrollWidth>innerWidth};});
 if(!normal.same||normal.overflow) throw Error(route+' normal '+JSON.stringify(normal));
 await page.evaluate(()=>document.documentElement.style.fontSize='32px');
 const enlarged=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,links:[...document.querySelectorAll('header .internal-links a')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,visible:r.width>0,left:r.left,right:r.right}})}));
 if(enlarged.overflow||enlarged.links.some(e=>!e.visible||e.right>width||e.left<0))throw Error(route+' enlarged '+JSON.stringify(enlarged));
 result.push({route,width,normalUnchanged:true,enlargedFits:true});
 }
 return result;
}

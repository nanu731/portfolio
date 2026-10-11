async page => {
  const results=[];
  for (const viewport of [{width:1440,height:1000},{width:375,height:812}]) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4345/');
    await page.locator('header').waitFor();
    const actual=await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,title:document.title}));
    if(actual.width!==viewport.width || actual.height!==viewport.height || actual.overflow) throw Error(JSON.stringify(actual));
    results.push(actual);
  }
  return results;
}

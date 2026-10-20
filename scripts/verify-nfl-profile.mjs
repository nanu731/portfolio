// Node24 source checks; native interaction and visual checks are recorded separately.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),cache=new Map();
async function load(relative){
 if(cache.has(relative))return cache.get(relative);
 let source=stripTypeScriptTypes(readFileSync(new URL(relative,root),'utf8'));
 for(const match of [...source.matchAll(/from\s+['"](.\/.+?)['"]/g)]){
  const target=fileURLToPath(new URL(match[1]+'.ts',new URL(relative,root))).slice(fileURLToPath(root).length);
  source=source.replace(match[0],`from '${await load(target)}'`);
 }
 const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;cache.set(relative,url);return url;
}
const experts=await import(await load('src/lib/nfl-experts.ts'));
const {EXPERT_RANKS,EXPERT_SOURCE,expertFor,expertRadius,validateExpertRanks}=experts;
const expected=[['00-0033873','arm_strength',2,.9],['00-0034857','arm_strength',1,1],['00-0033873','field_vision',1,1],['00-0034857','field_vision',4,.7]];
assert.equal(EXPERT_SOURCE.published,'2023-08-14');
assert.equal(EXPERT_SOURCE.url,'https://africa.espn.com/nfl/story/_/id/38151402/nfl-quarterback-council-2023-ranking-top-10-traits');
for(const [id,trait,rank,radius] of expected){assert.equal(expertFor(trait,2023,id).rank,rank);assert.equal(expertRadius(rank),radius);}
for(const rank of [null,NaN,Infinity,-1,0,1.5,11])assert.equal(expertRadius(rank),null);
assert.equal(expertRadius(10),.1);
const annual=JSON.parse(readFileSync(new URL('public/data/nfl-qb-annual-2006-2025-v1.json',root)));
const depth=JSON.parse(readFileSync(new URL('public/data/nfl-qb-depth-2006-2025-v1.json',root)));
const legacy=JSON.parse(readFileSync(new URL('public/data/nfl-qb-2023-2024-v2.json',root)));
let lookups=0;
for(const row of annual.rows)for(const trait of ['arm_strength','field_vision']){
 const found=expertFor(trait,row.season,row.player_key),fact=expected.find(([id,t])=>id===row.player_key&&t===trait&&row.season===2023);
 assert.equal(found?.rank,fact?.[2]);lookups++;
}
assert.equal(expertFor('arm_strength',2011,'00-0033873'),undefined);
assert.equal(expertFor('field_vision',2024,'00-0034857'),undefined);
for(const mutate of [rows=>rows.pop(),rows=>rows.push({...rows[0]}),rows=>rows[0].rank=NaN,rows=>rows[0].rank=0,rows=>rows[0].rank=11,rows=>rows[0].rank=1.5,rows=>rows[0].rank=3,rows=>rows[0].year=2024,rows=>rows[0].playerKey='unknown',rows=>rows[0].trait='decision_making',rows=>rows[0].extra=true,rows=>rows[0]={...rows[1]}]){
 const rows=structuredClone(EXPERT_RANKS);mutate(rows);assert.throws(()=>validateExpertRanks(rows));
}
// Exercise the real renderer with a minimal SVG DOM. Native-browser checks remain separate.
class Node {constructor(tag){this.tag=tag;this.attrs={};this.children=[];this.dataset={};this.parentElement={getBoundingClientRect:()=>({width:560})};}setAttribute(k,v){this.attrs[k]=String(v);}removeAttribute(k){delete this.attrs[k];}append(...els){this.children.push(...els);}replaceChildren(...els){this.children=els;}}
globalThis.document={createElementNS:(_,tag)=>new Node(tag)};
globalThis.HTMLElement=class {};
const registry=new Map();globalThis.customElements={get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)};
const charts=await import(await load('src/lib/nfl-charts.ts'));charts.registerNFL();
const host=new (registry.get('nfl-comparison'))(),svg=new Node('svg');host.querySelector=()=>svg;host.annual=annual;host.depth=depth;host.legacy=legacy;
const percentile=await import(await load('src/lib/nfl-percentiles.ts'));host.references=await percentile.buildPercentileReferences(annual,depth,legacy);
const selected=(side,id,year)=>({side,id,year,name:annual.rows.find(r=>r.player_key===id)?.display_name??id,row:annual.rows.find(r=>r.player_key===id&&r.season===year),legacy:legacy.rows.find(r=>r.player_key===id&&r.season===year),depth:depth.rows.filter(r=>r.player_key===id&&r.season===year)});
const a=selected('a','00-0033873',2023),b=selected('b','00-0034857',2023);
const nodes=cls=>svg.children.filter(n=>(n.attrs.class??'').split(' ').includes(cls));
host.drawRadar([a,b]);assert.equal(nodes('radar-mark').length,14);assert.equal(nodes('radar-segment').length,14);assert.equal(nodes('expert-spoke').length,2);
assert.equal(svg.children.some(n=>n.tag==='polygon'),false);assert.equal(svg.children.some(n=>n.attrs.class==='tick'),false);
for(const mark of nodes('radar-mark')){
 const attrs=mark.attrs,fraction=Number(attrs['data-radius'])/Number(attrs['data-radius-max']);
 if(attrs['data-kind']==='expert'){
  const fact=expected.find(([id,trait])=>id===(attrs['data-side']==='a'?a.id:b.id)&&trait===attrs['data-field']);
  assert.equal(Number(attrs['data-rank']),fact[2]);assert.equal(attrs['data-percentile'],undefined);assert.ok(Math.abs(fraction-fact[3])<1e-12);
 }else assert.ok(Math.abs(fraction-Number(attrs['data-percentile'])/100)<1e-12);
}
for(const [name,pair,counts,closing] of [
 ['independent2024',[a,selected('b',b.id,2024)],[7,5],[true,false]],
 ['sourceblocked2011',[a,selected('b',b.id,2011)],[7,0],[true,false]],
 ['unauditedQB',[a,selected('b','00-0037077',2023)],[7,4],[true,false]],
 ['identical',[a,{...a,side:'b'}],[7,7],[true,true]],
 ['nativeNull',[{...a,depth:a.depth.map(r=>r.bin==='medium'?{...r,cpoe_pp:null}:r)},b],[6,7],[false,true]],
]){
 host.drawRadar(pair);
 for(const [i,side]of ['a','b'].entries()){
  assert.equal(nodes('radar-mark').filter(n=>n.attrs['data-side']===side).length,counts[i],name);
  assert.equal(nodes('radar-segment').some(n=>n.attrs['data-side']===side&&n.attrs['data-from']==='6'&&n.attrs['data-to']==='0'),closing[i],name);
 }
 assert.ok(nodes('radar-segment').every(n=>Number(n.attrs['data-to'])===Number(n.attrs['data-from'])+1||(n.attrs['data-from']==='6'&&n.attrs['data-to']==='0')),'No gap-bridging segment');
}
const html=readFileSync(new URL('dist/projects/nfl-qbs-re-evaluated/index.html',root),'utf8');
const table=html.match(/<table data-static-default[\s\S]*?<\/table>/)[0];
const expertCells=[...table.matchAll(/<td\b[^>]*data-static-expert[^>]*>([\s\S]*?)<\/td>/g)];
assert.equal(expertCells.length,4);
[2,1,1,4].forEach((rank,i)=>{assert.ok(expertCells[i][1].startsWith(`#${rank} expert rank`));assert.ok(expertCells[i][1].includes(EXPERT_SOURCE.url));});
assert.ok(/<button\b[^>]*data-complete-example/.test(html));
const labels=['Arm strength','Processing','Pocket presence','Mobility','Short accuracy','Medium accuracy','Deep accuracy'];
const keys=['arm-strength','processing','pocket-presence','mobility','short-accuracy','medium-accuracy','deep-accuracy'];
host.drawRadar([a,b]);
const links=nodes('radar-attribute-link');assert.equal(links.length,7);
links.forEach((link,i)=>{
 assert.equal(link.tag,'a');assert.equal(link.attrs.href,'#nfl-attribute-'+keys[i]);assert.equal(link.attrs.id,'nfl-radar-link-'+keys[i]);assert.equal(link.attrs.tabindex,'0');assert.equal(link.attrs.role,'link');
 assert.equal(link.children.find(n=>n.tag==='text').textContent,labels[i]);
 const hit=link.children.find(n=>n.tag==='rect');assert.ok(Number(hit.attrs.width)>=24&&Number(hit.attrs.height)>=24);
});
assert.ok(/<svg\b[^>]*data-radar[^>]*role="group"/.test(html),'Interactive chart exposes child links rather than flattening them into one image');
const guide=html.match(/<section\b[^>]*class="nfl-attribute-guide"[^>]*>([\s\S]*?)<\/section>/)?.[1];assert.ok(guide,'Always-open static guide is present');
assert.equal((guide.match(/<h3\b/g)??[]).length,7);
for(const key of keys){
 assert.ok(new RegExp('<h3\\b[^>]*id="nfl-attribute-'+key+'"[^>]*tabindex="-1"','i').test(guide));
 assert.ok(guide.includes('href="#nfl-radar-link-'+key+'"'));
}
// Compare every requirement subset with the marks emitted by the real renderer.
const referencesBefore=JSON.stringify(host.references),sourcesBefore=JSON.stringify([annual,depth,legacy]);
let availabilityComparisons=0;const complete=[],mobility=[];
for(const row of annual.rows){
 const choice=selected('a',row.player_key,row.season);host.drawRadar([choice,{...choice,side:'b'}]);
 const available=nodes('radar-mark').filter(n=>n.attrs['data-side']==='a').reduce((mask,n)=>mask|(1<<Number(n.attrs['data-position'])),0);
 for(let mask=0;mask<128;mask++){
  assert.equal(host.requirementsMatch(row.player_key,row.season,mask),(available&mask)===mask,`${row.player_key}/${row.season} subset ${mask}`);availabilityComparisons++;
 }
 if(host.requirementsMatch(row.player_key,row.season,127))complete.push([row.player_key,row.season]);
 if(host.requirementsMatch(row.player_key,row.season,8))mobility.push([row.player_key,row.season]);
}
assert.deepEqual(complete.sort(),[['00-0033873',2023],['00-0034857',2023]]);
assert.equal(mobility.length,40);assert.ok(mobility.every(([,year])=>year===2023||year===2024));
const orton=annual.rows.find(r=>r.observed_name==='K.Orton'&&r.season===2008)??annual.rows.find(r=>r.display_name==='Kyle Orton'&&r.season===2008);
assert.ok(orton);assert.equal(host.requirementsMatch(orton.player_key,2008,8),false);
assert.equal(host.requirementsMatch(a.id,2011,8),false);assert.equal(host.requirementsMatch(a.id,2024,1),false);
const originalPoint=host.profilePoint;
for(const [radius,expected]of [[0,true],[null,false],[NaN,false],[Infinity,false]]){host.profilePoint=()=>({radius});assert.equal(host.requirementsMatch(a.id,2023,1),expected,'Finite zero remains available');}
host.profilePoint=originalPoint;
host.players=[...new Map(annual.rows.map(r=>[r.player_key,{id:r.player_key,name:r.display_name}])).values()];
const controls={a:{value:orton.player_key},b:{value:b.id},'season-a':{value:'2008'},'season-b':{value:'2023'}};
host.control=key=>controls[key];host.requiredMask=8;
assert.ok(!host.seasonPlayers('a').some(p=>p.id===orton.player_key));
assert.deepEqual(host.seasonChoices('a'),[]);
controls.a.value='';controls['season-a'].value='';
assert.deepEqual(host.seasonChoices('a').map(y=>y.season),[2024,2023]);
assert.ok(host.seasonPlayers('a').length>0,'Cleared year can search eligible players across matching years');
host.requiredMask=127;
assert.deepEqual(host.seasonPlayers('a').map(p=>p.id).sort(),[a.id,b.id].sort());
controls.a.value=a.id;assert.deepEqual(host.seasonChoices('a').map(y=>y.season),[2023]);
host.requiredMask=0;assert.equal(host.seasonChoices('a').length,20);assert.ok(host.seasonChoices('a').some(y=>y.season===2011));
assert.equal(JSON.stringify(host.references),referencesBefore,'Requirements never alter reference pools');
assert.equal(JSON.stringify([annual,depth,legacy]),sourcesBefore,'Requirements never alter input records');
assert.equal((html.match(/type="checkbox"[^>]*data-require-attribute=/g)??[]).length,7);
assert.ok(/<button\b[^>]*data-clear-requirements/.test(html));
console.log(JSON.stringify({status:'passed',expertFacts:4,expertLookups:lookups,invalidRecordCases:12,defaultPoints:14,defaultSegments:14,rendererScenarios:5,staticExpertCells:4,sourceDate:EXPERT_SOURCE.published,attributeLinks:7,staticGuideEntries:7,availabilityComparisons,requirementSubsets:128,completePlayerSeasons:complete,mobilityPlayerSeasons:mobility.length,finiteZeroAndNonfinite:'passed',fixedReferences:'unchanged',nativeBrowserChecks:'separate'},null,2));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { endingWinRate, createProfileRenderer, matchLabel } from '../src/lib/tennis-profile-renderer.mjs';
import { validateCatalog, validatePacket, createPacketLoader } from '../src/lib/tennis-viewer.mjs';

let checks = 0;
const equal = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
const catalog = validateCatalog(JSON.parse(fs.readFileSync('public/data/tennis-viewer-index-v1.json')));
const packets = catalog.players.map(entry => validatePacket(JSON.parse(fs.readFileSync(`public${entry.file}`)), entry));
for (const [wins, losses, expected] of [[120,80,.6],[1,0,1],[0,4,0],[0,0,null],[null,4,null],[4,undefined,null],[-1,2,null],[Infinity,1,null],[NaN,1,null],[Number.MAX_VALUE,Number.MAX_VALUE,null]]) equal(endingWinRate(wins, losses), expected);
equal(matchLabel('20220903-W-US_Open-R32-Player_A-Player_B'),'3 Sept 2022 · US Open · Round of 32');
equal(matchLabel('20210221-M-Australian_Open-F-Player_A-Player_B'),'21 Feb 2021 · Australian Open · Final');
equal(matchLabel('Unclear_record'), 'Unclear record');
equal(catalog.players.filter(entry => !entry.hidden).length,449);
assert.throws(() => validateCatalog({...catalog,players:[catalog.players[0],catalog.players[0]]})); checks++;
assert.throws(() => validatePacket(packets[0],catalog.players[1])); checks++;

const profiles = packets.flatMap(packet => packet.profiles), contexts = packets.flatMap(packet => packet.context);
const coverage = [...new Map(packets.flatMap(packet => packet.coverage).map(row => [JSON.stringify([row.category,row.match_id]),row])).values()];
equal(profiles.length,2972);
const original = JSON.parse(fs.readFileSync('scripts/tennis-viewer-copy.json')).render_script;
const prefix = original.slice(0,original.indexOf('// One shared explanation panel'));
const aliases = original.slice(original.indexOf('const phaseTerms='),original.indexOf('const helpPanel='));
const body = original.slice(original.indexOf('function endingRow('),original.indexOf('controls.category.addEventListener'));
const nodes = Object.fromEntries(['category','search','player','match','subset','view','search-status','definition-back'].map(id => [id,{}]));
nodes['frozen-data']={textContent:JSON.stringify({profiles,coverage})};
nodes['frozen-context']={textContent:JSON.stringify(contexts)};
const sandbox = { document:{getElementById:id=>nodes[id]},closeHelp(){},helpDismissed:null,definitionOrigin:null };
vm.createContext(sandbox);
vm.runInContext(prefix+aliases+body+'\nthis.renderOriginal=render; this.termOriginal=term;',sandbox);
const renderer = createProfileRenderer(sandbox.termOriginal);
const identity = meta => JSON.stringify([meta.aggregation_level,meta.category,meta.player,meta.match_id]);
const contextMap = new Map(contexts.map(group => [identity(group.meta),group]));
let endingRows=0, views=0;
for (const group of profiles) {
  const context = contextMap.get(identity(group.meta));
  assert.ok(context); checks++;
  const relevantCoverage=coverage.find(row=>row.category===group.meta.category&&row.match_id===group.meta.match_id&&row.aggregation_level==='MATCH');
  for (const subset of ['ALL_INCLUDED','BREAK_POINTS']) {
    nodes.category.value=group.meta.category;nodes.player.value=group.meta.player;nodes.match.value=group.meta.match_id;nodes.subset.value=subset;
    sandbox.renderOriginal();
    const html=renderer(group,context,relevantCoverage,subset);
    const unchanged=html.replace(/<p class="small ending-win-summary">[\s\S]*?<\/p>/g,'').replace(/<p class="small ending-win-counting-rule">[\s\S]*?<\/p>/g,'');
    equal(unchanged,nodes.view.innerHTML.replace(`<p class="match-id">${group.meta.match_id}</p>`, `<p class="match-id">${matchLabel(group.meta.match_id)}</p>`));
    const rows=(subset==='ALL_INCLUDED'?group.values:context.bp).filter(row=>row.measure==='POINT_ENDING');
    equal((html.match(/class="small ending-win-summary"/g)||[]).length,rows.length);
    for (const row of rows) {
      const total=row.wins+row.losses;
      equal(endingWinRate(row.wins,row.losses),total>0?row.wins/total:null);
      endingRows++;
    }
    views++;
  }
}

// Display fixtures exercise the actual HTML, including true zero and no-opportunity states.
const fixtureGroup = profiles.find(group => group.meta.all_qa_points > 0);
const fixtureContext = contextMap.get(identity(fixtureGroup.meta));
for (const [wins, losses, text] of [[120,80,'60% won · 120 of 200 points'],[1,0,'100% won · 1 of 1 points'],[0,4,'0% won · 0 of 4 points'],[0,0,'Unavailable']]) {
  const fixture = { ...fixtureGroup, values: fixtureGroup.values.map(row => row.measure === 'POINT_ENDING' ? { ...row, wins, losses } : row) };
  assert.ok(renderer(fixture, fixtureContext, undefined, 'ALL_INCLUDED').includes(`<strong class="numeric">${text}</strong>`)); checks++;
}
const component = fs.readFileSync('src/components/TennisPointPhases.astro','utf8');
assert.ok(component.includes("endingwin:") && component.includes('tennis-controls > div:nth-child(3)') && component.includes('white-space: nowrap')); checks++;
assert.ok(component.includes('Serve +1 is part of rally play') && component.includes('none is an untouched test')); checks++;

// Real request coordinator: stale responses cannot replace a later selection; cache/retry remain intact.
const pending=[];
const loader=createPacketLoader((file,options)=>new Promise((resolve,reject)=>pending.push({file,options,resolve,reject})));
const first=loader.load(catalog.players[0]),second=loader.load(catalog.players[1]);
equal(pending[0].options.signal.aborted,true);
pending[1].resolve({ok:true,json:async()=>packets[1]});equal((await second).current,true);
pending[0].resolve({ok:true,json:async()=>packets[0]});equal((await first).current,false);
equal((await loader.load(catalog.players[1])).current,true);equal(pending.length,2);
const failed=loader.load(catalog.players[2]);pending[2].resolve({ok:false});await assert.rejects(failed);checks++;
const retry=loader.load(catalog.players[2]);pending[3].resolve({ok:true,json:async()=>packets[2]});equal((await retry).current,true);
const empty=loader.load(catalog.players[3]);loader.invalidate();pending[4].resolve({ok:true,json:async()=>packets[3]});equal((await empty).current,false);

console.log(JSON.stringify({checks,views,endingRows,originalMeasuresAndMarkup:'UNCHANGED_EXCEPT_ADDED_PERCENTAGE_AND_MATCH_LABEL',result:'PASS'}));

import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {displaySummary,createComparisonLoader} from '../src/lib/player-comparison.ts';
const root='public/data/spatial-shot-selection/v4';
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(digest(`${root}/manifest.json`),'685aa02b5003cb292fbe0926b242a351200f0cd785a169c31942f8518ac03242');
const manifest=JSON.parse(readFileSync(`${root}/manifest.json`));
for(const file of manifest.payload_files) assert.equal(digest(`${root}/${file.path}`),file.sha256);
let players=0,sliders=0,unavailable=0;
const check=(source,scale=1)=>{
  const result=displaySummary(source,scale);
  for(const k of ['mean','lower_90','upper_90']) assert.equal(result[k],source[k]===null?null:source[k]*scale);
};
for(const season of manifest.seasons){
  for(const file of readdirSync(`${root}/seasons/${season.season}/players`)){
    const p=JSON.parse(readFileSync(`${root}/seasons/${season.season}/players/${file}`));
    const before=JSON.stringify(p);players++;
    check(p.baseline_expected_points_per_attempt,100);
    check({mean:p.score.point,lower_90:p.score.lower_90,upper_90:p.score.upper_90});
    assert.equal(typeof p.evidence_status,'string');
    assert.equal(typeof p.availability_reason,'string');
    assert.deepEqual(p.sliders.map(s=>s.requested_share),[0,.05,.1,.15,.2,.25]);
    for(const s of p.sliders){
      sliders++;check(s.relocated_expected_points_per_attempt,100);check(s.gain_per_100);
      assert.ok(Number.isFinite(s.actual_relocated_share)&&s.actual_relocated_share<=s.requested_share+1e-12);
      if(!p.relocation_available){unavailable++;assert.equal(p.score.point,null);assert.equal(s.gain_per_100.mean,null);assert.equal(s.relocated_expected_points_per_attempt.mean,null);}
    }
    assert.equal(JSON.stringify(p),before,'all original values unchanged');
  }
}
for(const invalid of [{mean:null,lower_90:0,upper_90:1},{mean:NaN,lower_90:0,upper_90:1},{mean:1,lower_90:2,upper_90:3},{mean:1,lower_90:0,upper_90:Infinity}])assert.throws(()=>displaySummary(invalid,100));
let requests=0;
const loader=createComparisonLoader(async path=>{requests++;return {ok:true,json:async()=>({path})};});
const [a,b]=await Promise.all([loader('catalog'),loader('catalog')]);
assert.equal(a,b);assert.equal(requests,1);
await loader('catalog');assert.equal(requests,1);
let tries=0;
const retry=createComparisonLoader(async()=>{tries++;return {ok:tries>1,status:503,json:async()=>({ok:true})};});
await assert.rejects(retry('index'));assert.deepEqual(await retry('index'),{ok:true});assert.equal(tries,2);
console.log(JSON.stringify({players,sliders,unavailableSliderCases:unavailable,hashes:'all match',checks:'exact conversions, nulls, ranges, immutable values, concurrent cache, cache reuse and failed-request retry passed'}));

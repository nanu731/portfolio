// Outcome-free UI-contract checks against unchanged public v4 files.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { relocationFlow } from '../src/lib/relocation-flow.ts';
const root = 'public/data/spatial-shot-selection/v4';
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
assert.equal(hash(`${root}/manifest.json`), '685aa02b5003cb292fbe0926b242a351200f0cd785a169c31942f8518ac03242');
const manifest = JSON.parse(readFileSync(`${root}/manifest.json`));
for (const file of manifest.payload_files) assert.equal(hash(`${root}/${file.path}`), file.sha256);
let cases = 0, fractional = 0, unavailable = 0, maximumError = 0;
for (const season of manifest.seasons) {
  const files = readdirSync(`${root}/seasons/${season.season}/players`);
  assert.equal(files.length, season.player_count);
  for (const file of files) {
    const player = JSON.parse(readFileSync(`${root}/seasons/${season.season}/players/${file}`));
    const before = JSON.stringify(player);
    const outcomesChanged = { ...player, makes: -1, misses: -1,
      shots: player.shots.map((shot) => ({ ...shot, made: !shot.made, after_x_ft: null, after_y_ft: null })) };
    for (const slider of player.sliders) {
      const result = relocationFlow(player, slider);
      assert.deepEqual(result, relocationFlow(outcomesChanged, slider));
      assert.deepEqual(result, relocationFlow({ ...player, shots: [...player.shots].reverse() }, slider));
      assert.equal(result.cells.length, 156);
      assert.deepEqual(Object.keys(result.cells[0]), ['cell_id', 'removed_attempt_equivalents', 'added_attempt_equivalents']);
      const removed = result.cells.reduce((sum, c) => sum + c.removed_attempt_equivalents, 0);
      const added = result.cells.reduce((sum, c) => sum + c.added_attempt_equivalents, 0);
      maximumError = Math.max(maximumError, Math.abs(removed-added));
      const tolerance = 1e-12 * player.observed_attempts;
      assert.ok(Math.abs(removed-added) <= tolerance);
      if (slider.requested_share === 0) assert.ok(result.cells.every(c => c.removed_attempt_equivalents === 0 && c.added_attempt_equivalents === 0));
      if (!player.relocation_available) { assert.equal(removed + added, 0); unavailable++; }
      if (Math.abs(removed - Math.round(removed)) > 1e-9) fractional++;
      cases++;
    }
    assert.equal(JSON.stringify(player), before, 'input, scores and gains are immutable');
  }
  console.log(`${season.season}: ${files.length} players × six sliders passed`);
}
// Exact boundaries and fractions, including one- and multiple-destination cases.
const cells = Array.from({length:156}, (_,i) => ({cell_id:i+1, observed_attempts:0, supported_destination:false}));
cells[0].observed_attempts=2; cells[1].observed_attempts=10;
cells[2].observed_attempts=40; cells[2].supported_destination=true;
cells[3].observed_attempts=40; cells[3].supported_destination=true;
cells[155].observed_attempts=8;
const shots = [
  ...Array.from({length:2},(_,i)=>({x_ft:-25,y_ft:-5.25,move_order:i+1})),
  ...Array.from({length:10},(_,i)=>({x_ft:-21,y_ft:-5.25,move_order:i+3})),
  ...Array.from({length:40},()=>({x_ft:-17,y_ft:-5.25,move_order:null})),
  ...Array.from({length:40},()=>({x_ft:-13,y_ft:-5.25,move_order:null})),
  ...Array.from({length:8},()=>({x_ft:25,y_ft:39.75,move_order:null})),
];
const fixture = {observed_attempts:100,relocation_available:true,availability_reason:'available',heatmap_cells:cells,shots};
const single = {requested_share:.05,actual_relocated_share:.025,actual_relocated_attempt_equivalents:2.5,destination_allocation:[{cell_id:3,added_share:.025,final_share:.425}]};
assert.deepEqual(relocationFlow(fixture,single).cells.slice(0,3).map(c=>c.removed_attempt_equivalents),[2,.5,0]);
const multiple = {...single,destination_allocation:[{cell_id:3,added_share:.01,final_share:.41},{cell_id:4,added_share:.015,final_share:.415}]};
assert.equal(relocationFlow(fixture,multiple).cells[3].added_attempt_equivalents,1.5);
for (const corrupt of [
  {...single,actual_relocated_attempt_equivalents:NaN},
  {...single,actual_relocated_attempt_equivalents:2.6},
  {...single,destination_allocation:[]},
  {...single,destination_allocation:[{cell_id:156,added_share:.025,final_share:.105}]},
  {...single,destination_allocation:[single.destination_allocation[0],single.destination_allocation[0]]},
  {...single,destination_allocation:[{cell_id:3,added_share:.025,final_share:.51}]},
]) assert.throws(()=>relocationFlow(fixture,corrupt));
assert.throws(()=>relocationFlow({...fixture, shots:shots.map((s,i)=>i===0?{...s,x_ft:26}:s)},single));
console.log(JSON.stringify({cases,fractional,unavailable,maximumError, hashes:'all v4 payloads match',
  tests:'mass, zero, caps, support, boundaries, fractions, nulls, ordering, determinism, outcome independence, immutability and corrupt-data rejection passed'}));

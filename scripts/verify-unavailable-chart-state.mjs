import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/SpatialShotSelection.astro', 'utf8');
const start = source.indexOf('\t\tprivate showSeasonUnavailable(');
const end = source.indexOf('\n\t\tprivate updateSlider()', start);

assert.ok(start >= 0 && end > start, 'showSeasonUnavailable must remain inspectable');

const method = source.slice(start, end);
for (const selector of [
	'[data-cell-detail]',
	'[data-court-title]',
	'[data-court-description]',
	'[data-court-empty] text',
]) {
	assert.ok(method.includes(selector), `unavailable state must update ${selector}`);
}
assert.ok(method.includes("const chartMessage = 'Chart unavailable'"));
assert.ok(!method.includes('Loading chart'), 'unavailable court must not retain loading copy');

console.log('Unavailable-season court copy replaces loading text in visible and accessible states.');

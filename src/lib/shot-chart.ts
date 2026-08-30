/**
 * Court geometry and colour for the shot selection chart.
 *
 * Everything here runs at build time. The zone polygons are imported rather than
 * fetched, serialised to path strings once, and rendered into the HTML, so a
 * reader with no JavaScript still gets a complete court.
 */
import zonePolygons from '../data/shot-selection/zone_polygons.json';

type Ring = number[][];
type ZoneGeometry = { vertices: Ring; anchor: number[]; arcs?: unknown[] };

const GEOMETRY = zonePolygons as unknown as Record<string, ZoneGeometry>;

/* ---------------------------------------------------------------------------
   The flip.

   Source coordinates put y increasing away from the baseline. SVG puts y
   increasing downward. The flip is declared once, here, and nowhere else.

   It is expressed two ways because SVG cannot do it one way for everything.
   `transform` goes on the group holding the shapes. `apply` places label
   anchors, which cannot sit inside that group: a flipped group renders its text
   upside down. Both read from this one object, so the flip has a single home
   even though it has two call sites.

   Nothing else in this file negates a coordinate.
   ------------------------------------------------------------------------ */
export const FLIP = {
	transform: 'scale(1, -1)',
	apply: ([x, y]: number[]): [number, number] => [x, -y],
} as const;

/* ---------------------------------------------------------------------------
   Serialiser. Formats numbers and does no arithmetic on them, so the
   coordinates in the page source stay byte-identical to the ones the analytics
   checker validated against 1.09 million shots. Anyone can diff the rendered
   `d` attribute against the source vertex list and see they match.

   The flat vertex list is emitted as one closed path on purpose. paint_center
   arrives as two rings, the outer paint boundary followed by the restricted
   area traced backwards, joined by a connector along the baseline. Splitting it
   into subpaths would break that. The hole is held open by fill-rule, not by
   winding: see KEYHOLE_ZONES.

   No polygon repeats its first point as its last, so every path closes with Z.

   Consecutive duplicate vertices are dropped. They are zero-length artifacts of
   the export, eight of them across six zones, and they add path data that draws
   nothing. Dropping one is a comparison, not arithmetic: no coordinate is
   altered, so every vertex that survives is still byte-identical to its source.
   ------------------------------------------------------------------------ */
export function toPathData(vertices: Ring): string {
	const parts: string[] = [];
	for (let i = 0; i < vertices.length; i++) {
		const [x, y] = vertices[i];
		const prev = vertices[i - 1];
		if (prev && prev[0] === x && prev[1] === y) continue;
		parts.push(`${parts.length === 0 ? 'M' : 'L'}${x} ${y}`);
	}
	parts.push('Z');
	return parts.join(' ');
}

export const ZONE_ORDER = Object.keys(GEOMETRY);

export const ZONE_PATHS: Record<string, string> = Object.fromEntries(
	ZONE_ORDER.map((id) => [id, toPathData(GEOMETRY[id].vertices)]),
);

export const ZONE_ANCHORS: Record<string, [number, number]> = Object.fromEntries(
	ZONE_ORDER.map((id) => [id, FLIP.apply(GEOMETRY[id].anchor)]),
);

/* paint_center is a keyhole, and the only zone with more than one ring: its
   outer ring reaches the inner one along a connector on the baseline.

   Two consequences.

   It fills with `fill-rule: evenodd`, declared rather than inherited. Under
   nonzero the hole only stays open because the two rings happen to wind
   oppositely today, so any tool that normalised winding would silently flood
   the restricted area with the paint's colour and nothing would error. evenodd
   does not care which way a ring turns.

   It is not stroked. The connector is an artifact of flattening two rings into
   one array, not a real boundary, and stroking it would draw a visible slit
   across the paint. Its neighbours all stroke themselves, so the gap on every
   shared edge is already there.

   Single-ring zones keep the default nonzero rule. Winding cannot affect them,
   so evenodd would buy nothing, and it would cost something real: midrange_left
   and midrange_right each carry one true self-intersection, a sub-unit sliver
   where the 16ft arc meets the paint edge, which evenodd would punch out as a
   pinhole. nonzero fills it, which is what the geometry means. */
export const KEYHOLE_ZONES = new Set(['paint_center']);

/* ---------------------------------------------------------------------------
   Frame. Derived from the polygons so the court cannot outgrow its box.
   ------------------------------------------------------------------------ */
const ALL = ZONE_ORDER.flatMap((id) => GEOMETRY[id].vertices);
/* 12, not 6. The corner three labels sit at x = +/-235 and are centred, so at 6
   they overran the frame by 3.5 and 5.5 units and the SVG clipped them. */
const PAD = 12;
const bounds = {
	minX: Math.min(...ALL.map((p) => p[0])),
	maxX: Math.max(...ALL.map((p) => p[0])),
	minY: Math.min(...ALL.map((p) => p[1])),
	maxY: Math.max(...ALL.map((p) => p[1])),
};
export const VIEW_BOX = [
	bounds.minX - PAD,
	-bounds.maxY - PAD,
	bounds.maxX - bounds.minX + PAD * 2,
	bounds.maxY - bounds.minY + PAD * 2,
].join(' ');

/* ---------------------------------------------------------------------------
   Build-time assertions. A mirrored polygon set passes the analytics checker,
   because point-in-polygon does not care which way up the court is, and then
   renders with the hoop at the wrong end. These stop the build instead.
   ------------------------------------------------------------------------ */
function contains(point: number[], ring: Ring): boolean {
	const [x, y] = point;
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const [xi, yi] = ring[i];
		const [xj, yj] = ring[j];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}

const HOOP = [0, 0];
const hoopZone = ZONE_ORDER.find((id) => contains(HOOP, GEOMETRY[id].vertices));
if (hoopZone !== 'restricted_area') {
	throw new Error(
		`Shot chart: the hoop at [0,0] falls in "${hoopZone ?? 'no zone'}", expected "restricted_area". ` +
			'The zone ids and the geometry disagree.',
	);
}

const FARTHEST = 'arc3_center';
const hoopRenderedY = FLIP.apply(HOOP)[1];
const farRenderedY = FLIP.apply(GEOMETRY[FARTHEST].anchor)[1];
if (!(hoopRenderedY > farRenderedY)) {
	throw new Error(
		'Shot chart: the court renders mirrored. The hoop must sit below the furthest zone ' +
			`once flipped, but the hoop lands at y=${hoopRenderedY} and ${FARTHEST} at y=${farRenderedY}. ` +
			'Check FLIP, or the sign convention of the exported polygons.',
	);
}

/* ---------------------------------------------------------------------------
   Colour.

   The seven-step ramp from CLAUDE.md. Ends and midpoint are palette tokens:
   --accent, --sand, --green. The four between are derived from them.
   ------------------------------------------------------------------------ */
export const RAMP = [
	'#9C3D1E', // 0  worst, --accent
	'#B26750', // 1
	'#C6907F', // 2
	'#D0BE9E', // 3  neutral, --sand, and the surface the chart sits on
	'#79A183', // 4
	'#477A56', // 5
	'#14532D', // 6  best, --green
] as const;

export const NEUTRAL_STOP = 3;
/** Positions 0-2 carry the hatch. Rust against green collapses under protanopia,
    so texture, not hue, is what separates below average from above. */
export const isHatched = (stop: number) => stop < NEUTRAL_STOP;

/* Domain. One shared scale across all fourteen zones and all five seasons,
   measured over the 21,098 zone-observations in the export:
   contrib runs from -0.3575 to +1.0233. Re-derive both if the export changes. */
export const CONTRIB_MIN = -0.3575;
export const CONTRIB_MAX = 1.0233;

/* contrib is badly asymmetric between zones: restricted_area spans -0.358 to
   +1.023 while paint_left spans -0.010 to +0.050. Mapped linearly onto seven
   steps, eleven zones sit at the neutral colour permanently and the chart says
   nothing. The signed square root keeps the order and the sign exactly, and
   moves the ramp's resolution to where the values actually are. Zero maps to
   zero, so the neutral stop stays exactly at league-average selection.

   Because it compresses the extremes, the legend prints real contrib values at
   every boundary rather than evenly spaced ticks. The transform is meant to be
   visible, not hidden. */
const signedSqrt = (v: number) => Math.sign(v) * Math.sqrt(Math.abs(v));

const NEG_EDGE = signedSqrt(CONTRIB_MIN); // negative
const POS_EDGE = signedSqrt(CONTRIB_MAX);

/* Each arm divides into three and a half parts. The half nearest zero on each
   side forms the neutral band, so the band straddles zero rather than sitting
   on a knife edge no real value ever lands on. */
const negAt = (sevenths: number) => (NEG_EDGE * sevenths) / 7;
const posAt = (sevenths: number) => (POS_EDGE * sevenths) / 7;

export function stopFor(contrib: number): number {
	const s = signedSqrt(contrib);
	if (s < negAt(5)) return 0;
	if (s < negAt(3)) return 1;
	if (s < negAt(1)) return 2;
	if (s <= posAt(1)) return 3;
	if (s <= posAt(3)) return 4;
	if (s <= posAt(5)) return 5;
	return 6;
}

export const colourFor = (contrib: number) => RAMP[stopFor(contrib)];

/** Legend rows, carrying the real contrib bounds of each stop. */
const unSqrt = (s: number) => Math.sign(s) * s * s;
export const LEGEND = [
	{ stop: 0, from: unSqrt(negAt(7)), to: unSqrt(negAt(5)) },
	{ stop: 1, from: unSqrt(negAt(5)), to: unSqrt(negAt(3)) },
	{ stop: 2, from: unSqrt(negAt(3)), to: unSqrt(negAt(1)) },
	{ stop: 3, from: unSqrt(negAt(1)), to: unSqrt(posAt(1)) },
	{ stop: 4, from: unSqrt(posAt(1)), to: unSqrt(posAt(3)) },
	{ stop: 5, from: unSqrt(posAt(3)), to: unSqrt(posAt(5)) },
	{ stop: 6, from: unSqrt(posAt(5)), to: unSqrt(posAt(7)) },
].map((r) => ({ ...r, colour: RAMP[r.stop], hatched: isHatched(r.stop) }));

/* ---------------------------------------------------------------------------
   Court furniture, drawn on top. Illustrative rather than derived: these encode
   no data and are not checked against it. The zones underneath already
   reproduce the three point line and the key through their shared edges.

   Published dimensions, in the same tenths of a foot the polygons use, with the
   hoop centre at the origin: rim 18 inches across, backboard 6 feet wide and
   15 inches behind the rim centre, free throw circle 6 feet in radius centred
   on a line 19 feet from the baseline.
   ------------------------------------------------------------------------ */
export const COURT = {
	rim: { cx: 0, cy: 0, r: 7.5 },
	backboard: { x1: -30, y1: -12.5, x2: 30, y2: -12.5 },
	freeThrowCircle: { cx: 0, cy: 137.5, r: 60 },
} as const;

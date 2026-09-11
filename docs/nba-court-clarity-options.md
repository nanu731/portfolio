# NBA court clarity: three review options

11 September 2026. Narayan approved **B: Follow the change**, with the view names
**Shot locations** and **Make-chance map**. The shared explorer now implements B
on the private preview branch. Narayan has since approved the complete redesign
for deployment. A permission-system rejection blocks the feature push; production
remains unchanged. The release preflight record explains the remaining step.
The alternatives and screenshots below record the earlier proposal stage.

## Original recommendation, before Narayan selected B

Choose **A: Court-side guide** if the priority is immediate comprehension with
the smallest implementation change. One court stays large, its heading names
the current state, and a compact shape key sits beside it on desktop and below
it on mobile. The ability map keeps a separate numeric legend.

B makes the reading sequence explicit but delays the court on phones. C makes
before/after comparison easier but adds a second court and more scrolling.
These are layout alternatives, not palette variations.

## Scope and verified example

All mockups use LeBron James, 2025–26, at a 25% request. The source is the
functioning local explorer built from the unchanged v4 player payload.

| Verified measure | Value |
| --- | --- |
| Included attempts | 919: 473 makes, 446 misses |
| Requested / actual relocation | 25% / 25.0% |
| Moved attempt-equivalents | 229.75, represented by 230 diamonds with a fractional boundary marker |
| Extra season points | +157; 90% range 129–183 |
| Extra points per 100 | +17.0; 90% range 14.1–19.9 |
| Shot Selection Score | 86.8; 90% range 84.7–89.0 |
| Ability map | 156 cells, two outlined evidence diamonds |

The review uses captured historical, relocated, and ability SVG artwork.
Shot coordinates, outcomes, marker opacity, cells, fills, and court geometry
are unchanged. Paired courts receive distinct accessibility IDs.
No statistical calculation runs in the prototypes.

At the proposal stage, the shared explorer remained untouched. Temporary HTML, CSS, JavaScript, SVGs,
and screenshots live outside the production repository at:

`/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/`

The review-only server is [local port 4324](http://127.0.0.1:4324/?option=a).
It reuses existing local fonts without adding a dependency or hosting service.
The prototype radio controls work; its slider previews the **0% and 25%
endpoints only**. A selected implementation must retain all six existing
settings, all player-season states, search, keyboard area inspection, and
unchanged lazy data loading. Player/season controls are not reproduced in this
fixed-example review.

## Exact shared visitor-facing copy

| Element | Proposed text |
| --- | --- |
| Context beside the current view | LeBron James · 2025–26 · 25% requested |
| Historical state title | Before: past shots |
| Guide above the historical court | Green circles show historical makes and rust crosses show misses; no attempts move at 0%. |
| Relocated state title, A/B | After: possible shot locations |
| Guide above the relocated court, A/B | Cyan diamonds show hypothetical new locations; green circles and rust crosses show shots that stay. |
| Ability title | Estimated shooting chance |
| Guide above the ability court | Darker blocks mean a higher estimated chance of making a shot; the slider does not change this map. |
| Shot key | Made shot; Missed shot; Relocated attempt; Original location |
| Movement control / value | Shots to move / Up to 25% |
| Movement explanation | At 0%, see past shots; above 0%, cyan diamonds replace moved attempts and faint rings mark their origins. |
| Actual movement | 25.0% moved in this estimate |
| Fractional marker | 229.75 attempt-equivalents; one faded diamond represents a partial attempt. |
| Ability-view slider help | The slider changes the points estimate, not the map; switch back to see moved attempts. |
| Ability-view movement note | 229.75 attempts move in the shot scenario; this map shows unchanged ability. |
| Probability legend | Estimated chance of a make |
| Five fixed bins | Below 30%; 30–40%; 40–50%; 50–60%; 60%+ |
| Evidence symbol | Area with relocation evidence |
| Map caveat | Same numeric scale for every player and season; darker does not guarantee a make or mean an area qualifies for relocation. |
| Results caveat | Modeled estimates from past shots; no guaranteed gains or causal claim. Cyan diamonds are hypothetical attempts, not guaranteed makes. |

Green filled circles identify makes; rust crosses identify misses. Cyan filled
diamonds identify hypothetical relocated attempts; faint open rings identify
their original locations. The ability map uses cream-to-green bins and
cream-filled, green-outlined diamonds for evidence. The view-specific legends
prevent confusing those outlined area symbols with cyan shot symbols.

At zero, all 919 historical markers return without relocation diamonds or
origin rings; gains read 0 and 0.0 while the fixed score remains 86.8.
Above zero, unchanged shots retain their historical symbols. Map geometry,
probability colors, and evidence markers never respond to the slider.

## A: Court-side guide

[Desktop shots](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-a-desktop-shots.jpg) ·
[Mobile shots](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-a-mobile-shots.jpg) ·
[Mobile key and slider](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-a-mobile-controls.jpg) ·
[Desktop map](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-a-desktop-map.jpg) ·
[Mobile map](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-a-mobile-map.jpg) ·
[Mobile map legend](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-a-mobile-map-legend.jpg)

- **View names:** “Shots: Before & After” and “Shooting Chance Map”.
- **Guide headings:** “What you’re seeing”, then “Same attempts, new locations”
  at 25%, “The recorded shot chart” at zero, or “Ability, area by area” for the map.
- **First reading:** identify player/season; choose a view; read the state and
  one-sentence court guide; use the adjacent key; move the slider; read gains.
- **Layout:** one court at the figure gutter, compact guide and slider on its
  right. At phone width the shape key sits below the court, followed by the
  slider. Redundant guide headings and prose disappear on mobile, while the
  state sentence, key, movement explanation, and caveats remain.
- **Map:** the numeric ramp sits below the court. Five equal-width labeled
  swatches fit the phone; the evidence key wraps onto its own line.
- **Advantages:** closest to the existing component; large court; no new
  navigation; no overlay or extra court.
- **Drawbacks:** the phone slider follows the court; dense rim clusters remain,
  because this proposal does not change real shot geometry or opacity.
- **Accessibility:** names, shapes, state heading, and requested/actual text
  supply multiple cues. Preserve the existing map's tap/keyboard numeric area
  readout rather than relying on color alone.
- **Work:** small relative change: labels, one guide, legend placement, and
  responsive styles in the existing component. No new data requests.
- **Space:** one court; shortest of the proposals. No extra comparison panel.

## B: Follow the change

[Desktop shots](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-b-desktop-shots.jpg) ·
[Mobile controls](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-b-mobile-controls.jpg) ·
[Mobile shots](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-b-mobile-shots.jpg) ·
[Desktop map](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-b-desktop-map.jpg) ·
[Mobile map](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-b-mobile-map.jpg)

- **View names:** “Shot locations” and “Make-chance map”.
- **Reading labels:** “1 · Choose what to see”, “2 · Set the change”,
  “3 · Read the court”.
- **First reading:** choose the shot chart or ability map; set the allowed
  movement; inspect the state-labeled court and its key; read estimated points.
- **Layout:** a numbered control column on the left and one court on the right.
  Mobile puts the controls before the court. The document order follows the
  same 1–2–3 sequence, not a CSS-only reorder.
- **Map:** step three says “Estimated shooting chance”; the guide states that
  moving the slider affects points, not the map. The same numeric ramp and
  outlined evidence marker appear below it.
- **Advantages:** teaches the relationship between setting, chart, and result;
  the phone reader reaches the slider before the chart.
- **Drawbacks:** more instruction for returning visitors; a phone reader must
  scroll to see the court. “Set the change” needs its map-specific help to avoid
  implying that estimated ability changes.
- **Accessibility:** numbered steps supplement headings; native radio and
  slider semantics remain. Source order must match visual reading order.
  Preserve the numeric map readout and visible focus.
- **Work:** medium: reorganize control/figure markup within the shared
  component, add state-aware step labels, and verify focus order.
- **Space:** one court, but more instruction height; no overlay or extra chart.

## C: Two courts, one change

[Desktop shots](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-c-desktop-shots.jpg) ·
[Mobile historical court](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-c-mobile-before.jpg) ·
[Mobile relocated court](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-c-mobile-after.jpg) ·
[Desktop map](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-c-desktop-map.jpg) ·
[Desktop map legend detail](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-c-desktop-map-legend.jpg) ·
[Mobile map](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/option-c-mobile-map.jpg)

- **View names:** “Compare shot locations” and “Shooting Chance Map”.
- **At 25%:** title “Past shots and possible new locations”; guide “Compare the
  same 919 attempts: historical shots on the first court, hypothetical relocations
  on the second.”
- **Court labels:** “Historical · 0% moved” and “Possible mix · 25.0% moved”.
- **First reading:** identify the player/season and requested percentage;
  compare the two labeled courts; decode their shared shape key; move the
  slider and read the results.
- **Layout:** two equal courts at positive movement, sharing one view control
  and one slider. The first stays historical; the second follows the slider.
  At zero, collapse to one historical court instead of showing duplicate charts.
  Mobile stacks historical then relocated courts.
- **Map:** one full-size ability court with guide/slider beside it on desktop
  and below on mobile; no duplicate map. Its numeric legend stays below it.
- **Advantages:** reduces memory demands when comparing distributions; avoids
  bringing back separate Before and After navigation buttons.
- **Drawbacks:** smaller desktop shot courts and much more mobile scrolling;
  the second court may not be visible while adjusting the phone slider.
  Zero-to-positive movement introduces a layout-height change.
- **Accessibility:** each court needs a unique title/description and distinct
  IDs. Announce the change once, not once per marker or court. Preserve native
  controls and the map's numeric readout.
- **Work:** largest: render a second shot court, maintain separate IDs/layers,
  test both render paths and responsive height changes. Fetch the player once;
  both courts must consume the same payload.
- **Space:** two shot courts above zero; one at zero or in the map view.

## Accessibility and visual review

The mockups retain the portfolio palette and three existing font families.
Filled circles, crosses, filled cyan diamonds, and open rings supplement color;
numeric labels accompany the fixed sequential ramp. Faint origin rings remain
secondary marks, with an explicit text key. No guide covers court data.

At 1440px and exact 375px, the checked pages had no horizontal overflow.
All three display the real 919-shot artwork and the same 156-cell map.
The mockup endpoint checks restore the historical artwork at zero; the
comparison collapses to one court; changing the slider leaves map artwork
unchanged. Radio selection and slider controls use native keyboard behavior,
visible focus, and one polite state announcement. The guided layout's document
order follows its visual steps. Browser logs contained no application errors.

These are visual prototypes, not acceptance-tested replacements: their static
SVGs do not reproduce the working explorer's area-inspection handlers,
player/season loading, six-setting slider, or unavailable-state interface.
Those existing behaviors must survive implementation of the chosen option.
No screen-reader speech or physical-device touch test was performed.

Captures use viewport frames. The screenshot tool's full-page stitching produced
duplicate content, so the final mobile set splits long pages into labeled frames.
The screenshots do not claim that an entire long phone page fits one screen.
Earlier review artifacts remain preserved.

## Copy/reference review screenshots

[Short notice, desktop](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/desktop-limitations.jpg) ·
[Notice ending and three closed references](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/desktop-collapsed-references.jpg) ·
[Expanded Definitions](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/desktop-definitions.jpg) ·
[Expanded Formulas](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/desktop-formulas.jpg) ·
[Variable key](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/desktop-variable-key.jpg) ·
[Short notice, mobile](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/mobile-limitations.jpg) ·
[Mobile variable key](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-court-clarity-options-review/mobile-variable-key.jpg)

## Current release status

Option B and its two view names are approved and implemented in the existing
shared explorer. The six slider settings, all player-season behavior, geometry,
data, and calculations remain intact. The new popup actions link exact entries.
The latest verification record is in `nba-plain-language-preview-review.md`.
Narayan has approved the implemented desktop/mobile layout. Free-pointer hover
transit remains a manual test limitation. Definition actions say See all definitions,
and the formula key uses aligned desktop rows and separated mobile pairs.
The quality assessment is in `nba-project-quality-review.md`. The latest request
authorizes pushing, merging, and connected automatic deployment. The permission
system requires that authorization in direct chat before it will allow the push.
The rejected push made no change; production and the remote feature remain unchanged.

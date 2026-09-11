# Plain-language NBA preview review

Verified 10 September 2026. Local review only; no merge or deployment is approved.

## Starting point and scope

The existing branch was `codex/nba-plain-language-copy` at proposal commit `c73c042`.
Local `main`, its remote-tracking reference, and a direct remote read were `c1e39fc`.
There were no tracked edits, staged changes, conflicts, or Git locks.
The implementation is commit `0784d9b` and uses the approved copy proposal.

Changed source files:

- `src/components/DefinitionHelp.astro`
- `src/components/SpatialShotSelection.astro`
- `src/content/projects/nba-shot-selection-analytics.mdx`
- `src/content.config.ts`
- `src/layouts/Project.astro`
- `src/styles/global.css`

The optional metadata placement affects only the NBA page. The proposal is unchanged.
The source change adds no dependencies and does not modify data, models, or formulas.

## Verification

- `npm run build` passed on the final source: six pages, including the NBA project.
  Existing empty-blog warnings remain. No test command exists in the package scripts.
- Compared the types, constants, numeric helpers, data validators, request controls,
  shot-marker calculations, heatmap geometry/colors, and slider result/null guards
  with the starting component. Those blocks are byte-identical.
- LeBron loaded in all five seasons. Shot counts were 919, 1,268, 1,268, 1,219,
  and 1,221 from newest to oldest. Both court views worked, with 156 map cells.
- LeBron's six 2025-26 settings displayed season gains of 0, +35, +68, +99,
  +128, and +157 points. Per-100 gains were 0.0, +3.9, +7.4, +10.7, +14.0,
  and +17.0. The score stayed 86.8; the 25% season range stayed 129 to 183.
- Returning to zero reproduced the original historical marker markup. Changing the
  slider in Shooting Map left the map markup unchanged. Returning to Before & After
  used the retained setting. Player/season changes reset the slider.
- Wembanyama retained 1,080 shots, 243 moved markers at the 25% request, 22.5%
  actual movement, +184 points, and an 87.0 score. The source allocation ends at 0.50.
- Chris Paul in 2024-25 retained 581 shots and 156 map cells without visible score
  or gains. The mobile result block remained hidden. His 2025-26 absence explained
  the 56 shots and 16 games. Carmelo Anthony's 2025-26 absence reported no shots.
  Reset restored LeBron, 2025-26, Before & After, and zero movement.
- Search tested mixed case and punctuation with `lUkA don-cic`, the all-player list,
  evidence suffixes, no results, pointer selection, and Arrow Down/Enter selection.
- An isolated server outside the repository served the built files and recorded
  requests. Before a selection, typing several queries added no player requests.
  Each page load requested the root manifest/catalog, active index, and selected
  player. A selected Wembanyama request added only his player file.
- A review-only 600ms player-response delay put rapid selections in flight. A
  Wembanyama selection followed by LeBron displayed only LeBron's final results.
  A review-only 503 response produced the retry message; retry recovered afterward.
- Definition tests covered pointer-only hover without trigger focus, focus through
  Tab, Enter, Space, Escape, clicks, outside clicks, and one-open-at-a-time behavior.
  ARIA names, expanded states, descriptions, and focus outlines were inspected.
- In the first implementation, native methodology and nested formula disclosures opened with the keyboard and
  began closed. The Definitions headings use cream text on green after visual review.
- Desktop 1440px, exact 375px mobile, and 720px reflow representing a 1440px viewport
  at 200% had no horizontal overflow. The final console had no warnings or errors.
  No physical-phone or screen-reader speech test was performed.

## Review files and boundary

Preview: `http://127.0.0.1:4323/projects/nba-shot-selection-analytics/`.
The temporary review server and request log are outside the repository at
`/tmp/nba-copy-review.B2MBUx/`. Its response delay is not part of the website.

Screenshots are outside the production tree in:
`/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-plain-language-review/`

- `desktop-lebron-0.png`
- `desktop-lebron-25.png`
- `mobile-lebron-25.png`
- `mobile-results-25.png`
- `desktop-open-definition.png`
- `definitions.png`
- `methodology-collapsed.png`
- `methodology-expanded.png`

The production page returned HTTP 200 with the old Modeled Ability label and without
the new methodology section. No Netlify configuration or deployment action occurred.
All tracked public assets match the starting commit. `layout-test.mdx` remains
untracked, 2,309 bytes, SHA-256
`0080c804c394d15dfa9d29f05b258a9c57110a53877becb202ec7514c47aabe3`.
The pre-existing untracked LeBron prototype remains 145,713 bytes, SHA-256
`18e3488cc373773f1bf04b0df76f95a568f08db7f4944984da5b8b973e748548`.

Narayan should review the information order, definition text, and the distinction
between the Shooting Map view and its Best Shooting Areas help heading. Deployment
requires separate approval. The next step is a visual and wording review, not a merge.

## Purpose and formula revision

Recovered the pushed branch at `e813463`, including `0784d9b` and `c73c042`.
A direct remote read confirmed feature `e813463` and main `c1e39fc` before edits.
The working tree contained only the preserved prototype and layout test. The existing
production-file review server on port 4323 was reused; no duplicate server was started.

Source commit `99a4117` changes only the NBA write-up and its formula styles. The
opening now explains the basketball question, possible efficiency gains, location
tradeoffs, and the limit on interpreting results as real-game predictions.
Definitions precedes two sibling disclosures: How the model works and Formulas.
Both start closed. The seven formula blocks use the existing numeric typeface,
subscripts, multiplication and summation symbols, an HTML fraction, and spoken labels.
A variable key and input-provenance notes complete the section. No dependency was added.

### Formula verification

Read the frozen five-season and single-destination-cap plans and inspected
`R/spatial_targeted_capped_website_export.R` and
`R/spatial_targeted_relocation_helpers.R` in the analytics repository without edits.

- Exporter lines 263–276 calculate each player-season cell's point value as
  `2 + three_point_attempts / point_value_attempts` and its historical attempt share.
  Empty cells have null observed point values and zero calculation weights.
- Lines 309–314 calculate weighted baseline draws and mean cell expected points.
- Lines 367–398 construct capped relocated shares and calculate relocated draws,
  season gains, and gains per 100 attempts. Shares stay fixed across the joint draws.
- Helper `target_summary` reports means and type-7 5th/95th percentiles.
  `target_score` calculates each ratio, clips it to 0–100, then reports the median
  and percentiles. The page preserves this distinction from a ratio of averages.
- The score uses feasible movement at the 25% request. Source capacity, supported
  destinations, and the 50% cap stay unchanged; unavailable gains and scores stay null.

### Revision checks

- Production build passed: six pages; only the existing empty-blog warnings.
- All six LeBron settings reproduced the earlier gains and per-100 values above.
  Returning to zero reproduced the historical SVG markup exactly.
- LeBron loaded in all five seasons with both court views. A slider change left
  Shooting Map markup unchanged; returning to Before & After retained the setting.
- Wembanyama remained at 22.5% actual movement, 243 attempt-equivalents, +184 season
  points, +17.1 per 100, and score 87.0 at the 25% request.
- Chris Paul's 2024-25 unavailable relocation retained the chart and disabled slider;
  changing to 2025-26 gave the 56-shot/16-game reason. Reset restored the defaults.
- Mixed-case `lUkA don-cic` matched Luka Dončić. Keyboard selection, no results,
  repeated searches, and delayed Wembanyama-to-LeBron selection worked.
- The review request log showed one root manifest and catalog request after reload.
  Season changes requested their active indexes. Typing added no requests; selecting
  Wembanyama added only his player JSON. Rapid selection ended with LeBron.
- Definition help still opened through its keyboard trigger and closed with Escape.
- Both disclosures passed pointer clicks, mobile tap-style clicks, Enter, and Space.
  Native collapsed states appeared in the accessibility tree. Seven math elements
  have descriptive spoken labels; no speech-reader or physical touchscreen test ran.
- Desktop 1440px, exact 375px mobile, and 720px reflow representing 200% of 1440px
  had no page or formula overflow. All formula blocks and the variable key fit.
  The console had no warnings or application errors. This was a viewport-based
  reflow check, not a native browser-zoom test.
- Compared with `e813463`, the shared explorer, definition component, layout, schema,
  and all tracked public assets are byte-identical. Analytics still reports only
  its pre-existing untracked observation folder. Layout-test and prototype hashes
  remain the preserved hashes recorded above.

### Updated review images

New images are outside the repository, preserving the prior screenshots:
`/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-purpose-formulas-review/`

- `desktop-opening.jpg`
- `desktop-definitions.jpg`
- `desktop-bottom-sections.jpg`
- `desktop-formulas.jpg`
- `desktop-formulas-score.jpg`
- `mobile-formulas.jpg`
- `mobile-score-formula.jpg`

Narayan's next step is a visual and wording review of these two revisions. Only
the preview branch may be pushed. Main, the live site, and Netlify remain outside
this change's authorization.

## Visible limitations and three-reference revision, 11 September 2026

Recovered the pushed branch at `fc3eea5`, preserving all earlier preview commits,
including `99a4117`. Direct remote reads confirmed feature `fc3eea5` and main
`c1e39fc`. There were no tracked edits or Git locks; only the existing prototype
and layout test were untracked. The existing port-4323 production preview server
was reused. Other running development processes were left untouched.

Source commit `d002b7c` changes only the NBA write-up and its reference styles.
The opening retains its purpose and now calls the scenario theoretical. A permanent
Important limitations notice occupies the existing green band after the results.
Definitions moves into a native disclosure beside How the model works and Formulas.
All three are siblings, initially closed, with the same focus and summary styling.
All twelve proposal terms remain, each with one or two explanatory sentences.
Inline definition components and explorer code are unchanged.

### Limitations audit and wording provenance

Reviewed the current scope, frozen model formula, and Known limitations in
`docs/SPATIAL_MODEL_PLAN.md`; the complete five-season and single-destination-cap
plans; and the targeted capped exporter and summary helpers. No analytics files
were changed or executed. The spatial plan's older integration-pending status is
historical; it does not override the verified deployed portfolio state.

- The spatial plan specifies location, made/missed, and point value; its frozen fit
  has player intercepts and spatial effects with no game-context covariates. The
  five-season plan preserves that specification. Narayan's requested examples of
  missing health, shot technique, roles, opponents, and game situations are consistent
  with this input scope; they are not newly measured basketball effects.
- Known limitations explicitly cover inability to create opportunities, favorable
  conditions in historical attempts, accuracy changes with volume and defensive
  adjustment, missing defender/clock context, free-throw value, and uncertainty
  that does not establish a causal gain. The notice includes all of these.
- The v3/v4 plans verify weakest-first movement, supported destinations, single-area
  states, the 50% added-capacity restriction, fixed plans across 4,000 draws, separate
  historical seasons, and null results when movement is unavailable. The notice
  describes these as project assumptions and rules, not basketball guarantees.
- The self-relative score, hypothetical markers, and prohibition on treating the
  tool as coaching or betting advice follow the approved scope. The notice makes
  no claim to enumerate unknown limitations or predict future player development.
- Shot technique is distinguished from two-/three-point value: the calculation
  uses the latter but does not adjust make probability for pull-ups, catch-and-shoot
  attempts, dribbling, balance, or how the shot opportunity arose.

### Notation and production equivalence

The variable key now precedes all seven equations. It defines `A` as included
season attempts, `w′` as relocated share, EPPS and its current/relocated subscripts,
cell expected points, percentile notation, and arithmetic/grouping symbols.
The notation changes no calculation. Point value remains
`2 + three_point_attempts / point_value_attempts` per player-season cell. Empty
cells retain no observed point value and contribute zero with zero shot weight.
Gains remain draw means; scores remain medians of draw ratios clipped to 0–100;
90% ranges remain type-7 fifth and ninety-fifth percentiles. The 25% score scenario
uses feasible movement. These are verified against the same production helpers
cited in the preceding revision.

### Final build and browser checks

- Final `npm run build` passed at 00:09 on 11 September: six pages, 2.60 seconds,
  with only the existing empty-blog collection warnings. No test script or new
  dependency was added.
- Initial LeBron/2025-26/0% remains. The permanent notice is outside disclosures;
  all three native disclosures begin closed. The twelve definition headings match
  the proposal's inventory. The formula key precedes the first equation in the DOM.
- LeBron's six settings reproduce the earlier recorded points and per-100 gains.
  Returning to zero reproduces the historical SVG markup. Slider changes leave
  Shooting Map markup unchanged. LeBron persists across all five season selections,
  each resetting movement to zero.
- Wembanyama retains 22.5% movement, 243 attempt-equivalents, +184 points, +17.1 per
  100, score 87.0, and the same displayed ranges at the 25% request.
- Chris Paul's 2024-25 insufficient-evidence chart remains with a disabled slider
  and no estimates. His 2025-26 absence explains 56 attempts in 16 games. Reset
  returns to LeBron. Rapid Wembanyama-to-LeBron selection ends with LeBron.
- Search matched `lUkA don-cic`; keyboard selection worked. Typing produced no
  requests, and selecting Wembanyama produced only his player-file request.
  The existing review-only 600ms player delay remains outside production files.
- Native disclosures passed mouse, 375px tap-style clicks, Enter, and Space.
  Their collapsed states appeared in the accessibility tree. Seven math elements
  carry descriptive labels. Inline definitions passed focus via Shift+Tab, visible
  outline, Enter, Space, Escape, outside clicks, and mobile click placement.
  Standalone pointer-hover behavior relies on the previous verified pass plus
  byte-identical definition-component code; no physical touchscreen or speech-reader
  testing was performed.
- Desktop 1440px, exact 375px mobile, and half-width 720px reflow representing 200%
  had no page, disclaimer, key, or equation overflow. This is a reflow test, not
  native browser zoom. The browser console contained no application warnings/errors.
- The complete source diff passed whitespace review. All tracked public assets,
  explorer and definition components, layouts, and collection configuration match
  `fc3eea5`. Analytics remains at `23b52b1` with its existing untracked observations.
  The layout-test and prototype hashes remain those recorded above.
- A live page fetch returned the existing page without the new notice or formulas.
  No merge, deployment, pull request, hosting edit, or main-branch push occurred.

### Latest screenshots and approval boundary

Screenshots are outside the production repository in:
`/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-limitations-reference-review/`

Main review set: `desktop-opening.jpg`, `desktop-disclaimer.jpg`,
`desktop-disclaimer-details.jpg`, `desktop-collapsed-references.jpg`,
`desktop-definitions-opening.jpg`, `desktop-methodology-opening.jpg`,
`desktop-formulas-opening.jpg`, `desktop-formula-key.jpg`, `desktop-equations.jpg`,
`mobile-disclaimer.jpg`, `mobile-formula-key.jpg`, `mobile-equations.jpg`, and
`mobile-score.jpg`. Additional interior Definitions and methodology captures remain
in that directory. Earlier review directories were preserved.

Narayan should review the visible notice's length, the three closed references, and
the key-first notation. Only the preview branch is authorized for this push; a merge
or deployment requires separate approval. A general notation-order lesson was logged
outside the repository for later skill review; no skill was changed.

## Short notice verification, 11 September 2026

Recovered pushed `9c126b8`, ahead of the five commits listed in the new request.
Remote and local main remain `c1e39fc`. No tracked changes or Git locks existed.
The visible notice, three sibling disclosures, and complete key-first formulas
already existed; none was duplicated. Only the notice required correction.

Fourteen one-sentence bullets replace ten long bullets and their background prose.
Thirteen bullets are under eighteen words; the longest is nineteen. The list
retains the requested basketball limitations plus health/travel, technique,
free-throw omissions, eligibility, and receiving-capacity caveats from the prior
audit. Existing methodology and formulas retain technical details, including
the cap's treatment of pre-existing concentration above 50% and per-cell
point value `2 + observed three-point-attempt share`.

Production build passed at 00:25 local time: six pages, 2.92 seconds, with the
existing empty-blog warnings. Definitions, How the model works, and Formulas
are sibling native disclosures without `open`; all passed Enter, Space, and
mobile click checks. Native accessibility reports collapsed states; keyboard
focus has a visible outline. The fourteen-entry variable key precedes seven
unchanged equations. No page, notice, key, or equation overflow occurred at
1440px, exact 375px, or 720px reflow (200%-equivalent, not browser zoom).

LeBron's 25% result stays +157 points (129–183), +17.0 per 100, score 86.8;
his court retains 919 markers, 230 moved markers/origins including the fractional
boundary, and 156 map cells with two evidence markers. Wembanyama stays at
22.5% movement, +184 points (156–211), +17.1 per 100, and score 87.0.
Request logs show one manifest, catalog, and active index load, no requests
from typing, and only Wembanyama's selected player request on selection.
The console contains no application warnings/errors. Explorer, popovers,
formulas, styles, and exports match the recovered commit without modification.

Screenshots for this pass are in the external `nba-court-clarity-options-review`
directory beside earlier review sets. Court design work will use separate
review-only mockups; this copy correction does not apply a court redesign.
Physical-device touch and screen-reader speech have not been tested.

## Court-option review, 11 September 2026

The three review-only options are documented in `nba-court-clarity-options.md`:
Court-side guide, Follow the change, and Two courts, one change.
Their HTML/CSS/JavaScript, rendered SVG snapshots, and screenshots live outside
the repository in the persistent `nba-court-clarity-options-review` directory.
The local mockup server uses port 4324; the existing portfolio preview remains
on port 4323. Neither server changes production data.

All use LeBron 2025-26 at a 25% request, with unchanged 919-shot geometry,
230 relocated markers, 156 map cells, real displayed gains/ranges, and score.
The paired option renders the same player payload twice, not two fetched players.
The prototypes expose only zero and 25% and two view choices. Their static map
does not reproduce interactive area inspection; implementation must preserve
that existing behavior. Desktop and 375px captures show both shot and map
layouts. Browser checks found no horizontal overflow or console errors.

The complete view, figure geometry, layers, palette, statistical payloads,
formulas, and network code in the functioning explorer remain untouched.
Only a recommendation was made; Narayan must choose a court option before work
on the component. The screenshot tool's stitched output duplicated content, so
the final review uses separate viewport captures for long sections.

## Implemented Option B and exact detail links, 11 September 2026

### Recovery and scope

Recovered clean tracked state at pushed `7433871`, including `b69a743`.
Both local and GitHub main remain `c1e39fc`. Existing preview server on port
4323 was reused; no duplicate process was started or existing process stopped.
The local layout test remains untracked, 2,309 bytes, SHA-256
`0080c804c394d15dfa9d29f05b258a9c57110a53877becb202ec7514c47aabe3`.
The untracked LeBron prototype retains SHA-256
`18e3488cc373773f1bf04b0df76f95a568f08db7f4944984da5b8b973e748548`.

Narayan selected B after the preceding proposal record. The implementation changes
the shared explorer, not the isolated mockups. `cc0c4da` implements the numbered
sequence; `6f6623b` adds detail navigation and accessibility corrections.
At that stage, the request authorized a preview-feature push. The final-refinement
request below supersedes that authorization and permits local commits only.

Git result at the end of that session: local implementation commits were `cc0c4da`, `6f6623b`, and
`a9922ef` (fresh-visit origin guard). The permission reviewer rejected the
documentation commit and feature push twice, treating the older visual-approval
gate as controlling even after the latest attachment's line 166 was quoted.
No rejected command ran. Three documentation files remained uncommitted and
the remote preview branch remained `7433871`. No bypass was attempted. The
final-refinement session below resolves the local documentation commit; it does
not attempt a push.

### Court and data checks

Actual DOM order is choose view, set movement, read court. Desktop uses a left
control column and one large right court; 375px stacks the same DOM.
Shot locations and Make-chance map replace the prior names, including the reset
announcement and missing-evidence explanation. Controls and legends remain outside
the court. Historical circles/crosses, cyan diamonds, origin rings, and fractional
opacity retain the same rendering calculations. The fractional note hides at zero
and in the map view. A new player/season returns to historical zero.

LeBron 2025-26 remains 919 attempts, 473 makes and 446 misses. At requests
0/5/10/15/20/25, season gains are 0/+35/+68/+99/+128/+157; per-100 gains
0.0/+3.9/+7.4/+10.7/+14.0/+17.0. Score stays 86.8.
Moved marker/origin counts are 0/46/92/138/184/230. At 25%, 229.75 attempt
equivalents include the faded boundary diamond. Zero restores identical marker HTML.

All five LeBron seasons loaded in both views with 156 map cells. Newest to oldest
shot counts: 919/1268/1268/1219/1221; scores: 86.8/88.5/88.8/86.3/88.3.
Map position, size, and fill attributes remain unchanged as the slider moves;
the active inspection outline can change when the pointer crosses an area.
Keyboard area inspection and the five fixed numeric bins remain available.

Wembanyama stays at 22.5% actual movement for a 25% request, 243 markers,
+184 points and score 87.0. His committed allocation confirms final share 0.5.
Chris Paul 2024-25 retains 581 shots (249 makes, 332 misses), a 156-cell map,
and hidden unavailable gains/score. His 2025-26 transition explains 56 eligible
shots across 16 games; reset returns LeBron/2025-26/zero.
A deliberate Jokić selection persisted into 2024-25.

The existing server's 600ms player delay exercised overlapping requests:
Luka selection at 05:07:59.598 UTC, Jokić selection at 05:07:59.888 UTC.
Only Jokić remained displayed. Accent/punctuation matching found Luka Dončić from
`LuKa... don-cic` and Nikola Jokić from `nikola jokic`.
Logs from 05:06:45 show one root manifest, catalog, active index, and default
LeBron payload. Typing `wEMB` fetched nothing; selection requested only
Wembanyama's file at 05:06:54.725. No complete-bundle download occurred.

### Popup mapping and navigation at that stage

| Inline term | Action | Exact target |
| --- | --- | --- |
| Shot relocation | See full definition | definition-relocation |
| Shots to Move | See full definition | definition-shots-to-move |
| Estimate from One Area | See full definition | definition-one-area |
| Make-chance map | See how the model works | method-shooting-chances |
| Area with Evidence for Moving Shots | See how the model works | method-receiving-areas |
| Extra Points in selected season | See the formula | formula-season-gain |
| Estimated Range (90%) | See the formula | formula-range |
| Extra Points per 100 Shots | See the formula | formula-per-100 |
| Shot Selection Score | See the formula | formula-score |

All nine actions reached their headings, opened the correct native disclosure,
and removed the popup. Reused dynamic terms keep the same targets across slider
and season updates. Dedicated copy spans prevent result updates from deleting
the buttons. Distinct popup/entry ID namespaces fix a collision found in testing;
the rendered document has no duplicate IDs.

Buttons retain Enter/Space activation. Tab moves from trigger to action;
Shift+Tab returns. Escape closes the panel and returns focus from its action.
Outside clicks close it. Target headings have programmatic focus and a visible
outline without joining the normal tab order. Actions carry target relationships.
Browser Back restores the originating term and preserves player, season, slider
and results; a final per-100 test returned with LeBron, 25%, and +157 points.
Fragments link exact entries. A fragment guard prevents ordinary section navigation
from restoring an unrelated origin.

Hover now covers trigger and panel with a 200ms transit allowance, and a hovering
term cannot steal a different popup's keyboard focus. Free-pointer hover/transit
was reviewed in code but NOT exercised with an unpressed mouse: the browser API
offers no free pointer-move action. This needs Narayan's manual check.
Mobile click activation is touch-style, not a physical-device touch test.

### Build, preservation, and visual limits

Final build passed at 01:14:18 local time: six pages, 3.05 seconds. Only existing
empty-blog warnings appeared. There is no separate test script in the package.
The final console check caught a false-valued missing origin reaching an element
method. A type guard fixed it before push. A fresh tab then loaded LeBron/zero
with all references closed and no console errors or warnings. Back and direct
formula-link checks also passed with no new errors after the fix.

1440px desktop, exact 375px mobile and 720×500 reflow showed no horizontal
overflow, clipped popup buttons, overlapping controls or formula overflow.
The 720px check represents 200%-equivalent reflow, not native browser zoom.
Screen-reader speech and physical touch were not tested.
Green text measures 7.52:1 on cream and 5.01:1 on sand.
The one-area label changed from rust to green to fix its 3.72:1 sand contrast.
Shape keys and numeric map labels supplement color; origin rings remain faint
secondary marks. Mobile needs scrolling from controls to court, as specified by B.

Exact comparisons against recovered `7433871` confirm unchanged shot/cell rendering
loops, court-line geometry, purpose paragraph, fourteen limitations, variable key,
and all seven equation lines. Tracked public assets show no diff. No analytics,
models, data, legacy bundles, prototypes or production branch changed.
The interface-review skill informed DOM/focus/contrast checks; the writing skill
kept new guidance concise. A reusable dynamic-popup observation was logged outside
the repository for later skill review; no skill was changed.

### Screenshots and approval

[Complete visual gallery](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/review.md)

- [Desktop, recorded shots at 0%](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/desktop-0.jpg)
- [Desktop, relocated shots at 25%](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/desktop-25.jpg)
- [375px, controls before the court](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/mobile-controls-25.jpg)
- [375px, relocated court](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/mobile-court-25.jpg)
- [375px, historical court](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/mobile-court-0.jpg)
- [Map explanation and fixed legend](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/make-chance-map.jpg)
- [Popup with See full definition](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/popup-definition.jpg)
- [Opened and focused definition](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/focused-definition.jpg)
- [Popup with See the formula](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/popup-formula.jpg)
- [Opened and focused formula](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/focused-formula.jpg)
- [Mobile popup](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/mobile-popup.jpg)
- [Mobile focused definition](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/mobile-focused-definition.jpg)
- [200%-equivalent reflow](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/reflow-focused-formula.jpg)
- [Concise limitations](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/limitations.jpg)
- [Notice ending and three closed references](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-option-b-detail-navigation-review/limitations-and-closed-references.jpg)

These are viewport captures, not stitched full-page images. The mobile controls
and court appear in separate frames of the same shared component. Narayan should
review Option B, popup hover transit and detail navigation before approving any
merge or deployment. No new dependency, deployment, pull request or main push
was authorized or performed.

## Final refinements and quality review, 11 September 2026

### Recovery and changes

Recovered branch `codex/nba-plain-language-copy` at `a9922ef`, with local commits
`cc0c4da` and `6f6623b` retained. The three preceding documentation changes were
preserved. Direct remote inspection confirmed feature `7433871` and main
`c1e39fc`, matching their local remote-tracking references. Local main remains
`c1e39fc`. The existing preview server on 4323 was reused.

`494f78e` changes the default definition action and the two explicit explorer
labels to **See all definitions**. All three actions keep their exact destination;
the four formula actions and two methodology actions retain their specific labels.
No navigation or chart JavaScript changed in these refinements.

`67b7934` groups each formula variable and definition in one semantic definition-list
row. Desktop keeps consistent left and right columns with CSS dotted leaders.
At widths through 40rem, each term sits above its meaning with a row separator.
Decorative leader spans have `aria-hidden="true"`. All 14 entries retain their
original order and wording; all seven equation lines remain byte-identical.
The rest of the project write-up is byte-identical to recovered `a9922ef`.

### Focused verification

All nine routes passed activation, popup closure, correct disclosure opening,
exact fragment, heading focus, and browser Back:

| Term | Action | Target |
| --- | --- | --- |
| Shot relocation | See all definitions | definition-relocation |
| Shots to Move | See all definitions | definition-shots-to-move |
| Estimate from One Area | See all definitions | definition-one-area |
| Make-chance map | See how the model works | method-shooting-chances |
| Area with Evidence for Moving Shots | See how the model works | method-receiving-areas |
| Extra Points in selected season | See the formula | formula-season-gain |
| Estimated Range (90%) | See the formula | formula-range |
| Extra Points per 100 Shots | See the formula | formula-per-100 |
| Shot Selection Score | See the formula | formula-score |

Focused headings sit about 24 pixels below the viewport top with a visible outline.
Back restores the originating term and preserves the selected player and slider.
Enter and Space activate buttons. Tab reaches the action, Shift+Tab returns to
the trigger, and Escape closes the popup and restores trigger focus. The mobile
Shots to Move route also passed at 375 pixels with LeBron's 25% value preserved.

At 1440×1000 every desktop definition starts at the same horizontal coordinate.
At exact 375×812 the meanings occupy one consistent full-width inset below their
terms. At 720×500 every definition remains aligned and no row overflows.
All three sizes have no horizontal document overflow. The accessibility snapshot
lists 14 terms followed by their definitions and omits the decorative leaders.
There are no duplicate IDs. The 720-pixel check represents 200%-equivalent reflow,
not native zoom. Screen-reader speech, physical touch, and free-pointer hover
transit remain hands-on checks, not claimed passes.

LeBron at 25% still shows +157 points, 129–183, +17.0 per 100, and score 86.8.
Returning to zero restores identical historical marker markup and zero season gain.
Wembanyama still shows 22.5% movement, +184 points, 156–211, +17.1 per 100, and
score 87.0. The broader season, cap, unavailable-player, and network/race tests
recorded above were reused, not rerun in full. No data-loading code changed.

The final source build passed at 01:30:31 local time, six pages in 2.93 seconds.
It used the approved existing-font network path and added no dependency.
Warnings concern the existing empty blog collection. There is no separate package
test script. Browser error/warning logs contain no new entries during the focused
checks after 05:27 UTC. Source comparison and `git diff --check` passed.

### Review, screenshots, and approval

The private assessment in `nba-project-quality-review.md` rates the project 7.5/10.
It separates observed checks from subjective judgments and documents five ranked
improvements. None is implemented by this session. The interface-review skill
guided row alignment and reflow checks; the writing skill guided the assessment.

[Final screenshot gallery](/Users/narayanlekhi/.codex/visualizations/2026/09/05/01a06fff-1e92-7d90-89cf-0a912c4ba691/nba-final-key-quality-review/review.md)

The gallery contains the new popup, focused definition, desktop/mobile variable
keys, half-width reflow, desktop court, and separate phone controls/court frames.
Earlier screenshots and prototypes remain preserved. These are viewport captures.

Narayan authorized local implementation and documentation commits, but no push.
Review the final preview and complete the hands-on checks before granting further
approval. Main, analytics, all data exports, dependencies, and hosting are unchanged.
The untracked prototype and 2,309-byte layout test retain their recorded hashes
and are excluded from every commit.

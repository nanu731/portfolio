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

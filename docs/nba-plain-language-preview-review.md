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
- Native methodology and nested formula disclosures opened with the keyboard and
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

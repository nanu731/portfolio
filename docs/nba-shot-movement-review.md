# Shot movement: review-only implementation

Verified locally on 29 September 2026. No merge or deployment is authorized.

## Scope and provenance

Portfolio branch: `codex/location-relocation-flow`, based on verified local and
GitHub main `182226096eeb25f4f6fe785e341c301d23f07cba`. The starting checkout was
the separate research branch `ff140a4`; its commits remain there and are not
part of this feature branch. Implementation commit: `ef01478`.

Analytics HEAD and GitHub both matched
`2800b9971ac5bc310f59d804fd0aa0c184f4be19` before implementation. The authority is
`docs/LOCATION_RELOCATION_FLOW_CONTRACT.md` in the analytics repository. The
portfolio v4 manifest and all inventoried payload hashes match that contract.

The repository instructions name Netlify while this task mentions Vercel. This
work does not settle the hosting discrepancy or inspect/change hosting settings.
Only the isolated feature branch may be pushed; no merge, manual deployment or
production-branch push forms part of this task.

## Contract and interface

The existing view selector now offers Shot locations, Make-chance map and Shot
movement. The first two views retain their rendering logic and behavior.

Shot movement derives 156 ordered cell records from the selected loaded payload.
For moved mass M and saved source order r, removal is `min(1,max(0,M-r+1))`,
summed by original cell. Additions use the selected slider's saved `added_share`
times total attempts. Null source order means zero removal. No make/miss field,
illustrative destination coordinate, probability reranking, new score or gain
calculation enters the derivation. No transport matrix or cell-to-cell route exists.

The result retains availability, reason, request, actual mass and per-cell removed
and added attempt-equivalents. All arithmetic uses unrounded values. Display
formatting uses 15 significant digits to suppress binary tails. The guard rejects
invalid values, duplicated orders/destinations, unsupported receivers, cap
violations and imbalance exceeding `1e-12 * max(1, observed_attempts)`.

At 0%, the view asks readers to move the slider. Positive settings show rust
removal bubbles, a moved-total readout and cyan addition bubbles. Radius is
`17 * sqrt(cell mass / largest mass across both courts)`, so circle area shares
one scale for the active selection. The scale recalculates between selections.
The desktop courts sit side by side with the total below; mobile follows source,
total, destination reading order. There are no arrows, connecting lines or animation.

Native radio controls retain arrow-key selection and visible focus. Named court
images describe player, season, total and affected-area count. A native disclosure
lists nonzero cell totals and position bounds for readers who cannot use the
graphic. Bubbles add no tab stops. The total uses a polite live status. Unavailable
estimates retain the existing explanation and null results, not zero-gain claims.

## Checks performed

- `node scripts/verify-relocation-flow.mjs`: all 1,507 player-seasons and 9,042
  slider cases passed across five seasons. This includes 5,433 fractional cases
  and 1,290 unavailable-player slider cases. Maximum source/destination difference
  was `1.7053025658242404e-13` attempts. All v4 inventory hashes matched.
- Synthetic checks passed for fractional and court boundaries, one/multiple
  destinations, missing/nonfinite mass, corrupted totals, unsupported cells,
  duplicate destinations and cap violations. Changing outcomes and marker
  destinations or reversing input rows leaves aggregate output unchanged. Input
  payloads, scores and gains remain byte-identical in memory.
- `npm run build`: six pages succeeded. Only the existing empty-blog notices
  appeared. No dependency or package configuration changed.
- Chrome production-build review covered all five LeBron seasons and all six
  settings: 30 cases passed, with no overflow or error state. Radius-squared/mass
  ratios agree across both courts within floating-point precision.
- LeBron at 25%: 229.75 moved attempts and two receiving areas; score 86.8,
  +157 season points and +17.0 per 100 remain unchanged.
- Wembanyama at 25%: 243 moved attempts, one receiving area, 22.5% actual share,
  unchanged cap explanation, score 87.0 and +184 points.
- Chris Paul 2024-25 retains insufficient evidence, hidden scores/gains and zero
  flow bubbles. Chris Paul 2025-26 retains its ineligible-season explanation;
  Carmelo Anthony 2025-26 retains no-recorded-shots. Reset returns to LeBron,
  2025-26, Shot locations, 0%. Player/season changes clear flow state.
- A 1,200ms delayed Wembanyama response followed 391ms later by a LeBron request
  left only LeBron visible. Rapid season changes also retained the newest season.
- An isolated test-server response with an altered destination share triggered
  the existing alert/retry treatment and hid charts/results. Retry with unchanged
  data recovered. No checked-in data or server behavior changed.
- The initial production-page request log contains exactly four data requests:
  manifest, catalog, season index and selected player. Typing, changing views and
  slider movement left the count at four. Selecting Wembanyama added only his
  payload. There is no new export or data request; the helper bundles into the
  existing explorer script.
- Keyboard radio selection, focus outlines, native disclosure activation,
  accessible image names and text lists passed. No per-bubble focus stops exist.
  Desktop 1440px, exact 375px mobile and 720px reflow (1440px at 200%-equivalent
  width) had no horizontal overflow. Console warning/error inspection was empty.
- Shot-chart and map markup stayed identical when switching away and back at
  the same setting. Static comparison confirms unchanged renderers, player
  validator, fetch/request guards, search, map navigation and unavailable-state
  methods. Definitions, project prose, global styles and data files are unchanged.

## Review assets and limitations

Local production-build review: `http://127.0.0.1:4325/projects/nba-shot-selection-analytics/`.
The temporary server, request log, response-test controls and browser-check summary
are outside the repository at `/tmp/shot-movement-review.RVg5HB/`. Test corruption
and delay are now disabled. The separate development server uses port 4324.

Screenshots remain outside the production tree under
`/Users/narayanlekhi/.codex/visualizations/2026/08/30/01a0519f-bb03-7b51-9f32-4ca49cfedf35/shot-movement-review/`:
`desktop-zero.png`, `desktop-positive.png`, `mobile-zero.png`,
`mobile-positive.png`, `wembanyama-single.png`, `insufficient.png`,
`all-view-controls.png`, and `reflow-720.png`.

Native browser 200% zoom was not established through the available controls;
the 720px reflow check is an equivalent-width check, not a native-zoom claim.
Physical-device touch and screen-reader speech remain manual review items.
Small source bubbles can be difficult to compare; the shared area scale is
truthful, and the text disclosure provides exact values.

The pre-existing unavailable-season court placeholder still says Loading after
the correct no-analysis status appears. It contains no prior-player flow or
numeric result. This task preserved the existing views instead of repairing that
separate placeholder issue. No live-site verification or deployment occurred.

## Protected work and next decision

Analytics, model fits, posterior draws, scores, gains, v1-v4 exports, Context M1,
M3, 2026-27, hosting configuration and main are unchanged. No dependency, export,
private artifact or shot-level record was added. Existing untracked prototype,
layout test, notes, skill observations and temporary work remain uncommitted.

Narayan must review the screenshots and authorize merging the reviewed feature
branch and its associated production deployment separately. Nothing in this
record grants either approval. Use the existing integration and plain-language
review documents for unchanged release history.

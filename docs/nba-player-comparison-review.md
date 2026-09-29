# Two-player Location comparison: review and release

Verified 29 September 2026. Branch `codex/location-player-comparison` starts from
main `80844ab17342de59c3334f2328dcb96ed2e93201`. Implementation: `4c20c23`.
Narayan approved one page route and exact per-attempt-to-per-100 display conversion.
The initial task excluded merge and deployment; Narayan then approved release.
Refer to the Shot movement review record
and analytics Location flow contract for unchanged data and model history.

## Scope and contract

Page: `/projects/nba-player-comparison/`. The single-player explorer links to it;
the comparison page links back. No API, data endpoint or export was added.

| Display | Verified v4 source | Display operation |
|---|---|---|
| Current expected points per 100 | `baseline_expected_points_per_attempt` | Multiply mean and both 90% bounds by 100 |
| Expected points per 100 after relocation | selected `relocated_expected_points_per_attempt` | Same exact unit conversion |
| Improvement per 100 | selected `gain_per_100` | No calculation |
| Shot-selection score | `score` | No calculation |
| Requested and actual relocation | selected slider request, actual share and attempt-equivalents | Format saved values |
| Evidence and availability | saved evidence status and availability reason | Existing labels and explanations |

Null relocation estimates, bounds and scores remain unavailable, including at 0%.
The verified baseline remains visible for eligible players with insufficient
relocation evidence. A missing or ineligible player-season has no metrics or
substituted player. Display formatting happens after conversion; no probability,
gain, score, head-to-head estimate, ranking or winner is calculated.

## Implementation

The page renders two instances of the existing explorer. Comparison-only hooks
namespace IDs and radio groups, defer Player B, share immutable request promises,
reject duplicate selections and apply shared controls. Catalog and season-index
validators, normalized search, evidence copy and court renderers are reused.
Shared fetches outlive a slot cancellation; existing request tokens discard stale
responses. Failed requests leave the cache so the existing retry can recover.

Defaults are 2025-26, LeBron in A, B unselected, Shot locations and 0%. Changing
either player or season resets both sliders to 0%, retaining the shared view.
Reset restores all defaults. Players persist by identity across seasons.

Desktop places players side by side; mobile stacks A before B. Court geometry,
shot-marker sizing and make-chance colors are shared. Movement circles use one
area scale across both players' source/destination courts for the active request.
The scale changes with selection. Marginal flow totals never imply cell-to-cell
routes. Existing definition popovers retain their explanations; full-definition
links lead to the canonical single-player page.

## Verification

- Production build passed: seven pages, only the existing empty-blog notices.
- `verify-player-comparison.mjs` checked all 1,507 player-seasons and 9,042 slider
  records, exact conversions, interval order, null preservation, unchanged inputs,
  manifest/inventory hashes, shared concurrent requests, cache reuse and retry.
  There are 1,290 unavailable slider records. No private artifacts were needed.
- The existing flow verifier passed all 9,042 cases. No public v4 bytes changed.
- Chrome production-build testing covered 90 combinations: five seasons, six
  slider settings and three shared views. No alerts, invalid values or overflow.
  Wembanyama remains unavailable in seasons with no recorded shots.
- LeBron at 25% retains score 86.8, gain +17.0 per 100 and 229.75 moved attempts.
  Wembanyama retains score 87.0, gain +17.1 per 100, 243 attempts, one receiving
  area and 22.5% actual movement. These are display checks, not new findings.
- Chris Paul's 2024-25 baseline remains visible; after-relocation estimates,
  gains, scores and ranges remain unavailable in all three views. His ineligible
  2025-26 state hides metrics and stale flow. Reset and duplicate rejection passed.
- Reset during a deliberate 1,200ms Wembanyama delay left B unselected after the
  old response arrived. Rapid season changes retained the latest season. The
  temporary delay fixture was restored; no production server setting changed.
- Request logging recorded four initial data requests: manifest, catalog, active
  index and LeBron. Typing fetched nothing. Selecting Wembanyama added one payload;
  all 18 slider/view combinations added none. A fresh session covering all five
  seasons recorded 15 distinct requests, each once. B is not fetched until chosen.
- Normalized keyboard search, arrow-key view selection, visible focus, unique
  IDs, named courts, zero marker focus stops and area summaries passed. Bubble
  radius-squared/mass ratios shared a scale within floating-point precision.
- All three views passed explicit 375px, 720px and 1440px viewport checks without
  horizontal overflow. The 720px check represents half-width/200%-equivalent
  reflow, not a verified native browser zoom setting. Console warnings/errors were empty.
- Single-player browser checks retained score 86.8, +157 season points and all
  three views. Source comparisons confirmed unchanged shot/map renderers, map
  navigation, qualified/insufficient handling, and slider gain/score calculations.

## Review assets and limits

Local built preview: `http://127.0.0.1:4325/projects/nba-player-comparison/`.
Screenshots remain outside the repository at
`/Users/narayanlekhi/.codex/visualizations/2026/08/30/01a0519f-bb03-7b51-9f32-4ca49cfedf35/player-comparison-review/`:
`desktop-locations.png`, `desktop-movement.png`, `desktop-map.png`,
`desktop-unavailable.png`, `mobile-default.png`, `mobile-movement.png`.

Mobile requires scrolling between player panels. Native 200% zoom, physical-device
touch and screen-reader speech remain manual review items. The inherited
unavailable-season Loading placeholder remains unchanged; no prior numeric
estimate or chart replaces the unavailable state. No hosting configuration,
dependency, analytics code, model, export, main commit or unrelated file changed.
No production deployment occurred during the feature task. Provider-created
feature previews, if any, were not production release approval.

## Approved release: 29 September 2026

Reviewed feature `5b4208e87382db2767c22f36b6e8dc41ba35caf2` matched the local and
remote feature refs. Local and remote main started at
`80844ab17342de59c3334f2328dcb96ed2e93201`. The tracked tree and index were clean;
the seven-file diff contained the reviewed implementation and documentation only.
Both full-payload verifiers and the seven-page production build passed again.

Merge `5a56fa9ce3cc22e8e3bfe8e1074a1756105c3f69` reached GitHub main. GitHub's
Vercel status reported success for that exact commit. No manual deployment ran.
Both domains returned HTTP 200 for home, comparison and single-player pages;
the apex redirected to www. Those six responses matched the local build, as did
the six comparison assets referenced in its HTML and 15 sampled public data files.

Live Chrome checks confirmed LeBron/unselected defaults, normalized keyboard
search, all five seasons, 18 slider/view combinations in 2025-26, zero movement,
LeBron's two receiving areas and Wembanyama's single capped area. Chris Paul's
2024-25 missing relocation estimates stayed unavailable while his baseline
remained visible; his 2025-26 ineligible state hid stale metrics. Duplicate-player
rejection, reset, rapid season changes and visible keyboard focus passed.
All three views had no horizontal overflow at 375, 720 and 1440 pixels. No
application console errors or warnings appeared. The single-player explorer kept
its three views and LeBron's +157 points and 229.75 moved-attempt display.

Live resource inventories added no data paths during subsequent view/slider
checks. This inventory does not count repeat requests to an existing path; the
byte-identical script retains the recorded pre-release request-count tests.
The initial comparison request returned 404 while Vercel was still building;
it returned the verified page after deployment succeeded.

Native 200% zoom, physical touch and screen-reader speech remain unverified.
The known unavailable-season Loading wording remains unchanged. No analytics,
export, dependency, hosting setting or preserved untracked file changed.
Further features or limitation fixes require separate authorization.

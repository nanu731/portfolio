# Portfolio site status

Snapshot for a reader new to the site. Updated 11 October 2026.

## UI refinement released on both hosts

Narayan approved release on 11 October 2026. The merge and push to production
succeeded. Both www.nslanalytics.com and nlekhi.netlify.app serve the reviewed
UI. All seven pages, ten referenced assets, fifteen sampled data files and three
metadata feeds match the verified build. Browser security headers match on both
hosts; HTTPS and the custom apex redirects pass. The hosting dashboards were
not inspected for this release.

Live Chromium checks passed at 1440 and 1920 pixels and 375-pixel mobile.
Keyboard search, shared controls, reset, season persistence, capped and
unavailable estimates, court alignment and selector order passed. The 320-pixel
enlarged-text check passed. Vercel logged no console errors. Netlify logged two
policy blocks inside its Powered by Netlify badge iframe; the portfolio had no
application errors.

## Eight UI repairs complete

Narayan reviewed and trusted both project hooks and approved comparison
regrouping. The released site now fixes the range help name, home project row,
search dismissal, unavailable court text, enlarged-text header, shared control
identifiers, desktop court alignment and mobile selector order. Each completed
repair has its own commit and matched desktop/mobile views. Both selectors now
appear ahead of mobile results; desktop courts share intrinsic row sizing.

The confirmation pass covered both explorers across all five seasons, six
relocation settings and three court views at desktop and mobile sizes: 360
rendered states. Actual viewports measured 1440 by 1000 and 375 by 812. Focused
Chromium, Firefox and WebKit checks passed for the repaired behaviors, keyboard
focus, court inspection, help dismissal, duplicate rejection, season persistence,
reset, capped estimates and unavailable estimates. All six routes passed reflow
at 320 and 375 pixels with root text doubled. That test enlarges text; it does
not establish native browser zoom behavior.

The six-route final capture confirmed reduced-motion preference with no active
animations or transitions. Chrome's ordinary application checks had no console
errors or policy violations. Fonts, scripts and selected data requests succeeded.
Firefox logged warnings from the unchanged font-preload and help code. The local
production-header preview matched both hosts' policies; generated hashes passed
on all seven pages. Negative checks blocked an unhashed script and event handler.

The production build passed. The website dependency audit reports zero known
vulnerabilities. Existing empty-blog, policy-scope and syntax-highlighting
warnings remain. Public data, analytical calculations, factual copy, analytics,
dependencies and hosting policies remain unchanged. Development tooling stays
outside published output. Product and design records capture the supplied facts
and existing visual system; reproducible checks and traces accompany the work.

Footer polish remains deferred. Physical touch, assistive-technology speech,
native browser zoom, slow-network races and low-end performance remain
unverified. The release and live-host checks above complete the authorized UI
repairs.

## Selector width correction after visual review

The proposed desktop comparison had narrow search fields and excess wrapping
in their guidance. The released correction restores both fields to their player
column widths. Mobile grouping, wording and chart behavior stay intact. Focused
Chromium, Firefox and WebKit checks pass; intermediate widths and doubled-text
reflow pass. The production build and generated policy hashes pass. The correction
is live with the other UI repairs.

Two optional visual follow-ups remain: spacing between adjacent figure-caption
parts and a green footer that reaches the viewport bottom on short pages. Both
were checked during local review. Neither has been implemented.

## Approved desktop comparison complete

The comparison now uses 1200 pixels of content at the two checked desktop widths,
1440 and 1920 pixels. Each court grows from 432 to 528 pixels. The left gutter
and gap between players remain 40 pixels, and introductory prose keeps its
previous width. Player guidance stays on one line when the desktop space allows.

The desktop spacing pass removes repeated gaps above the courts. In the matched
LeBron/Curry view the courts appear 120 pixels earlier and remain aligned.
Mobile selector order and geometry remain unchanged. Other pages, factual copy,
fonts, colors, analytical data and behavior remain unchanged.

Focused Chromium, Firefox and WebKit checks passed at both desktop sizes and
375-pixel mobile. Additional checks covered 60 combinations of desktop width,
evidence state and court view, including positive relocation, plus 14 normal
and enlarged-text reflow cases. Empty, supported, insufficient-evidence and
unavailable courts remain aligned. The production build and all seven pages'
policy hashes passed; the final layout scan found no findings.

The approved width and spacing changes have separate commits and matched views.
The wider candidate and single-explorer widening remain deferred, as do optional
footer and caption improvements. Narayan approved release; both public hosts
now serve the approved result.

## Released security repairs

The reviewed security release now serves through Vercel at www.nslanalytics.com
and through Netlify at nlekhi.netlify.app. The earlier security release included the five
approved security changes and excluded design tooling, prototypes and layout-test
content. The current UI release includes the reviewed design tools in Git; they
stay outside the published site, along with prototypes and layout-test content.
The security push succeeded. Vercel reported a successful security deployment;
public responses establish the Netlify result, whose dashboard remains inaccessible.

The clean dependency installation and production build pass. The dependency audit
reports zero known vulnerabilities. Both hosts return the intended matching browser
security headers, and each page carries its generated script policy. HTTPS redirects
and browser HTTPS enforcement remain intact. The custom apex redirects to www.
All canonical metadata, sitemap and RSS use the corrected custom address.

All seven public pages match the verified build on each host. Nine referenced
scripts, stylesheets and fonts, fifteen sampled data files and three metadata feeds
match too. Sensitive environment and development paths remain unavailable. The
release contains no application, analytics, data, content or layout change.

Both explorers passed all ninety combinations of five seasons, six slider settings
and three views on each host. Player selection, capped estimates, keyboard controls,
help popups, comparison reset and unavailable estimates passed. Chrome confirmed
actual desktop dimensions of 1440 by 1000 and mobile dimensions of 375 by 812.
Neither page overflowed horizontally or produced application console errors or
policy violations during these checks. At that release, the unavailable-season placeholder retained Loading; no
release regression required rollback. The UI release above now fixes that
wording on both hosts.

Chrome blocked the local framing test. The browser client blocked the injected
script fixture before loading, so that attempt does not prove policy enforcement.
Static checks confirm permitted script hashes and blocked script attributes. The
build retains its empty-blog, policy-scope and syntax-highlighting warnings; the
style-attribute exception preserves existing formatting.

GitHub confirms that Narayan's account is the only portfolio collaborator. All
three account-settings pages require sign-in. MFA, hosting access, project and
shared environment settings, preview access, plans, alerts and spending controls
remain unverified. Sign in yourself and identify which account tabs are ready.
The deployment is complete; the security audit remains open until those settings
receive inspection. No account, authentication or billing setting changed.

All 85 recorded untracked files in the original checkout retain their hashes and
remain outside the release. The worktree preserves the security release record
without changing the user's working branch.

## Released two-player comparison

A separate NBA comparison page now pairs two existing player explorers. It opens
with LeBron in the first slot and the second slot empty. One season, relocation
slider and court-view selector control both players. Duplicate selections are
blocked, and player or season changes reset movement to zero.

Each player has current and relocated expected points per 100, improvement,
score, model ranges and evidence status. The only new numeric operation converts
verified per-attempt summaries to per-100 units. Missing estimates remain
unavailable. The page makes no head-to-head probability or talent claim.

Build, full-payload tests, selective network loading, keyboard controls, all
season/slider/view combinations, desktop, 375-pixel mobile and half-width reflow
checks passed. The original explorer retains its calculations and court views,
with one added link to the comparison. Native zoom, screen-reader speech and
physical touch still need manual review. At that release, unavailable-season
text retained Loading. The UI release above now fixes it on both hosts. Narayan
approved that comparison release. The merge and push succeeded, and
Vercel reported a successful automatic deployment. Both nslanalytics.com and its
www address serve the comparison; the apex redirects to www.

Live checks passed for all five seasons, all six slider settings across three
views in 2025-26, LeBron and Wembanyama, unavailable estimates, duplicate-player
rejection, reset, rapid season changes and keyboard focus. Desktop, 375-pixel
mobile and half-width reflow had no horizontal overflow or application console
errors. The home, comparison and single-player pages matched the verified build
byte-for-byte, as did referenced comparison assets and 15 sampled public data
files. The live resource inventory showed no added flow-data path; the unchanged
script retains the earlier request-count verification. No analytics, data,
dependencies or hosting settings changed.

## Released Shot movement view

The NBA explorer now has a third view live on nslanalytics.com and its www address.
Shot movement shows areas
losing attempts in rust and receiving areas in cyan, with the total moved volume
between them in mobile reading order. The desktop courts sit side by side.
At zero movement, a short explanation asks readers to use the slider. The existing
shot-location and make-chance views remain intact.

The view uses the already-loaded player data and preserves fractional attempts.
It does not match individual source shots to destinations or recalculate scores
and gains. A readable list supplies each area's amount; the court markers do not
create extra keyboard stops. Invalid totals show an error and retry option.

Checks passed across five seasons and all six slider settings, including LeBron,
Wembanyama's capped single-area case, unavailable estimates, reset and rapid
selection changes. Mobile at 375 pixels and half-width reflow had no horizontal
overflow. The build passed, console checks were clean, and switching views or
moving the slider added no data requests. Native zoom, physical-device touch and
screen-reader speech still need manual review.

Narayan approved the reviewed feature for release. The merge and push succeeded,
and GitHub reported a successful Vercel deployment. The apex address redirects
to www. Both domains served the verified page, script, stylesheets and fonts.
Fifteen sampled live data files matched the committed data. Live checks covered
all 30 LeBron season-and-slider combinations, Wembanyama, unavailable states,
reset, rapid changes and keyboard controls. Desktop and 375-pixel mobile had no
horizontal overflow or application console errors. The live resource inventory
showed no new flow-data route; the unchanged script passed the earlier request
count check. Analytics, exports, dependencies and hosting settings remain unchanged.

That earlier release retained the unavailable-season Loading wording. The UI
release above now fixes it on both hosts. The two-player comparison has since
been released, as recorded above.

## Earlier public release record

The September release check found the approved plain-language NBA redesign live
on the Netlify address. This task did not recheck the live site or hosting. Narayan
authorized the feature push, production merge, and automatic deployment in chat.
The push and merge succeeded. Public fetches confirmed the new release about a
minute after the merge. No hosting settings changed or manual deployment ran.

The shared explorer presents three steps: Choose what to see, Set the change,
and Read the court. Desktop places controls beside one court. Mobile places
controls before the court. Shot locations opens at zero movement; Make-chance
map retains its fixed scale and area inspection. Positive movement adds cyan
hypothetical locations and faint origin rings. Requested and achieved movement
remain separate, and the explanation says cyan does not mean a guaranteed make.

Contextual help opens the matching definition, method explanation, or formula
with keyboard focus. Browser Back retains the selection. Definitions, How the
model works, and Formulas start closed beneath fourteen limitations. Fourteen
variable-and-meaning pairs precede seven equations. Desktop uses aligned rows
with dotted leaders; mobile stacks each pair.

## Earlier release checks

The successful production build was reused because the source had not changed.
It built six pages and reported only the existing empty-blog warnings. No
dependency was added. Public main content, referenced scripts, styles, fonts,
the data manifest, the player catalog, all five season indexes, and representative
player files matched the verified build and committed data byte-for-byte.
This sampled live data check did not fetch every player payload.

Live checks confirmed the LeBron James, 2025-26, zero-movement starting state;
all five LeBron seasons in both views; all six slider settings; normalized search;
keyboard selection; player persistence across seasons; and reset. The zero setting
restored identical historical markers. Each map contained 156 cells. Typing added
no data request, and selecting Wembanyama added only his player file. The browser
inventory and earlier request log confirm selective loading, not a full-bundle
download; the inventory alone cannot count repeated requests to the same address.

LeBron's 2025-26 score remains 86.8. At 25%, he shows +157 points, a 129–183
range, and +17.0 per 100 shots. Wembanyama moves 22.5% at a 25% request, shows
+184 points and score 87.0, and reaches the unchanged 50% receiving-area cap.
Chris Paul's 2024-25 unavailable estimates remain hidden while his map is usable.

Live definition, method, and formula actions opened and focused the exact entry;
Back retained the slider value. Keyboard popup dismissal passed. Desktop and
375-pixel mobile checks found no horizontal overflow or application console
warnings or errors. Earlier half-width reflow checks remain valid for the unchanged
source. The phone court remains dense. Netlify's floating badge can overlay the
bottom of a screenshot; readers can scroll the page to reveal the covered text.

## Remaining limitations and next decision

At that release, Chris Paul's 2025-26 selection explained that 56 shots in
16 games fail eligibility, but its empty court retained Loading. The authorized
UI repair now finishes the court text with the existing reason and preserves
unavailable values. The repair has passed local and live browser checks and
serves on both hosts.

Free-pointer hover transit, native 200% zoom, physical-device touch, and
screen-reader speech remain untested. Browser clicks approximate touch, and the
earlier half-width viewport approximates zoom reflow. The available GitHub checks
did not expose Netlify build details; live content and file hashes establish the
deployment result, not a dashboard build duration or deployment identifier.

The private quality review remains a proposal for follow-up work. Its priorities
include a verified findings story, dense mobile charts, and hands-on accessibility
testing. Release approval did not authorize those recommendations.

Analytics, models, calculations, all statistical exports, prototypes, and the
pre-existing layout test remain unchanged. Both untracked artifacts retain their
recorded hashes and remain excluded from commits. The older narayanlekhi.com
registration question was not rechecked. The current nslanalytics.com addresses
were verified for the Shot movement release above; no domain configuration changed.

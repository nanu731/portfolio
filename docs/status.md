# Portfolio site status

Snapshot for a reader new to the site. Updated 29 September 2026.

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

The unavailable-season Loading wording remains an unchanged limitation. Player
comparison needs separate authorization and has not begun.

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

One unavailable-season edge case needs a follow-up: Chris Paul's 2025-26 selection
explains that 56 shots in 16 games fail eligibility, but the empty court still says
Loading. No previous player's chart or numerical result appears. Reset works.
This release verification found and recorded the placeholder issue; it did not
change the approved interface. Narayan can authorize a narrow repair separately.

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

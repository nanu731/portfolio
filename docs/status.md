# Portfolio site status

Snapshot for a reader new to the site. Updated 11 September 2026.

## Public site

The deployed five-season explorer has not changed during this preview session.
Local and GitHub production branches still point to the combined-view release.
The public page retains its earlier wording; the last live fetch on 11 September
preceded this implementation. This session did not deploy or change hosting.

## Private review preview

Narayan approved Follow the change. The shared explorer now presents three steps:
Choose what to see, Set the change, and Read the court. The controls sit beside
one large court on desktop. Mobile puts those controls before the court in the
document's reading order.

The two views are Shot locations and Make-chance map. Zero movement shows recorded
makes as green circles and misses as rust crosses. Positive movement adds cyan
hypothetical locations and faint origin rings; a faded diamond represents a
partial attempt when needed. Requested and achieved movement stay separate.
The map retains its fixed numeric scale, evidence diamonds, and individual-area
inspection. Its guide explains that the slider changes scoring estimates, not ability.

Highlighted terms retain short explanations. Nine contextual buttons now open an
exact definition, method explanation, or formula. Each action closes its popup,
opens the correct reference, and puts visible keyboard focus on the matching
heading. Browser Back returns to the term without resetting the player or slider.
Dynamic explanations retain their buttons when the displayed numbers change.
The three definition actions now say See all definitions; formula and method
actions keep their specific labels. They still open the matching entry.

The three-sentence purpose paragraph and fourteen concise limitations remain
unchanged. Definitions, How the model works, and Formulas follow the limitations
as separate, initially closed dropdowns. Direct links to detailed entries open
their containing dropdown. The variable key still precedes seven unchanged
equations, including the verified cell point value and missing-value conventions.
Each of its fourteen terms now pairs with its meaning in one aligned row, with
dotted leaders on desktop and separated stacked pairs on mobile. The wording
and equations did not change.

## Verification

The final production build passed on 11 September. Its warnings concern the
existing empty blog collection; no dependency was added.

The preceding Option B checks covered LeBron in all five seasons and both views, all six slider
settings, Wembanyama's capped one-area result, and Chris Paul's missing estimates.
Normalized search, player persistence, an unavailable season, reset, and overlapping
player requests retained their behavior. Typing made no request; selecting a
player fetched that player's file. The catalog loaded once per page load.
The final refinement check repeated all nine reference routes, exact focus and
Back, keyboard order, mobile definition navigation, both reference players, and
the revised key at desktop, phone, and half-width sizes. It did not repeat the
entire season or network suite; the loading and chart code did not change.

LeBron's score remains 86.8 in 2025-26. At 25%, he shows +157 points, a 129–183
range, and +17.0 per 100 shots. Zero restores the identical historical markers.
Wembanyama still moves 22.5% at a 25% request and reaches the 50% receiving cap.
Chris Paul's unavailable gains remain hidden while his 581 recorded shots and
156-cell map remain accessible in 2024-25.

Desktop, exact 375-pixel mobile, and half-width reflow checks found no horizontal
overflow. Keyboard and click checks passed for popup actions, exact destination
focus, Escape, outside dismissal, and Back. The console contained no application
errors. The one-area label now has sufficient text contrast on the sand surface.

Free-pointer hover/transit still needs a manual check. The implementation keeps
both popup surfaces active and allows a short transit interval; the available
browser controls did not expose free pointer movement. Mobile clicks approximate
touch, and the reflow check approximates 200% zoom with a half-width viewport.
Physical-device touch, screen-reader speech, and native browser zoom were not tested.

## Approval and preserved work

The preview awaits Narayan's final visual approval, including the popup hover
check. It has not been merged or deployed. Review screenshots cover historical
and relocated courts, mobile controls, the map, popup actions, focused targets,
and the limitations with closed references.

The implementation and review notes have local commits. Narayan's latest request
authorized those commits and withheld permission to push. Nothing from this
session has been pushed, merged, or deployed. The preview needs visual approval;
a feature-branch push and any later merge or deployment need explicit approval.

The private quality review rates the current project 7.5 out of 10 against a
polished sports-analytics portfolio. Its strongest parts are the concrete question,
inspectable assumptions, uncertainty, and working explorer. The largest remaining
gaps are a concise verified findings story, dense mobile charts, and hands-on
accessibility testing. Recommendations remain proposals, not approved changes.

All statistical data, analytics code, shot geometry, calculations, legacy exports,
prototypes, and the pre-existing layout test remain unchanged. The data bundle
still loads selected files rather than downloading every player.

The custom domain remains an earlier unresolved issue; this session did not
recheck its registration or change hosting configuration.

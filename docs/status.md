# Portfolio site status

Snapshot for a reader new to the site. Updated 11 September 2026.

## Public site

The approved plain-language NBA redesign is live on the Netlify address. Narayan
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

## Verified release checks

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
recorded hashes and remain excluded from commits. The custom-domain issue remains
outside this release; its registration was not rechecked.

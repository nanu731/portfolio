# Portfolio site status

Snapshot for a reader new to the site. Updated 10 September 2026.

## Public site

The public NBA page still uses the deployed five-season explorer and its earlier wording.
A live-page request on 10 September returned the earlier Modeled Ability label and no
new methodology disclosure. The deployed branch has not changed during this preview work.

The explorer opens with LeBron James in 2025-26. Readers can choose all five seasons,
keep a selected player across available seasons, and reset after an unavailable season.
Before & After shows past shots at 0% and hypothetical moved shots above 0%.
Cyan diamonds mark possible new locations, and faint rings mark the originals.

## Private review preview

The approved plain-language proposal now has a working local preview.
It starts with the basketball question, two explanatory sentences, and short instructions.
The season and player controls lead to the court, slider, points estimates, and score.
The desktop slider sits beside the court so readers can watch shots move.
The three result measures sit below them. Mobile uses one column.

The preview calls the ability view Shooting Map. Its Best Shooting Areas help explains
that colors show chances of making shots, while outlined diamonds mark areas that pass
the relocation rules. The two labels remain subject to Narayan's wording review.

Shots to Move, Extra Points in the selected season, Extra Points per 100 Shots,
Estimated Range (90%), and Estimate from One Area replace the technical labels.
Requested and achieved movement remain separate. The page explains what each number
means and keeps the real-game limitations beside the results.

Highlighted terms open short explanations through mouse hover, keyboard focus, or
click and tap-style selection. Escape and outside clicks close them. Only one opens
at a time. The visible Definitions section repeats the essential meanings.
How the model works is the final section and starts closed. Its formulas have a
second disclosure. Readers do not need to open either to understand the limitations.

This preview awaits visual and wording approval. It has not been merged or deployed.

## Verified in this session

The production build passed. Its warnings concern the existing empty blog collection.
No dependency was added. The built page passed local browser checks for LeBron in all
five seasons, player persistence, both court views, every slider setting, normalized
search, unavailable seasons, reset, and delayed rapid player selections.

LeBron's 2025-26 score remains 86.8. At 25%, the page shows +157 points, a range of
129 to 183, and +17.0 points per 100 shots. At zero, gains return to zero and the
historical marker sequence returns unchanged. Wembanyama's one-area estimate still
moves 22.5% at a 25% request and finishes at the 50% receiving-area limit.
Chris Paul's unavailable relocation estimates stay hidden while his shots and map
remain accessible.

Local request records showed one catalog load per page load, no player-file requests
from typing, and a request for each selected player. A simulated connection failure
produced the retry message and recovered when the connection returned.
The final browser console contained no warnings or application errors.

Desktop, exact 375-pixel mobile, and 200%-equivalent reflow checks found no horizontal
overflow. Keyboard, pointer, definition placement, focus indicators, and disclosure
checks passed. The visual review corrected invisible Definitions headings before
the final screenshots. Physical-device and screen-reader speech testing were not performed.

## Preserved work and limits

The analytics repository and all statistical data remain unchanged. The preview keeps
all five seasons, the 50% cap, missing-result rules, numeric precision, and shot movement.
The older zone assets, all export versions, the prototype, and the pre-existing layout
test remain preserved and excluded from these changes.

These estimates do not establish that moving shots causes extra points. They omit
defensive response, shot creation, passing, fatigue, shot-clock pressure, and game context.
The static bundle remains large, but readers load selected files rather than the whole bundle.

The previous status recorded unresolved custom-domain registration. This session did
not recheck registration or change the hosting configuration. The Netlify address
remains the public address used for the live-page verification.

# Portfolio site status

Snapshot for a reader new to the site. Updated 11 September 2026.

## Public site

The public NBA page still uses the deployed five-season explorer and its earlier wording.
A live-page request on 11 September confirmed that the new limitations notice and
formula disclosure are absent. The deployed branch has not changed during this preview work.

The explorer opens with LeBron James in 2025-26. Readers can choose all five seasons,
keep a selected player across available seasons, and reset after an unavailable season.
Before & After shows past shots at 0% and hypothetical moved shots above 0%.
Cyan diamonds mark possible new locations, and faint rings mark the originals.

## Private review preview

The approved plain-language proposal now has a working local preview.
It starts with the basketball question, a three-sentence purpose paragraph, and short instructions.
The paragraph connects shot location with scoring efficiency and describes a
theoretical scenario rather than a real-game prediction or coaching instruction.
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
at a time. Definitions retains all twelve approved terms with shorter explanations.

Important limitations remains visible after the results. Fourteen single-sentence
bullets replace the longer notice; thirteen contain fewer than eighteen words.
They cover limited control over shot opportunities, missing defensive and game
context, health and shot-creation factors, and potential optimism at higher volume.
It also explains court-cell simplification, project rules, historical-season scope,
missing estimates, within-model ranges, the self-relative score, one-area caution,
free-throw omissions, and the hypothetical markers. It rules out coaching and betting use.

Definitions, How the model works, and Formulas follow as three independent dropdowns,
all initially closed. The model explanation retains the method and testing history;
the detailed limitations now sit outside it. The formula introduction leads to a
complete variable key before seven bordered equations, then explains the input values.
Equations use selectable mathematical text and plain-English interpretations.

The formula notes explain the verified point-value convention: 2 plus the player's
share of three-point attempts in each cell. They distinguish average gains from the
median of scores limited to 0–100, and explain the feasible 25% score scenario.

This preview awaits visual and wording approval. It has not been merged or deployed.

Three court-clarity mockups now accompany the preview: a compact court-side guide,
a numbered walkthrough, and a paired historical/relocated comparison. Each has
desktop and mobile shot-chart and ability-map examples using LeBron's real 25%
result. The compact guide is the recommendation because it keeps one large court
and requires the smallest change. Narayan has not selected an option.
These isolated mockups do not replace the working explorer.

## Verification record

The latest production build passed after shortening the limitations notice.
Its warnings concern the existing empty blog collection.
No dependency was added. Earlier checks of the same explorer covered LeBron in all
five seasons, player persistence, both court views, every slider setting, normalized
search, unavailable seasons, reset, and delayed rapid player selections.

The latest copy-only check repeated LeBron and Wembanyama's results, reference
disclosure keyboard and click behavior, initial collapsed states, and desktop,
375-pixel, and half-width reflow measurements. Typing made no data request;
selecting Wembanyama requested his player file and no other player file.

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
checks passed. The revised formula blocks and variable key fit at all three widths.
All three independent disclosures passed click, Enter, and Space checks with native
expanded-state announcements. Inline help retained keyboard focus, activation, Escape,
outside dismissal, and mobile click behavior. Its pointer-hover implementation is
unchanged from the prior verified preview. Physical-device and screen-reader speech
testing were not performed. The reflow check uses a half-width viewport rather than
changing the browser's zoom setting.

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

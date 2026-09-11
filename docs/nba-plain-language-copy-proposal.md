# NBA page: plain-language copy proposal

Historical proposal, superseded by the approved Option B implementation and its
release record. Narayan's direct authorization resolved the earlier permission
rejection; the approved redesign deployed on 11 September 2026. The content below records
the original copy proposal, not the current implementation or approval boundary.
Prepared 10 September 2026 against portfolio `c1e39fc` and analytics `23b52b1`.

This document recommends one version. Sections 1–5 contain the proposed visitor copy
and interaction specification. Sections 6–8 record the inventory, evidence, and review.
Braces identify values supplied by the existing export or current selection. They are
not text to display. All example player numbers below come from verified v4 files.

## 1. Recommended page order and complete main copy

Keep the existing site navigation, identity, footer, chart geometry, colors, data, and
calculations. The order below describes a future implementation, not a change made by
this document. Move the technical metadata into the final methodology disclosure.
Do not move or rewrite other project pages when implementing this proposal.

### 1.1 Title

How many more points could an NBA player score by shifting shots toward their strongest areas?

### 1.2 Two-sentence explanation

This project uses a player's past shots to estimate where they score more points per attempt.
It estimates how many extra points they could score by moving some shots from weaker areas to stronger ones.

### 1.3 How to use it

Choose a season and player. Move the slider to compare their past shots with a possible new shot mix.

**Shot relocation** means changing where some shots happen while keeping the same total number of attempts.

### 1.4 Season and player

| Element | Recommended copy |
| --- | --- |
| Season label | Season |
| Season options, in this order | 2025–26; 2024–25; 2023–24; 2022–23; 2021–22 |
| Player label | Search player |
| Player placeholder | Search players in {season} |
| Search help | Open the list or type a name. Accents and punctuation are optional. |
| List accessible name | Players in {season} |

Preserve original player names and the current search rules. Preserve the initial
LeBron James / 2025–26 / 0% selection. Changing player or season starts at 0%.
Keep the selected player across seasons when their analysis exists; use section 4
when it does not. Typing alone does not replace the displayed player.

### 1.5 Court views

Control group: **Court view**

Choices: **Before & After** and **Shooting Map**.

Use “Shooting Map” instead of “Best Shooting Areas.” The existing colors show estimated
make probability across the whole court. A dark cell does not, by itself, pass the
relocation rules or account for the difference between two and three points.
The Shooting Map help trigger belongs beside the selected view's heading, outside
the radio label, so asking for help does not switch views.

#### Before & After at 0%

Court heading: **Before: past shots**

Player heading: `{player_name}`

Season: `{season}`

Court summary:

> {attempts} shots: {makes} made and {misses} missed. No shots have moved.

Legend: **Made shot** · **Missed shot**

Caption:

> {player_name}, {season}. Green circles show made shots. Rust crosses show missed shots.

Keep relocated-shot and origin legend entries hidden at 0%.

#### Before & After above 0%

Court heading: **After: possible shot locations**

Court summary:

> You asked to move up to {requested_percent}% of shots. This estimate moves {actual_percent}%.

Legend: **Made shot** · **Missed shot** · **Moved shot** · **Original location**

Caption:

> {player_name}, {season}. Cyan diamonds show possible new locations. Faint rings show where those shots started.
> A faded diamond represents part of a shot in the calculation. Cyan does not mean the shot goes in.

Retain colors for unmoved historical shots. The calculation chooses movements from
modeled location value; it does not select individual misses to erase. Changing the
slider updates this court without another click. Returning to 0% restores the same
historical markers. The existing marker sequence illustrates the relocation plan;
do not describe individual diamonds as predictions of actual future attempts.

#### Shooting Map

Court heading: **Estimated chance of making a shot**

Explanation:

> Darker areas mean a higher estimated chance of making a shot. The same color scale applies to each player and season.
> Outlined diamonds mark areas with enough evidence to receive moved shots. Shot value also matters: threes are worth more than twos.

Legend heading: **Estimated chance of a make**

Legend: **Below 30%** · **30–40%** · **40–50%** · **50–60%** · **60% and above**

Diamond legend entry: **Area with evidence for moving shots**

Inspection instruction:

> Point to or tap an area for details. With the court focused, use the arrow keys.

Selected-area template:

> Area {cell_id}: {make_percent}% estimated chance of a make. Estimated range (90%): {low_percent}% to {high_percent}%.
> {area_attempts} recorded {shot_word}. {support_sentence}

`{shot_word}` is “shot” for one and “shots” otherwise. `{support_sentence}` is exactly
“This area passes the rules for receiving moved shots.” or “This area does not pass the rules for receiving moved shots.”
Passing the rules does not mean an area has remaining room below the 50% cap.

Caption:

> {player_name}, {season}. Estimated shooting chances across 156 court areas. Outlined diamonds mark areas that pass the evidence rules.

Keep the chosen slider value when switching views. Show this help beside the map:

> The slider changes the points estimate. It does not change this shooting map.

### 1.6 Slider and results

Results heading: **Estimated extra points**

Order: slider and requested/actual amounts, points over the selected season's shot
volume, points per 100 shots, then score. This makes the basketball question the first
result and leaves the score as supporting context. Keep all three intervals visible.

| Element | Recommended copy |
| --- | --- |
| Slider label | Shots to Move |
| Slider help | Choose the largest share of shots you want to move, from 0% to 25%. |
| Slider output | Up to {requested_percent}% |
| Amount achieved | {actual_percent}% moved in this estimate |
| Existing attempt-equivalent count | Equal to {moved_attempts} shots in the calculation |
| Count explanation | The calculation allows part of a shot, so this count can include a decimal. |
| Season metric | Extra Points in {season} |
| Season value | {signed_season_gain} points |
| Season helper | Over the same {attempts} recorded shots. This is not a forecast of a future season. |
| Per-100 metric | Extra Points per 100 Shots |
| Per-100 value | {signed_per_100_gain} points |
| Per-100 helper | The estimated difference for every 100 attempts. |
| Score label | Shot Selection Score |
| Score value | {score} / 100 |
| Score helper | Compares the past shot mix with the scenario that asks to move up to 25%. Higher means less estimated room to improve. |
| Score qualification | This score is not a league ranking or a rating of the whole player. It stays fixed as you move the slider. |
| Interval label for all metrics | Estimated Range (90%) |
| Interval value | {lower} to {upper} |
| Interval helper, once beside the first result range | The middle 90% of estimates within this model. Real games can differ for reasons the model does not include. |

Preserve existing rounding: score and per-100 values/bounds to one decimal; season
points/bounds to whole points; actual share to one decimal; moved-shot equivalents
to two decimals. Preserve a minus sign if an interval or result is negative. “Extra
points” may be negative; explain that as fewer estimated points if such a value appears.
Do not manufacture a value for an unavailable result.

For an available estimate at 0%, display `0 points`, `0.0 points`, and zero gain
ranges. The score and its range continue to describe the scenario at the 25% request.
An unavailable estimate remains unavailable at 0%; it does not become a score or gain of zero.

### 1.7 Visible limitation beside results

> These estimates assume the player can get the new shots and keep the same shooting ability.
> They do not show that moving shots would cause extra points in a real game.

Keep this qualification visible beside results, including while the model section
is closed. Keep the cyan-marker caveat beside the relocated chart. Put the complete
list of missing game factors in the final methodology section.

## 2. Complete visible Definitions section

Heading: **Definitions**

These entries remain visible without opening a popover or the methodology section.
Their headings need no additional bold help triggers; the definition follows each one.

### Shot relocation

Moving some attempts to different court areas while keeping the total number of shots unchanged.
The model starts with the weakest estimated scoring areas. A shot's made-or-missed result does not decide whether it moves.

### Shots to Move

Your slider setting is the most the model may move. At 25%, that means up to 25 of every 100 shots.
The amount moved can be smaller if suitable source shots run out or receiving areas reach their limits.
The displayed moved count can include part of a shot because the model works with shares of the player's attempts.

### Extra Points in the Selected Season

The estimated difference in points over the same number of recorded shots in that season.
For example, LeBron's 2025–26 result at 25% shows +157 points across 919 attempts.
That compares two modeled shot mixes; it does not add points to his official season total or predict his next season.

### Extra Points per 100 Shots

The estimated difference for every 100 attempts, whatever the player's season shot count.
LeBron's 2025–26 result at 25% shows +17.0 points per 100 shots.
Both points measures describe the same change at different scales. A negative value would mean fewer estimated points.

### Shot Selection Score

This 0–100 score compares the player's past shot mix with the allowed scenario at the 25% request.
A score of 90 means the past mix produces about 90% of the estimated points per shot in that scenario.
Higher scores mean less estimated room to improve through this particular change in locations.
The score does not rank players or rate their overall offense. It stays fixed when you change the slider.
The calculation reports the middle score across its possible shooting estimates, rather than the average score.

### Estimated Range (90%)

This range contains the middle 90% of the model's estimates, given its data and assumptions.
For LeBron's +157-point example, the displayed range is 129 to 183 points.
A wider range means more uncertainty within the model. The range does not cover all the ways real games could differ.
It is not a promise that future results will fall inside it.

### Estimate from One Area

One area passes the evidence rules for receiving moved shots. The estimate sends the moved shots to that area.
It stops adding shots there at 50% of the player's total attempts, or sooner if suitable source shots run out.
This label describes the number of receiving areas; it does not mean the player has no other basketball strengths.
If the area already holds at least half the attempts, there is no room to add shots and no points estimate appears.

### Shooting Map

The colors show the estimated chance of making a shot from each court area, including areas with few or no attempts.
Nearby areas help the model estimate shooting chances where shots are sparse.
A darker area does not qualify on color alone. The relocation test also considers shot value and evidence.
The colors describe chances of making shots, not expected points or guaranteed makes.

### Area with Evidence for Moving Shots

The player took at least 10 shots in this area during the selected season.
Under the model, the area has at least a 90% chance of producing more points per attempt than the player's past mix.
An outlined diamond marks this evidence. The 50% limit determines whether the area can receive any more attempts.

### No Clear Area for Moving Shots

No area passes both evidence rules. You can view the player's past shots and shooting map, but no relocation estimate appears.
This does not prove the player's shot choices were ideal or that no change could help.

### No Room to Move More Shots

The areas that pass the evidence rules have no remaining room under the 50% limit.
The chart stays available, but the model supplies no score or extra-points estimate.

### Estimated Points per Shot

The model combines the chance of making a shot with its two-point or three-point value.
It uses the player's mix of shot values within each area. This is how it compares scoring locations.

## 3. Future accessible help popovers

This is a specification, not an implemented control. Highlight the first important
occurrence of each term listed below. Use a visible help button beside a control or
metric label; do not nest it inside a radio label or replace a form label with a button.
Keep later mentions plain. Do not bold whole paragraphs.

On desktop hover or keyboard focus, show the short definition. Keep it readable while
the pointer rests on the trigger or panel. Click, tap, Enter, or Space pins the panel
open; activating again closes it. Escape or an outside click closes it. Escape must
not reopen it until the visitor leaves and returns to the trigger. Use no timeout.

Use a native button with `aria-expanded` and `aria-controls`. Keep focus on its trigger
when it opens; connect the explanation through `aria-describedby`. Use a nonmodal
disclosure with text only, no focus trap. An outside click keeps focus at its target;
Escape preserves focus on the help button. Only one panel opens at a time. At narrow
widths, keep the panel within the viewport and clear of the number or control it explains.
These are future acceptance requirements, not a claim of completed accessibility testing.

This behavior follows the [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
and the [hover/focus content guidance](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).
Visible Definitions provide the same meanings without requiring discovery of help controls.

| Term and first important placement | Exact short popover copy | Accessible button name |
| --- | --- | --- |
| Shot relocation; after How to use it | Moving some shots to different court areas while keeping the same total attempts. The model chooses locations without picking individual shots because they were misses. | Explain shot relocation |
| Shots to Move; slider label | Your {requested_percent}% setting allows up to {requested_percent} of every 100 shots to move. The amount moved can be lower because suitable shots or room in receiving areas can run out. | Explain Shots to Move |
| Extra Points in {season}; first points metric | The model estimates {signed_season_gain} extra points over the same {attempts} recorded shots in {season}. This compares possible shot mixes, not a future season forecast. | Explain Extra Points in {season} |
| Extra Points per 100 Shots; second points metric | The model estimates {signed_per_100_gain} extra points for every 100 attempts at this slider setting. This puts players with different shot counts on the same scale. | Explain Extra Points per 100 Shots |
| Estimated Range (90%); first result range | For {metric_name}, {lower} to {upper} covers the middle 90% of this model's estimates. It does not include every uncertainty in a real game. | Explain Estimated Range for {metric_name} |
| Shot Selection Score; score label | A score of {score} means the past mix produces about {score}% of the estimated points per shot in the 25%-request scenario. Higher means less estimated room to improve; this is not a league rank or overall player rating. | Explain Shot Selection Score |
| Estimate from One Area; result status outside the search list | One area passes the evidence rules for receiving moved shots. It cannot receive more shots once it reaches half the player's total attempts. | Explain Estimate from One Area |
| Shooting Map; selected map heading | Each color shows the estimated chance of making a shot in that area. Outlined diamonds mark areas that pass the rules for receiving moved shots. | Explain Shooting Map |
| Area with Evidence for Moving Shots; first diamond legend | The area has at least 10 recorded attempts and at least 90% model probability of beating the player's past points per shot. An outlined diamond marks it; the 50% limit may leave no room to add shots. | Explain areas with evidence for moving shots |

“Shots to Move” replaces Maximum Relocated Share; “Extra Points in {season}” replaces
Season Gain; “Estimated Range (90%)” replaces 90% Interval and the suggested Likely
Range; “Shooting Map” replaces Modeled Ability and the suggested Best Shooting Areas;
“Area with Evidence for Moving Shots” replaces Supported Destination. These aliases
are review notes, not extra visitor labels. “Estimate from One Area” replaces
Single-Destination Estimate without changing its evidence status.

Screen-reader contract:

- A help button exposes its name, button role, and expanded/collapsed state. Its description is the corresponding text above.
- Do not announce a whole panel twice through both its description and a live region.
- Announce loading and court summaries politely. Announce a genuine loading failure once as an alert.
- Use “percent” and “to” when reading percentages and range boundaries. Read a positive sign as “plus” and a negative sign as “minus.”
- Slider accessible value: “Up to {requested_percent} percent requested; {actual_percent} percent moved in this estimate.”
- A metric value reads as “{metric_name}: {value} {unit}. Estimated range, 90 percent: {lower} to {upper} {unit}.”
- Score reads as “Shot Selection Score: {score} out of 100. Estimated range, 90 percent: {low} to {high}. Uses the 25 percent request.”
- Preserve native radio selected states and keyboard behavior. Announce the chart summary, not individual shot markers.
- Before SVG title: “{player_name}, {season}: past shot locations.” Description: “{attempts} shots. Green circles show makes. Rust crosses show misses. No shots have moved.”
- After SVG title: “{player_name}, {season}: possible shot locations.” Description: “Up to {requested_percent} percent requested; {actual_percent} percent moved. Cyan diamonds show possible new locations; rings mark origins. Other markers keep their recorded outcomes.”
- Map SVG title: “{player_name}, {season}: estimated shooting chances.” Description: “156 court areas. Darker colors mean higher estimated chances of a make. Outlined diamonds mark areas that pass the evidence rules. Use arrow keys to inspect areas.”

## 4. Dynamic, empty, and error copy

Use the existing state and availability fields. Do not infer a missing season from a
failed request, or infer an ideal shot mix from a missing gain. Preserve a selected
player's name when their season is unavailable. Keep score and gains unavailable
where the export contains null. The word “null” is for documentation, not the visitor.

| State / trigger | Exact recommended copy |
| --- | --- |
| Initial catalog loading | Loading seasons and players… |
| Season index loading | Loading players for {season}… |
| Short court loading text | Loading chart… |
| Player loading | Loading {player_name}, {season}… |
| Player loaded | {player_name}, {season}, loaded. |
| Empty initial player heading, SVG title, or result | Choose a player |
| Initial court help | Choose a player to see their shots. |
| Initial mode label / cleared chart label | Player chart |
| No search matches | No players found |
| No-match help | Try another name or season. |
| One match announcement | 1 player matches in {season}. |
| Other match counts | {match_count} players match in {season}. |
| Full list announcement | {player_count} players in {season}. Type to narrow the list. |
| Search suffix, insufficient evidence | {player_name} (no clear area for moving shots) |
| Search suffix, one destination | {player_name} (one area passes the evidence rules) |
| Search result, multiple destinations | {player_name} |
| One-destination result heading | Estimate from One Area |
| One-destination result explanation | One area passes the evidence rules. The model can add shots there until it reaches half the player's total attempts. |
| Multiple-destination explanation, where a support count is displayed | {destination_count} areas pass the evidence rules for receiving moved shots. |
| No supported destinations heading | No Clear Area for Moving Shots |
| No supported destinations body | No area passes both evidence rules for {player_name} in {season}. You can view past shots and the Shooting Map, but no score or extra-points estimate is available. |
| No positive capacity heading | No Room to Move More Shots |
| No positive capacity body | The area that passes the evidence rules already holds at least half of {player_name}'s attempts. The 50% limit leaves no room to add shots. Past shots and the Shooting Map remain available. No score or extra-points estimate is available. |
| No eligible weak source heading | No Weaker Source Areas |
| No eligible weak source body | No recorded shot area falls below {player_name}'s estimated points per shot across their past mix. The model has no suitable source shots to move, so no score or extra-points estimate is available. |
| Season unavailable heading | {player_name} · {season} |
| No recorded shots | This dataset has no recorded shots for {player_name} in {season}, so no chart is available. |
| Model-ineligible season | The dataset has {attempts} included shots across {games} games for {player_name} in {season}. This analysis requires at least 250 included shots and 20 games. {eligibility_reason} |
| Eligibility reason, games only | The player falls short of the game minimum. |
| Eligibility reason, shots only | The player falls short of the shot minimum. |
| Eligibility reason, both | The player falls short of both minimums. |
| Availability fallback for an eligible surface without support | A shooting map exists for {player_name} in {season}, but no area passes the rules for moving shots. |
| Unavailable status announcement | No analysis for {player_name} in {season}. Choose another player or season, or reset the explorer. |
| Unavailable chart caption | No chart is available for {player_name} in {season}. |
| Catalog failure | We couldn't load the seasons and players. Check your connection and try again. |
| Season failure | We couldn't load {season}. Try again. |
| Player failure | We couldn't load {player_name}'s chart for {season}. Try again. |
| Short court / result error | Chart unavailable |
| Retry button | Try again |
| Reset button | Reset to LeBron James, 2025–26 |
| Reset completion announcement | Reset complete. LeBron James, 2025–26. Before & After at 0%; no shots moved. |
| 0% historical state | {attempts} shots: {makes} made and {misses} missed. No shots have moved. |
| Positive relocation state | You asked to move up to {requested_percent}% of shots. This estimate moves {actual_percent}%. |
| Requested share exceeds achievable share | You asked for {requested_percent}%. The model can move {actual_percent}% before suitable source shots or receiving-area space runs out. |
| Wembanyama example, verified 2025–26, 25% request | You asked for 25%. The model can move 22.5%, equal to 243 shots, before the receiving area reaches 50%. |
| Future negative estimated gain | The model estimates {absolute_gain} fewer points {metric_scope}. |
| Missing metric label if the value slot is retained | Estimate unavailable |
| JavaScript unavailable | Turn on JavaScript to use the player search and shot charts. The explanations below remain available. |

Use the generic achievable-share reason unless the export establishes the binding
constraint. Never guess that a cap, lack of evidence, or missing source shots caused a
smaller amount. Keep two decimal places for the regular moved-count value; the verified
Wembanyama explanatory example uses the whole-shot count 243.

The one-area search suffix describes evidence, including the existing cases with no
remaining capacity. It must not promise an available estimate. The result panel then
states the exact capacity reason. No new evidence tier or threshold is proposed.

## 5. Final page section: How the model works

Use this exact disclosure label: **How the model works**. Start collapsed. Place it
after Definitions as the last project section, before the existing site footer.
Enter, Space, click, or tap opens and closes it. Use native disclosure semantics.
Put the following complete text inside, with the subheadings shown.

### Data and seasons

This project analyzes regular-season NBA field-goal attempts from 2021–22 through 2025–26.
Each season has its own analysis. The model does not combine a player's shots across seasons.
Players need at least 250 included attempts across 20 games in that season.
The analysis includes shots inside its half-court boundary and excludes shots beyond it.
The five seasons contain 1,507 player-season analyses. A player appearing in two seasons counts as two analyses.

### Estimating shooting chances

The court contains 156 areas, each about four feet across, with smaller areas at the edges.
The model uses made and missed shots to estimate each player's shooting chances across these areas.
Nearby areas help estimate chances where the player took few shots.

The Bayesian conditional autoregressive model estimates shooting chances by connecting court areas that share an edge.
It combines shot evidence with assumptions about nearby areas and keeps a range of plausible shooting chances.

Each player has their own shooting map. Players share how strongly the model smooths neighboring areas, not one common shooting pattern.
Limited shot samples leave uncertainty. The Bayesian approach tracks that uncertainty instead of treating a small sample's shooting percentage as exact.
An area with no recorded attempts can have an estimated shooting chance, but cannot pass the relocation evidence rule.

### Finding areas that can receive shots

An area needs at least 10 of the player's recorded attempts in that season.
It also needs at least 90% model probability of beating the player's past mix in expected points per attempt.
Expected points combine the chance of making a shot with its two-point or three-point value.
The calculation uses the player's observed mix of twos and threes within each area.
It compares the player with their own shot mix, rather than league-average shooting.

Zero, one, or several areas can pass. With zero, the model gives no relocation score or points estimate.
One area can support an estimate if it has room for more shots under the cap.
No receiving area can finish with more than 50% of the player's attempts after adding shots.
This limit does not remove historical shots from an area already above 50%; that area cannot receive more shots.

### Choosing which shots move

The calculation ranks occupied areas by their estimated points per attempt, from weakest to strongest.
It moves shots from areas below the player's past mix, starting with the weakest.
Made and missed shots help estimate shooting ability. An individual shot's outcome does not decide whether that shot moves.

The slider requests 0%, 5%, 10%, 15%, 20%, or 25% of attempts.
Movement stops at the request, when suitable source shots run out, or when receiving areas have no room.
The calculation permits part of a shot at the final boundary. A faded marker represents that part.

With several receiving areas, the initial split follows how often the player shot from those areas.
If one reaches 50%, the remaining moved shots go to other supported areas with room, using their existing usage proportions.
With one area, it receives the moved shots until its cap applies.
At least 75% of attempt volume stays in its historical locations at the largest request.
The same slider setting gives the same markers. Higher settings retain the shots already selected at lower settings.

### Estimating points and uncertainty

The calculation freezes the movement plan before testing it across 4,000 possible shooting-ability estimates from the fitted model.
It uses the same possible abilities for both the past and changed shot mixes in each comparison.
This gives estimated differences in points over the season's included shots and per 100 attempts.

The extra-points numbers are averages across those 4,000 comparisons.
The score uses the middle of the 4,000 scores, after limiting each score to 0–100.
Each displayed range runs from the fifth to the ninety-fifth percentile: the middle 90% of those values.
These ranges describe uncertainty within the model, not the full uncertainty of future games.
The points ranges do not simulate future makes and misses or changes in defensive response.

### How the model was tested

The 2025–26 comparison used separate groups of games for fitting, choosing court size, and the final test.
Shots from the same game stayed together. The final test used 39,212 shots from 246 games unseen during fitting or selection.
The selected model beat a simpler smooth-curve model on the predeclared test of shooting predictions.
The test found no clear disadvantage in how its predicted shooting chances matched observed make rates.
It found no clear uncertainty advantage for players with fewer shots.

After testing, the selected model used all included season shots for the published estimates.
The earlier four seasons reuse the same specification with separate fits. They do not repeat the model comparison.
Checks covered missing results, shot counts, repeatable movement, uncertainty ranges, and the 50% cap.
These checks test the calculation. They do not show that a player could create those new shots in a game.

### Limits in real games

These estimates assume the player can get the replacement shots and keep the same shooting ability after changing locations.
The model leaves out defensive response, shot creation, passing, fatigue, shot-clock pressure, and the game situation.
Players may take shots from an area only when conditions favor them. Taking more there could reduce their shooting percentage.
Field-goal records also miss part of the value of drawing free throws.
The ranges do not include all these missing effects. The project does not establish that moving shots causes extra points.

### Optional disclosure: The formulas

Keep this subsection collapsed inside How the model works.

For one possible shooting-ability estimate, let `B` mean estimated points per attempt
with the past shot mix. Let `A(s)` mean points per attempt after feasible movement at
slider request `s`. Let `N` be the number of included shots in the selected season.

- Extra points over the observed season: `N × (A(s) − B)`.
- Extra points per 100 shots: `100 × (A(s) − B)`.
- One score calculation: `100 × B / A(25%)`, limited to 0–100.
- Actual share moved: the smallest of the requested share, available weak-source share, and remaining receiving-area capacity.
- Receiving-area capacity: add up `max(0, 0.50 − past attempt share)` across areas that pass the evidence rules.

Calculate these values across 4,000 joint ability estimates. Show average gains,
the median of the limited scores, and the fifth-to-ninety-fifth-percentile ranges.
The score is a median of ratios; dividing two displayed averages does not reproduce it.
The 25% score request uses the achievable movement, which can be less than 25%.
Unavailable relocation keeps both the score and gains missing, including at 0%.

Method metadata, now inside this final disclosure:

- **Data:** Recorded NBA field-goal attempts in five separate regular seasons.
- **Approach:** Estimate shooting chances by location, then test a limited change in shot mix.
- **Seasons:** 2021–22 through 2025–26.
- **Analysis code:** [View the analysis on GitHub](https://github.com/nanu731/nba-shot-analytics).

## 6. Complete current-to-proposed inventory

This inventory covers project metadata, body paragraphs, controls, generated text,
accessibility descriptions, and shared page text. Repeated strings share a row.
Long current paragraphs are identified by their opening words and source section;
their complete replacements appear above. Source locations refer to the reviewed
`c1e39fc` files, not to changes authorized for this task.

### Static page and explorer copy

| Current copy / location | Proposed copy or disposition |
| --- | --- |
| Browser/index title: NBA Shot Selection Analytics | Keep this short project title; the approved question remains the visible main heading. |
| Description: A spatial model estimates player-specific shot value and tests capped relocation from weaker modeled locations. | See how changing shot locations could affect a player's estimated points across five NBA seasons. |
| Question / h1 | Keep the approved question exactly, section 1.1. |
| Dataset: Five season-specific player shooting surfaces on a 156-cell half-court grid | Data: Recorded NBA field-goal attempts in five separate regular seasons. Move to final disclosure. |
| Method: Bayesian CAR model with capped weak-location relocation | Approach: Estimate shooting chances by location, then test a limited change in shot mix. Move to final disclosure. |
| Seasons: 2021-22 through 2025-26 | Seasons: 2021–22 through 2025–26. Move metadata to final disclosure; retain selector. |
| Code / Repository | Analysis code / View the analysis on GitHub. Preserve URL. |
| The model | Replace early technical section with the two sentences and How to use it in sections 1.2–1.3. |
| Paragraph beginning “The production Bayesian conditional autoregressive model…” | Replace with section 5, Estimating shooting chances and Choosing which shots move. |
| Paragraph beginning “The calculation chooses source locations…” | Replace with section 5, Finding areas that can receive shots and Choosing which shots move. |
| What the numbers mean | Distribute into result helpers and Definitions, not another repeated explanatory band. |
| Paragraph beginning “The explorer reports posterior means…” | Replace with section 1.6 and section 5 uncertainty copy; gains use means, score uses median. |
| Paragraph beginning “The five season indexes contain 1,507…” | Keep count and its meaning in Data and seasons; explain unavailable results in section 4. |
| Limits / paragraph beginning “These are modeled, non-causal estimates…” | Visible limitation in 1.7 and complete Limits in real games in section 5. |
| Definitions | Keep heading; use the complete section 2. |
| Shot Selection Score / definition beginning “This 0–100 score…” | Section 2 score definition; preserve self-comparison and no league rank. |
| Maximum Relocated Share / definition beginning “A 25% setting…” | Shots to Move / section 2, including requested versus achieved and fractional counts. |
| Season Gain / definition beginning “A value of +157…” | Extra Points in the Selected Season / verified LeBron example in section 2. |
| Gain per 100 shots / definition beginning “A value of +17…” | Extra Points per 100 Shots / section 2. |
| 90% interval / definition beginning “A range such as 129–183…” | Estimated Range (90%) / section 2, with model-conditional meaning. |
| Single-destination estimate / definition beginning “Only one court cell…” | Estimate from One Area / section 2; include source exhaustion and capacity. |
| Supported destination / definition beginning “A supported destination…” | Area with Evidence for Moving Shots / section 2. |
| Interactive figure | Remove this redundant eyebrow in the proposed page. |
| Shot selection explorer | How to use it precedes the controls; remove this duplicate heading in the proposed page. |
| Choose a season and player to compare historical shots with a targeted relocation estimate and the modeled shooting surface. | Choose a season and player. Move the slider to compare their past shots with a possible new shot mix. |
| Season / five season options | Keep wording and order. |
| Search player / Search players in {season} | Keep wording; add search help from 1.4. |
| Player suggestions | Players in {season}. |
| Court view | Keep. |
| Before & After | Keep. |
| Modeled ability | Shooting Map. |
| Estimated make probability / Player analysis | Player chart during loading; Estimated chance of making a shot in map view. |
| Choose a player / Choose a player. | Keep where selection is required. |
| Choose a player to inspect the court. | Choose a player to see their shots. |
| Initial SVG description beginning “A half-court heatmap with 156 cells…” | Use a neutral empty/loading description until loaded, then the view-specific descriptions in section 3. |
| Estimated make probability legend | Estimated chance of a make. |
| Below 30%; 30–40%; 40–50%; 50–60%; 60% and above | Keep bins and numeric boundaries. |
| Supported relocation destination | Area with Evidence for Moving Shots. |
| Shot-chart legend | Shot chart key. |
| Historical make / Historical miss | Made shot / Missed shot. |
| Hypothetically relocated / Original location | Moved shot / Original location. Keep caveat and marker shapes. |
| Player result | Estimated extra points; unavailable panels retain their specific headings. |
| Shot Selection Score | Keep label; add “/ 100” to the same existing number. |
| Self-relative score based on the feasible result at the 25% request. | Score helper and qualification in 1.6. |
| Maximum relocated share | Shots to Move. |
| 0% requested / {percent}% requested | Up to {requested_percent}%. |
| {actual}% actual · {count} attempt-equivalents | {actual_percent}% moved in this estimate. Equal to {moved_attempts} shots in the calculation. |
| Slider endpoint 0% / 25% | Keep. |
| Season gain / Gain per 100 shots | Extra Points in {season} / Extra Points per 100 Shots. |
| {signed_value} points | Keep existing numeric value, sign, unit, and rounding. |
| 90% interval {low}–{high}, score/season/per-100 | Estimated Range (90%): {lower} to {upper}. |
| Insufficient evidence / Analysis unavailable | Specific state headings and explanations in section 4. |
| Reset to LeBron James — 2025–26 | Reset to LeBron James, 2025–26. |
| Disclaimer beginning “These modeled estimates use past shots…” | Visible qualification 1.7, marker warning 1.5, and full limitations in section 5. |
| The player explorer needs JavaScript to load a selected player. | Turn on JavaScript to use the player search and shot charts. The explanations below remain available. |
| Fig 1 | Keep figure number. |
| {player_name}, {season}. | Keep player/season caption prefix. |
| Modeled make probability across a fixed 156-cell half-court grid. | View-specific captions in 1.5; empty state reads Choose a player. |

### Generated text and states

| Current string / template | Proposed template reference or exact replacement |
| --- | --- |
| Loading season catalog… | Loading seasons and players… |
| Loading {season}… / Loading player… | Loading chart… in the short court slot. |
| Loading {season} players… | Loading players for {season}… |
| Loading {player_name}… | Loading {player_name}, {season}… |
| {player_name} loaded. | {player_name}, {season}, loaded. |
| Selected player fallback | Keep Selected player when no catalog name exists; do not invent a name. |
| The season catalog could not be loaded. Check the connection and try again. | Catalog failure in section 4. |
| {season} could not be loaded. Try again. | Season failure in section 4. |
| {player_name} could not be loaded. Try again. | Player failure in section 4. |
| Try again | Keep. |
| Player unavailable | Chart unavailable. |
| 1 player matches. / {count} players match. | Season-aware match announcements in section 4. |
| {count} players shown for {season}. Type to filter the list. | {player_count} players in {season}. Type to narrow the list. |
| No players found | Keep; add Try another name or season. |
| {name} (single-destination estimate) | {player_name} (one area passes the evidence rules). |
| {name} (insufficient evidence for relocation) | {player_name} (no clear area for moving shots). |
| {name}, multiple-destination suggestion | Keep player name without a suffix. |
| Before · historical shots | Before: past shots. |
| After · targeted estimate | After: possible shot locations. |
| Modeled ability · production CAR | Estimated chance of making a shot. |
| SVG title: {player}, {season}: estimated make probability by court cell | Map title in section 3. |
| SVG title: {player}, {season}: historical before shot locations | Before title in section 3. |
| SVG title: {player}, {season}: after shot locations at {percent}% requested relocation | After title in section 3, with percentages in its description. |
| SVG description beginning “Historical before state for…” | Before description in section 3. |
| SVG description beginning “Targeted relocation estimate at…” | After description in section 3. |
| SVG description beginning “A half-court heatmap with 156 cells…” | Map description in section 3. |
| Detail beginning “Historical before state at 0% requested relocation…” | 0% summary in 1.5; retain outcome-independence explanation in Definitions and methodology. |
| Detail beginning “{percent}% requested relocation; {actual}% actual relocation equals…” | Positive summary in 1.5; moved-count explanation in 1.6. |
| Caption beginning “Historical before state at 0% requested relocation…” | Before caption in 1.5. |
| Caption beginning “Targeted relocation estimate at {percent}% requested…” | After caption in 1.5. |
| Caption beginning “Modeled make probability across a fixed 156-cell half-court grid; outlined diamonds…” | Map caption in 1.5. |
| Move over, tap, or focus the court and use arrow keys to inspect a cell. | Point to or tap an area for details. With the court focused, use the arrow keys. |
| Cell {id}: {p}% estimated make probability; 90% interval {low}%–{high}%; {n} observed attempt(s). | Complete selected-area template in 1.5. |
| Supported relocation destination. / Not a supported relocation destination. | The two support sentences in 1.5. |
| Single-destination estimate, result note | Estimate from One Area. |
| No relocation capacity / explanation beginning “One location passed…” | No Room to Move More Shots / capacity explanation in section 4. |
| No eligible source shots / explanation beginning “Supported destinations exist…” | No Weaker Source Areas / source explanation in section 4. |
| Insufficient evidence / explanation beginning “No destination passed both…” | No Clear Area for Moving Shots / evidence explanation in section 4. |
| {player} · {season}, unavailable heading | Keep. |
| The source data contains no recorded shots for {player} in {season}, so no player analysis is available. | No-recorded-shots explanation in section 4; limit the claim to this dataset. |
| Explanation beginning “The source data records {attempts} in-play attempts…” | Model-ineligible explanation and exact threshold reason in section 4. |
| the 20-game threshold / the 250-attempt threshold / the 20-game and 250-attempt thresholds | Explicit minimums plus the three eligibility-reason templates in section 4. |
| {player} has an eligible modeled surface for {season}, but no destination passed the relocation evidence rule. | Availability fallback in section 4. |
| No chart is available for this player-season. | No chart is available for {player_name} in {season}. |
| {player} has no analysis available for {season}. Search for another player or reset the explorer. | Unavailable status in section 4. |
| Slider spoken value: {percent} percent requested | Slider accessible value in section 3, including achieved amount. |
| No separate reset completion message | Reset completion announcement in section 4; replaces the ordinary loaded announcement for that action. |

Internal validation exceptions, such as “Player payload does not match the versioned
contract,” are developer diagnostics. The component catches data failures and displays
the contextual loading-failure messages inventoried above. Retain diagnostics; do not
expose schema versions, JSON, or contract language to visitors. Do not claim that a
connection is the sole possible cause of failure.

### Shared text retained

“Narayan Lekhi,” “Home,” “Projects,” “Blog,” “About,” “Narayan Lekhi on GitHub,” and
“© {year} Narayan Lekhi” remain unchanged. The live host also shows “Powered by Netlify”
and “Powered by Netlify — build your own site”; these are host-injected and outside
the copy proposal. The production page does not show the draft-only metadata warning
or `TODO_REPO_URL`. Preserve that separate draft behavior.

## 7. Evidence and statistical review

### Sources reviewed

- Portfolio at `c1e39fc`: complete NBA project MDX, complete shared explorer (including its generated strings), project layout, header, footer, and status document.
- Live NBA page on 10 September 2026: initial loading, LeBron 2025–26 at 0% and 25%, and Modeled Ability. Dynamic failure branches were inventoried from source, not induced on the live site.
- Analytics at `23b52b1`: `AGENTS.md`; current scope, evaluation, production, and limitation sections of `docs/SPATIAL_MODEL_PLAN.md`; complete `docs/FIVE_SEASON_V4_PLAN.md` and `docs/SINGLE_DESTINATION_CAP_V3_PLAN.md`.
- Historical authority cross-check: `docs/SHOT_SELECTION_SCORE_PLAN.md` and targeted amendment/result sections of `docs/RELOCATION_PLAN.md`. Their older eligibility and proportional-relocation statements do not override v3/v4.
- Formula checks: `target_summary` and `target_score` in `R/spatial_targeted_relocation_helpers.R`; baseline, gain, and point-value calculations in `R/spatial_targeted_capped_website_export.R`.
- Existing v4 JSON for LeBron James (`2544`) and Victor Wembanyama (`1641705`), selected through verified player identities; no model objects loaded and no statistics regenerated.
- WAI disclosure and hover/focus references linked in section 3.

### Claims checked

| Claim | Evidence and conclusion |
| --- | --- |
| Five separate seasons, eligibility, 156 areas | v4 plan freezes separate regular-season fits, 250 included attempts, 20 games, and a four-foot 156-cell grid. Edge cells can be smaller. |
| Nearby information and individual maps | Spatial plan uses separate replicated player fields with shared smoothing parameters. Do not claim league-average ability or a shared player map. |
| Source movement | v3/v4 rank occupied cells below the player's weighted baseline by modeled expected points, not whether an individual attempt missed. Makes/misses still inform model fitting. |
| Destination support | At least 10 attempts and at least 90% posterior probability of beating the player's own weighted expected points per attempt. Raw make rate, neighboring shot counts, and a dark heatmap color do not replace those rules. |
| One destination and cap | v3 supersedes the older two-destination rule. Receiving cells may not be raised above 50%; historical cells above that share need not be reduced. |
| Requested versus actual | The v3 allocation takes the minimum of request, eligible source share, and supported destination capacity. No unsupported destination receives moved mass. |
| Gain semantics | Mean of draw-level `N × (A − B)` and `100 × (A − B)`. Fixed N is selected-season included attempts, not minutes, possessions, all official points, or a projected full season. |
| Score semantics | Median of clipped draw-level `100 × B / A(25%)`; 5th/95th percentiles after clipping. Do not call this a percentile rank, average ratio, global optimum, or slider-dependent score. |
| Intervals | Central 90% conditional model intervals. Gain intervals do not include future binomial shot noise or unmodeled game effects. Avoid calling them a guaranteed future range. |
| Zero and missing values | Available gains are zero at 0%; unavailable gains and score stay null. The fixed 25%-request score remains visible for available estimates even at slider zero. |
| Prediction testing | Spatial final-test record reports 39,212 shots in 246 untouched test games, 46 passing checks, and a CAR prediction advantage. Sparse-player uncertainty showed no clear advantage. Earlier-season fits do not establish new comparative accuracy. |
| Limits | Preserve defense, shot creation, game situation, fatigue, passing, shot clock, selection of favorable attempts, free-throw omissions, and no causal claim. |

### Verified numerical examples

LeBron, 2025–26: 919 attempts; 25% requested and achieved; 229.75 moved shot-equivalents;
score `86.79578933168781`, displayed 86.8; score range 84.7 to 89.0. Mean gain
`156.62496469153956`, displayed +157; range 129 to 183. Mean per-100 gain
`17.042977659579932`, displayed +17.0; range 14.1 to 19.9. Scaling the unrounded
per-100 gain by `919 / 100` reproduces the season gain within floating-point precision.
Do not multiply the rounded 17.0 and expect the exact stored season number.

Wembanyama, 2025–26: 1,080 attempts; one supported destination; 25% requested and
22.5% achieved, equal to 243 attempts. The receiving area's final share is 50%.
These are checked examples for copy review, not new results or new live annotations.

### Documentation conflicts handled

The current project paragraph describes the explorer's results as posterior means
without distinguishing the score median. The proposal corrects that wording.
The older score plan and portfolio historical notes cite 122 qualified and 196
unsupported players under a two-destination rule. Those are v1/v2 facts, not current
v4 eligibility. The v4 plan reports 29 zero-support players in 2025–26 and 276 with
available relocation; another 13 have support but no capacity. The proposal does not
repeat the old totals or equate support with available gains.

The spatial plan still says portfolio integration remains. Direct live inspection
and the verified portfolio commit establish that the five-season integration exists.
This proposal records the conflict without rewriting the analytics plan.

## 8. Quality review and implementation boundary

Editorial review after revision, scored 1–5: directness **5**, clarity **4**, natural
voice **4**, removal of unnecessary wording **4**. These are editorial judgments,
not user-test findings or a measured reading grade. The main copy uses short sentences
and basketball terms. The retained score and range need explicit definitions; their
necessary qualifications add length. The approved title is 16 words.

Checks completed: main terms have adjacent help or visible explanations; short
popover and full Definitions meanings agree; “Shooting Map” does not claim expected
points; requested and achieved shares stay distinct; score and gain summaries use
their correct formulas; examples retain stored values and display rounding; important
limits remain beside results; detailed method appears last. No new motivation,
personal claim, basketball conclusion, evidence tier, or prediction guarantee appears.

The proposal does not claim that popovers, new labels, or reordered content have been
built or browser-tested. Narayan should approve the complete copy, particularly
“Shooting Map,” “Shots to Move,” “Estimated Range (90%),” the one-area wording, and
placing the score after the points measures. A later authorized implementation must
check wrapping, keyboard/screen-reader behavior, and dynamic copy against the same data.

Repository scope for this task: only this proposal document enters the commit. The
explicit one-document instruction takes precedence over the standing status-file
rewrite convention. Preserve `docs/status.md`, website files, analytics, all exports,
prototypes, and other untracked work. Do not merge or deploy this proposal.

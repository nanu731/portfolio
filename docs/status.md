# Portfolio site status

Snapshot for a reader new to the site. Updated 6 September 2026.

## What is stable

The visual system remains unchanged. Cream is the dominant surface, dark green carries
type and rules, sand belongs to charts and tables, and rust marks focus and links. The
page still uses full-width bands, shifting prose offsets, and a fixed figure gutter.

The NBA project uses the verified five-season capped targeted spatial export. The season
indexes contain 318 players in 2025-26, 304 in 2024-25, 281 in 2023-24, 292 in 2022-23,
and 312 in 2021-22. Together they contain 1,507 analyzed player-seasons, 968,595
historical shots, and 156 modeled court cells per analysis. Each player-season has six
settings from 0% through 25%.

The explorer opens with LeBron James in 2025-26. Its season menu lists all five seasons
from newest to oldest. A reader who selects another player can change seasons without
losing that player when the new season has an analysis for the same NBA player ID. The
explorer names the player and season when no analysis exists, explains whether the data
has no recorded shots or the player missed model eligibility, and offers a reset to the
default LeBron view.

The browser loads the root availability catalog once, then the active season index and
one selected player file. Focusing the search field shows every analyzed player for the
active season in a bounded list. Typing ignores accents and punctuation, ranks prefix
matches first, and preserves the original display name. Before shows green circles for
historical makes and rust crosses for misses at the 0% slider setting. Raising the
slider updates the same Before & After court with hypothetical relocations as cyan
diamonds and faint rings at their origins. Modeled Ability remains a separate view with
one fixed probability scale and supported destinations.

Players with feasible relocation receive a Shot Selection Score with a 90% interval and
the six-step relocation control. One-location results carry a single-destination label.
The page reports requested and actual relocated shares, season gains as whole points,
and gains per 100 shots to one decimal place. The zero setting displays zero gain.
Unavailable values stay null and receive a reason instead of a substitute zero.

## What was verified

The analytics and portfolio version-four copies contain the same 1,514 JSON files and
280,809,899 bytes. A directory comparison found no differences. The manifest SHA-256 is
`685aa02b5003cb292fbe0926b242a351200f0cd785a169c31942f8518ac03242`; the root
availability-catalog SHA-256 is
`e78e4c68ba22e74e45b95bb5b26d6b4a7a01494a271e96016cbd9318e923732e`. Two export
builds matched byte for byte. The complete 2025-26 subtree matches version three.

Focused analytics tests covered zero, one, and multiple supported destinations;
fractional source boundaries; exhausted source and destination capacity; proportional
redistribution after a cap binds; outcome-independent movement; and Victor Wembanyama's
single-destination case. Every receiving destination finishes at or below 50%.

The production site build completed with the NBA page included. Browser checks covered
LeBron in all five seasons, preserved player IDs, both unavailable reasons, all three
evidence states, accent and punctuation normalization, pointer and keyboard selection,
Escape, outside clicks, no results, and rapid season and player changes. Network records
showed one root catalog request and requests for the active season index and chosen
player. The browser console reported no warnings or errors.

The combined-view browser checks covered every 0% through 25% slider setting. The 0%
state reproduced the historical marker markup, positive settings added cyan relocation
markers and origin rings, and fractional boundary markers retained reduced opacity.
Player, season, unavailable-player, and full reset paths returned the court to 0%.
Modeled Ability preserved a nonzero slider value without changing the heatmap.

Desktop, 375-pixel mobile, and 200%-equivalent reflow checks found no horizontal
overflow, clipped controls, overlapping labels, or court-alignment problem. The score,
legend, slider, intervals, definitions, and caveats remained readable.

## Known limits

The results are modeled, descriptive, and non-causal estimates based on past shots. They
do not guarantee improvement. The model does not represent whether a replacement shot
can be created, how a defense responds, fatigue, passing, shot-clock pressure, or game
context.

The static version-four bundle is 267.80 MiB, but a reader does not download it as one
file. The browser requests the root catalog, one season index, and one player payload.
The versioned files fit the existing static Netlify setup, and Netlify can cache each
file.

The older zone assets and complete version-one, version-two, and version-three bundles
remain preserved.

The chosen custom domain remains unregistered. The Netlify address remains the public
address until that separate domain work occurs.

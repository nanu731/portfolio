# Portfolio site status

Snapshot for a reader new to the site. Updated 6 September 2026.

## What is stable

The visual system remains unchanged. Cream is the dominant surface, dark green carries
type and rules, sand belongs to charts and tables, and rust marks focus and links. The
page still uses full-width bands, shifting prose offsets, and a fixed figure gutter.

The NBA project uses the verified 2025-26 capped targeted spatial export. It contains 318
players, 156 modeled court cells per player, 194,987 historical shots, and six settings
from 0% through 25%. Twenty-nine players have no supported destination, 167 have one, and
122 have two or more. The page publishes relocation estimates for 276 players. Thirteen
single-destination players have no room under the universal 50% destination cap, so their
scores and gains remain unavailable.

The explorer loads the 318-player index once and opens with LeBron James. Focusing its
single search field shows every player in a bounded list. Typing filters from the first
character, ignores accents and punctuation, ranks prefix matches first, and preserves
the original display name. The browser loads only the selected player's file. Before
shows green circles for historical makes and rust crosses for misses. After keeps
unmoved shots in place, shows hypothetical relocations as cyan diamonds, and marks their
origins with faint rings. Modeled Ability shows a complete heatmap with one fixed
probability scale and supported destinations.

Players with feasible relocation receive a Shot Selection Score with a 90% interval and
the six-step relocation control. One-location results carry a single-destination label.
The page reports requested and actual relocated shares, season gains as whole points,
and gains per 100 shots to one decimal place. The zero setting displays zero gain.
Unavailable values stay null and receive a reason instead of a substitute zero.

## What was verified

The analytics and portfolio version-three copies contain the same 320 files and
57,418,128 bytes. A directory comparison found no differences. The manifest and
season-index SHA-256 hashes match the verified source. Two independent export builds
also matched byte for byte.

Focused analytics tests covered zero, one, and multiple supported destinations;
fractional source boundaries; exhausted source and destination capacity; proportional
redistribution after a cap binds; outcome-independent movement; and Victor Wembanyama's
single-destination case. Every receiving destination finishes at or below 50%.

The production site build completed with the NBA page included. Browser checks covered
the LeBron preload, all three court views, the complete list, accent and punctuation
normalization, no results, pointer and keyboard selection, Escape, outside clicks,
clearing, rapid player changes, and unavailable-result reasons. The browser console
reported no warnings or errors.

Desktop, 375-pixel mobile, and 200%-equivalent reflow checks found no horizontal
overflow, clipped controls, overlapping labels, or court-alignment problem. The score,
legend, slider, intervals, definitions, and caveats remained readable.

## Known limits

The results are modeled, descriptive, and non-causal estimates based on past shots. They
do not guarantee improvement. The model does not represent whether a replacement shot
can be created, how a defense responds, fatigue, passing, shot-clock pressure, or game
context.

The static version-three bundle is about 54.76 MiB, but a reader does not download it as
one file. The browser requests the compact index and one selected player payload. The
versioned files fit the existing static Netlify setup and can be cached separately.

The older zone assets and complete version-one and version-two bundles remain preserved.
Four earlier seasons and a season selector remain future work. They have not started.

The chosen custom domain remains unregistered. The Netlify address remains the public
address until that separate domain work occurs.

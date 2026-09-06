# Portfolio site status

Snapshot for a reader new to the site. Updated 6 September 2026.

## What is stable

The visual system remains unchanged. Cream is the dominant surface, dark green carries
type and rules, sand belongs to charts and tables, and rust marks focus and links. The
page still uses full-width bands, shifting prose offsets, and a fixed figure gutter.

The NBA project uses the verified 2025-26 targeted spatial export. It contains 318
players, 156 modeled court cells per player, 194,987 historical shots, and six settings
from 0% through 25%. The destination rules qualify 122 players. The other 196 players
retain their shots and heatmaps with unavailable scores and gains left null.

Readers begin with a `Choose a player` state. The explorer loads the 318-player index
once and the chosen player's file on selection. Before shows green circles for historical
makes and rust crosses for misses. After keeps unmoved shots in place, shows hypothetical
relocations as gold diamonds, and marks their origins with faint rings. Modeled Ability
shows a complete heatmap with one fixed probability scale and supported destinations.

Qualified players receive a Shot Selection Score with a 90% interval and the six-step
relocation control. The page reports requested and actual relocated shares, season gains
as whole points, and gains per 100 shots to one decimal place. The zero setting displays
zero gain. Unsupported players receive a clear insufficient-evidence result instead of a
substitute zero.

## What was verified

The analytics and portfolio version-two copies contain the same 320 files and 56,847,516
bytes. A directory comparison found no differences. The manifest and season-index
SHA-256 hashes match the verified source.

The production build completed with the NBA page included. Browser checks covered the
initial state, player search, a qualified player, an insufficient-evidence player, all
six slider positions, all three views, rapid player changes, and keyboard inspection of
court cells. A temporary request log recorded one player-index request and only the two
player files selected during that session. The browser console reported no warnings or
errors.

Desktop and 375-pixel mobile checks found no horizontal overflow, clipped controls,
overlapping labels, or court-alignment problem. The score, legend, slider, intervals,
and caveats remained readable at both sizes.

## Known limits

The results are modeled, descriptive, and non-causal estimates based on past shots. They
do not guarantee improvement. The model does not represent whether a replacement shot
can be created, how a defense responds, fatigue, passing, shot-clock pressure, or game
context.

The static version-two bundle is about 54.21 MiB, but a reader does not download it as
one file. The browser requests the compact index and one selected player payload. The
versioned files fit the existing static Netlify setup and can be cached separately.

The older zone assets and complete version-one bundle remain preserved. Four earlier
seasons and a season selector are the next analytics and interface expansion. They have
not started.

The chosen custom domain remains unregistered. The Netlify address remains the public
address until that separate domain work occurs.

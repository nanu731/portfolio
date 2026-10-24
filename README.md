# NSL Analytics

Narayan Lekhi's sports analytics portfolio. The site brings together the questions,
methods, charts and limitations behind projects in basketball, football and tennis.

This repository contains the website and the data used by its charts. The analyses
live in separate research repositories.

## Start here

[Visit NSL Analytics](https://www.nslanalytics.com/) or open a project:

| Project | What you can explore | Analysis code |
| --- | --- | --- |
| [NBA shot selection](https://www.nslanalytics.com/projects/nba-shot-selection-analytics/) | How expected scoring changes when attempts move to better-supported court areas. | [nba-shot-analytics](https://github.com/nanu731/nba-shot-analytics) |
| [Two-player comparison](https://www.nslanalytics.com/projects/nba-player-comparison/) | Two players' shot-selection scenarios with the same season and movement settings. | [nba-shot-analytics](https://github.com/nanu731/nba-shot-analytics) |
| [Tennis point stages](https://www.nslanalytics.com/projects/tennis-point-phases/) | Where recorded points end and how serving and receiving outcomes differ. | [tennis-analytics](https://github.com/nanu731/tennis-analytics) |
| [NFL QBs Visualized](https://www.nslanalytics.com/projects/nfl-qbs-re-evaluated/) | Quarterback season statistics and attributed expert assessments. | [nfl-qb-eval](https://github.com/nanu731/nfl-qb-eval) |
| [Moneyball: Basketball Edition](https://www.nslanalytics.com/projects/nba-economics/) | NBA compensation alongside LEBRON contribution rate and LEBRON WAR. | [basketball-econ](https://github.com/nanu731/basketball-econ) |

For the NBA explorer, choose a player and season, then move the slider. It starts
with LeBron James in 2025–26 at 0%, showing his recorded shots. You can request
movement from 0% to 25% in 5% steps; the result reports how much movement the model
can support. The three views show shot locations, estimated make chances and the
volume moved between court areas.

Player search accepts names with or without accents and punctuation. Your selected
player carries across seasons when an analysis exists. Otherwise, the page explains
the gap and offers a reset. The comparison page uses one season, slider and view
for both players, blocks duplicate selections and leaves its second slot empty
until you choose someone.

## What's included

The site uses Astro 7, plain CSS and browser JavaScript/TypeScript. Project pages
use MDX; blog posts use Markdown. The build includes a sitemap and blog RSS feed.
Charts use SVG and versioned JSON. Fraunces, Source Serif 4 and IBM Plex Mono supply
the typography, with a cream, green, rust and cyan palette.

| Location | Contents |
| --- | --- |
| `src/content/projects/` | Project write-ups and metadata. |
| `src/content/blog/` | Dated writing; no published posts in this snapshot. |
| `src/pages/` | Page routes, including the two-player comparison. |
| `src/components/` and `src/lib/` | Shared components, data loaders and chart interactions. |
| `src/styles/global.css` | Colour, spacing and typography settings. |
| `public/data/` and `public/plots/` | Chart data and static figures. |
| `scripts/` | Data and browser verification scripts. |

The NBA Location Edition uses the v4 export in
`public/data/spatial-shot-selection/v4/`: 1,507 analyzed player-seasons from
2021–22 through 2025–26. The browser loads the availability list, selected season
and selected players as needed. Typing, moving the slider or switching views does
not fetch more player files. The website displays saved analysis outputs; it does
not fit models or provide a live NBA feed.

## Getting started

Use **Node.js 22.12.0 or newer** and npm. Run these commands from the repository root:

```sh
npm ci
npm run dev -- --background
```

Open `http://localhost:4321`. To check or stop the background server:

```sh
npm run astro -- dev status
npm run astro -- dev stop
```

To build and preview the production site:

```sh
npm run build
npm run preview
```

The build writes to `dist/`. The first build may need network access for fonts;
visitors load the fonts from the site's own origin.

To check the NBA movement and comparison data:

```sh
node --experimental-strip-types scripts/verify-relocation-flow.mjs
node --experimental-strip-types scripts/verify-player-comparison.mjs
```

The flag allows the TypeScript helper imports on Node 22. These checks cover data
integrity, movement totals, fractional attempts, per-100 conversions, missing
values and comparison loading. Browser checks and statistical validation are
separate; see the [UI verification record](docs/ui-refinement-verification.md).

Project metadata follows `src/content.config.ts`. Use `draft: true` to preview a
page in development without including it in production. The unlinked `/styleguide/`
shows the site's design settings; it stays out of the sitemap but is not
access-controlled.

The canonical address is `www.nslanalytics.com`, with Vercel as the production host.
A push to `main` can trigger a deployment. The current Netlify configuration skips
new builds. `astro.config.mjs` sets the canonical URL; `vercel.json` and
`netlify.toml` define host security headers. Astro adds per-page script and style
hashes during the build. The [security checklist](docs/security-checklist.md)
records the distinction between browser protections and account checks.

## Methods and limitations

### Reading the NBA results

Each season has its own Bayesian spatial model, which shares information between
neighboring court areas. A receiving area needs at least 10 attempts and a 90%
model probability of improving on the player's current expected points per shot.
No receiving area can exceed 50% of final shot volume. One supported area can be
enough if it has room for more attempts.

The score compares a player's historical shot mix with feasible movement at a
fixed 25% request. A higher score means less modeled room to improve that mix.
Results show estimated extra season points, extra points per 100 attempts, the
score and 90% model ranges. The comparison uses each player's own shot mix; it
provides no overall talent ranking or head-to-head win probability. Missing
estimates remain unavailable.

Cyan locations represent hypothetical attempts. Movement bubbles show aggregate
volume, not routes taken by individual shots. The model holds shooting ability
fixed and leaves out defense, game situation, shot creation, fatigue and opponent
reactions. Its estimates describe historical scenarios, not causal gains or
forecasts. Definitions, formulas and full limitations appear on the project page.

### Reading the tennis results

The tennis charts show recorded point endings, overlapping stage reaches,
serving/receiving win rates and break-point subsets, with counts and denominators.
The sampled charted points cannot establish career-wide strengths, rankings,
causal credit or clutch ability.

### Research in progress

The research plan recorded on 13 October 2026 keeps Location Edition separate
from a proposed Context Edition, which asks whether shot type and verified
pre-shot situation improve scoring predictions. Context research is paused.
Its broad finish/creation model remains the baseline; adding distance improved
log loss but failed the calibration requirement. The game-context model remains
unfitted after memory constraints stopped its training preflight.

Location sensitivity testing is complete with production defaults unchanged.
Possible later work includes location archetypes, player-specific shot-family
effects, verified field-goal/free-throw trip value and historical volume limits.
These ideas need their own data and validation. Direct defense data remain
unavailable, and the current five-season evidence does not support player-specific
volume-efficiency curves. The plan reserves 2026–27 for prospective confirmation
and gives no release date. Physical-device and spoken screen-reader testing also
remain follow-up work.

## Data and license

Site content and writing are © Narayan Lekhi. This repository does not declare a
blanket open-source license for the website or its analytical data.

The tennis display adapts data from the Tennis Abstract Match Charting Project,
Jeff Sackmann and contributors, under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
See the [source and transformation notice](public/tennis-mcp-notice.txt). Those
terms do not relicense unrelated site material or fonts.

Fraunces uses the SIL Open Font License; see [OFL.txt](src/assets/fonts/OFL.txt).

# Statistical twins: stocks model

We compare 308 players with at least 750 minutes in the 2023–24 regular season. We combine team stints, sum each player's game totals, calculate eight rates, and rank each rate on a 0–100 percentile scale. Similarity = 100 minus the weighted mean absolute gap between two percentile profiles. The five smallest gaps excluding the player himself are the results. Source game logs: https://github.com/NocturneBear/NBA-Data-2010-2024/tree/a5f108b5b1f08074d78b9e8e901926a9ce4c06c5.

The source repository provides an MIT license; see source-data-license.txt for its notice.

| Statistic | Weight |
|---|---:|
| Estimated shooting attempts per 36 minutes | 14.25% |
| Assists per 36 minutes | 13.95% |
| Three-point attempt share | 14.34% |
| Free throws per 100 field-goal attempts | 12.32% |
| True shooting percentage | 7.90% |
| Rebounds per 36 minutes | 13.92% |
| Stocks per 36 minutes | 11.75% |
| Personal fouls per 36 minutes | 11.57% |

Stocks = 36 × (steals + blocks) / minutes. Fouls = 36 × personal fouls committed / minutes. Weights are proportional to each rate’s positive correlation between odd- and even-appearance percentile rankings in 2022–23. Equal stocks can come from different combinations of steals and blocks. Fouls count whistles against a player and can reflect assignments and intentional fouling.

## Why fouls earned the eighth spot

The table counts players whose odd-appearance profile matched their even-appearance profile in the top five. For each candidate we estimated weights on 2022–23, then applied those weights to 2021–22. Each candidate used the same players, with 375+ minutes and nonzero field-goal attempts and rebounds in each half.

| Added to the seven stats | 2022–23 (312 players) | 2021–22 (319 players) |
|---|---:|---:|
| Nothing | 267 | 268 |
| Offensive rebounds / total rebounds | 268 | 272 |
| Turnover percentage | 264 | 270 |
| Personal fouls per 36 minutes | **273** | **275** |

Turnover percentage = 100 × TOV / (FGA + 0.44 × FTA + TOV). Identity recovery tests repeatability, not scouting agreement. Reproduce with `python3 scripts/test_eighth_stat.py /tmp/nba-twin-cache` after caching the pinned logs with `python3 scripts/build_model.py /tmp/nba-twin-cache`.

## Other-player checks

In the 2023–24 sample, 263 of 306 players recovered their own other-half profile in the top five. For the actual task of matching **other players**, the two half-season samples shared 1.29 of five neighbors on average. The app also counts first-place finishes and top-five appearances for each selected pair in 200 resampled seasons.

We kept the 2023–24 matches fixed and compared where the players shot in 2024–25. For 155 common anchors with observed same-position matches, the average gap in rim share among short shots was 12.755 percentage points for the eight-trait model, 12.423 for equal weights and 14.646 for assists and rebounds alone. These checks measure the whole model, not the isolated effect of adding fouls. Reproduce the current result with `node scripts/check-shot-style.cjs PATH_TO_EXPORT/2024-25/players`. 

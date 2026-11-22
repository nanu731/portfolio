"""Build historical game rosters using the analysis repo's pinned model builder.

Usage: python3 scripts/build-twin-game.py PATH_TO_NBA_SIMILAR_PLAYER CSV_CACHE
Use the analysis checkout at 6311e6b or its identical eight-stat model builder.
"""
import csv
import hashlib
import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(sys.argv[1]) / "scripts"))
from build_model import CSV_HASHES, FIELDS, REV, normalize, profile

out = Path(__file__).resolve().parents[1] / "public/twins-source/data"
seasons = defaultdict(lambda: defaultdict(list))
seen = set()
for n, sha in enumerate(CSV_HASHES, 1):
    source = Path(sys.argv[2]) / f"twin-games-{n}.csv"
    if hashlib.sha256(source.read_bytes()).hexdigest() != sha:
        raise ValueError(f"Wrong input for {REV}: {source}")
    with source.open() as f:
        for row in csv.DictReader(f):
            if not row["minutes"] or not row["gameId"].zfill(10).startswith("002"):
                continue
            key = row["personId"], row["gameId"]
            if key in seen:
                raise ValueError(f"Duplicate appearance {key}")
            seen.add(key)
            m, s = row["minutes"].split(":")
            minutes = int(m) + float(s) / 60
            if minutes > 0:
                seasons[row["season_year"]][key[0]].append((
                    row["game_date"], row["personName"], row["teamTricode"],
                    minutes, [int(row[k]) for k in FIELDS],
                ))

current = json.loads((out / "data.js").read_text().split(" = ", 1)[1].strip().rstrip(";"))
for season, appearances in sorted(seasons.items()):
    players = []
    for pid, games in appearances.items():
        games.sort()
        values = profile(games, 750)
        if values:
            players.append(dict(id=pid, name=games[-1][1], team=games[-1][2], values=values))
    players.sort(key=lambda p: p["name"])
    for p, vector in zip(players, normalize([p["values"] for p in players])):
        p["p"] = list(vector)
        p["values"] = [round(x, 4) for x in p["values"]]
    assert len(players) > 6
    if season == current["season"].replace("–", "-"):
        assert players == [{k: p[k] for k in players[0]} for p in current["players"]]
    else:
        (out / f"round-{season}.json").write_text(json.dumps(players, separators=(",", ":"), ensure_ascii=False))
    print(season, len(players))

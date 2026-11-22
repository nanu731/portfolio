"""Build pressure-point overlays from the exact MCP inputs used by build_data.py.

The three fields in a point record are break, set and match opportunity holders.
0 = neither player, 1 = player one, 2 = player two, 3 = both. None means unknown.
"""
import argparse
import csv
import hashlib
import json
from collections import defaultdict
from itertools import groupby
from pathlib import Path

from build_data import ROOT, save


FORMATS = {"0", "1", "A", "T", "V", "W", "N", "S"}
GAME_SCORE = {"0": 0, "15": 1, "30": 2, "40": 3, "AD": 4}
UNKNOWN = (None, None, None)


def rules(match_id, code):
    date, _, event, *_ = match_id.split("-")
    year = int(date[:4])
    # Grand Slam Board harmonization began at Roland Garros 2022.
    # https://www.usopen.org/en_US/news/articles/2022-03-16/us_open_to_join_all_grand_slams_in_playing_10point_final_set_tiebreak.html
    if event in {"Wimbledon", "Roland_Garros", "US_Open", "Australian_Open"}:
        if year > 2022 or (year == 2022 and event != "Australian_Open"):
            code = "A"
        elif event == "Australian_Open" and year >= 2019:
            code = "A"
        elif event == "Wimbledon" and 2019 <= year <= 2021:
            code = "T"
    if event == "NextGen_Finals":
        code = "N"
    if event == "US_Open" and 1970 <= year <= 1974:
        return "sudden"
    return code


def pressure(score, server, sets, games, best_of, code, observed_tiebreak=None):
    """Use pre-point state only. Scores are server first; sets/games are player first."""
    parts = score.split("-")
    if len(parts) != 2 or server not in (1, 2):
        return UNKNOWN
    known_format = code in FORMATS or code == "sudden"
    sets_needed = best_of // 2 + 1 if best_of in (3, 5) else None
    if sets_needed and max(sets) >= sets_needed:
        return UNKNOWN
    deciding = sets_needed and min(sets) == sets_needed - 1
    trigger = {"N": 3, "W": 8, "V": None}.get(code, 6)
    if deciding:
        trigger = {"0": None, "T": 12, "S": 0}.get(code, trigger)
    tb = known_format and games is not None and trigger is not None and games == (trigger, trigger)
    regular = all(v in GAME_SCORE for v in parts)
    if observed_tiebreak is False:
        tb = False
    if not regular or tb or observed_tiebreak:
        if not all(v.isdecimal() for v in parts):
            return UNKNOWN
        a, b = map(int, parts)
        # Numeric tiebreak scores never give a returner a break opportunity.
        if not tb or not sets_needed:
            return (0, None, None)
        target = 5 if code == "sudden" else 10 if deciding and code in {"A", "S"} else 7
        lead = 1 if code == "sudden" else 2
        if max(a, b) >= target and abs(a - b) >= lead:
            return (0, None, None)
        can_win = [x + 1 >= target and x + 1 - y >= lead for x, y in ((a, b), (b, a))]
    else:
        a, b = [GAME_SCORE[v] for v in parts]
        if 4 in (a, b) and sorted((a, b)) != [3, 4]:
            return UNKNOWN
        if a == b == 3 and not known_format:
            return UNKNOWN
        can_win = [x >= 3 and (x > y or code == "N") for x, y in ((a, b), (b, a))]
    holder = [server, 3 - server]
    bp = holder[1] if not tb and can_win[1] else 0
    if not any(can_win):
        return (bp, 0, 0)
    game_target = 4 if code == "N" else 6
    if games is None or not known_format or (max(games) >= game_target and abs(games[0] - games[1]) >= 2):
        return (bp, None, None)
    sp = 0
    for side, wins in zip(holder, can_win):
        g, opponent = games[side - 1], games[2 - side]
        if wins and (tb or (g + 1 >= game_target and g + 1 - opponent >= 2)):
            sp |= side
    if not sp:
        return (bp, 0, 0)
    mp = sum(side for side in (1, 2) if sp & side and sets[side - 1] == sets_needed - 1) if sets_needed else None
    return (bp, sp, mp)


def build_player_pressure(data, archive, buckets):
    """Group confirmed point outcomes by player lookup bucket for on-demand comparisons."""
    groups = defaultdict(dict)
    for match in archive.values():
        key = Path(match["file"]).stem
        overlay = buckets[key[:2]][key]
        points = {p[0]: p for p in json.loads((data / "points" / (key + ".json")).read_text())}
        rows = [[number, *holders, *points[number][5:8]] for number, *holders in overlay["rows"]]
        record = {"rows": rows, "uncertain": overlay["uncertain"]}
        for bucket in {hashlib.sha256(name.encode()).hexdigest()[:2] for name in match["players"]}:
            groups[bucket][key] = record
    for bucket, matches in groups.items():
        save(data / "player-pressure" / (bucket + ".json"), matches)


def build(source, data):
    provenance = json.loads((data / "provenance.json").read_text())
    archive = {m["id"]: m for m in json.loads((data / "index.json").read_text())}
    prefix = "mcp-stage1-" if (source / "mcp-stage1-charting-m-matches.csv").exists() else ""
    paths = {}
    for original, expected in provenance["hashes"].items():
        name = original.removeprefix("mcp-stage1-")
        path = source / (prefix + name)
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError(f"Source revision mismatch: {name}")
        paths[name] = path
    buckets = defaultdict(dict)
    for tour in ("m", "w"):
        formats = {}
        with paths[f"charting-{tour}-matches.csv"].open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                if row.get("Player 2"):
                    best = (row.get("Best of") or "").strip()
                    formats[row["match_id"]] = (int(best) if best.isdigit() else None,
                                                rules(row["match_id"], (row.get("Final TB?") or "").strip()))
        for era in ("to-2009", "2010s", "2020s"):
            with paths[f"charting-{tour}-points-{era}.csv"].open(encoding="utf-8-sig", newline="") as f:
                for mid, rows in groupby(csv.DictReader(f), key=lambda row: row["match_id"]):
                    if mid not in archive:
                        continue
                    path = Path(archive[mid]["file"])
                    points = json.loads((data / "points" / path.name).read_text())
                    indexed = {p[0]: p for p in points}
                    classified = {}
                    best, code = formats.get(mid, (None, ""))
                    rows = list(rows)
                    # An early 1–0 or 0–1 establishes a numeric tiebreak. An AD score
                    # or 15–0 establishes a service game even if vintage metadata disagrees.
                    game_kind = {}
                    for row in rows:
                        key = (row["Set1"], row["Set2"], row["Gm#"].split(" ")[0], row["Gm1"], row["Gm2"])
                        score = row["Pts"].split("-")
                        if row["Pts"] in {"15-0", "0-15", "AD-40", "40-AD"}:
                            game_kind[key] = False
                        elif len(score) == 2 and all(v.isdecimal() for v in score) and any(v not in GAME_SCORE for v in score):
                            game_kind[key] = True
                    for row in rows:
                        n = int(row["Pt"])
                        p = indexed.get(n)
                        if not p or [row["Pts"], int(row["Svr"]), int(row["PtWinner"])] != p[3:6]:
                            continue
                        sets = (int(row["Set1"]), int(row["Set2"]))
                        gs = (row["Gm1"], row["Gm2"])
                        games = tuple(map(int, gs)) if all(v.isdigit() for v in gs) else None
                        if games and sum(games) + 1 != p[2]:
                            games = None
                        key = (row["Set1"], row["Set2"], row["Gm#"].split(" ")[0], row["Gm1"], row["Gm2"])
                        tags = pressure(p[3], p[4], sets, games, best, code, game_kind.get(key))
                        classified[n] = tags if n not in classified or classified[n] == tags else UNKNOWN
                    marked, uncertain = [], [0, 0, 0, 0]
                    for p in points:
                        tags = classified.get(p[0], UNKNOWN)
                        for i, holder in enumerate(tags):
                            uncertain[i] += holder is None
                        uncertain[3] += None in tags and not any(tags)
                        if any(tags):
                            marked.append([p[0], *tags])
                    bucket = buckets[path.stem[:2]]
                    if path.stem in bucket:
                        raise ValueError(f"Unexpected split chart: {mid}")
                    bucket[path.stem] = {"rows": marked, "uncertain": uncertain}
    if sum(map(len, buckets.values())) != len(archive):
        raise ValueError("Pressure overlay does not cover the full archive")
    for key, bucket in buckets.items():
        save(data / "pressure" / (key + ".json"), bucket)
    build_player_pressure(data, archive, buckets)
    print(f"Built pressure coverage for {len(archive):,} matches in {len(buckets)} files.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--data", type=Path, default=ROOT / "data")
    args = parser.parse_args()
    build(args.source, args.data)

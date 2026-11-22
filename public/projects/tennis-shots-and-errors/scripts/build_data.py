"""Build the chart archive from the six MCP point files and two inventories.

Usage: python3 scripts/build_data.py PATH_TO_CSV_DIRECTORY
Accepts upstream names or the Obsidian research snapshot's mcp-stage1- prefix.
"""

import argparse
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from itertools import groupby
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STROKES = "fbrsvzopuylmhijktq"
SHOT = re.compile(f"[{STROKES}]")
# Direction, depth and position codes modify a stroke without adding a contact.
# Extra placement/depth modifiers are opaque. They cannot create a stroke.
# For example, f39+ still identifies one forehand. Never interpret its location.
PLAY = re.compile(
    rf"[0456](?:\+;?|;\+?)?(?:[{STROKES}][0-9+=;^\-]*)+(?:\*|(?:[nwdxe!];?)?[#@])"
)
BAD_MODIFIER = re.compile(r"([+;^=\-])\1|-=|=-")
FAULT = re.compile(r"[0456](?:\+;?|;\+?)?[nwdxge!];?")
DIRECT = re.compile(r"[0456](?:\+;?|;\+?)?([*#])")
METRICS = "w u sw su nw nu gw gu grw gru egw egu pointsWon".split()


def classify(first, second, server, winner):
    """Return terminal class and completed shots, cross-checking actor parity."""
    first = first.strip().lstrip("c")
    second = second.strip().lstrip("c")
    sequence = second or first
    if second and first != "V" and not FAULT.fullmatch(first):
        return "O", None
    if second and FAULT.fullmatch(second) and winner != server:
        return "D", 0
    direct = DIRECT.fullmatch(sequence)
    if direct and winner == server:
        return ("A" if direct[1] == "*" else "O"), 1
    if not PLAY.fullmatch(sequence) or BAD_MODIFIER.search(sequence):
        return "O", None
    attempts = 1 + len(SHOT.findall(sequence))
    last_hitter = server if attempts % 2 else 3 - server
    outcome = {"*": "W", "#": "F", "@": "U"}[sequence[-1]]
    if (outcome == "W") != (last_hitter == winner):
        return "O", None
    return outcome, attempts - int(outcome != "W")


def reconcile_games(points, game_ids):
    """Repair a source game-score reset only with an intact absolute-game sequence."""
    if all(a[1:3] <= b[1:3] for a, b in zip(points, points[1:])):
        return True
    if None in game_ids or any(
        b - a not in (0, 1) for a, b in zip(game_ids, game_ids[1:])
    ):
        return False
    first_game = {}
    for point, number in zip(points, game_ids):
        first = first_game.setdefault(point[1], number)
        point[2] = number - first + 1
    return all(a[1:3] <= b[1:3] for a, b in zip(points, points[1:]))


def totals(points):
    players = [dict.fromkeys(METRICS, 0) for _ in range(2)]
    games = 0
    for _, group in groupby(points, key=lambda p: (p[1], p[2])):
        game = list(group)
        games += 1
        hits = [defaultdict(list), defaultdict(list)]
        for _, _, _, _, _, winner, ending, shots in game:
            players[winner - 1]["pointsWon"] += 1
            if ending in ("W", "U"):
                hitter = winner if ending == "W" else 3 - winner
                hits[hitter - 1][ending.lower()].append(shots)
        for pl, events in zip(players, hits):
            for kind, lengths in events.items():
                n, total = len(lengths), sum(lengths)
                pl[kind] += n
                pl["s" + kind] += total
                pl["n" + kind] += n
                pl["g" + kind] += n / len(game)
                pl["gr" + kind] += total / n
                pl["eg" + kind] += 1
    for pl in players:
        for k in pl:
            pl[k] = round(pl[k], 9)
    return games, players


def save(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False),
        encoding="utf8",
    )


def build(source, dest):
    prefix = (
        "mcp-stage1-" if (source / "mcp-stage1-charting-m-matches.csv").exists() else ""
    )
    inventory, result, manifest = {}, [], {}
    exclusions, outcomes = Counter(), Counter()
    for kind in ("m", "w"):
        metadata = source / f"{prefix}charting-{kind}-matches.csv"
        manifest[metadata.name] = hashlib.sha256(metadata.read_bytes()).hexdigest()
        with metadata.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                mid = row["match_id"]
                id_fields = mid.split("-")
                # Some split metadata records store the names/surface in the second row.
                if not row.get("Charted by") and not row.get("Player 2"):
                    continue
                dt = row["Date"] or id_fields[0]
                inventory[row["match_id"]] = dict(
                    id=row["match_id"],
                    date=f"{dt[:4]}-{dt[4:6]}-{dt[6:]}",
                    players=[row["Player 1"].strip(), row["Player 2"].strip()],
                    event=row["Tournament"] or id_fields[2].replace("_", " "),
                    round=row["Round"] or id_fields[3],
                    surface=row["Surface"]
                    if row["Surface"] in ("Clay", "Hard", "Grass", "Carpet")
                    else "",
                    chartist=row["Charted by"] or "",
                )
                inventory[row["match_id"]]["event"] = inventory[row["match_id"]][
                    "event"
                ].replace("_", " ")
        for era in ("to-2009", "2010s", "2020s"):
            path = source / f"{prefix}charting-{kind}-points-{era}.csv"
            manifest[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
            by_match = defaultdict(list)
            with path.open(encoding="utf-8-sig", newline="") as f:
                for row in csv.DictReader(f):
                    svr, win = int(row["Svr"]), int(row["PtWinner"])
                    end, shots = classify(row["1st"], row["2nd"], svr, win)
                    set_no = int(row["Set1"]) + int(row["Set2"]) + 1
                    game = (
                        (int(row["Gm1"]) + int(row["Gm2"]) + 1)
                        if row["Gm1"] and row["Gm2"]
                        else None
                    )
                    by_match[row["match_id"]].append(
                        [
                            int(row["Pt"]),
                            set_no,
                            game,
                            row["Pts"],
                            svr,
                            win,
                            end,
                            shots,
                            int(row["Gm#"].split(" ")[0])
                            if row["Gm#"].split(" ")[0].isdigit()
                            else None,
                        ]
                    )
            for mid, points in by_match.items():
                if mid not in inventory:
                    exclusions["points without match metadata"] += len(points)
                    continue
                points.sort(key=lambda p: p[0])
                # Use adjacent rows of the same game when a pre-game field is blank.
                for i, p in enumerate(points):
                    if (
                        p[2] is None
                        and i
                        and points[i - 1][1] == p[1]
                        and p[3] != "0-0"
                    ):
                        p[2] = points[i - 1][2]
                    if (
                        p[2] is None
                        and i + 1 < len(points)
                        and points[i + 1][1] == p[1]
                        and points[i + 1][3] != "0-0"
                    ):
                        p[2] = points[i + 1][2]
                # Collapse repeated exports only when every displayed field agrees.
                unique = {tuple(p): p for p in points}
                duplicate_count = len(points) - len(unique)
                points = list(unique.values())
                if duplicate_count:
                    exclusions["repeated equivalent point records"] += duplicate_count
                if any(p[2] is None for p in points) or len(
                    {p[0] for p in points}
                ) != len(points):
                    exclusions[
                        "points in charts with unresolved game or duplicate point number"
                    ] += len(points)
                    continue
                game_ids = [p.pop() for p in points]
                if not reconcile_games(points, game_ids):
                    exclusions["points in charts with inconsistent game sequence"] += (
                        len(points)
                    )
                    continue
                meta = inventory[mid]
                games, stats = totals(points)
                filename = (
                    f"data/points/{hashlib.sha256(mid.encode()).hexdigest()[:18]}.json"
                )
                save(dest / filename.removeprefix("data/"), points)
                other = sum(p[6] == "O" for p in points)
                result.append(
                    dict(
                        meta,
                        file=filename,
                        points=len(points),
                        games=games,
                        stats=stats,
                        other=other,
                        unresolved=sum(p[6] == "O" and p[7] is None for p in points),
                        partial=(points[0][0] != 1 or points[-1][0] != len(points)),
                    )
                )
                outcomes.update(p[6] for p in points)
            print(path.name, len(by_match), flush=True)
    result.sort(key=lambda m: (m["date"], m["id"]), reverse=True)
    assert len({m["id"] for m in result}) == len(result)
    save(dest / "index.json", result)
    normalized = "\n".join(
        k.removeprefix("mcp-stage1-") + " " + v for k, v in sorted(manifest.items())
    )
    pinned = (
        hashlib.sha256(normalized.encode()).hexdigest()
        == "fe9b6a471852b8fde6801c570e28b94df9b1d1b091f472e2837f3fa81f65d58b"
    )
    save(
        dest / "provenance.json",
        dict(
            source="https://github.com/JeffSackmann/tennis_MatchChartingProject",
            attribution="Tennis Abstract Match Charting Project, Jeff Sackmann and contributing chartists",
            revision="1813a1309b7ed7ebf1c7e884b32bf675d00e4edf" if pinned else None,
            license="https://creativecommons.org/licenses/by-nc-sa/4.0/",
            hashes=manifest,
            exclusions=exclusions,
            matches=len(result),
            inventory=len(inventory),
            points=sum(outcomes.values()),
            outcomes=outcomes,
            unresolved=sum(m["unresolved"] for m in result),
        ),
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "data")
    args = parser.parse_args()
    build(args.source, args.output)

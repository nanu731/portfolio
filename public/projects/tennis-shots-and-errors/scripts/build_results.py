"""Build optional scored-history and featured-match files from pinned singles results."""
import csv
import json
import re
import sys
import unicodedata
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

FEATURED = "20230716-M-Wimbledon-F-Novak_Djokovic-Carlos_Alcaraz"
EVENTS = {"roland garros": "french open", "us open": "us open",
          "australian chps": "australian open", "rome masters": "rome",
          "paris masters": "paris", "atp tour world finals": "tour finals"}


def norm(name):
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    return " ".join(re.findall("[a-z0-9]+", plain))


def event(name):
    label = norm(name)
    return EVENTS.get(label, label.removesuffix(" masters"))


def build(folder, data):
    records = defaultdict(list)
    for path in sorted(folder.glob("*_matches_[0-9][0-9][0-9][0-9].csv")):
        tour = {"atp": "M", "wta": "W"}[path.name.split("_")[0]]
        with path.open(encoding="utf-8-sig", newline="") as f:
            for r in csv.DictReader(f):
                raw = r["tourney_date"]
                if len(raw) != 8 or not r["score"].strip():
                    continue
                day = date(int(raw[:4]), int(raw[4:6]), int(raw[6:]))
                winner = norm(r["winner_name"])
                pair = tuple(sorted([winner, norm(r["loser_name"])]))
                key = tour, pair, r["round"], event(r["tourney_name"])
                records[key].append((day, winner, r["score"].strip(), r["surface"]))
    matches = json.loads((data / "index.json").read_text())
    results = {}
    for m in matches:
        names = list(map(norm, m["players"]))
        key = m["id"].split("-")[1], tuple(sorted(names)), m["round"], event(m["event"])
        day = date.fromisoformat(m["date"])
        # Published results use tournament start dates. Require every identity
        # field, a plausible main-draw date, and exactly one result.
        hits = [(names.index(winner) + 1, score) for start, winner, score, surface in records[key]
                if timedelta(0) <= day - start <= timedelta(days=16)
                and m["surface"] and m["surface"] == surface and winner in names]
        if len(hits) == 1:
            results[m["id"]] = hits[0]
    featured = next(m for m in matches if m["id"] == FEATURED)
    for filename, obj in [("results.json", results), ("featured.json", dict(match=featured, result=results.get(FEATURED),
                count=len(matches), years=[matches[-1]["date"][:4], matches[0]["date"][:4]]))]:
        (data / filename).write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")))
    print(f"Matched {len(results):,} of {len(matches):,} charts to scored results.")


if __name__ == "__main__":
    build(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[1] / "data")

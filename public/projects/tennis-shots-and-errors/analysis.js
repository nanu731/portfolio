import { mountRally } from "./rally.js";

// All indexes in the point export are one-based. Errors belong to the point loser.
const outcomes = {
  W: "Winner",
  U: "Unforced error",
  F: "Forced error",
  A: "Ace",
  D: "Double fault",
  O: "Other / unknown",
};
const bands = ["0–4", "5–8", "9+", "Unknown"];
const bandOf = (n) =>
  n == null ? "Unknown" : n < 5 ? bands[0] : n < 9 ? bands[1] : bands[2];
const ratio = (a, b) => (b > 0 ? a / b : null);
const decimal = (n) => (n == null ? "Unavailable" : n.toFixed(2));
const percent = (n) => (n == null ? "Unavailable" : (n * 100).toFixed(1) + "%");
const count = (n) => n.toLocaleString("en-US");
const html = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function summarize(matches, name) {
  const total = {
    games: 0,
    points: 0,
    w: 0,
    u: 0,
    sw: 0,
    su: 0,
    nw: 0,
    nu: 0,
    gw: 0,
    gu: 0,
    grw: 0,
    gru: 0,
    egw: 0,
    egu: 0,
    pointsWon: 0,
  };
  for (const match of matches) {
    const s = match.stats[match.players.indexOf(name)];
    if (!s) continue;
    for (const key of Object.keys(total))
      total[key] += key === "games" || key === "points" ? match[key] : s[key];
  }
  return total;
}

function shotAverage(value, total, ending) {
  if (value != null) return decimal(value) + " shots";
  return total ? "Length unavailable" : "No charted " + ending;
}

const scrollTable = (label, content) =>
  '<div class="ta-table-block"><small class="ta-overflow" hidden>Scroll sideways for more columns.</small><div class="ta-scroll" role="region" tabindex="0" aria-label="' + html(label) +
  '"><table aria-label="' + html(label) + '">' + content +
  '</table></div></div>';

const tableObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(entries => {
  for (const { target } of entries) {
    target.previousElementSibling.hidden = target.scrollWidth <= target.clientWidth + 1;
  }
});
function watchTables(root) {
  root.querySelectorAll(".ta-scroll").forEach(el => tableObserver?.observe(el));
}
const head = (labels) =>
  "<thead><tr>" +
  labels.map((x) => '<th scope="col">' + html(x) + "</th>").join("") +
  "</tr></thead>";
const bodyRow = (cells) =>
  "<tr>" +
  cells
    .map((x, i) =>
      i ? "<td>" + x + "</td>" : '<th scope="row">' + x + "</th>",
    )
    .join("") +
  "</tr>";
const sub = (label, text) =>
  '<section class="ta-section"><h2>' + label + "</h2>" + text + "</section>";
const note = (s) => '<p class="ta-note">' + s + "</p>";

const errorLength = (sum, n, attempt) => n ? sum / n + Number(attempt) : null;

function profile(matches, players, mode, attempt) {
  const match = mode === "match";
  const series = players.map((name) => {
    const s = summarize(matches, name);
    const win = match ? ratio(s.sw, s.nw) : ratio(s.grw, s.egw);
    const inPlay = match ? ratio(s.su, s.nu) : ratio(s.gru, s.egu);
    return { name, s, win, err: inPlay == null ? null : inPlay + Number(attempt), inPlay };
  });
  const scale = Math.ceil(Math.max(1, ...series.flatMap(v => [v.win, v.err])));
  const timingCells = series.map(({name, s, win, err}, side) => {
    const cells = [[win, s.nw, s.w, s.egw], [err, s.nu, s.u, s.egu]].map(([value, measured, total, games], i) => {
      const noun = i ? "unforced error" : "winner";
      const label = count(measured) + " " + noun + (measured === 1 ? "" : "s");
      const mean = value == null ? shotAverage(null, total, noun + "s") : value.toFixed(1) + " shots";
      const bar = value == null ? "" : '<span class="ta-track" aria-hidden="true"><i class="ta-bar style-' +
        i + '" style="width:' + (100 * value / scale) + '%"></i></span>';
      let sample = "";
      if (match && measured) {
        sample = '<button type="button" data-ending="' + (i ? "U" : "W") + '" data-player="' + (side + 1) +
          '" aria-label="Show ' + label + ' by ' + html(name) + '">' + label + '</button>';
      } else if (measured) {
        sample = label + " · " + count(games) + (games === 1 ? " game" : " games");
      }
      return '<td><strong>' + mean + '</strong>' + bar + '<div class="ta-support">' + sample + '</div></td>';
    });
    return '<tr><th scope="row">' + html(name) + '</th>' + cells.join("") + '</tr>';
  });
  let finding = "";
  if (match && series.every(row => row.win != null && row.err != null)) {
    const directions = series.map(row => Math.sign(Number(row.win.toFixed(1)) - Number(row.err.toFixed(1))));
    if (directions[0] * directions[1] === -1) {
      const later = series[directions[0] === 1 ? 0 : 1], earlier = series[directions[0] === 1 ? 1 : 0];
      finding = '<p class="ta-finding">' + html(later.name) + " averaged longer rallies on winners than on unforced errors. " +
        html(earlier.name) + " averaged longer rallies on unforced errors.</p>";
    }
  }
  const timing = sub(
    "How long were winner and unforced-error rallies?",
    finding + '<table class="ta-timing"><caption class="sr-only">Average rally length in shots by player and ending</caption>' +
      head(["Player", "Winner", "Unforced error"]) + '<tbody>' + timingCells.join("") + '</tbody></table>' +
      note((attempt ? "Averages include the final miss." : "Averages count only shots put in play.") +
        (match ? "" : " Each game with a measured ending of that kind counts equally.")) +
      '<details class="ta-method" data-count-options><summary>How shots are counted</summary>' +
      '<label class="ta-count-rule"><input type="checkbox" data-count-rule ' + (attempt ? 'checked' : '') +
      '> Count the final miss</label>' + note("A miss on shot five leaves four shots in play. Aces and double faults count separately.") +
      '</details>' + (match ? '<div data-rally></div>' : ""),
  );
  const rows = [
    ...(!match
      ? [
          [
            "Shots per winner · all measured winners",
            (s) => decimal(ratio(s.sw, s.nw)),
          ],
          [
            "Shots per error · all measured unforced errors",
            (s) => decimal(errorLength(s.su, s.nu, attempt)),
          ],
        ]
      : []),
    ...(!match || series.some(row => row.s.w !== row.s.nw) ? [["All charted winners", s => count(s.w)]] : []),
    ...(!match || series.some(row => row.s.u !== row.s.nu) ? [["All charted unforced errors", s => count(s.u)]] : []),
    ["Winners per game played", (s) => decimal(ratio(s.w, s.games))],
    ["Unforced errors per game played", (s) => decimal(ratio(s.u, s.games))],
    ["Game-average winner share", (s) => percent(ratio(s.gw, s.games))],
    ["Game-average unforced error share", (s) => percent(ratio(s.gu, s.games))],
  ];
  const frequency = sub(
    match ? "In an average game" : "How often did each ending happen?",
    scrollTable(
      "Point-ending frequencies",
      head(["Measure", ...players]) +
        "<tbody>" +
        rows
          .map(([l, f]) => bodyRow([l, ...series.map(({ s }) => f(s))]))
          .join("") +
        "</tbody>",
    ) +
      note(
        "For each share, we average the player’s percentage across games. A four-point hold, a long deuce game and a tiebreak each count once." + (match ? "" : " Longer matches contribute more games."),
      ),
  );
  if (mode === "player") {
    const {s} = series[0];
    const shares = sub("In an average game",
      '<p class="ta-finding"><strong>' + percent(ratio(s.gw, s.games)) + "</strong> of points ended with " +
      html(players[0]) + "’s winner and <strong>" + percent(ratio(s.gu, s.games)) + "</strong> with their unforced error.</p>" +
      note("Each game counts equally. " + (matches.length === 1 ? "This profile covers one charted match." : "The archive covers selected matches.")));
    const spread = ["gw","gu"].map((key, i) => {
      const vals = matches.map(m => m.stats[m.players.indexOf(players[0])][key] / m.games).sort((a,b) => a-b);
      const q = fraction => {
        const x = fraction * (vals.length - 1), n = Math.floor(x);
        return vals[n] + (vals[Math.ceil(x)] - vals[n]) * (x - n);
      };
      return bodyRow([i ? "Unforced error" : "Winner", percent(q(.5)), percent(q(.25)) + "–" + percent(q(.75))]);
    });
    const typical = matches.length < 4 ? "" : '<details class="ta-method"><summary>How much did it vary by match?</summary>' +
      note("Each match counts once. The middle half runs from the 25th to the 75th percentile of game-average shares.") +
      scrollTable("Variation across charted matches", head(["Ending","Median match","Middle half"]) + "<tbody>" + spread.join("") + "</tbody>") + "</details>";
    return shares + timing + '<details class="ta-method"><summary>More player stats</summary>' + frequency + typical + "</details>";
  }
  return timing + frequency;
}

function actorOf(p) {
  if (p[6] === "O") return null;
  return ["W", "A"].includes(p[6]) ? p[5] : 3 - p[5];
}

function rallyBreakdown(points, players) {
  const rows = bands
    .map((band) => {
      const group = points.filter((p) => bandOf(p[7]) === band);
      if (!group.length) return "";
      const a = group.filter((p) => p[5] === 1).length;
      const pick =
        '<button type="button" data-pick-band="' +
        html(band) +
        '" aria-label="Show points with ' +
        html(band) +
        ' shots in play">' +
        html(band) + " · See points" +
        "</button>";
      return bodyRow([
        pick,
        count(group.length),
        count(a) + " · " + percent(a / group.length),
        count(group.length - a) + " · " + percent(1 - a / group.length),
      ]);
    })
    .join("");
  const context = bands
    .flatMap((band) =>
      players.map((name, i) => {
        const group = points.filter((p) => bandOf(p[7]) === band);
        if (!group.length) return "";
        const role = [true, false].map((serving) => {
          const sample = group.filter((p) => (p[4] === i + 1) === serving);
          const won = sample.filter((p) => p[5] === i + 1).length;
          return (
            count(won) +
            " / " +
            count(sample.length) +
            " · " +
            percent(ratio(won, sample.length))
          );
        });
        return bodyRow([html(name), html(band), ...role]);
      }),
    )
    .join("");
  return sub(
    "Who won the longer points?",
    scrollTable(
      "Points won by rally length",
      head(["Shots in play", "Points", ...players]) +
        "<tbody>" +
        rows +
        "</tbody>",
    ) +
      note(
        "Each row shows who won the points of that length. Short points include aces and double faults.",
      ) +
      '<details class="ta-method"><summary>Compare serving and returning</summary>' +
      scrollTable(
        "Points won serving and returning by length",
        head(["Player", "Shots in play", "Won on serve", "Won on return"]) +
          "<tbody>" +
          context +
          "</tbody>",
      ) +
      "</details>",
  );
}

function options(values) {
  return values
    .map(
      ([key, label]) =>
        '<option value="' + html(key) + '">' + html(label) + "</option>",
    )
    .join("");
}

function pager() {
  return '<div class="ta-pager"><button type="button" data-prev>Previous</button><span data-page aria-live="polite"></span><button type="button" data-next>Next</button></div>';
}

function paginate(section, rows, header, draw, label, size = 15, startPage = 0) {
  let page = Math.max(0, Math.min(startPage, Math.ceil(rows.length / size) - 1));
  const next = section.querySelector("[data-next]"),
    prev = section.querySelector("[data-prev]");
  function paint() {
    section.dataset.pageIndex = String(page);
    const first = page * size;
    const visible = rows.slice(first, first + size);
    const list = section.querySelector("[data-list]");
    list.querySelectorAll(".ta-scroll").forEach(el => tableObserver?.unobserve(el));
    list.innerHTML = rows.length
      ? scrollTable(
          label,
          header + "<tbody>" + visible.map(draw).join("") + "</tbody>",
        )
      : "<p>No points match these filters.</p>";
    watchTables(section);
    section.querySelector("[data-page]").textContent = rows.length
      ? first +
        1 +
        "–" +
        Math.min(first + size, rows.length) +
        " of " +
        count(rows.length)
      : "0 entries";
    prev.hidden = next.hidden = rows.length <= size;
    prev.disabled = page === 0;
    next.disabled = first + size >= rows.length;
  }
  next.onclick = () => {
    page++;
    paint();
  };
  prev.onclick = () => {
    page--;
    paint();
  };
  paint();
}

function ledger(container, points, players, savedOpen) {
  container.innerHTML =
    '<details class="ta-method" data-point-log><summary>Explore ' + count(points.length) + ' charted ' + (points.length === 1 ? 'point' : 'points') + '</summary><a class="ta-jump" href="#timing-comparison">Back to comparison</a>' +
    note(
      "The score is from before the point, with the server’s score first.",
    ) +
    '<div class="ta-filters"><label>Rally length<select data-band>' +
    options([["", "All lengths"], ...bands.map((b) => [b, b])]) +
    "</select></label><label>Point ending<select data-end>" +
    options([["", "All endings"], ...Object.entries(outcomes)]) +
    "</select></label><label>Server<select data-server>" +
    options([["", "Either player"], ...players.map((p, i) => [i + 1, p])]) +
    "</select></label><label>Final hitter<select data-actor>" +
    options([["", "Either player"], ...players.map((p,i) => [i + 1, p])]) +
    '</select></label></div><button type="button" data-export>Download points (CSV)</button> <button type="button" data-clear hidden>Clear filters</button><div data-list></div>' +
    pager() + "</details>";
  const log = container.querySelector("[data-point-log]");
  const band = container.querySelector("[data-band]"),
    end = container.querySelector("[data-end]"),
    server = container.querySelector("[data-server]"),
    actor = container.querySelector("[data-actor]");
  const selectors = { length: band, ending: end, server, hitter: actor };
  const initial = new URLSearchParams(location.hash.slice(1) || location.search);
  for (const [key, select] of Object.entries(selectors)) {
    const value = initial.get(key);
    if ([...select.options].some(o => o.value === value)) select.value = value;
  }
  log.open = savedOpen ?? (location.hash === "#point-records" || Object.values(selectors).some(select => select.value));
  function showSelection() {
    log.open = true;
    container.onchange();
    band.focus({preventScroll:true});
    log.scrollIntoView({block:"start"});
  }
  const filter = () => {
    const rows = points.filter(
      (p) =>
        (!band.value || band.value === bandOf(p[7])) &&
        (!end.value || end.value === p[6]) &&
        (!server.value || Number(server.value) === p[4]) &&
        (!actor.value || Number(actor.value) === actorOf(p)),
    );
    const clear = container.querySelector("[data-clear]");
    clear.hidden = !Object.values(selectors).some(select => select.value);
    clear.onclick = () => {
      Object.values(selectors).forEach(select => { select.value = ""; });
      container.onchange();
      band.focus();
    };
    container.querySelector("[data-export]").disabled = !rows.length;
    container.querySelector("[data-export]").onclick = () => {
      const lines = [["Point", "Set", "Game", "Score", "Server", "Point winner", "Ending", "Final hitter", "Shots in play"],
        ...rows.map(p => [p[0],p[1],p[2],p[3],players[p[4]-1],players[p[5]-1],outcomes[p[6]],players[actorOf(p)-1] || "",p[7] ?? ""])];
      const csv = lines.map(row => row.map(v => '"' + String(v).replaceAll('"','""') + '"').join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
      const a = document.createElement("a"); a.href = url; a.download = "rally-tracker-points.csv"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    paginate(
      container,
      rows,
      head([
        "Point",
        "Ending",
        "Set · game",
        "Score",
        "Server",
        "Shots in play",
        "Point won by",
      ]),
      (p) => {
        const actor = players[actorOf(p) - 1];
        const attempt =
          p[7] != null && ["W", "U", "F"].includes(p[6])
            ? " on shot " + (p[7] + Number(p[6] !== "W"))
            : "";
        return bodyRow([
          html(p[0]),
          html(
            p[6] === "O" && p[7] === 1
              ? "Unreturned serve"
              : outcomes[p[6]] || "Other",
          ) +
            attempt +
            (actor ? " · " + html(actor) : ""),
          html(p[1]) + " · " + html(p[2]),
          html(p[3]),
          html(players[p[4] - 1]),
          p[7] ?? "Unknown",
          html(players[p[5] - 1]),
        ]);
      },
      "Charted points",
    );
  };
  for (const button of container.parentElement.querySelectorAll("[data-ending]")) {
    button.onclick = () => {
      band.value = server.value = "";
      end.value = button.dataset.ending;
      actor.value = button.dataset.player;
      showSelection();
    };
  }
  container.onchange = () => {
    const params = new URLSearchParams(location.hash.slice(1) || location.search);
    for (const [key, select] of Object.entries(selectors)) {
      if (select.value) params.set(key, select.value); else params.delete(key);
    }
    history.replaceState(null, "", location.pathname + location.search + (params.size ? "#" + params : ""));
    filter();
  };
  for (const button of container.parentElement.querySelectorAll(
    "[data-pick-band]",
  )) {
    button.onclick = () => {
      band.value = button.dataset.pickBand;
      end.value = "";
      server.value = "";
      actor.value = "";
      showSelection();
    };
  }
  filter();
}

export function correlation(xy) {
  if (xy.length < 5) return null;
  const mx = xy.reduce((s, v) => s + v[0], 0) / xy.length,
    my = xy.reduce((s, v) => s + v[1], 0) / xy.length;
  let cross = 0,
    xx = 0,
    yy = 0;
  for (const [x, y] of xy) {
    cross += (x - mx) * (y - my);
    xx += (x - mx) ** 2;
    yy += (y - my) ** 2;
  }
  return ratio(cross, Math.sqrt(xx * yy));
}

function pairedMeans(matches, name, minEvents = 1) {
  return matches
    .map((m) => m.stats[m.players.indexOf(name)])
    .filter((s) => s.nw >= minEvents && s.nu >= minEvents)
    .map((s) => [s.sw / s.nw, s.su / s.nu]);
}

function scatter(pairs, name, hi) {
  if (pairs.length < 5) return "";
  const r = correlation(pairs);
  const description = r == null ? "One average was constant." : "Pearson’s r = " + decimal(r) + " across " + pairs.length + " charted matches.";
  const ticks = [0.25, 0.5, 0.75].map(fraction => {
    const x = 44 + 218 * fraction, y = 160 - 135 * fraction;
    const tick = Number((hi * fraction).toFixed(1));
    return '<path d="M' + x + ' 25V160M44 ' + y + 'H262" fill="none" stroke="currentColor" opacity=".18"/>' +
      '<g fill="currentColor" font-size="11"><text x="' + x + '" y="177" text-anchor="middle">' + tick +
      '</text><text x="37" y="' + (y+4) + '" text-anchor="end">' + tick + '</text></g>';
  }).join("");
  const marks = pairs
    .map(
      ([x, y]) =>
        '<circle cx="' +
        (44 + (218 * x) / hi) +
        '" cy="' +
        (160 - (135 * y) / hi) +
        '" r="2.5"/>',
    )
    .join("");
  return (
    '<figure class="ta-scatter"><figcaption>' +
    html(name) +
    '<span class="ta-interpretation">' +
    html(description) +
    "</span>" +
    '</figcaption><svg viewBox="0 0 292 207" role="img" aria-label="' +
    html(
      "Winner and error mean shots across " +
        pairs.length +
        " charted matches for " +
        name,
    ) +
    '"><path d="M44 25V160H262" fill="none" stroke="currentColor"/>' + ticks + '<g fill="currentColor" opacity=".48">' +
    marks +
    '</g><g fill="currentColor" font-size="12"><text x="30" y="165">0</text><text x="22" y="32">' +
    hi +
    '</text><text x="250" y="178">' +
    hi +
    '</text><text x="46" y="16">Error rally (shots)</text><text x="125" y="197">Winner rally (shots)</text></g></svg></figure>'
  );
}

function sensitivity(matches, players) {
  const surfaces = [
    ...new Set(matches.map((m) => m.surface).filter(Boolean)),
  ].sort();
  const rows = ["All surfaces", ...surfaces]
    .flatMap((surface) => {
      const subset =
        surface === "All surfaces"
          ? matches
          : matches.filter((m) => m.surface === surface);
      return players.map((name) => {
        const xy = pairedMeans(subset, name, 3);
        return bodyRow([
          html(surface),
          html(name),
          count(xy.length),
          decimal(correlation(xy)),
        ]);
      });
    })
    .join("");
  return (
    '<details class="ta-method"><summary>Check by surface and sample size</summary>' +
    note(
      "Here each player needs three measured winners and three measured unforced errors per match. Check the match count for each surface.",
    ) +
    scrollTable(
      "Association by surface on higher-count matches",
      head(["Surface", "Player", "Eligible matches", "Pearson’s r"]) +
        "<tbody>" +
        rows +
        "</tbody>",
    ) +
    "</details>"
  );
}

function association(matches, players, attempt) {
  const pairs = players.map(name => pairedMeans(matches, name).map(([w,u]) => [w, u + Number(attempt)]));
  if (!pairs.some(pair => pair.length >= 5)) return "";
  const hi = Math.max(2, Math.ceil(Math.max(...pairs.flat(2)) / 2) * 2);
  return sub(
    "Patterns across matches",
    note(
      "Each dot represents one match. " + (attempt ? "The final miss counts. " : "Only shots in play count. ") + "Read across for the player’s average shots on winners and up for their average on unforced errors. Both averages give each measured ending equal weight.",
    ) +
      scrollTable(
        "Observed association across matches",
        head(["Player", "Eligible matches", "Pearson’s r"]) +
          "<tbody>" +
          players
            .map((name) => {
              const xy = pairedMeans(matches, name);
              return bodyRow([
                html(name),
                count(xy.length),
                decimal(correlation(xy)),
              ]);
            })
            .join("") +
          "</tbody>",
      ) +
      '<div class="ta-scatters">' +
      players.map((name, i) => scatter(pairs[i], name, hi)).join("") +
      "</div>" +
      note(
        "A match needs at least one measured ending of each kind to qualify. We report Pearson’s r once five matches qualify and both averages vary. With few matches, one result can shift the pattern.",
      ) +
      note("Pearson’s r measures whether the two averages rise or fall together across matches. Values near zero show little linear relationship.") + sensitivity(matches, players),
  );
}

function selectionCoverage(matches, points) {
  const total = matches.reduce((n, m) => n + m.points, 0);
  const games = matches.reduce((n, m) => n + m.games, 0);
  const partial = matches.filter((m) => m.partial).length;
  const unresolved = points.length
    ? points.filter((p) => p[6] === "O" && p[7] == null).length
    : matches.every((m) => Number.isInteger(m.unresolved))
      ? matches.reduce((n, m) => n + m.unresolved, 0)
      : null;
  let text =
    count(total) + " charted points across " + count(games) + " games.";
  if (unresolved)
    text +=
      " Missing rally length for " +
      count(unresolved) +
      " points (" +
      percent(unresolved / total) +
      ").";
  if (partial)
    text +=
      " " +
      count(partial) +
      " selected " +
      (partial === 1 ? "chart has" : "charts have") +
      " gaps in point numbering.";
  return '<p class="ta-exposure">' + text + "</p>";
}

function coverage(matches, points) {
  const unknown = matches.reduce((n, m) => n + m.other, 0);
  const credit =
    matches.length === 1 && matches[0].chartist
      ? " Match chartist: " + html(matches[0].chartist) + "."
      : "";
  return (
    '<details class="ta-method"><summary>Which points are included?</summary>' +
    selectionCoverage(matches, points) +
    note(count(unknown) + " points have other or unclear endings. They count toward game totals and are excluded from winner and error averages.") +
    note(
      "The archive can miss meetings or the last points of a match." +
        credit,
    ) +
    note(
      'Adapted from <a href="https://github.com/JeffSackmann/tennis_MatchChartingProject">Tennis Abstract’s Match Charting Project</a>, Jeff Sackmann and contributors. Derived data are shared under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.',
    ) +
    "</details>"
  );
}

export function renderAnalysis(
  root,
  { mode, matches, players, points = [], onMatch, attempt = true, onRule, results = {}, preservePoint = false },
) {
  if (!matches?.length) {
    root.innerHTML = "<p>No charted matches for this selection.</p>";
    return;
  }
  tableObserver?.disconnect();
  if (mode === "match") players = matches[0].players;
  const isMatch = mode === "match";
  const shortGame = isMatch && points.some((p,i) => {
    if (i + 1 < points.length && p[1] === points[i+1][1] && p[2] === points[i+1][2]) return false;
    return i < 3 || p[1] !== points[i-3][1] || p[2] !== points[i-3][2];
  });
  const savedRally = preservePoint && root.querySelector("[data-rally]");
  const previousRecords = preservePoint && root.querySelector("[data-records]");
  const previousHistory = previousRecords ? {
    expanded: previousRecords.querySelector("[data-history-toggle]")?.getAttribute("aria-expanded") === "true",
    page: Number(previousRecords.dataset.pageIndex),
  } : null;
  const countOptionsOpen = preservePoint && root.querySelector("[data-count-options]")?.open;
  const savedLedger = preservePoint && isMatch && root.querySelector("[data-records]");
  const recordSection = '<section class="ta-section" id="point-records" tabindex="-1" data-records></section>';
  const score = m => {
    const r = results[m.id];
    return r ? html(m.players[r[0] - 1]) + " won · " + html(r[1]) : "Final score unavailable";
  };
  const unresolved = matches.reduce((sum, m) => sum + (m.unresolved || 0), 0);
  const totalPoints = matches.reduce((sum, m) => sum + m.points, 0);
  const alerts = [];
  if (shortGame || matches.some(m => m.partial)) alerts.push("The point record may be incomplete.");
  if (totalPoints && unresolved / totalPoints >= .10)
    alerts.push("Rally length is missing for " + percent(unresolved / totalPoints) + " of these points.");
  if (mode === "h2h") alerts.push('Other meetings may be missing. <a href="#point-records">See charted meetings</a>.');
  const extra = isMatch ? "" : association(matches, players, attempt);
  root.innerHTML = '<div class="ta-analysis">' +
    (isMatch ? note(score(matches[0])) : "") +
    (alerts.length ? note(alerts.join(" ")) : "") +
    profile(matches, players, mode, attempt) +
    (isMatch ? rallyBreakdown(points, players) + '<div data-opportunities></div>' :
      (extra ? '<details class="ta-method"><summary>Do winner and error rallies lengthen together?</summary>' + extra + "</details>" : "")) +
    recordSection + coverage(matches, points) + "</div>";
  root.querySelector("[data-count-options]").open = Boolean(countOptionsOpen);
  root.querySelector("[data-count-rule]").onchange = e => onRule?.(e.target.checked);
  const timingTitle = root.querySelector("[data-count-rule]").closest("section").querySelector("h2");
  timingTitle.id = "timing-comparison";
  timingTitle.tabIndex = -1;
  watchTables(root);
  const records = root.querySelector("[data-records]");
  if (isMatch) {
    const rally = root.querySelector("[data-rally]");
    if (savedRally) {
      rally.replaceWith(savedRally);
      savedRally.dispatchEvent(new CustomEvent("rally-rule", { detail: attempt }));
    } else mountRally(rally, points, players, matches[0].surface, attempt);
    opportunityTable(root.querySelector("[data-opportunities]"), points, players);
    const oldFilters = savedLedger ? [...savedLedger.querySelectorAll("select")].map(el => el.value) : [];
    ledger(records, points, players, savedLedger ? savedLedger.querySelector("[data-point-log]").open : undefined);
    if (oldFilters.length) {
      records.querySelectorAll("select").forEach((el,i) => { el.value = oldFilters[i]; });
      records.onchange();
    }
    if (!preservePoint && (location.hash === "#point-records" || records.querySelector("[data-point-log]").open)) {
      records.scrollIntoView({block:"start"});
    }
    return;
  }
  const preview = mode === "player" && matches.length > 3;
  records.innerHTML =
    "<h2>" + (mode === "h2h" ? "Their meetings" : "Charted match history") + "</h2>" +
    (preview ? '<button type="button" data-history-toggle aria-expanded="false" aria-controls="history-list"></button>' : "") +
    '<div data-list id="history-list"></div>' + pager();
  const sorted = [...matches].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );
  const drawHistory = (visible, pageSize, startPage) => paginate(
    records,
    visible,
    head(["Date", "Event", "Winner and score", "Details"]),
    m => {
      const info = players.map(name => {
        const a = m.stats[m.players.indexOf(name)];
        return html(name) + " · " + (a.w ? "Winners: " : "") + shotAverage(ratio(a.sw, a.nw), a.w, "winners") +
          " · " + (a.u ? "Unforced errors: " : "") + shotAverage(errorLength(a.su, a.nu, attempt), a.u, "unforced errors");
      }).join("<br>");
      const details = '<details><summary>Stats</summary>' + note(html(m.surface || "Surface unknown") +
        " · " + count(m.points) + " charted points") +
        (m.points && m.unresolved / m.points >= .1 ? note("Rally length is missing for " + count(m.unresolved) + " of " + count(m.points) + " points.") : "") +
        note("Average across individual endings, " + (attempt ? "including the final miss." : "counting shots in play.") + "<br>" + info) + "</details>";
      return bodyRow([html(m.date), '<button type="button" data-match="' + html(m.id) +
        '" aria-label="Open ' + html(m.date + " " + m.event + " " + m.players.join(" versus ")) + '">' +
        html(m.event + " · " + m.round) + "</button>" +
        (mode === "player" ? "<br>vs. " + html(m.players.find(n => n !== players[0])) : ""),
        score(m), details]);
    },
    "Charted match history",
    pageSize, startPage,
  );
  const toggle = records.querySelector("[data-history-toggle]");
  function showHistory(expanded, page = 0) {
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Show latest 3" : "See all " + count(matches.length) + " charted matches";
    }
    const recentOnly = preview && !expanded;
    drawHistory(recentOnly ? sorted.slice(0, 3) : sorted, mode === "h2h" ? 3 : 15, page);
    if (recentOnly) records.querySelector("[data-page]").textContent = "Latest 3 of " + count(matches.length);
  }
  const savedHistory = previousHistory || window.history.state;
  showHistory(Boolean(savedHistory?.expanded), savedHistory?.page || 0);
  if (toggle) toggle.onclick = () => showHistory(toggle.getAttribute("aria-expanded") !== "true");
  const previousMatch = savedHistory?.returnMatch;
  if (previousMatch && !preservePoint) {
    const origin = [...records.querySelectorAll("[data-match]")].find(el => el.dataset.match === previousMatch);
    origin?.focus();
  }
  records.onclick = (e) => {
    const b = e.target.closest("[data-match]");
    if (!b) return;
    window.history.replaceState({
      expanded: toggle?.getAttribute("aria-expanded") === "true",
      page: Number(records.dataset.pageIndex), returnMatch: b.dataset.match,
    }, "");
    onMatch?.(b.dataset.match);
  };
}

// Once a measured exchange reaches a player's next contact, classify that
// opportunity once, including each nonterminal stroke that kept play going.
export function opportunities(points, player, role) {
  const rows = new Map();
  for (const point of points) {
    const [, , , , server, , kind, inPlay] = point;
    if (!["W", "U", "F"].includes(kind) || !Number.isInteger(inPlay)) continue;
    if (role === "serve" && server !== player || role === "return" && server === player) continue;
    const last = inPlay + Number(kind !== "W");
    for (let n = server === player ? 3 : 2; n <= last; n += 2) {
      if (!rows.has(n)) rows.set(n, { total: 0, W: 0, U: 0, F: 0, kept: 0 });
      const row = rows.get(n);
      row.total++;
      row[n === last ? kind : "kept"]++;
    }
  }
  return [...rows].sort(([a], [b]) => a - b);
}

function opportunityTable(host, points, players) {
  host.innerHTML = '<details class="ta-method"><summary>What happened on each shot?</summary>' +
    note("Follow one player after the serve. Each opportunity is one turn to hit in a measured rally ending in a winner, unforced error or forced error. Aces, double faults and other endings are excluded.") +
    '<div class="ta-filters"><label>Player<select data-side>' + options(players.map((p,i) => [i + 1, p])) +
    '</select></label><label>Service role<select data-role>' + options([["all","Both"],["serve","Serving"],["return","Returning"]]) +
    '</select></label></div><div data-shot-table></div></details>';
  const table = host.querySelector("[data-shot-table]");
  function update() {
    const side = Number(host.querySelector("[data-side]").value);
    const rows = opportunities(points, side, host.querySelector("[data-role]").value);
    table.querySelectorAll(".ta-scroll").forEach(el => tableObserver?.unobserve(el));
    table.innerHTML = rows.length ? scrollTable("Outcomes per shot opportunity",
      head(["Shot", "Chances", "Winner", "Unforced error", "Forced error", "Kept in play"]) + "<tbody>" +
      rows.map(([shot,r]) => bodyRow([shot, r.total, ...["W","U","F","kept"].map(key => percent(r[key]/r.total) + '<span aria-hidden="true" class="ta-share-bar" style="width:' + (r[key]/r.total*100) + '%"></span>')])).join("") +
      "</tbody>") : note("No measured opportunities for this selection.");
    watchTables(table);
  }
  host.onchange = update;
  host.querySelector("details").ontoggle = e => { if (e.currentTarget.open) update(); };
}

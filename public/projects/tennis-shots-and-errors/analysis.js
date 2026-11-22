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
const decimal = (n) => (n == null ? "—" : n.toFixed(2));
const percent = (n) => (n == null ? "—" : (n * 100).toFixed(1) + "%");
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

const scrollTable = (label, content) =>
  '<div class="ta-scroll" role="region" tabindex="0" aria-label="' +
  html(label) +
  '"><table aria-label="' +
  html(label) +
  '">' +
  content +
  "</table></div>";
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
  const flips = series.filter(v => v.win != null && v.inPlay != null &&
    v.win - v.inPlay > 1e-9 && v.win - v.inPlay < 1 - 1e-9);
  const takeaway = flips.length ? note(flips.map(v => html(v.name)).join(" and ") +
    (flips.length === 1 ? " has" : " have") + " longer winner rallies by shots in play, but later misses when the final attempt counts.") : "";
  const bars = series
    .map(
      ({ name, s, win, err }) =>
        '<div class="ta-series"><h3>' +
        html(name) +
        "</h3>" +
        [
          [win, "Winner", s.nw, s.egw],
          [err, "Unforced error", s.nu, s.egu],
        ]
          .map(
            ([v, label, n, g], i) =>
              '<div class="ta-bar-row"><span>' +
              label +
              '</span><div class="ta-track" aria-hidden="true"><i class="ta-bar style-' +
              i +
              '" style="width:' +
              ((v || 0) / scale) * 100 +
              '%"></i></div><strong>' +
              (v == null ? "—" : decimal(v) + " shots") +
              "</strong></div>" +
              '<div class="ta-support">' +
              count(n) +
              " measured " +
              (n === 1 ? "ending" : "endings") +
              (match ? "" : " · " + count(g) + " contributing games") +
              "</div>",
          )
          .join("") +
        "</div>",
    )
    .join("");
  const timing = sub(
    "How long were the rallies?",
    '<label class="ta-count-rule"><input type="checkbox" data-count-rule ' + (attempt ? 'checked' : '') + '> Count the final miss</label>' +
      note((attempt ? "Average shot number of the winner or miss." : "Average shots put in play before the point ended.") +
        (match ? " Each measured ending counts once." : " Each game with that ending counts once.")) +
      takeaway +
      '<div class="ta-bars">' +
      bars +
      "</div>" +
      (match ? '<div data-rally></div>' : "") +
      '<details class="ta-method"><summary>Reading the chart</summary>' +
      note("Each bar uses the counting rule selected above. The count under it shows how many recorded endings contributed.") +
      note("A winner on shot five counts as five either way. A miss on shot five leaves four shots in play. We count aces and double faults separately.") +
      "</details>",
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
    ["Winners", (s) => count(s.w)],
    ["Unforced errors", (s) => count(s.u)],
    ["Winners per game played", (s) => decimal(ratio(s.w, s.games))],
    ["Unforced errors per game played", (s) => decimal(ratio(s.u, s.games))],
    ["Game-average winner share", (s) => percent(ratio(s.gw, s.games))],
    ["Game-average unforced error share", (s) => percent(ratio(s.gu, s.games))],
  ];
  const frequency = sub(
    "How often did each ending happen?",
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
        "For each share, we average the player’s percentage across games. A four-point hold, a long deuce game and a tiebreak each count once. Longer matches contribute more games.",
      ),
  );
  if (mode === "player") {
    const {s} = series[0];
    const shares = sub("In an average game", note("<strong>" + percent(ratio(s.gw, s.games)) +
      "</strong> of points ended with this player’s winner and <strong>" + percent(ratio(s.gu, s.games)) +
      "</strong> with their unforced error. Each of the " + count(s.games) + " service or return games gets one vote, including tiebreaks.") +
      note(count(s.w) + " winners · " + count(s.u) + " unforced errors · " + count(matches.length) +
        (matches.length === 1 ? " charted match. This profile covers one match." : " charted matches.")));
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
    return shares + typical + timing + frequency;
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
        html(band) +
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
        "Select a rally length to see those points. Each percentage shows who won the points in that row. Short points include aces and double faults.",
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

function paginate(section, rows, header, draw, label, size = 15) {
  let page = 0;
  const next = section.querySelector("[data-next]"),
    prev = section.querySelector("[data-prev]");
  function paint() {
    const first = page * size;
    const visible = rows.slice(first, first + size);
    section.querySelector("[data-list]").innerHTML = rows.length
      ? scrollTable(
          label,
          header + "<tbody>" + visible.map(draw).join("") + "</tbody>",
        )
      : "<p>No entries match these filters.</p>";
    section.querySelector("[data-page]").textContent = rows.length
      ? first +
        1 +
        "–" +
        Math.min(first + size, rows.length) +
        " of " +
        count(rows.length)
      : "0 entries";
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

function ledger(container, points, players) {
  container.innerHTML =
    "<h2>Point by point</h2>" +
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
    '</select></label></div><button type="button" data-export>Download filtered points (CSV)</button><p class="ta-pan">Scroll sideways for more columns.</p><div data-list></div>' +
    pager();
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
  const filter = () => {
    const rows = points.filter(
      (p) =>
        (!band.value || band.value === bandOf(p[7])) &&
        (!end.value || end.value === p[6]) &&
        (!server.value || Number(server.value) === p[4]) &&
        (!actor.value || Number(actor.value) === actorOf(p)),
    );
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
        "Set · game",
        "Score",
        "Server",
        "Shots in play",
        "Ending",
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
          html(p[1]) + " · " + html(p[2]),
          html(p[3]),
          html(players[p[4] - 1]),
          p[7] ?? "—",
          html(
            p[6] === "O" && p[7] === 1
              ? "Unreturned serve"
              : outcomes[p[6]] || "Other",
          ) +
            attempt +
            (actor ? " · " + html(actor) : ""),
          html(players[p[5] - 1]),
        ]);
      },
      "Charted points",
    );
  };
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
      container.onchange();
      band.focus();
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
    "Do winner and error rallies lengthen together?",
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
      sensitivity(matches, players),
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

function coverage(matches) {
  const partial = matches.filter((m) => m.partial).length;
  const unknown = matches.reduce((n, m) => n + m.other, 0);
  const total = matches.reduce((n, m) => n + m.points, 0);
  const credit =
    matches.length === 1 && matches[0].chartist
      ? " Match chartist: " + html(matches[0].chartist) + "."
      : "";
  const partialNote = partial
    ? " " +
      count(partial) +
      " selected " +
      (partial === 1 ? "chart has" : "charts have") +
      " a gap in point numbering. Figures use the recorded points."
    : "";
  return (
    '<details class="ta-method"><summary>Coverage &amp; counting notes</summary>' +
    note(
      count(total) +
        " charted points. " +
        count(unknown) +
        " points have other or unclear endings, including unreturned serves outside the ace category. We include them in game shares and leave them out of winner and error rally averages." +
        partialNote,
    ) +
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
  if (mode === "match") players = matches[0].players;
  const isMatch = mode === "match";
  const shortGame = isMatch && points.some((p,i) => {
    if (i + 1 < points.length && p[1] === points[i+1][1] && p[2] === points[i+1][2]) return false;
    return i < 3 || p[1] !== points[i-3][1] || p[2] !== points[i-3][2];
  });
  const savedRally = preservePoint && root.querySelector("[data-rally]");
  const savedLedger = preservePoint && isMatch && root.querySelector("[data-records]");
  const history = '<section class="ta-section" id="point-records" tabindex="-1" data-records></section>';
  const score = m => {
    const r = results[m.id];
    return r ? html(m.players[r[0] - 1]) + " · " + html(r[1]) : "Result unverified";
  };
  root.innerHTML = '<div class="ta-analysis">' + selectionCoverage(matches, points) +
    (isMatch ? note(score(matches[0]) + (shortGame ? " · At least one game has fewer than four recorded points." : "")) : "") +
    (mode === "h2h" ? history : '<a class="ta-jump" href="#point-records">' +
      (isMatch ? "Jump to point-by-point" : "Jump to match history") + "</a>") +
    profile(matches, players, mode, attempt) +
    (isMatch ? rallyBreakdown(points, players) + '<div data-opportunities></div>' : association(matches, players, attempt)) +
    (mode === "h2h" ? "" : history) + coverage(matches) + "</div>";
  root.querySelector("[data-count-rule]").onchange = e => onRule?.(e.target.checked);
  const records = root.querySelector("[data-records]");
  if (isMatch) {
    const rally = root.querySelector("[data-rally]");
    if (savedRally) {
      rally.replaceWith(savedRally);
      savedRally.dispatchEvent(new CustomEvent("rally-rule", { detail: attempt }));
    } else mountRally(rally, points, players, matches[0].surface, attempt);
    opportunityTable(root.querySelector("[data-opportunities]"), points, players);
    const oldFilters = savedLedger ? [...savedLedger.querySelectorAll("select")].map(el => el.value) : [];
    ledger(records, points, players);
    if (oldFilters.length) {
      records.querySelectorAll("select").forEach((el,i) => { el.value = oldFilters[i]; });
      records.onchange();
    }
    return;
  }
  records.innerHTML =
    "<h2>Charted match history</h2>" +
    note(
      "Newest meetings first. Scores list the match winner first. The paired numbers are average shots on winners and unforced errors. " + (attempt ? "The final miss counts." : "Only shots in play count.") + "",
    ) +
    '<p class="ta-pan">Scroll sideways for more columns.</p><div data-list></div>' +
    pager();
  const sorted = [...matches].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );
  paginate(
    records,
    sorted,
    head([
      "Date",
      "Event",
      "Surface",
      "Round",
      "Players",
      "Winner · score",
      "Shots per winner / error",
      "Charted points",
    ]),
    (m) =>
      bodyRow([
        html(m.date),
        '<button type="button" data-match="' +
          html(m.id) +
          '" aria-label="' +
          html(
            "Open " + m.date + " " + m.event + " " + m.players.join(" versus "),
          ) +
          '">' +
          html(m.event) +
          "</button>",
        html(m.surface || "—"),
        html(m.round),
        m.players.map(html).join(" vs "),
        score(m),
        players
          .map((name) => {
            const a = m.stats[m.players.indexOf(name)];
            return (
              html(name) +
              " · " +
              decimal(ratio(a.sw, a.nw)) +
              " / " +
              decimal(errorLength(a.su, a.nu, attempt))
            );
          })
          .join("<br>"),
        count(m.points),
      ]),
    "Charted match history",
  );
  records.onclick = (e) => {
    const b = e.target.closest("[data-match]");
    if (b) onMatch?.(b.dataset.match);
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
    table.innerHTML = rows.length ? scrollTable("Outcomes per shot opportunity",
      head(["Shot", "Chances", "Winner", "Unforced error", "Forced error", "Kept in play"]) + "<tbody>" +
      rows.map(([shot,r]) => bodyRow([shot, r.total, ...["W","U","F","kept"].map(key => percent(r[key]/r.total) + '<span aria-hidden="true" class="ta-share-bar" style="width:' + (r[key]/r.total*100) + '%"></span>')])).join("") +
      "</tbody>") : note("No measured opportunities for this selection.");
  }
  host.onchange = update;
  host.querySelector("details").ontoggle = e => { if (e.currentTarget.open) update(); };
}

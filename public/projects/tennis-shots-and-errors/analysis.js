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

function profile(matches, players, mode) {
  const match = mode === "match";
  const series = players.map((name) => {
    const s = summarize(matches, name);
    return {
      name,
      s,
      win: match ? ratio(s.sw, s.nw) : ratio(s.grw, s.egw),
      err: match ? ratio(s.su, s.nu) : ratio(s.gru, s.egu),
    };
  });
  const max = Math.max(1, ...series.flatMap((v) => [v.win, v.err]));
  const scale = Math.ceil(max);
  const comparable = series.filter((x) => x.win != null && x.err != null);
  const greatest = comparable.sort(
    (a, b) => Math.abs(b.win - b.err) - Math.abs(a.win - a.err),
  )[0];
  let takeaway = "";
  if (greatest) {
    const gap = greatest.win - greatest.err;
    const direction = gap > 0 ? "longer" : "shorter";
    const contrast = Math.abs(gap) < 0.005
      ? "winner and unforced-error rallies had the same average length"
      : "winner rallies averaged " + decimal(Math.abs(gap)) + " shots " + direction + " than unforced-error rallies";
    takeaway = note(html(greatest.name) + "’s " + contrast + " (" + decimal(greatest.win) + " vs. " + decimal(greatest.err) + " shots in play). The winning stroke counts. Add one to the error average to include the missed stroke.");
  }
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
  let b = sub(
    "How long were the rallies?",
    note(
      match
        ? "Average shots in play when each player hit a winner or made an unforced error."
        : "Each bar averages games with that player’s winner or unforced error, depending on the bar.",
    ) +
      note("A measured ending is a point with enough recorded strokes to count its rally length.") +
      takeaway +
      '<div class="ta-bars">' +
      bars +
      "</div>" +
      '<details class="ta-method"><summary>Reading the chart</summary>' +
      note("Each bar gives the average shots in play. The measured ending count tells you how many points went into that average.") +
      note("A winner on shot five counts as five shots in play. A miss on shot five counts as four. We count aces and double faults separately.") +
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
            (s) => decimal(ratio(s.su, s.nu)),
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
  b += sub(
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
  return b;
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
    '</select></label></div><p class="ta-pan">Scroll sideways for more columns.</p><div data-list></div>' +
    pager();
  const band = container.querySelector("[data-band]"),
    end = container.querySelector("[data-end]"),
    server = container.querySelector("[data-server]");
  const filter = () => {
    const rows = points.filter(
      (p) =>
        (!band.value || band.value === bandOf(p[7])) &&
        (!end.value || end.value === p[6]) &&
        (!server.value || Number(server.value) === p[4]),
    );
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
  container.onchange = filter;
  for (const button of container.parentElement.querySelectorAll(
    "[data-pick-band]",
  )) {
    button.onclick = () => {
      band.value = button.dataset.pickBand;
      end.value = "";
      server.value = "";
      filter();
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
  const size = Math.abs(r);
  const strength = size >= 0.7 ? "strong" : size >= 0.4 ? "moderate" : "weak";
  const description =
    r === null
      ? "One of the two averages was constant."
      : size < 0.1
        ? "The two lengths showed little linear relationship."
        : "The two lengths showed a " +
          strength +
          " " +
          (r > 0 ? "positive" : "negative") +
          " relationship.";
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

function association(matches, players) {
  const pairs = players.map((name) => pairedMeans(matches, name));
  const hi = Math.max(2, Math.ceil(Math.max(...pairs.flat(2)) / 2) * 2);
  return sub(
    "Do winner and error rallies lengthen together?",
    note(
      "Each dot represents one match. Read across for the player’s average shots on winners and up for their average on unforced errors. Both averages give each measured ending equal weight.",
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
  { mode, matches, players, points = [], onMatch },
) {
  if (!matches?.length) {
    root.innerHTML = "<p>No charted matches for this selection.</p>";
    return;
  }
  if (mode === "match") players = matches[0].players;
  const isMatch = mode === "match";
  root.innerHTML =
    '<div class="ta-analysis">' +
    selectionCoverage(matches, points) +
    '<a class="ta-jump" href="#point-records">' +
    (isMatch ? "Jump to point-by-point" : "Jump to match history") +
    "</a>" +
    profile(matches, players, mode) +
    (isMatch
      ? rallyBreakdown(points, players)
      : association(matches, players)) +
    '<section class="ta-section" id="point-records" tabindex="-1" data-records></section>' +
    coverage(matches) +
    "</div>";
  const records = root.querySelector("[data-records]");
  if (isMatch) {
    ledger(records, points, players);
    return;
  }
  records.innerHTML =
    "<h2>Charted match history</h2>" +
    note(
      "Open a match to see its points. The paired numbers give each player’s average shots on winners, then on unforced errors.",
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
        players
          .map((name) => {
            const a = m.stats[m.players.indexOf(name)];
            return (
              html(name) +
              " · " +
              decimal(ratio(a.sw, a.nw)) +
              " / " +
              decimal(ratio(a.su, a.nu))
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

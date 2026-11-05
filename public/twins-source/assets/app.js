(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  if (!window.NBA_DATA?.players?.length || !window.NBA_MODEL) {
    $("error").hidden = false;
    return;
  }
  const { players, features, season, validation, source } = NBA_DATA;
  const words = {
    score: [
      "Similarity score",
      "How closely two players match across all eight stats. A score of 90 means the two profiles are 10 percentile points apart on average after weighting the eight stats. An identical profile scores 100. We rank before rounding to one decimal; exact ties use player ID. The number measures statistical resemblance, not the chance that two players are alike.",
    ],
    percentile: [
      "Percentile",
      "A player’s place among the eligible players that season. A value of 80 puts the player around the top fifth for that stat. For example, a high three-point tendency means a larger share of shots came from three.",
    ],
    knn: [
      "Nearest neighbors",
      "The other players whose eight-stat profiles have the smallest overall gaps from the player you chose. Each player can have a different set of neighbors.",
    ],
    per36: [
      "Per 36 minutes",
      "A playing-time adjustment. Divide the season total by minutes played and multiply by 36 to compare players who logged different minutes.",
    ],
    ...Object.fromEntries(
      features.map((f) => [f.key, [f.label, f.definition]]),
    ),
  };
  const definitionButton = (id, label) =>
    `<button type="button" class="term" data-term="${id}">${label}</button>`;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const normalize = (name) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const picker = $("picker"),
    definition = $("definition");
  let anchor, matches, chosen;
  function selectPlayer(p, matchId) {
    anchor = p;
    const ranked = NBA_MODEL.rank(p);
    matches = ranked.slice(0, 5);
    const middle = ranked[Math.floor(ranked.length / 2)];
    const margin = matches[4].score - ranked[5].score;
    const lead = matches[0].score - matches[1].score;
    $("ranking-margin").textContent =
      `${matches[0].player.name} leads ${matches[1].player.name} by ${lead < 0.05 ? "less than 0.1" : lead.toFixed(1)} similarity points.`;
    if (new Set(matches.map((m) => m.score.toFixed(1))).size < matches.length)
      $("ranking-margin").textContent +=
        " Some scores look tied after rounding. Their order uses the full scores.";
    $("score-context").textContent =
      `For ${p.name}, the middle score across all ${ranked.length} other players is ${middle.score.toFixed(1)}/100. Fifth and sixth place are ${margin < 0.05 ? "less than 0.1" : margin.toFixed(1)} points apart.`;
    chosen = Math.max(
      0,
      matches.findIndex((entry) => entry.player.id === matchId),
    );
    $("selected").textContent = p.name;
    $("selection-meta").textContent =
      `${p.team} · ${season} · ${p.minutes.toLocaleString()} minutes`;
    $("player-stability").textContent = Number.isInteger(p.repeatCount)
      ? `Across two sets of games, ${p.repeatCount} of ${p.name}’s five twins appeared in both lists.`
      : "Too few minutes in one half to check this player’s match stability.";
    render();
    $("announce").textContent =
      `${p.name} selected. Closest match: ${matches[0].player.name}.`;
  }
  function saveSelection() {
    const url = new URL(location.href);
    url.searchParams.set("player", anchor.id);
    url.searchParams.set("match", matches[chosen].player.id);
    url.hash = "";
    if (url.href !== location.href) history.pushState(null, "", url.href);
  }
  function restoreSelection() {
    const params = new URLSearchParams(location.search);
    selectPlayer(
      players.find((p) => p.id === params.get("player")) ||
        players.find((p) => p.name === "Stephen Curry") ||
        players[0],
      params.get("match"),
    );
  }
  function chooseMatch(i) {
    chosen = i;
    render();
    saveSelection();
    $("announce").textContent =
      `Comparing ${anchor.name} with ${matches[i].player.name}.`;
  }
  function scoreLabel(index) {
    return matches[index].score.toFixed(1);
  }
  function drawMap() {
    const cx = 210,
      cy = 149,
      radius = 94;
    const labels = [
      [210, 35],
      [348, 99],
      [315, 253],
      [105, 253],
      [72, 99],
    ];
    const rings = [90, 80, 70]
      .map(
        (score) =>
          `<circle cx="${cx}" cy="${cy}" r="${(radius * (100 - score)) / 30}"/>`,
      )
      .join("");
    const nodes = matches
      .map(({ player, score }, i) => {
        const angle = ((-90 + i * 72) * Math.PI) / 180;
        const dx = Math.cos(angle),
          dy = Math.sin(angle);
        const r = (radius * (100 - score)) / 30;
        const x = cx + r * dx,
          y = cy + r * dy;
        const [lx, ly] = labels[i],
          active = i === chosen;
        const name = player.name.split(" "),
          first = name.shift(),
          rest = name.join(" ");
        const mark = active
          ? `<path d="M${x} ${y - 5}l5 5 -5 5 -5 -5Z"/>`
          : `<circle cx="${x}" cy="${y}" r="4"/>`;
        return `<g data-rank="${i}" role="button" tabindex="0" aria-label="Compare number ${i + 1}, ${escape(player.name)}, score ${scoreLabel(i)}" aria-pressed="${active}" class="map-choice ${active ? "active" : ""}"><line class="spoke" x1="${cx}" y1="${cy}" x2="${cx + radius * dx}" y2="${cy + radius * dy}"/><g class="score-mark">${mark}</g><rect class="label-hit" x="${lx - 65}" y="${ly - 36}" width="130" height="75" rx="6"/><text x="${lx}" y="${ly - 10}" class="map-name">${escape(first)}</text><text x="${lx}" y="${ly + 5}" class="map-name">${escape(rest)}</text><text class="map-score" x="${lx}" y="${ly + 22}">#${i + 1} · ${scoreLabel(i)}</text></g>`;
      })
      .join("");
    $("map-anchor").textContent = "At center · " + anchor.name;
    $("map").innerHTML =
      `<svg viewBox="0 0 420 292" role="group" aria-label="Similarity scores around ${escape(anchor.name)}"><g class="court"><path d="M4 12v266h412V12ZM4 116h37v58H4m412-58h-37v58h37"/><circle cx="41" cy="145" r="18"/><circle cx="379" cy="145" r="18"/></g><g class="rings">${rings}</g>${[
        90, 80, 70,
      ]
        .map(
          (n) =>
            `<text class="ring-tick" x="${cx - (radius * (100 - n)) / 30}" y="${cy - 3}">${n}</text>`,
        )
        .join(
          "",
        )}${nodes}<g class="pivot" aria-hidden="true"><circle cx="${cx}" cy="${cy}" r="5"/><path d="M202 149h16m-8-8v16"/></g></svg>`;
  }
  function standing(value) {
    const n = Math.round(value);
    const suffix =
      n % 100 >= 11 && n % 100 <= 13
        ? "th"
        : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
    return n + suffix + " percentile";
  }
  const units = {
    load: "estimated shooting attempts per 36 minutes",
    ast: "assists per 36 minutes",
    three: "of shots taken from three",
    ftr: "free-throw attempts per 100 field-goal attempts",
    ts: "true shooting",
    reb: "rebounds per 36 minutes",
    stocks: "steals and blocks combined per 36 minutes",
    pf: "personal fouls per 36 minutes",
  };
  function statPair(player, i) {
    const f = features[i],
      a = anchor.values[i].toFixed(1),
      b = player.values[i].toFixed(1);
    const surname = (p) => {
      const parts = p.name.split(" ");
      return parts
        .slice(/^(Jr\.|Sr\.|II|III|IV)$/.test(parts.at(-1)) ? -2 : -1)
        .join(" ");
    };
    let left = surname(anchor),
      right = surname(player);
    if (left === right) {
      left = anchor.name;
      right = player.name;
    }
    if (f.key === "three")
      return `${left} took ${a}% of shots from three, ${right} ${b}%`;
    if (f.key === "ts")
      return `${left} posted ${a}% true shooting, ${right} ${b}%`;
    return `${left} averaged ${a} ${units[f.key]}, ${right} ${b}`;
  }
  function sharedTrait(player) {
    const i = features
      .map((_, i) => i)
      .sort(
        (a, b) =>
          Math.abs(anchor.p[a] - player.p[a]) -
          Math.abs(anchor.p[b] - player.p[b]),
      )[0];
    return `Closest stat: ${statPair(player, i)}.`;
  }
  function render() {
    const { player: rival } = matches[chosen];
    $("compare-context").textContent =
      `Match ${chosen + 1} of 5 · ${scoreLabel(chosen)}/100 · ${season}`;
    $("next-match").textContent =
      chosen === 4 ? "First match →" : "Next match →";
    drawMap();
    $("matches").innerHTML = matches
      .map(
        ({ player }, i) =>
          `<li><button type="button" class="match" data-rank="${i}" aria-pressed="${chosen === i}" aria-controls="profile"><span class="number">${String(i + 1).padStart(2, "0")}</span><span><span class="player">${escape(player.name)}</span><span class="sub">${escape(player.team)}${i === 0 ? " · Closest profile" : ""}</span></span><span class="score">${scoreLabel(i)}<small>/100</small> <span class="arrow" aria-hidden="true">›</span></span>${
            i === 0
              ? `<span class="shared">${escape(sharedTrait(player))}</span>`
              : ""
          }</button></li>`,
      )
      .join("");
    const diffs = features
      .map((f, i) => ({ f, i, gap: Math.abs(anchor.p[i] - rival.p[i]) }))
      .sort((a, b) => a.gap - b.gap);
    $("comparison").textContent = `${anchor.name} & ${rival.name}`;
    const near = diffs[0],
      far = diffs.at(-1);
    $("insight").innerHTML =
      `<strong>Where they match.</strong> ${escape(statPair(rival, near.i))}. <strong>Where they differ.</strong> ${escape(statPair(rival, far.i))}.`;
    const repeats = anchor.pairRepeats?.[rival.id];
    $("pair-stability").textContent = Number.isInteger(repeats)
      ? `We tried ${validation.bootstrapDraws} different mixes of the same games. ${rival.name} made the five in ${repeats} of those checks and ranked first in ${anchor.firstRepeats[rival.id]}.`
      : "";
    const costly = diffs.reduce((best, x) =>
      x.gap * x.f.weight > best.gap * best.f.weight ? x : best,
    );
    const loss = (costly.gap * costly.f.weight).toFixed(1);
    $("score-loss").innerHTML =
      `${definitionButton(costly.f.key, costly.f.label)} accounts for the largest deduction: ${loss} points. Across all eight stats the weighted gap is ${matches[chosen].distance.toFixed(1)} points, giving a score of ${matches[chosen].score.toFixed(1)} out of 100.`;
    $("key").innerHTML =
      `<span class="legend"><i class="dot"></i>${escape(anchor.name)}</span><span class="legend"><i class="diamond"></i>${escape(rival.name)}</span>`;
    $("recenter").hidden = false;
    $("recenter").textContent = `Find twins for ${rival.name} →`;
    renderStats(rival);
  }

  function renderStats(rival) {
    $("anchor-column").textContent = anchor.name;
    $("match-column").textContent = rival.name;
    const cell = (player, stat, i) => `<td>
      ${player.values[i].toFixed(1)}${stat.unit === "%" ? "%" : ""}
      <small class="mobile-standing">${standing(player.p[i])}</small>
    </td>`;
    $("stat-rows").innerHTML = features
      .map((stat, i) => {
        const left = anchor.p[i],
          right = rival.p[i];
        return `<tr>
        <th scope="row">${definitionButton(stat.key, escape(stat.label))}</th>
        <td class="axis"><div class="track" aria-label="Percentiles ${Math.round(left)} and ${Math.round(right)}">
          <i class="dot" style="left:${left}%"></i>
          <i class="diamond" style="left:${right}%"></i>
        </div></td>
        ${cell(anchor, stat, i)}${cell(rival, stat, i)}
      </tr>`;
      })
      .join("");
  }
  function renderRoster() {
    const input = $("search").value.trim();
    const query = normalize(input);
    const parts = input
      .split(/[\s-]+/)
      .map(normalize)
      .filter(Boolean);
    const found = players.filter((p) => {
      const words = p.name.split(/[\s-]+/).map(normalize);
      const initials = words.map((word) => word[0]).join("");
      return (
        normalize(p.name).includes(query) ||
        (query.length >= 2 && query === initials) ||
        parts.every((part) => words.some((word) => word.startsWith(part)))
      );
    });
    $("count").textContent =
      `${found.length} of ${players.length} eligible players · ${season}`;
    $("roster").innerHTML = found.length
      ? found
          .map(
            (p) =>
              `<button type="button" data-player="${escape(p.id)}">${escape(p.name)} <small>· ${escape(p.team)}</small></button>`,
          )
          .join("")
      : `<p class="empty">No match. Try a surname. This list includes players with at least 750 minutes in ${season}.</p>`;
    $("roster").scrollTop = 0;
  }
  $("choose").disabled = false;
  $("choose").onclick = () => {
    $("search").value = "";
    renderRoster();
    picker.showModal();
    $("search").focus();
  };
  $("search").oninput = renderRoster;
  $("search").onkeydown = (e) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      const first = $("roster").querySelector("button");
      if (first) {
        e.preventDefault();
        e.key === "Enter" ? first.click() : first.focus();
      }
    }
  };
  $("roster").onclick = (e) => {
    const el = e.target.closest("[data-player]");
    if (el) {
      picker.close();
      selectPlayer(players.find((p) => p.id === el.dataset.player));
      saveSelection();
    }
  };
  $("next-match").onclick = () => {
    chooseMatch((chosen + 1) % 5);
    $("comparison").focus();
  };
  $("recenter").onclick = () => {
    selectPlayer(matches[chosen].player);
    saveSelection();
    $("choose").focus();
  };
  document.addEventListener("click", (e) => {
    const match = e.target.closest("[data-rank]");
    if (match) {
      const map = match.closest("svg");
      chooseMatch(Number(match.dataset.rank));
      const group = map ? $("map") : $("matches");
      if ($("comparison").getBoundingClientRect().bottom > innerHeight) {
        $("comparison").focus({ preventScroll: true });
        $("profile").scrollIntoView({ block: "start" });
      } else
        group
          .querySelector(`[data-rank="${chosen}"]`)
          .focus({ preventScroll: true });
      return;
    }
    const term = e.target.closest("[data-term]");
    if (term) {
      const key = term.dataset.term;
      $("def-title").textContent = words[key][0];
      $("def-copy").textContent = words[key][1];
      $("full-def").href = "#def-" + key;
      definition.showModal();
    }
    if (e.target.closest(".close")) e.target.closest("dialog").close();
  });
  $("map").addEventListener("keydown", (e) => {
    if (["Enter", " "].includes(e.key) && e.target.closest("[data-rank]")) {
      e.preventDefault();
      e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  });
  $("full-def").onclick = (e) => {
    e.preventDefault();
    const node = document.querySelector($("full-def").getAttribute("href"));
    definition.close();
    node.focus();
    node.scrollIntoView({ block: "center" });
  };
  for (const dialog of [picker, definition])
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    });
  $("terms").innerHTML = Object.entries(words)
    .map(
      ([id, [title, copy]]) =>
        `<dt tabindex="-1" id="def-${id}">${escape(title)}</dt><dd>${escape(copy)}</dd>`,
    )
    .join("");
  $("cohort-size").textContent = players.length;
  $("cohort-season").textContent = season;
  $("weight-list").textContent = features
    .map((f) => `${f.label} ${(100 * f.weight).toFixed(1)}%`)
    .join(" · ");
  $("source-link").href = source;
  window.addEventListener("popstate", restoreSelection);
  restoreSelection();
})();

// Historical rosters use the same eligibility, eight stats and within-season percentiles as the explorer.
(() => {
  const el = id => document.getElementById(id);
  if (!window.NBA_MODEL || !window.NBA_DATA) return;
  const dialog = el('twin-game'), form = el('guess-form'), input = el('guess-name');
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const normalize = name => name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const labels = {
    load: 'Estimated shot attempts / 36 min', ast: 'Assists / 36 min',
    three: 'Shots taken from three', ftr: 'Free throws / 100 field-goal attempts',
    ts: 'True shooting', reb: 'Rebounds / 36 min', stocks: 'Steals + blocks / 36 min',
    pf: 'Personal fouls / 36 min',
  };
  let subject, season, candidates, ranked, locked = false;
  function drawStats(guess) {
    el('subject-column').textContent = subject.name;
    el('guess-column').hidden = !guess;
    el('guess-column').textContent = guess?.name || '';
    const body = el('game-clues').tBodies[0];
    body.replaceChildren();
    NBA_DATA.features.forEach((f,i) => {
      const row = body.insertRow();
      const heading = document.createElement('th');
      heading.scope = 'row'; heading.textContent = labels[f.key];
      row.append(heading);
      for (const p of guess ? [subject,guess] : [subject]) {
        row.insertCell().textContent = p.values[i].toFixed(1) + (f.unit === '%' ? '%' : '');
      }
    });
  }
  async function drawRound() {
    el('game-next').hidden = false;
    el('game-next').disabled = true;
    el('game-round').hidden = true;
    el('game-result').hidden = true;
    el('game-rule').hidden = false;
    el('game-status').textContent = 'Drawing a player…';
    try {
      const year = 2010 + Math.floor(Math.random() * 14);
      const nextSeason = year + '–' + String(year + 1).slice(-2);
      let players = NBA_DATA.players;
      if (nextSeason !== NBA_DATA.season) {
        const response = await fetch('/twins-source/data/round-' + nextSeason.replace('–','-') + '.json');
        if (!response.ok) throw new Error('Roster unavailable');
        players = await response.json();
      }
      const visibleName = el('selected').textContent;
      subject = pick(players.filter(p => !(season === nextSeason && p.id === subject?.id) &&
        !(nextSeason === NBA_DATA.season && p.name === visibleName)));
      season = nextSeason;
      ranked = NBA_MODEL.rank(subject, players);
      candidates = players.filter(p => p.id !== subject.id);
      locked = false;
      el('game-season').textContent = season + ' · ' + subject.team;
      el('game-subject').textContent = subject.name;
      drawStats();
      el('game-roster').replaceChildren(...candidates.map(p => new Option(p.team, p.name + ' · ' + p.team)));
      input.value = ''; input.setCustomValidity('');
      form.hidden = false;
      el('game-round').hidden = false;
      el('game-status').textContent = '';
      if (dialog.open) el('game-subject').focus();
    } catch {
      subject = null;
      el('game-status').textContent = 'This season couldn’t load. Try another draw.';
    } finally { el('game-next').disabled = false; }
  }
  input.addEventListener('input', () => input.setCustomValidity(''));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (locked || !subject) return;
    const query = normalize(input.value);
    const hits = candidates.filter(p => normalize(p.name) === query || normalize(p.name + p.team) === query);
    if (hits.length !== 1) {
      input.setCustomValidity('Choose another player from the season list. Players need at least 750 minutes.');
      input.reportValidity(); return;
    }
    const guess = hits[0];
    const index = ranked.findIndex(m => m.player.id === guess.id);
    locked = true; form.hidden = true;
    drawStats(guess);
    el('result-title').textContent = index < 5 ? 'You found a top-five twin!' : 'Outside the top five';
    el('game-rank').textContent = guess.name + ' ranked #' + (index + 1) + ' of ' + ranked.length +
      ' · ' + ranked[index].score.toFixed(1) + '/100 similarity.';
    el('game-five').replaceChildren(...ranked.slice(0,5).map(({player,score}) => {
      const li = document.createElement('li');
      li.textContent = player.name + ' · ' + score.toFixed(1) + '/100' + (player.id === guess.id ? ' · Your guess' : '');
      return li;
    }));
    el('game-next').hidden = true;
    el('game-rule').hidden = true;
    el('game-result').hidden = false;
    el('result-title').focus();
  });
  el('twin-play').hidden = false;
  el('twin-play').onclick = () => {
    dialog.showModal();
    if (!subject && !el('game-next').disabled) drawRound();
  };
  el('game-next').onclick = drawRound;
  el('game-replay').onclick = drawRound;
})();

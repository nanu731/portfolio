/* Shared reader controls. The project engines remain responsible for their data and results. */
(() => {
  'use strict';
  const kind = document.body.dataset.project;
  const area = document.querySelector('.std-selection-area');
  if (!kind || !area) return;
  const one = (selector, root = document) => root.querySelector(selector);
  const text = (node, value) => { if (node && node.textContent !== value) node.textContent = value; };
  const normalize = value => String(value).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const compact = value => normalize(value).replaceAll(' ', '');
  // Names can render from the last successful scoped roster while it refreshes.
  // The original engine still validates and commits the selected player's data.
  const cache = new Map();
  const json = url => {
    let entry = cache.get(url);
    const now = Date.now();
    const refresh = () => {
      if (entry?.pending) return entry.pending;
      entry ||= { data: null, updated: 0, pending: null };
      cache.set(url, entry);
      while (cache.size > 12) cache.delete(cache.keys().next().value);
      entry.pending = fetch(url).then(response => {
        if (!response.ok) throw new Error('Player names could not be loaded.');
        return response.json();
      }).then(data => {
        // Retain menu identities and scope, not a second copy of model/stat data.
        if (/\/moneyball\//.test(url) && data.views?.[0]?.players) data = { views: [{ players: data.views[0].players.map(({ id, name, teams }) => ({ id, name, teams })) }] };
        entry.data = data; entry.updated = Date.now(); return data;
      })
        .finally(() => { entry.pending = null; });
      return entry.pending;
    };
    if (entry?.data) {
      if (now - entry.updated > 60000) void refresh().catch(() => {});
      return Promise.resolve(entry.data);
    }
    return refresh();
  };
  const inputEvent = input => input.dispatchEvent(new Event('input', { bubbles: true }));
  const hide = node => { if (node) node.classList.add('std-original-selection'); };
  const spatial = [...document.querySelectorAll('spatial-shot-explorer')];
  const nfl = one('nfl-comparison');
  const moneyball = one('[data-moneyball]');
  const tennis = one('[data-tennis-explorer]');
  let frame = 0;
  const scheduleSync = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync(); }); };

  function spatialAdapter(engine, slot) {
    return {
      slot,
      ready: () => Boolean(engine?.players?.length && !engine.search?.disabled),
      loading: () => engine?.stage?.getAttribute('aria-busy') === 'true',
      selected: () => one('[data-player-name]', engine)?.textContent || engine?.search?.value || 'Choose a player',
      context: () => engine?.seasonSelect?.selectedOptions?.[0]?.textContent || one('[data-season]', engine)?.textContent || '',
      roster: async () => (engine.players || []).map(player => ({
        id: player.player_id, name: player.player_name,
        context: player.evidence_status === 'single_destination' ? 'One area passes the evidence rules' : player.evidence_status === 'insufficient_evidence' ? 'No clear area for moving shots' : '',
        source: player,
      })),
      commit: entry => {
        if (kind === 'comparison' && spatial.some(other => other !== engine && other.dataset.selectedId === String(entry.id))) throw new Error('Choose a different player. This player is already selected on the other side.');
        return engine.selectSuggestion(entry.source);
      },
    };
  }

  let adapters = [];
  if (kind === 'twins') {
    hide(one('#choose'));
    // Keep the incumbent identity nodes, because its renderer updates these IDs.
    hide(one('#choose')?.closest('.controls'));
    adapters = [{
      ready: () => Boolean(window.NBA_DATA?.players?.length && window.NBA_MODEL),
      selected: () => one('#selected')?.textContent || 'Choose a player',
      context: () => one('#selection-meta')?.textContent || '',
      roster: async () => window.NBA_DATA.players.map(player => ({ id: player.id, name: player.name, context: player.team, source: player })),
      commit: entry => {
        const url = new URL(location.href);
        url.searchParams.set('player', entry.id);
        url.searchParams.delete('match');
        url.hash = '';
        history.pushState(null, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    }];
  } else if (kind === 'shots' || kind === 'comparison') {
    spatial.forEach(engine => hide(one('.player-combobox', engine.selectionControls || engine)));
    adapters = spatial.map((engine, index) => spatialAdapter(engine, kind === 'comparison' ? index === 0 ? 'A' : 'B' : ''));
  } else if (kind === 'nfl' && nfl) {
    nfl.querySelectorAll('.player-combobox').forEach(hide);
    adapters = ['a', 'b'].map(side => ({
      slot: side.toUpperCase(),
      ready: () => nfl.dataset.state === 'ready' && typeof nfl.seasonPlayers === 'function' && !nfl.search(side).disabled,
      selected: () => typeof nfl.selectedName === 'function' ? nfl.selectedName(side) || 'Choose a quarterback' : 'Choose a quarterback',
      context: () => one(`[data-season-${side}]`, nfl)?.selectedOptions?.[0]?.textContent || '',
      roster: async () => nfl.seasonPlayers(side).map(player => ({ id: player.id, name: player.name, source: player })),
      commit: entry => nfl.choosePlayer(side, entry.source),
    }));
  } else if (kind === 'moneyball' && moneyball) {
    hide(one('[data-mb-search-shell]', moneyball));
    adapters = [{
      ready: () => !one('[data-mb-search]', moneyball)?.disabled && Boolean(one('[data-mb-season]', moneyball)?.value),
      selected: () => one('[data-mb-selection-name]', moneyball)?.textContent.replace(/^(?:Example|Selected):?\s*/, '') || 'Choose a player',
      context: () => one('[data-mb-selection-context]', moneyball)?.textContent || '',
      roster: async () => {
        const season = Number(one('[data-mb-season]', moneyball).value);
        const windowSize = Number(one('[data-mb-window]', moneyball).value);
        const team = one('[data-mb-team]', moneyball).value;
        const index = await json('/data/moneyball/v1/index.json');
        const view = index.views.find(view => view.endSeason === season && view.window === windowSize);
        if (!view) throw new Error('This season and time span have no player list.');
        const bundle = await json(view.url);
        return bundle.views[0].players.filter(player => !team || player.teams.includes(team)).map(player => ({ id: player.id, name: player.name, context: player.teams.join(' · '), source: player }));
      },
      commit: entry => {
        const search = one('[data-mb-search]', moneyball);
        search.value = entry.name;
        inputEvent(search);
        const options = one('[data-mb-suggestions]', moneyball);
        const option = document.getElementById(`${options.id}-option-${entry.id}`);
        if (!option) throw new Error('That player is no longer in the selected view.');
        option.click();
        // The original engine ignores this full-name query after it commits the ID.
        // Dispatching another input event would clear that committed selection.
      },
    }];
  } else if (kind === 'draft') {
    const engine = one('draft-explorer');
    const form = one('[data-find-player-form]', engine);
    hide(form);
    adapters = [{
      label: 'Selected draft pick', action: 'Find a player', pickerTitle: 'Find any draftee',
      ready: () => Boolean(customElements.get('draft-explorer') && one('[data-pick]', engine)?.value),
      selected: () => `Pick ${one('[data-pick]', engine)?.value || '41'}`,
      context: () => one('[data-active-player-record]:not([hidden]) .player-record-name', engine)?.textContent.trim() || '',
      roster: async () => [...engine.querySelectorAll('#draft-player-directory option')].map(option => ({ id: `${option.dataset.findPick}-${option.dataset.findYear}`, name: option.dataset.findName, context: `${option.dataset.findYear} draft · pick ${option.dataset.findPick}`, source: option.value })),
      commit: entry => {
        one('[data-find-player-choices]', engine).hidden = true;
        const input = one('[data-find-player]', engine);
        input.value = entry.source; inputEvent(input); form.requestSubmit();
      },
    }];
  } else if (kind === 'tennis' && tennis) {
    hide(one('.tennis-player-combobox', tennis));
    const control = name => one(`[data-tennis-control="${name}"]`, tennis);
    adapters = [{
      ready: () => !control('search')?.disabled && Boolean(control('search')?.value),
      loading: () => one('#tennis-view', tennis)?.getAttribute('aria-busy') === 'true',
      selected: () => control('search')?.value || 'Choose a player',
      context: () => control('category')?.selectedOptions?.[0]?.textContent || '',
      roster: async () => {
        const index = await json('/data/tennis-viewer-index-v1.json');
        const category = control('category').value;
        return index.players.filter(player => player.category === category && !player.hidden).map(player => ({ id: player.file, name: player.player, source: player }));
      },
      commit: entry => {
        const search = control('search');
        search.value = entry.name;
        inputEvent(search);
        const hash = entry.source.file.match(/[a-f0-9]{64}/)?.[0];
        const option = hash && document.getElementById(`tennis-player-option-${hash}`);
        if (!option) throw new Error('That player is no longer in the selected category.');
        option.click();
      },
    }];
  }
  if (!adapters.length) return;

  const icon = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"></circle><path d="m15 15 6 6"></path></svg>';
  const rows = adapters.map(adapter => {
    const row = document.createElement('div');
    row.className = 'std-selected-row controls';
    const identity = document.createElement('div');
    const label = document.createElement('span');
    label.className = 'kicker';
    label.textContent = adapter.label || (adapter.slot ? `Player ${adapter.slot}` : 'Selected player');
    const name = document.createElement('h2');
    name.className = 'std-selected-name';
    const context = document.createElement('span');
    context.className = 'std-selected-meta';
    context.setAttribute('role', 'status');
    identity.append(label, name, context);
    const button = document.createElement('button');
    button.className = 'solid std-change-player';
    button.type = 'button';
    button.innerHTML = icon;
    button.append(document.createTextNode(adapter.action || (adapter.slot ? `Change player ${adapter.slot}` : 'Change player')));
    button.disabled = true;
    button.addEventListener('click', () => openPicker(adapter, button));
    const warmRoster = () => { if (adapter.ready()) void adapter.roster().catch(() => {}); };
    button.addEventListener('pointerenter', warmRoster, { passive: true });
    button.addEventListener('focus', warmRoster);
    row.append(identity, button);
    area.append(row);
    return { adapter, name, context, button };
  });
  if (kind === 'twins') {
    one('#recenter')?.addEventListener('click', () => {
      requestAnimationFrame(() => rows[0].button.focus({ preventScroll: true }));
    });
  }
  if (kind === 'moneyball') {
    one('[data-mb-find-player]', moneyball)?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPicker(adapters[0], rows[0].button);
    }, true);
  }

  let picker = one('#std-picker');
  if (!picker) {
    picker = document.createElement('dialog');
    picker.id = 'std-picker';
    picker.className = 'std-picker';
    picker.setAttribute('aria-labelledby', 'std-picker-title');
    picker.innerHTML = '<div class="dialog-header"><h2 id="std-picker-title">Choose a player</h2><button type="button" class="close" aria-label="Close player list">×</button></div><label for="std-picker-search">Search by player name</label><input id="std-picker-search" type="search" placeholder="Type a name…" autocomplete="off"><p id="std-picker-status" role="status"></p><div id="std-picker-results"></div>';
    document.body.append(picker);
  }
  const search = one('#std-picker-search', picker);
  const results = one('#std-picker-results', picker);
  const status = one('#std-picker-status', picker);
  let activeAdapter, opener, roster = [], matches = [], request = 0;
  function sync() {
    for (const row of rows) {
      try {
        if (row.optimistic && row.adapter.loading?.()) {
          text(row.name, row.optimistic); text(row.context, 'Loading player data…');
        } else {
          row.optimistic = null;
          text(row.name, row.adapter.selected()); text(row.context, row.adapter.context?.() || '');
        }
        const disabled = !row.adapter.ready();
        if (row.button.disabled !== disabled) row.button.disabled = disabled;
      } catch { if (!row.button.disabled) row.button.disabled = true; }
    }
    if (kind !== 'twins') {
      document.querySelectorAll('[data-definition-trigger]').forEach(trigger => {
        if (trigger.getAttribute('aria-haspopup') !== 'dialog') trigger.setAttribute('aria-haspopup', 'dialog');
        if (trigger.getAttribute('aria-controls') !== 'definition') trigger.setAttribute('aria-controls', 'definition');
        if (trigger.hasAttribute('aria-expanded')) trigger.removeAttribute('aria-expanded');
      });
    }
  }
  async function openPicker(adapter, button) {
    activeAdapter = adapter;
    opener = button;
    roster = [];
    matches = [];
    search.value = '';
    const skeleton = document.createElement('div'); skeleton.className = 'std-roster-skeleton'; skeleton.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 4; i++) { const line = document.createElement('span'); line.className = 'std-skeleton-line'; skeleton.append(line); }
    results.replaceChildren(skeleton);
    text(one('#std-picker-title', picker), adapter.pickerTitle || (adapter.slot ? `Choose player ${adapter.slot}` : 'Choose a player'));
    text(status, 'Loading player names…');
    picker.showModal();
    search.focus();
    const version = ++request;
    try {
      const entries = await adapter.roster();
      if (version !== request || !picker.open) return;
      roster = entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || String(a.id).localeCompare(String(b.id)));
      renderRoster();
    } catch (error) { if (version === request && picker.open) { results.replaceChildren(); text(status, `${error.message} Close this list and try again.`); } }
  }
  function renderRoster() {
    const query = normalize(search.value);
    const squeezed = compact(query);
    const parts = query.split(' ').filter(Boolean);
    matches = roster.filter(entry => {
      const name = normalize(entry.name);
      const words = name.split(' ');
      return !query || name.includes(query) || compact(name).includes(squeezed) || parts.every(part => words.some(word => word.startsWith(part))) || squeezed.length >= 2 && words.map(word => word[0]).join('') === squeezed;
    });
    const fragment = document.createDocumentFragment();
    for (const entry of matches) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.stdOption = entry.id;
      button.textContent = entry.name;
      if (entry.context) { const detail = document.createElement('small'); detail.textContent = ` · ${entry.context}`; button.append(detail); }
      button.addEventListener('click', () => commit(entry));
      fragment.append(button);
    }
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No match. Try a surname or change the selected scope.';
      fragment.append(empty);
    }
    results.replaceChildren(fragment);
    results.scrollTop = 0;
    text(status, `${matches.length} of ${roster.length} eligible players${query && matches.length > 1 ? '. Choose a name from the list.' : ''}`);
  }
  function commit(entry) {
    if (!activeAdapter || !picker.open) return;
    const adapter = activeAdapter;
    const row = rows.find(row => row.adapter === adapter);
    if (row) { row.optimistic = entry.name; text(row.name, entry.name); text(row.context, 'Loading player data…'); }
    picker.close();
    try { adapter.commit(entry); } catch (error) {
      text(status, error.message);
      picker.showModal();
      search.focus();
    }
    scheduleSync();
  }
  search.addEventListener('input', renderRoster);
  search.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); one('[data-std-option]', results)?.focus(); }
    if (event.key === 'Enter') {
      event.preventDefault();
      const exact = matches.filter(entry => compact(entry.name) === compact(search.value));
      if (exact.length === 1) commit(exact[0]);
      else if (matches.length === 1) commit(matches[0]);
      else text(status, matches.length ? `${matches.length} matches. Choose a player from the list.` : 'No match. Try a surname or change the selected scope.');
    }
  });
  results.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...results.querySelectorAll('[data-std-option]')];
    if (!buttons.length) return;
    event.preventDefault();
    let index = buttons.indexOf(document.activeElement);
    index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[index].focus();
  });
  one('.close', picker)?.addEventListener('click', () => picker.close());
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      picker.close();
    }
  });
  picker.addEventListener('close', () => { ++request; opener?.focus({ preventScroll: true }); });
  picker.addEventListener('click', event => {
    if (event.target !== picker) return;
    const rect = picker.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) picker.close();
  });

  // Changes made through plots, context controls, history, or asynchronous data loads
  // all update the same selected-player rows without firing a second engine action.
  new MutationObserver(scheduleSync).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'aria-busy', 'data-state', 'data-selected-id', 'data-comparison-ready'] });
  document.addEventListener('change', scheduleSync);
  document.addEventListener('click', scheduleSync);
  window.addEventListener('popstate', scheduleSync);
  window.addEventListener('hashchange', scheduleSync);
  sync();

  // Every documentation link reveals its destination before moving keyboard focus.
  function revealReferenceHash() {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    if (target.tagName === 'DETAILS') target.open = true;
  }
  window.addEventListener('hashchange', revealReferenceHash);
  revealReferenceHash();
  document.querySelectorAll('.std-section-menu a[href^="#std-"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, '', link.hash);
      if (target.tagName === 'DETAILS') target.open = true;
      link.closest('.std-section-menu').open = false;
      target.tabIndex = -1;
      target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' });
    });
  });

  if (kind === 'twins') {
    one('#definition')?.classList.add('std-definition');
    one('#full-def')?.addEventListener('click', () => {
      const target = document.getElementById(one('#full-def').hash.slice(1));
      for (let parent = target?.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
    }, true);

    return; // Keep the original term-copy and link handler, with the shared dialog style.
  }
  let definition = one('#definition');
  if (!definition) {
    definition = document.createElement('dialog');
    definition.id = 'definition';
    definition.className = 'std-definition';
    definition.setAttribute('aria-labelledby', 'def-title');
    definition.innerHTML = '<div class="dialog-header"><h2 id="def-title"></h2><button type="button" class="close" aria-label="Close definition">×</button></div><p id="def-copy"></p><a id="full-def" href="#std-definitions">Read full definition ↓</a>';
    document.body.append(definition);
  }
  let termOpener;
  let restoreTermFocus = true;
  const fullDefinition = one('#full-def', definition);
  one('.close', definition)?.addEventListener('click', () => definition.close());
  definition.addEventListener('close', () => {
    if (restoreTermFocus) termOpener?.focus({ preventScroll: true });
  });
  definition.addEventListener('click', event => {
    if (event.target !== definition) return;
    const rect = definition.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) definition.close();
  });
  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element && event.target.closest('[data-definition-trigger]');
    if (!trigger) return;
    const help = trigger.closest('definition-help');
    const copy = help && one('[data-help-copy]', help);
    if (!copy) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    termOpener = trigger;
    restoreTermFocus = true;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'definition');
    trigger.removeAttribute('aria-expanded');
    text(one('#def-title', definition), one('[data-help-label]', trigger)?.textContent || trigger.getAttribute('aria-label')?.replace(/^Explain\s+/, '') || trigger.textContent);
    text(one('#def-copy', definition), copy.textContent.trim());
    const detail = one('[data-detail-target]', help);
    const link = one('a.definition-detail', help);
    fullDefinition.href = detail ? `#${detail.dataset.detailTarget}` : link?.getAttribute('href') || '#std-definitions';
    definition.showModal();
  }, true);
  fullDefinition.addEventListener('click', event => {
    const url = new URL(fullDefinition.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    const chain = [];
    for (let parent = target.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') chain.push(parent);
    chain.reverse().forEach(details => { details.open = true; });
    if (target.tagName === 'SUMMARY') target.parentElement.open = true;
    if (target.tagName === 'DETAILS') target.open = true;
    restoreTermFocus = false;
    definition.close();
    history.replaceState({ ...history.state, stdDefinitionOrigin: termOpener?.id, stdDefinitionFragment: location.hash }, '');
    history.pushState({ ...history.state, stdDefinitionOrigin: null }, '', url.hash);
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    requestAnimationFrame(() => { target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' }); });
  });
  window.addEventListener('popstate', () => {
    const state = history.state;
    if (state?.stdDefinitionFragment === location.hash && typeof state.stdDefinitionOrigin === 'string') {
      document.getElementById(state.stdDefinitionOrigin)?.focus({ preventScroll: true });
    }
  });
})();

import { createProfileRenderer, matchLabel } from './tennis-profile-renderer.mjs';

export const packetVersion = 'TENNIS_PORTFOLIO_DISPLAY_1.0.0';
const key = meta => JSON.stringify([meta.aggregation_level, meta.category, meta.player, meta.match_id]);

export function validateCatalog(catalog) {
  if (catalog?.version !== packetVersion || !Array.isArray(catalog.players)) throw new Error('Invalid display index');
  const identities = new Set();
  for (const entry of catalog.players) {
    const id = JSON.stringify([entry.category, entry.player]);
    if (!['ATP', 'WTA'].includes(entry.category) || typeof entry.player !== 'string' || identities.has(id)
        || !/^\/data\/tennis-viewer-v1-[a-f0-9]{64}\.json$/.test(entry.file)
        || entry.hidden !== (entry.category === 'ATP' && entry.player === 'Dominik Koepfer')) throw new Error('Invalid player index');
    identities.add(id);
  }
  return catalog;
}

export function validatePacket(packet, entry) {
  if (packet?.version !== packetVersion || !Array.isArray(packet.profiles) || !Array.isArray(packet.context)
      || !Array.isArray(packet.coverage) || !packet.profiles.length) throw new Error('Invalid player display');
  const ids = new Set();
  for (const group of packet.profiles) {
    if (group.meta?.category !== entry.category || group.meta?.player !== entry.player || ids.has(key(group.meta))
        || !Array.isArray(group.values)) throw new Error('Player identity mismatch');
    ids.add(key(group.meta));
  }
  const contextIds = new Set(packet.context.map(group => key(group.meta)));
  if (contextIds.size !== packet.context.length || contextIds.size !== ids.size || [...ids].some(id => !contextIds.has(id))) {
    throw new Error('Point context mismatch');
  }
  return packet;
}

export function createPacketLoader(fetcher = fetch) {
  let serial = 0, controller;
  const cache = new Map();
  return {
    invalidate() { serial++; controller?.abort(); },
    async load(entry) {
      const request = ++serial;
      controller?.abort();
      controller = new AbortController();
      try {
        let packet = cache.get(entry.file);
        if (!packet) {
          const response = await fetcher(entry.file, { signal: controller.signal });
          if (!response.ok) throw new Error('Player display request failed');
          packet = validatePacket(await response.json(), entry);
          if (request === serial) cache.set(entry.file, packet);
        }
        return { current: request === serial, packet };
      } catch (error) {
        if (request !== serial || error.name === 'AbortError') return { current: false };
        throw error;
      }
    }
  };
}

// Same matching and prefix-first ordering as SpatialShotSelection's player search.
export const normalizePlayerSearch = value => value.normalize('NFD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase().replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
const compactSearch = value => normalizePlayerSearch(value).replace(/\s/g, '');
export function findTennisPlayers(players, category, text) {
  const query = normalizePlayerSearch(text), compactQuery = compactSearch(text);
  return players.filter(entry => entry.category === category && !entry.hidden)
    .filter(entry => normalizePlayerSearch(entry.player).includes(query) || compactSearch(entry.player).includes(compactQuery))
    .sort((a, b) => {
      const aStarts = normalizePlayerSearch(a.player).startsWith(query) || compactSearch(a.player).startsWith(compactQuery);
      const bStarts = normalizePlayerSearch(b.player).startsWith(query) || compactSearch(b.player).startsWith(compactQuery);
      return aStarts !== bStarts ? (aStarts ? -1 : 1)
        : a.player.localeCompare(b.player, undefined, { sensitivity: 'base' }) || a.file.localeCompare(b.file);
    });
}

async function initialize(root) {
  const controls = Object.fromEntries(['category', 'search', 'match', 'subset', 'view', 'search-status', 'suggestions']
    .map(id => [id, root.querySelector(`[data-tennis-control="${id}"]`)]));
  const defaults = { ATP: 'Adrian Mannarino', WTA: 'Ajla Tomljanovic' };
  const loader = createPacketLoader();
  let catalog, packet, contexts = new Map(), termSerial = 0, selectedPlayer = '';
  let matches = [], activeSuggestionIndex = -1;
  const combobox = root.querySelector('[data-tennis-combobox]');
  const returnButton = root.querySelector('[data-tennis-definition-return]');

  function term(id, label) {
    const template = root.querySelector(`template[data-tennis-term="${id}"]`);
    if (!template) throw new Error('Missing definition');
    const help = template.content.firstElementChild.cloneNode(true);
    const instance = `tennis-${id}-${++termSerial}`;
    const trigger = help.querySelector('[data-definition-trigger]');
    const panel = help.querySelector('[popover]');
    const copy = help.querySelector('[data-help-copy]');
    help.dataset.term = instance;
    trigger.id = `term-${instance}`;
    trigger.setAttribute('aria-label', `Explain ${label}`);
    trigger.setAttribute('aria-controls', `definition-popup-${instance}`);
    trigger.setAttribute('aria-describedby', `definition-copy-${instance}`);
    trigger.querySelector('[data-help-label]').textContent = label;
    panel.id = `definition-popup-${instance}`;
    panel.setAttribute('aria-labelledby', trigger.id);
    copy.id = `definition-copy-${instance}`;
    return help.outerHTML;
  }
  const renderProfile = createProfileRenderer(term);
  const option = (value, text) => {
    const item = document.createElement('option'); item.value = value; item.textContent = text; return item;
  };
  function closeDefinitions() {
    document.dispatchEvent(new Event('close-definitions'));
    returnButton.hidden = true;
  }
  function render() {
    closeDefinitions();
    const group = packet?.profiles.find(group => group.meta.match_id === controls.match.value
      && group.meta.aggregation_level === (controls.match.value === 'ALL_MATCHES' ? 'POOLED_PLAYER' : 'MATCH_PLAYER'));
    if (!group) { controls.view.textContent = 'No matching player selected. Search or choose a player to see their recorded points.'; return; }
    const context = contexts.get(key(group.meta));
    const coverage = packet.coverage.find(row => row.category === group.meta.category && row.match_id === group.meta.match_id && row.aggregation_level === 'MATCH');
    controls.view.innerHTML = renderProfile(group, context, coverage, controls.subset.value);
  }
  function unavailable(message, retry = false) {
    closeDefinitions();
    packet = undefined; contexts.clear();
    controls.match.replaceChildren(); controls.match.disabled = true;
    controls.view.setAttribute('aria-busy', 'false');
    controls.view.replaceChildren();
    const paragraph = document.createElement('p'); paragraph.className = 'unavailable'; paragraph.textContent = message;
    controls.view.append(paragraph);
    if (retry) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.tennisRetry = '';
      button.textContent = 'Try loading again'; controls.view.append(button);
    }
  }
  async function loadSelected() {
    const entry = catalog.players.find(entry => entry.category === controls.category.value && entry.player === selectedPlayer && !entry.hidden);
    if (!entry) { loader.invalidate(); unavailable('No matching player selected. Search or choose a player to see their recorded points.'); return; }
    unavailable(`Loading recorded points for ${entry.player}…`);
    controls.view.setAttribute('aria-busy', 'true');
    try {
      const result = await loader.load(entry);
      if (!result.current || controls.category.value !== entry.category || selectedPlayer !== entry.player) return;
      packet = result.packet;
      contexts = new Map(packet.context.map(group => [key(group.meta), group]));
      controls.match.replaceChildren(option('ALL_MATCHES', 'All recorded matches'), ...packet.profiles
        .filter(group => group.meta.aggregation_level === 'MATCH_PLAYER')
        .map(group => option(group.meta.match_id, matchLabel(group.meta.match_id))));
      controls.match.value = 'ALL_MATCHES'; controls.match.disabled = false;
      controls.view.setAttribute('aria-busy', 'false'); render();
      controls['search-status'].textContent = `${entry.player}, ${categoryLabel()} loaded.`;
    } catch { unavailable(`Recorded points for ${entry.player} could not be loaded. No results are shown.`, true); }
  }
  const categoryLabel = () => controls.category.value === 'ATP' ? 'Men’s' : 'Women’s';
  function closeSuggestions() {
    controls.suggestions.hidden = true; matches = []; activeSuggestionIndex = -1;
    controls.search.setAttribute('aria-expanded', 'false'); controls.search.removeAttribute('aria-activedescendant');
  }
  function renderSuggestions() {
    controls.search.removeAttribute('aria-activedescendant');
    const fragment = document.createDocumentFragment();
    if (!matches.length) {
      const empty = document.createElement('p'); empty.className = 'no-results';
      empty.setAttribute('role', 'option'); empty.setAttribute('aria-disabled', 'true'); empty.setAttribute('aria-selected', 'false');
      empty.textContent = 'No players found. Try another name or category.'; fragment.append(empty);
    } else matches.forEach((entry, index) => {
      const item = document.createElement('div'); item.id = `tennis-player-option-${entry.file.match(/[a-f0-9]{64}/)[0]}`;
      item.className = 'suggestion-option'; item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(index === activeSuggestionIndex)); item.dataset.suggestionIndex = String(index);
      item.textContent = entry.player;
      item.addEventListener('mousedown', event => event.preventDefault());
      item.addEventListener('click', () => selectSuggestion(entry)); fragment.append(item);
    });
    controls.suggestions.replaceChildren(fragment);
  }
  function updateSuggestions(showAll = false) {
    if (!catalog || controls.search.disabled) return;
    matches = findTennisPlayers(catalog.players, controls.category.value, showAll ? '' : controls.search.value);
    activeSuggestionIndex = -1; renderSuggestions(); controls.suggestions.hidden = false;
    controls.search.setAttribute('aria-expanded', 'true');
    controls['search-status'].textContent = showAll
      ? `${matches.length} players in ${categoryLabel()}. Type to narrow the list.`
      : `${matches.length} ${matches.length === 1 ? 'player matches' : 'players match'} in ${categoryLabel()}.`;
  }
  function selectSuggestion(entry) {
    selectedPlayer = entry.player; controls.search.value = entry.player; closeSuggestions(); loadSelected();
  }
  function resetCategory() {
    closeSuggestions(); controls.suggestions.setAttribute('aria-label', `Players in ${categoryLabel()}`);
    controls.search.placeholder = `Search players in ${categoryLabel()}`;
    selectSuggestion(catalog.players.find(entry => entry.category === controls.category.value && entry.player === defaults[controls.category.value] && !entry.hidden));
  }
  function handleSearchKeydown(event) {
    if (event.key === 'Tab') { closeSuggestions(); return; }
    if (event.key === 'Escape') { if (!controls.suggestions.hidden) event.preventDefault(); closeSuggestions(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); if (controls.suggestions.hidden) updateSuggestions(true);
      if (!matches.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      activeSuggestionIndex = activeSuggestionIndex === -1 ? (step === 1 ? 0 : matches.length - 1)
        : (activeSuggestionIndex + step + matches.length) % matches.length;
      renderSuggestions();
      const active = controls.suggestions.querySelector(`[data-suggestion-index="${activeSuggestionIndex}"]`);
      controls.search.setAttribute('aria-activedescendant', active.id); active.scrollIntoView({ block: 'nearest' }); return;
    }
    if (event.key === 'Enter' && activeSuggestionIndex >= 0) { event.preventDefault(); selectSuggestion(matches[activeSuggestionIndex]); }
  }
  async function loadCatalog() {
    unavailable('Loading player names…');
    controls.search.disabled = true;
    try {
      const response = await fetch('/data/tennis-viewer-index-v1.json');
      if (!response.ok) throw new Error('Display index request failed');
      catalog = validateCatalog(await response.json()); controls.search.disabled = false; resetCategory();
    } catch { unavailable('Player names could not be loaded. No results are shown.', true); }
  }
  root.querySelectorAll('[data-tennis-inline-term]').forEach(node => {
    node.outerHTML = term(node.dataset.tennisInlineTerm, node.textContent);
  });
  root.addEventListener('click', event => {
    if (event.target.closest('[data-tennis-retry]')) catalog ? loadSelected() : loadCatalog();
    if (event.target.closest('[data-detail-target]')) returnButton.hidden = false;
    if (event.target.closest('[data-tennis-definition-return]')) history.back();
  });
  controls.category.addEventListener('change', () => catalog && resetCategory());
  controls.search.addEventListener('input', () => updateSuggestions());
  controls.search.addEventListener('focus', () => updateSuggestions(true));
  controls.search.addEventListener('keydown', handleSearchKeydown);
  combobox.addEventListener('focusout', event => { if (!(event.relatedTarget instanceof Node) || !combobox.contains(event.relatedTarget)) closeSuggestions(); });
  document.addEventListener('pointerdown', event => { if (event.target instanceof Node && !combobox.contains(event.target)) closeSuggestions(); });
  controls.match.addEventListener('change', render);
  controls.subset.addEventListener('change', () => packet && render());
  await loadCatalog();
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-tennis-explorer]').forEach(initialize);

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

async function initialize(root) {
  const controls = Object.fromEntries(['category', 'search', 'player', 'match', 'subset', 'view', 'search-status']
    .map(id => [id, root.querySelector(`[data-tennis-control="${id}"]`)]));
  const defaults = { ATP: 'Adrian Mannarino', WTA: 'Ajla Tomljanovic' };
  const loader = createPacketLoader();
  let catalog, packet, contexts = new Map(), termSerial = 0;
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
    const entry = catalog.players.find(entry => entry.category === controls.category.value && entry.player === controls.player.value && !entry.hidden);
    if (!entry) { loader.invalidate(); unavailable('No matching player selected. Search or choose a player to see their recorded points.'); return; }
    unavailable(`Loading recorded points for ${entry.player}…`);
    controls.view.setAttribute('aria-busy', 'true');
    try {
      const result = await loader.load(entry);
      if (!result.current || controls.category.value !== entry.category || controls.player.value !== entry.player) return;
      packet = result.packet;
      contexts = new Map(packet.context.map(group => [key(group.meta), group]));
      controls.match.replaceChildren(option('ALL_MATCHES', 'All recorded matches'), ...packet.profiles
        .filter(group => group.meta.aggregation_level === 'MATCH_PLAYER')
        .map(group => option(group.meta.match_id, matchLabel(group.meta.match_id))));
      controls.match.value = 'ALL_MATCHES'; controls.match.disabled = false;
      controls.view.setAttribute('aria-busy', 'false'); render();
    } catch { unavailable(`Recorded points for ${entry.player} could not be loaded. No results are shown.`, true); }
  }
  function playerOptions(reset = false) {
    const category = controls.category.value, old = controls.player.value, query = controls.search.value.toLocaleLowerCase();
    const names = catalog.players.filter(entry => entry.category === category && !entry.hidden).map(entry => entry.player).sort();
    const shown = names.filter(name => name.toLocaleLowerCase().includes(query));
    controls.player.replaceChildren(...shown.map(name => option(name, name)));
    controls.player.disabled = !shown.length;
    controls['search-status'].textContent = (shown.length ? `${shown.length} of ${names.length} selectable names.` : 'No matching player name.')
      + (category === 'ATP' ? ' One name hidden from selection; 228 saved identities remain in the data.' : ' 222 saved identities remain in the data.');
    if (shown.length) controls.player.value = reset && shown.includes(defaults[category]) ? defaults[category] : shown.includes(old) ? old : shown[0];
    loadSelected();
  }
  async function loadCatalog() {
    unavailable('Loading player names…');
    controls.player.disabled = true;
    try {
      const response = await fetch('/data/tennis-viewer-index-v1.json');
      if (!response.ok) throw new Error('Display index request failed');
      catalog = validateCatalog(await response.json()); playerOptions(true);
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
  controls.category.addEventListener('change', () => { controls.search.value = ''; catalog && playerOptions(true); });
  controls.search.addEventListener('input', () => catalog && playerOptions());
  controls.player.addEventListener('change', loadSelected);
  controls.match.addEventListener('change', render);
  controls.subset.addEventListener('change', () => packet && render());
  await loadCatalog();
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-tennis-explorer]').forEach(initialize);

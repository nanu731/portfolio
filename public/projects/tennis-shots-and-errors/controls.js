import { renderAnalysis } from './analysis.js';

const $ = (id) => document.getElementById(id);
const pilotId = '20230716-M-Wimbledon-F-Novak_Djokovic-Carlos_Alcaraz';
const rounds = {F:'Final', SF:'Semifinal', QF:'Quarterfinal', RR:'Round robin', R128:'Round of 128', R64:'Round of 64', R32:'Round of 32', R16:'Round of 16'};
const modes = ['match','player','h2h'];
let archive = [], byId, byPlayer, directory, searchMatches;
let state, revision = 0, finderKind, options = [], pageSize = 30;
const cache = new Map();
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const format = (n) => n.toLocaleString('en-US');
const matchName = (m) => m.players.join(' vs. ');
const matchMeta = (m) => [m.date, m.event, rounds[m.round] || m.round, m.surface].filter(Boolean).join(' · ');
const meetings = (a,b) => (byPlayer.get(a) || []).filter(m => m.players.includes(b));
function button(label, run) {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  el.addEventListener('click',run);
  return el;
}
function defaultState() {
  const match = byId.get(pilotId) || archive[0];
  return {mode:'match',match:match.id,player:match.players[1],opponent:match.players[0]};
}
function restore() {
  const defaults = defaultState(), params = new URLSearchParams(location.hash.slice(1) || location.search);
  const mode = modes.includes(params.get('view')) ? params.get('view') : defaults.mode;
  const match = byId.get(params.get('match')) || byId.get(defaults.match);
  const player = byPlayer.has(params.get('player')) ? params.get('player') : defaults.player;
  const other = params.get('opponent') || defaults.opponent;
  const opponent = byPlayer.has(other) && other !== player ? other : byPlayer.get(player)[0].players.find(n => n !== player);
  state = {mode,match:match.id,player,opponent};
  update();
}
function select(next) {
  state = {...state,...next};
  const params = new URLSearchParams({view:state.mode});
  if (state.mode === 'match') params.set('match',state.match);
  else params.set('player',state.player);
  if (state.mode === 'h2h') params.set('opponent',state.opponent);
  history.pushState(null,'','#' + params);
  update();
}
async function loadPoints(match) {
  if (!cache.has(match.id)) {
    const res = await fetch(match.file);
    if (!res.ok) throw new Error('Unavailable point record');
    if (cache.size >= 10) cache.delete(cache.keys().next().value);
    cache.set(match.id,await res.json());
  }
  return cache.get(match.id);
}
function retry(message, handler) {
  $('results').removeAttribute('aria-busy');
  const p = document.createElement('p');
  p.textContent = message;
  $('results').replaceChildren(p,button('Try again',handler));
}
async function update() {
  const rev = ++revision;
  const {mode,match:matchId,player,opponent} = state;
  const match = byId.get(matchId);
  const players = mode === 'match' ? match.players : mode === 'player' ? [player] : [player,opponent];
  const matches = mode === 'match' ? [match] : mode === 'player' ? byPlayer.get(player) : meetings(player,opponent);
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  const title = mode === 'player' ? player : players.join(' vs. ');
  $('selection-title').textContent = title;
  $('selection-meta').textContent = mode==='match' ? matchMeta(match) : format(matches.length) + (matches.length===1?' charted match':' charted matches') + (matches.length ? ' · '+matches.at(-1).date.slice(0,4)+'–'+matches[0].date.slice(0,4) : '');
  const choices = $('change-selection');
  choices.replaceChildren();
  if (mode === 'match') choices.append(button('Find a match',() => find('match')));
  else {
    choices.append(button(mode === 'player'?'Find a player':'Change player',() => find('player')));
    if (mode==='h2h') choices.append(button('Change opponent',() => find('opponent')));
  }
  for (const choice of choices.children) {
    choice.setAttribute('aria-haspopup', 'dialog');
    choice.setAttribute('aria-controls', 'finder');
  }
  $('announce').textContent = 'Selected '+title+'. '+$('selection-meta').textContent;
  $('results').setAttribute('aria-busy','true');
  $('results').textContent = 'Loading analysis…';
  try {
    const points = mode==='match' ? await loadPoints(match) : [];
    if (rev !== revision) return;
    $('results').replaceChildren();
    if (!matches.length) {
      $('results').textContent = 'No charted meetings in this archive. Choose another player or opponent.';
    } else {
      renderAnalysis($('results'),{mode,matches,players,points,onMatch(id) {
        if (byId.has(id)) {
          select({mode:'match',match:id});
          $('explorer').focus();
        }
      }});
    }
    $('results').removeAttribute('aria-busy');
  } catch (error) {
    if (rev===revision) retry('We couldn’t load these results.',update);
    console.error(error);
  }
}
function find(kind) {
  finderKind = kind;
  $('finder-title').textContent = kind==='match' ? 'Find a match' : kind==='player' ? 'Find a player' : 'Find an opponent';
  $('query-label').textContent = kind==='match' ? 'Player, tournament, round or year' : 'Player name';
  $('query').placeholder = kind==='match' ? 'e.g. Wimbledon 2023 Alcaraz' : 'e.g. Serena Williams';
  $('query').value = '';
  pageSize = 30;
  filter();
  $('finder').showModal();
  $('query').focus();
}
function filter() {
  const query = norm($('query').value), tokens = query.split(/\s+/).filter(Boolean);
  let source = finderKind==='match' ? searchMatches : directory;
  if (finderKind==='opponent') {
    const counts = new Map();
    for (const m of byPlayer.get(state.player)) {
      const other = m.players.find(n => n!==state.player);
      counts.set(other,(counts.get(other)||0)+1);
    }
    source = directory.filter(row=>counts.has(row.key)).map(row=>{
      const n = counts.get(row.key)||0;
      return {...row,n,detail:format(n)+' charted '+(n===1?'meeting':'meetings')+' with '+state.player};
    }).sort((a,b)=>b.n-a.n);
  }
  options = source.filter(x => (finderKind!=='opponent' || x.key !== state.player) && tokens.every(t=>x.search.includes(t)));
  if (finderKind!=='match' && query) {
    const rank = x => x.search===query?0:x.search.split(' ').some(w => w.startsWith(query))?1:2;
    options.sort((a,b)=>rank(a)-rank(b));
  }
  renderOptions();
}
function renderOptions() {
  const count = Math.min(pageSize,options.length);
  $('search-count').textContent = options.length ? 'Showing '+format(count)+' of '+format(options.length)+' results.' : (finderKind==='opponent' ? 'No matching charted opponent for '+state.player+'. Try another name.' : 'No results. Try a last name or fewer words.');
  const frag = document.createDocumentFragment();
  for (const row of options.slice(0,count)) {
    const el = button(row.title,() => choose(row.key));
    const small = document.createElement('small');
    small.textContent = row.detail;
    el.append(small);
    frag.append(el);
  }
  $('options').replaceChildren(frag);
  $('more').hidden = count >= options.length;
}
function choose(key) {
  $('finder').close();
  if (finderKind==='match') select({match:key});
  else if (finderKind==='opponent') select({opponent:key});
  else {
    const previous = key===state.opponent ? state.player : state.opponent;
    const opponent = meetings(key,previous).length ? previous : byPlayer.get(key)[0].players.find(name=>name!==key);
    select({player:key,opponent});
  }
  $('change-selection').querySelector(finderKind==='opponent'?'button:last-child':'button').focus({preventScroll:true});
}
async function boot() {
  try {
    const response = await fetch('./data/index.json');
    if (!response.ok) throw new Error('Unavailable archive');
    archive = await response.json();
    byId = new Map(archive.map(m=>[m.id,m]));
    byPlayer = new Map();
    for (const m of archive) for (const name of m.players) {
      if (!byPlayer.has(name)) byPlayer.set(name,[]);
      byPlayer.get(name).push(m);
    }
    directory = [...byPlayer].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0])).map(([name,ms])=>({
      key:name,title:name,search:norm(name),detail:format(ms.length)+' charted '+(ms.length===1?'match':'matches')
    }));
    searchMatches = archive.map(m=>({key:m.id,title:matchName(m),detail:matchMeta(m),search:norm(matchName(m)+' '+matchMeta(m)+' '+m.round)}));
    const archiveEl = $('archive');
    const strong = document.createElement('strong'), span = document.createElement('span');
    strong.textContent = format(archive.length)+' matches';
    span.textContent = 'Charted archive · '+archive.at(-1).date.slice(0,4)+'–'+archive[0].date.slice(0,4);
    archiveEl.replaceChildren(strong,span); archiveEl.hidden=false;
    restore();
  } catch (error) {
    $('selection-title').textContent='Match archive unavailable';
    retry('We couldn’t load the match list.',boot);
    console.error(error);
  }
}
for (const b of document.querySelectorAll('[data-mode]')) b.addEventListener('click',() => {
  if (state && state.mode !== b.dataset.mode) {
    const next = {mode:b.dataset.mode};
    if (state.mode==='match') {
      const pair = byId.get(state.match).players;
      next.player = pair.includes(state.player) ? state.player : pair[0];
      next.opponent = pair.find(name=>name!==next.player);
    }
    if (state.mode!=='match' && next.mode==='h2h' && !meetings(state.player,state.opponent).length) {
      next.opponent = byPlayer.get(state.player)[0].players.find(name=>name!==state.player);
    }
    select(next);
  }
});
$('close-finder').addEventListener('click',()=> $('finder').close());
$('finder').addEventListener('keydown',event=>{
  if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
  const results = Array.from($('options').children);
  const current = results.indexOf(document.activeElement);
  if (!results.length || (current<0 && document.activeElement!==$('query'))) return;
  event.preventDefault();
  const index = current + (event.key==='ArrowDown' ? 1 : -1);
  if(index<0) $('query').focus();
  else results[Math.min(index,results.length-1)].focus();
});
$('query').addEventListener('input',()=>{pageSize=30;filter()});
$('more').addEventListener('click',()=>{const firstNew=pageSize;pageSize+=30;renderOptions();$('options').children[firstNew]?.focus()});
$('search-form').addEventListener('submit',e=>{e.preventDefault();if(options.length)choose(options[0].key)});
window.addEventListener('popstate',()=>{if (archive.length) restore()});
boot();
// Section jumps share the current URL with the active analysis selection.
document.addEventListener('click',event=>{
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const section = $(link.hash.slice(1));
  if (!section) return;
  event.preventDefault();
  if (section.matches("summary")) section.parentElement.open = true;
  section.focus({preventScroll:true});
  section.scrollIntoView({block:'start'});
});

/** Prepare the reviewed project pages for Astro's normal static build.
 * Authoring only: builds/deploys read committed pages and assets, not this snapshot cache.
 */
import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, join, extname } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const root = resolve(import.meta.dirname, '..');
const target = arg('--target') && resolve(arg('--target'));
const snapshotPath = arg('--snapshot') && resolve(arg('--snapshot'));
if (!target || !snapshotPath || target === root) throw Error('Supply --target for the isolated release checkout and --snapshot for the reviewed version record.');
const branch = execFileSync('git', ['branch', '--show-current'], { cwd: target, encoding: 'utf8' }).trim();
if (!branch.startsWith('codex/')) throw Error('Prepare only on an isolated codex/ release branch.');
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
const blobs = resolve(dirname(snapshotPath), '../blobs');
const twins = resolve(root, '../nba-similar-player');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const includeDraft = args.includes('--include-draft-success');
const projects = snapshot.source.projects.filter(p => p.kind !== 'draft' || (includeDraft && p.slug === 'nba-draft-success'));
if (includeDraft && !projects.some(p => p.kind === 'draft' && p.slug === 'nba-draft-success')) throw Error('The approved snapshot must include NBA Draft Success.');
const require = createRequire(import.meta.url);
const { chromium } = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const cache = join(homedir(), 'Library/Caches/ms-playwright');
const executable = (await readdir(cache)).filter(n => n.startsWith('chromium_headless_shell-')).sort().reverse()[0];
const browser = await chromium.launch({ executablePath: join(cache, executable, 'chrome-headless-shell-mac-arm64/chrome-headless-shell') });
const parser = await browser.newPage();
const pageFolder = join(target, 'src/prepared-projects');
await mkdir(pageFolder, { recursive: true });
const manifest = { sourceSnapshot: snapshot.id, sourceLabel: snapshot.label, projects: [], assets: {} };
const savedBytes = async path => {
  const record = snapshot.files[path]; if (!record) throw Error(`Missing saved asset ${path}`);
  const bytes = await readFile(join(blobs, record.sha256));
  if (sha(bytes) !== record.sha256) throw Error(`Saved asset checksum mismatch: ${path}`);
  return bytes;
};
try {
  for (const project of projects) {
    const html = (await savedBytes(project.url)).toString('utf8');
    const page = await parser.evaluate(({ html, project, includeDraft }) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('meta[http-equiv],meta[name="robots"]').forEach(e => e.remove());
      if (!includeDraft) doc.querySelectorAll('a[href="/projects/nba-draft-success/"]').forEach(e => e.remove());
      doc.title = `${project.title}${project.italic} | Narayan Lekhi`;
      const description = doc.querySelector('meta[name="description"]')?.content || doc.querySelector('.std-intro>p')?.textContent.trim();
      const canonical = 'https://www.nslanalytics.com' + project.url;
      const meta = (attribute, key, value) => { let e = doc.querySelector(`meta[${attribute}="${key}"]`); if (!e) { e = doc.createElement('meta'); e.setAttribute(attribute, key); doc.head.append(e); } e.content = value; };
      let link = doc.querySelector('link[rel="canonical"]'); if (!link) { link = doc.createElement('link'); link.rel = 'canonical'; doc.head.append(link); } link.href = canonical;
      for (const [key,value] of [['og:type','website'],['og:url',canonical],['og:title',doc.title],['og:description',description],['og:image','https://www.nslanalytics.com/og.png']]) meta('property', key, value);
      for (const [key,value] of [['twitter:card','summary_large_image'],['twitter:title',doc.title],['twitter:description',description],['twitter:image','https://www.nslanalytics.com/og.png']]) meta('name', key, value);
      if (project.kind === 'twins') {
        const method = [...doc.querySelectorAll('#std-method .std-disclosure')].find(d => d.querySelector(':scope > summary')?.textContent === 'Method');
        const meaningful = method && [...method.childNodes].filter(n => n.nodeName !== 'SUMMARY').some(n => n.textContent.trim());
        if (!meaningful) {
          const explanation = doc.querySelector('#std-method button[data-term="knn"]')?.closest('p');
          if (!method || !explanation) throw Error('Twins needs its sourced method explanation.');
          method.append(explanation);
        }
        const gap = doc.querySelector('#std-sources .std-content-gap');
        if (!gap || gap.textContent.trim() !== 'TODO_SOURCE_DATA_TERMS') throw Error('Twins source notice target changed.');
        const notice = doc.createElement('p'); notice.append('The source repository provides an MIT license. ');
        const a = doc.createElement('a'); a.href = '/twins-source/research/source-data-license.txt'; a.textContent = 'Source data license and attribution'; notice.append(a); gap.replaceWith(notice);
        for (const p of doc.querySelectorAll('#std-sources p')) if (p.textContent.includes('repository is private (verified')) p.textContent = 'The analysis repository is private.';
        const fonts = doc.createElement('p'); const a2 = doc.createElement('a'); a2.href = '/twins-source/assets/OFL.txt'; a2.textContent = 'Font licenses'; fonts.append(a2); doc.querySelector('#std-sources .std-notes-copy').append(fonts);
      }
      if (project.kind === 'tennis') {
        const gap = doc.querySelector('#std-method .std-content-gap');
        const scope = [...doc.querySelectorAll('#std-limits p, #std-limits li')].find(p => /sampled charted matches|descript|representative|coverage|selection|selected matches/i.test(p.textContent));
        if (!gap || !scope) throw Error('A sourced Tennis scope paragraph is required.');
        gap.classList.remove('std-content-gap'); gap.textContent = scope.textContent;
      }
      const bodyText = doc.querySelector('main').textContent;
      if (/TODO_[A-Z_]+/.test(bodyText)) throw Error(`Unresolved content marker in ${project.kind}`);
      return { kind: project.kind, slug: project.slug, title: project.title + project.italic, description, head: doc.head.innerHTML, body: doc.body.innerHTML, bodyClass: doc.body.className, inlineScripts: [...doc.querySelectorAll('script:not([src])')].map(e => e.textContent), inlineStyles: [...doc.querySelectorAll('style')].map(e => e.textContent) };
    }, { html, project, includeDraft });
    page.scriptHashes = page.inlineScripts.map(s => `sha256-${createHash('sha256').update(s).digest('base64')}`);
    page.styleHashes = page.inlineStyles.map(s => `sha256-${createHash('sha256').update(s).digest('base64')}`);
    delete page.inlineScripts; delete page.inlineStyles;
    const bytes = JSON.stringify(page);
    await writeFile(join(pageFolder, project.slug + '.json'), bytes);
    manifest.projects.push({ slug: project.slug, sourceSha256: project.sourceSha256, pageSha256: sha(bytes) });
  }
} finally { await browser.close(); }
// Follow the saved catalogs, preserving asset bytes and their published paths.
const references = (bytes, type, path) => {
  if (!/html|css|javascript|json/.test(type)) return [];
  const text = bytes.toString('utf8'), refs = new Set();
  const add = value => {
    if (typeof value !== 'string' || value.includes('${') || /^(?:https?:|data:|#|mailto:)/.test(value)) return;
    if (/javascript/.test(type) && !/^(?:\/|\.\.?\/)/.test(value)) return;
    if (!/\.(?:css|m?js|json|woff2?|svg|png|jpe?g|ico|txt|md|csv)(?:[?#].*)?$/i.test(value)) return;
    try { const u = new URL(value, 'http://saved.local' + path); if (u.origin === 'http://saved.local') refs.add(u.pathname + u.search); } catch {}
  };
  if (/json/.test(type)) { const visit = v => { if (typeof v === 'string') add(v); else if (v && typeof v === 'object') Object.values(v).forEach(visit); }; visit(JSON.parse(text)); }
  else {
    for (const m of text.matchAll(/["'`]([^"'`\s<>]+\.(?:css|m?js|json|woff2?|svg|png|jpe?g|ico|txt|md|csv)(?:\?[^"'`\s<>]*)?)["'`]/g)) add(m[1]);
    for (const m of text.matchAll(/url\(\s*["']?([^\s)"']+)/g)) add(m[1]);
    for (const m of text.matchAll(/(?:data-base-path=["']|["'`])(\/data\/[^"'`\s<>]+)(?:["'`])/g)) if (!extname(m[1])) { add(m[1] + '/manifest.json'); add(m[1] + '/players.json'); }
  }
  return [...refs];
};
const queue = projects.map(p => p.url), seen = new Set(queue), written = new Map();
let changed = 0, unchanged = 0;
while (queue.length) {
  const path = queue.shift(), record = snapshot.files[path];
  const bytes = await savedBytes(path);
  for (const ref of references(bytes, record.type, path)) if (!seen.has(ref)) { seen.add(ref); queue.push(ref); }
  if (record.type.includes('text/html')) continue;
  const name = new URL(path, 'http://saved.local').pathname;
  if (written.has(name) && written.get(name) !== record.sha256) throw Error(`Conflicting saved variants: ${name}`);
  written.set(name, record.sha256);
  const file = resolve(target, 'public', '.' + name);
  if (!file.startsWith(join(target, 'public') + '/')) throw Error('Unsafe asset path');
  const old = await readFile(file).catch(() => null);
  if (old && sha(old) === record.sha256) unchanged++;
  else { await mkdir(dirname(file), { recursive: true }); await writeFile(file, bytes); changed++; }
  manifest.assets[name] = record.sha256;
}
for (const [source, destination] of [['LICENSE','LICENSE'],['assets/OFL.txt','assets/OFL.txt']]) {
  const file = join(target, 'public/twins-source', destination); await mkdir(dirname(file), { recursive: true }); await copyFile(join(twins, source), file); manifest.assets['/twins-source/' + destination] = sha(await readFile(file));
}
const licenseURL = 'https://raw.githubusercontent.com/NocturneBear/NBA-Data-2010-2024/a5f108b5b1f08074d78b9e8e901926a9ce4c06c5/LICENSE';
const response = await fetch(licenseURL); if (!response.ok) throw Error('Pinned source license unavailable.');
const license = `Source: ${licenseURL}\nRepository: https://github.com/NocturneBear/NBA-Data-2010-2024/tree/a5f108b5b1f08074d78b9e8e901926a9ce4c06c5\n\n` + await response.text();
await mkdir(join(target, 'public/twins-source/research'), { recursive: true });
await writeFile(join(target, 'public/twins-source/research/source-data-license.txt'), license);
manifest.assets['/twins-source/research/source-data-license.txt'] = sha(license);
// The public methodology describes the supplied model, not unavailable development versions.
const stocks = await readFile(join(twins, 'research/stocks-model.md'), 'utf8');
let methodology = stocks.replace('The original [research precedents and data provenance](methodology.md) still apply.', 'Source game logs: https://github.com/NocturneBear/NBA-Data-2010-2024/tree/a5f108b5b1f08074d78b9e8e901926a9ce4c06c5.\n\nThe source repository provides an MIT license; see source-data-license.txt for its notice.');
methodology = methodology.replace(/ The \[earlier protocol\]\(future-shot-check\.md\) gives the coverage rules\./, '').replace('The earlier review panels evaluated the previous model.', '').replace('for the revised model', 'for the eight-trait model').replace('the original 2023–24 matches', 'the 2023–24 matches');
await writeFile(join(target, 'public/twins-source/research/stocks-model.md'), methodology);
manifest.assets['/twins-source/research/stocks-model.md'] = sha(methodology);
const contrastPath = '/std-assets/project-standard-experience.css';
const contrastFile = join(target, 'public', contrastPath);
const contrastBase = await readFile(contrastFile, 'utf8');
const contrastFix = contrastBase.includes('.std-workspace .map h2 { color: var(--std-cream); }') ? '' : '\n/* Keep the figure heading readable under the host site heading rules. */\nbody.standard-page .std-workspace .map h2 { color: var(--std-cream); }\n';
await writeFile(contrastFile, contrastBase + contrastFix);
manifest.integrationChanges = [{ path: contrastPath, reason: 'Explicit cream figure heading under host styles', sourceSha256: manifest.assets[contrastPath] }, { path: '/projects/nba-statistical-twins/', reason: 'Move the sourced nearest-neighbor paragraph into the Method disclosure' }];
manifest.assets[contrastPath] = sha(contrastBase + contrastFix);
await writeFile(join(target, 'src/prepared-projects/manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ projects: projects.map(p => p.slug), changedAssets: changed, unchangedAssets: unchanged, totalAssets: Object.keys(manifest.assets).length }));

/** Fail the production build if a reviewed asset or inline CSP hash has drifted. */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const root = join(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(join(root, 'src/prepared-projects/manifest.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const cspHash = code => `sha256-${createHash('sha256').update(code).digest('base64')}`;
const sorted = values => [...values].sort();
for (const project of manifest.projects) {
  const bytes = await readFile(join(root, 'src/prepared-projects', project.slug + '.json'));
  if (sha(bytes) !== project.pageSha256) throw Error(`Reviewed page changed without updating its manifest: ${project.slug}`);
  const page = JSON.parse(bytes);
  const html = page.head + page.body;
  const method = page.body.match(/<details class="std-disclosure"><summary>Method<\/summary>([\s\S]*?)<\/details>/);
  if (!method || method[1].replace(/<[^>]+>/g, '').trim().length < 20) throw Error(`Method disclosure has no explanatory content: ${project.slug}`);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !/(?:^|\s)src\s*=/i.test(m[1])).map(m => cspHash(m[2]));
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => cspHash(m[1]));
  if (JSON.stringify(sorted(scripts)) !== JSON.stringify(sorted(page.scriptHashes)) || JSON.stringify(sorted(styles)) !== JSON.stringify(sorted(page.styleHashes))) throw Error(`Inline CSP hashes differ from the reviewed page: ${project.slug}`);
  const built = await readFile(join(root, 'dist/projects', project.slug, 'index.html'), 'utf8');
  if (!built.includes(`https://www.nslanalytics.com/projects/${project.slug}/`) || /<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(built)) throw Error(`Publication metadata failed: ${project.slug}`);
}
for (const [path, expected] of Object.entries(manifest.assets)) {
  const bytes = await readFile(join(root, 'dist', path));
  if (sha(bytes) !== expected) throw Error(`Built asset differs from the reviewed copy: ${path}`);
}
const home = await readFile(join(root,'dist/index.html'),'utf8');
const projects = await readFile(join(root,'dist/projects/index.html'),'utf8');
if (!home.includes('/projects/nba-statistical-twins/') || !projects.includes('/projects/nba-statistical-twins/')) throw Error('Twins is missing from Home or Projects.');
if (home.includes('/projects/nba-draft-success/') || projects.includes('/projects/nba-draft-success/')) throw Error('NBA Draft Success must remain local.');
console.log(`Verified ${manifest.projects.length} project pages, inline CSP hashes, ${Object.keys(manifest.assets).length} built assets and both Twins listings.`);

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', 'dist');
const manifest = JSON.parse(await readFile(new URL('../src/prepared-projects/manifest.json', import.meta.url), 'utf8'));
const routes = ['', 'about', 'blog', 'projects', 'contact', ...manifest.projects.map(p => `projects/${p.slug}`)];
for (const route of routes) {
  const html = await readFile(join(root, route, 'index.html'), 'utf8');
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.match(header || '', /href="\/contact\/?"/, `Contact navigation missing on /${route}`);
}
const contact = await readFile(join(root, 'contact/index.html'), 'utf8');
assert.match(contact, /<h1\b[^>]*>Contact<\/h1>/);
assert.match(contact, /<button\b[^>]*disabled/);
assert.match(contact, /Design preview\. Messages are not sent\./);
assert.doesNotMatch(contact, /mailto:/);
assert.doesNotMatch(contact, /<form\b[^>]*action=/);
console.log(`Contact preview verified across ${routes.length} routes; submission remains disabled.`);

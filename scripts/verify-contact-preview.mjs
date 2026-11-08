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
assert.match(contact, /Checking message delivery/);
assert.doesNotMatch(contact, /mailto:/);
assert.match(contact, /<form\b[^>]*method="post"[^>]*action="\/api\/contact"/);
assert.match(contact, /src="\/contact-form\.js"/);
assert.match(contact, /maxlength="5000"/);
assert.doesNotMatch(contact, /RESEND_API_KEY|CONTACT_TO|CONTACT_FROM/);
console.log(`Contact verified across ${routes.length} routes; the button stays disabled until server readiness is confirmed.`);

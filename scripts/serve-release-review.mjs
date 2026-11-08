/** Local review of the real static production output. Never proxies to the live site. */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { createContactHandler } from '../src/lib/contact-delivery.js';
const root = resolve(import.meta.dirname, '..'), dist = join(root, 'dist');
const port = Number(process.env.RELEASE_REVIEW_PORT || 4359);
if (process.argv.includes('--background')) {
  const logPath = join(root, '.astro/release-review.log'); await mkdir(dirname(logPath), { recursive: true });
  const log = openSync(logPath, 'a');
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url)], { detached: true, stdio: ['ignore',log,log], env: process.env });
  child.unref(); await writeFile(join(root, '.astro/release-review.json'), JSON.stringify({pid:child.pid,port}));
  console.log(`Release review starting: http://127.0.0.1:${port}/ (PID ${child.pid})`); process.exit(0);
}
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.ico':'image/x-icon','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8'};
const prepared = JSON.parse(await readFile(join(root, 'src/prepared-projects/manifest.json'), 'utf8'));
const projects = await Promise.all(prepared.projects.map(async p=>{const page=JSON.parse(await readFile(join(root,'src/prepared-projects',p.slug+'.json'),'utf8'));return{kind:page.kind,slug:p.slug,title:page.title,italic:'',url:`/projects/${p.slug}/`}}));
// Local review only. The deployed API never imports this script or its fake transport.
const simulateContact = process.env.CONTACT_REVIEW_MODE === 'simulation';
const contactHandler = createContactHandler(simulateContact ? {
  env: { CONTACT_ENABLED: 'true', CONTACT_FORM_ID: 'mdeevbzp', CONTACT_ALLOWED_ORIGINS: `http://127.0.0.1:${port}` },
  fetchImpl: async () => Response.json({ ok: true }),
} : undefined);
if (simulateContact) console.log('Contact delivery simulation: no emails will be sent.');
http.createServer(async(req,res)=>{
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  // Local comparison frames are allowed; production hosts retain their own anti-framing headers.
  res.setHeader('Content-Security-Policy',"frame-ancestors 'self' http://127.0.0.1:4358; base-uri 'self'; object-src 'none'; form-action 'none'");
  if(url.pathname==='/manifest.json'){res.setHeader('Content-Type',types['.json']);res.end(JSON.stringify({version:'production-candidate',projects}));return}
  if(url.pathname==='/api/contact'){
    const request = new Request(url, { method: req.method, headers: req.headers, ...(!['GET','HEAD'].includes(req.method) ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
    const response = await contactHandler(request);
    const data = await response.json();
    if (simulateContact) data.preview = true;
    for (const [key,value] of response.headers) res.setHeader(key,value);
    res.writeHead(response.status);res.end(JSON.stringify(data));return;
  }
  // Production Analytics is present in the build; review traffic must not be recorded.
  if(url.pathname==='/_vercel/insights/script.js'){res.setHeader('Content-Type',types['.js']);res.end('/* Analytics disabled for local release review. */');return}
  try{let path=resolve(dist,'.'+decodeURIComponent(url.pathname));if(!path.startsWith(dist+'/')&&path!==dist)throw Error('Invalid path');if((await stat(path)).isDirectory())path=join(path,'index.html');const bytes=await readFile(path);res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(bytes)}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page or asset not found in this production build.')}
}).listen(port,'127.0.0.1',()=>console.log(`Release review ready: http://127.0.0.1:${port}/`));

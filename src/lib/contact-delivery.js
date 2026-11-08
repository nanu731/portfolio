/** Server-only contact delivery. Never import this module into browser code. */
import { createHash, randomUUID } from 'node:crypto';

const MAX_BODY = 16_384;
const WINDOW = 3 * 1000;
const email = value => typeof value === 'string' && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });

async function readBody(request) {
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY)) throw 413;
  if (!request.body) throw 400;
  const reader = request.body.getReader(), chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw 413; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw 400; }
}

function validFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (Object.keys(body).some(k => !['name', 'email', 'message', 'website'].includes(k))) return false;
  return typeof body.name === 'string' && body.name.trim().length > 0 && body.name.length <= 100 && !/[\u0000-\u001f\u007f]/.test(body.name)
    && email(body.email) && typeof body.message === 'string' && body.message.trim().length > 0 && body.message.length <= 5000 && !body.message.includes('\0')
    && (body.website === undefined || body.website === '');
}

export function createContactHandler({ env = process.env, fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  // This bounded, three-second limiter is per warm instance, not a global quota.
  // Configure a Vercel firewall rate rule before enabling production delivery.
  const attempts = new Map();
  const origins = new Set((env.CONTACT_ALLOWED_ORIGINS || 'https://www.nslanalytics.com,https://nslanalytics.com').split(',').map(s => s.trim()).filter(Boolean));
  if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL) origins.add('https://' + env.VERCEL_URL);
  // The owner supplied this public form ID; the recipient stays inside Formspree.
  const formId = env.CONTACT_FORM_ID === undefined ? 'mdeevbzp' : env.CONTACT_FORM_ID;
  const configured = () => env.CONTACT_ENABLED === 'true' && /^[a-zA-Z0-9]{8,64}$/.test(formId || '');

  return async function contact(request) {
    if (request.method === 'GET') return json({ available: Boolean(configured()) });
    if (request.method !== 'POST') return json({ message: 'Method not allowed.' }, 405, { Allow: 'GET, POST' });
    if (!origins.has(request.headers.get('origin')) || request.headers.get('sec-fetch-site') === 'cross-site') return json({ message: 'Please send this message from the website.' }, 403);
    if (!configured()) return json({ message: 'Message delivery is unavailable. Please try again later.' }, 503);
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ message: 'Unsupported message format.' }, 415);

    const time = now();
    for (const [key, entry] of attempts) if (entry.until <= time) attempts.delete(key);
    // The platform overwrites x-vercel-forwarded-for; do not use user form data as an identity.
    const address = request.headers.get('x-vercel-forwarded-for') || 'unidentified';
    const key = createHash('sha256').update(address).digest('hex');
    let entry = attempts.get(key);
    if ((!entry && attempts.size >= 2000) || (entry && entry.count >= 1)) return json({ message: 'Too many attempts. Please wait three seconds before trying again. Your message is still here.' }, 429, { 'Retry-After': String(Math.ceil(((entry?.until || time + WINDOW) - time) / 1000)) });
    if (!entry) { entry = { count: 0, until: time + WINDOW }; attempts.set(key, entry); }
    entry.count++;

    let body;
    try { body = await readBody(request); } catch (status) { return json({ message: status === 413 ? 'This message is too large.' : 'Please check the message fields.' }, status === 413 ? 413 : 400); }
    if (!validFields(body)) return json({ message: 'Please check the message fields and try again.' }, 400);
    try {
      const result = await fetchImpl('https://formspree.io/f/' + formId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: request.headers.get('origin') },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ name: body.name.trim(), email: body.email, message: body.message.trim(), _subject: `NSL Analytics inquiry — ${body.name.trim()} [${randomUUID()}]` }),
      });
      if (!result.ok) throw Error('Provider did not accept the request');
      const receipt = await result.json();
      if (receipt.ok !== true) throw Error('Missing acceptance confirmation');
      return json({ accepted: true }, 201);
    } catch {
      // Provider errors can include the recipient, credentials or message. Never forward/log them.
      return json({ message: 'We could not confirm delivery. Your message is still here. Sending it again may create a duplicate.' }, 502);
    }
  };
}

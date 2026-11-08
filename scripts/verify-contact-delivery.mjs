import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler } from '../src/lib/contact-delivery.js';

const env = { CONTACT_ENABLED: 'true', CONTACT_FORM_ID: 'testform', CONTACT_ALLOWED_ORIGINS: 'https://www.nslanalytics.com' };
const valid = { name: 'Review test', email: 'visitor@example.test', message: 'A local test, not a real email.', website: '' };
const request = (body = valid, headers = {}, method = 'POST') => new Request('https://www.nslanalytics.com/api/contact', {
  method, headers: { origin: 'https://www.nslanalytics.com', 'content-type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.1', ...headers },
  ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
});
const setup = (overrides = {}) => {
  const calls = [];
  const handler = createContactHandler({ env, fetchImpl: async (url, init) => { calls.push({ url, init }); return Response.json({ ok: true }); }, ...overrides });
  return { handler, calls };
};
test('status exposes readiness but no server configuration', async () => {
  const { handler, calls } = setup(); const result = await handler(request(null, {}, 'GET'));
  assert.deepEqual(await result.json(), { available: true }); assert.equal(result.headers.get('cache-control'), 'no-store'); assert.equal(calls.length, 0);
});
test('missing configuration fails closed', async () => {
  for (const key of Object.keys(env).filter(k => k !== 'CONTACT_ALLOWED_ORIGINS')) {
    const { handler, calls } = setup({ env: { ...env, [key]: '' } });
    assert.deepEqual(await (await handler(request(null, {}, 'GET'))).json(), { available: false });
    const response = await handler(request()); assert.equal(response.status, 503); assert.equal(calls.length, 0);
    assert.ok(!(await response.text()).includes(env.CONTACT_FORM_ID));
  }
});
for (const method of ['PUT', 'DELETE', 'OPTIONS']) test('rejects method ' + method, async () => {
  const { handler, calls } = setup(); const r = await handler(request(null, {}, method)); assert.equal(r.status, 405); assert.equal(calls.length, 0);
});
for (const origin of ['', 'https://attacker.example', 'https://www.nslanalytics.com.attacker.example']) test('rejects origin ' + (origin || '(missing)'), async () => {
  const { handler, calls } = setup(); assert.equal((await handler(request(valid, { origin }))).status, 403); assert.equal(calls.length, 0);
});
test('rejects cross-site requests even with a matching origin', async () => {
  const { handler } = setup(); assert.equal((await handler(request(valid, { 'sec-fetch-site': 'cross-site' }))).status, 403);
});
test('rejects non-JSON and malformed bodies', async () => {
  const { handler, calls } = setup(); assert.equal((await handler(request(valid, { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await handler(request('{'))).status, 400); assert.equal(calls.length, 0);
});
for (const [label, change] of [
  ['empty name', { name: ' ' }], ['long name', { name: 'a'.repeat(101) }], ['email', { email: 'not-an-email' }],
  ['header injection', { email: 'a@example.test\r\nBcc: someone@example.test' }], ['empty message', { message: '' }],
  ['long message', { message: 'a'.repeat(5001) }], ['null message', { message: null }],
  ['recipient override', { to: 'attacker@example.test' }], ['honeypot', { website: 'spam' }], ['unknown field', { submissionId: 'unexpected' }],
]) test('rejects ' + label, async () => {
  const { handler, calls } = setup(); assert.equal((await handler(request({ ...valid, ...change }))).status, 400); assert.equal(calls.length, 0);
});
test('bounds declared and streamed body sizes', async () => {
  const { handler, calls } = setup(); assert.equal((await handler(request(valid, { 'content-length': '20000' }))).status, 413);
  assert.equal((await handler(request('x'.repeat(20000)))).status, 413); assert.equal(calls.length, 0);
});
test('provider gets only approved fields at the fixed Formspree destination', async () => {
  const { handler, calls } = setup(); const response = await handler(request({ ...valid, message: '<script>alert(1)</script>' }));
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), { accepted: true });
  assert.equal(calls.length, 1); assert.equal(calls[0].url, 'https://formspree.io/f/' + env.CONTACT_FORM_ID);
  const payload = JSON.parse(calls[0].init.body); assert.equal('to' in payload, false); assert.equal('from' in payload, false);
  assert.equal(payload.email, valid.email); assert.equal(payload._subject, 'NSL Analytics website inquiry'); assert.equal('html' in payload, false);
  assert.ok(payload.message.includes('<script>alert(1)</script>')); assert.equal('Authorization' in calls[0].init.headers, false);
});
test('provider failures and timeouts never expose secrets or claim acceptance', async () => {
  for (const fetchImpl of [async () => Response.json({ error: 'private-provider-detail' }, { status: 500 }), async () => { throw Error('private-provider-detail'); }, async () => Response.json({})]) {
    const { handler } = setup({ fetchImpl }); const response = await handler(request()); const text = await response.text();
    assert.equal(response.status, 502); assert.ok(!text.includes('private-provider-detail')); assert.ok(!text.includes('"accepted":true'));
  }
});
test('warm-instance throttle limits attempts and resets after one minute', async () => {
  let time = 1000; const { handler, calls } = setup({ now: () => time });
  for (let i = 0; i < 3; i++) assert.equal((await handler(request())).status, 201);
  const blocked = await handler(request()); assert.equal(blocked.status, 429); assert.ok(Number(blocked.headers.get('retry-after')) > 0); assert.equal(calls.length, 3);
  time += 60001; assert.equal((await handler(request())).status, 201);
});
test('strict-origin checks do not trust a client-supplied host header', async () => {
  const { handler } = setup(); assert.equal((await handler(request(valid, { origin: 'https://attacker.example', host: 'attacker.example' }))).status, 403);
});

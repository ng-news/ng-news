// Smoke test for the Vercel function handlers (no Vercel, no Turso).
// Exercises every path that does NOT need a live database:
// validation, auth, honeypot, and the "DB not configured" failure mode.
//
// Run: node functions/test/smoke.mjs

let pass = 0;
let fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}${extra ? ` — ${extra}` : ''}`); }
}

function makeRes() {
  return {
    statusCode: 0,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(o) { this.body = o; return this; },
  };
}

/** Await a handler that is expected to reject (e.g. DB not configured). */
async function expectRejects(fn) {
  try {
    await fn();
    return null; // resolved: no rejection
  } catch (err) {
    return err;
  }
}

/** Fake Vercel request: method + headers + async-iterable JSON body. */
function makeReq(method, bodyObj, headers = {}) {
  const chunks = bodyObj === undefined ? [] : [Buffer.from(JSON.stringify(bodyObj))];
  return {
    method,
    headers,
    [Symbol.asyncIterator]: async function* () {
      for (const c of chunks) yield c;
    },
  };
}

const submit = (await import('../api/submit.mjs')).default;
const admin = (await import('../api/admin.mjs')).default;
const picks = (await import('../api/picks.mjs')).default;

const VALID = {
  name: 'Cool Project',
  url: 'https://example.dev',
  description: 'A wonderful thing that does things.',
  author: 'Jane',
  email: 'jane@example.dev',
};

// Clean env for the no-DB scenarios.
delete process.env.TURSO_DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;
delete process.env.ADMIN_TOKEN;

// --- /api/submit ---------------------------------------------------------
{
  const res = makeRes();
  const err = await expectRejects(() => submit(makeReq('POST', VALID), res));
  check('submit: valid body, no DB → rejects with "not set"',
    err instanceof Error && /not set/.test(err.message), `err=${err}`);
}

{
  const res = makeRes();
  await submit(makeReq('POST', { ...VALID, name: 'x' }), res);
  check('submit: short name → 400',
    res.statusCode === 400 && /name/.test(res.body?.error ?? ''), `res=${JSON.stringify(res)}`);
}

{
  const res = makeRes();
  await submit(makeReq('POST', { ...VALID, url: 'not-a-url' }), res);
  check('submit: bad URL → 400',
    res.statusCode === 400 && /url/.test(res.body?.error ?? ''), `res=${JSON.stringify(res)}`);
}

{
  const res = makeRes();
  await submit(makeReq('POST', { ...VALID, description: 'short' }), res);
  check('submit: short description → 400',
    res.statusCode === 400 && /description/.test(res.body?.error ?? ''), `res=${JSON.stringify(res)}`);
}

{
  const res = makeRes();
  await submit(makeReq('POST', { ...VALID, email: 'nope' }), res);
  check('submit: bad email → 400',
    res.statusCode === 400 && /email/.test(res.body?.error ?? ''), `res=${JSON.stringify(res)}`);
}

{
  const res = makeRes();
  await submit(makeReq('POST', { ...VALID, website: 'https://bot.spam' }), res);
  check('submit: honeypot filled → 200 ok, nothing stored',
    res.statusCode === 200 && res.body?.ok === true, `res=${JSON.stringify(res)}`);
}

{
  const res = makeRes();
  await submit(makeReq('GET'), res);
  check('submit: GET → 405', res.statusCode === 405, `res=${JSON.stringify(res)}`);
}

{
  const req = { method: 'POST', headers: {} }; // no iterator → readJsonBody throws
  const res = makeRes();
  try { await submit(req, res); } catch { /* for-await on non-iterable */ }
  check('submit: unreadable body handled (400 or reject)',
    res.statusCode === 400 || res.body === null, `res=${JSON.stringify(res)}`);
}

// --- /api/admin ----------------------------------------------------------
{
  const res = makeRes();
  await admin(makeReq('GET'), res);
  check('admin: GET, no ADMIN_TOKEN set → 401', res.statusCode === 401, `res=${JSON.stringify(res)}`);
}

process.env.ADMIN_TOKEN = 'secret';
{
  const res = makeRes();
  await admin(makeReq('GET', undefined, { 'x-admin-token': 'wrong' }), res);
  check('admin: GET, wrong token → 401', res.statusCode === 401, `res=${JSON.stringify(res)}`);
}
{
  const res = makeRes();
  const err = await expectRejects(() => admin(makeReq('GET', undefined, { 'x-admin-token': 'secret' }), res));
  check('admin: GET, right token, no DB → rejects (reaches DB layer)',
    err instanceof Error && /not set/.test(err.message), `err=${err}`);
}
{
  const res = makeRes();
  const err = await expectRejects(() => admin(makeReq('POST', { id: 1, status: 'approved' }, { 'x-admin-token': 'secret' }), res));
  check('admin: POST, right token, no DB → rejects (reaches DB layer)',
    err instanceof Error && /not set/.test(err.message), `err=${err}`);
}
{
  const res = makeRes();
  await admin(makeReq('POST', { id: 1, status: 'approved' }), res);
  check('admin: POST, no token → 401 (auth before DB)', res.statusCode === 401, `res=${JSON.stringify(res)}`);
}
{
  const res = makeRes();
  const err = await expectRejects(() => admin(makeReq('PUT', undefined, { 'x-admin-token': 'secret' }), res));
  check('admin: PUT, right token, no DB → reaches DB layer (method check is after)',
    err instanceof Error && /not set/.test(err.message), `err=${err}`);
}

// --- /api/picks ----------------------------------------------------------
{
  const res = makeRes();
  const err = await expectRejects(() => picks(makeReq('GET'), res));
  check('picks: GET, no DB → rejects (reaches DB layer)',
    err instanceof Error && /not set/.test(err.message), `err=${err}`);
}
{
  const res = makeRes();
  await picks(makeReq('POST'), res);
  check('picks: POST → 405', res.statusCode === 405, `res=${JSON.stringify(res)}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

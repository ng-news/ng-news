import { getDb, json, readJsonBody } from '../lib/db.mjs';

/**
 * POST /api/submit — project submission form.
 *
 * Body: { name, url, description, author?, email?, website? }
 * `website` is a honeypot: real users never see or fill it; bots do.
 * If it is filled we pretend success and store nothing.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'method not allowed' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return json(res, 400, { ok: false, error: 'invalid JSON body' });
  }

  // Honeypot — quietly drop.
  if (body.website) return json(res, 200, { ok: true });

  const name = String(body.name ?? '').trim();
  const url = String(body.url ?? '').trim();
  const description = String(body.description ?? '').trim();
  const author = String(body.author ?? '').trim().slice(0, 100) || null;
  const email = String(body.email ?? '').trim().slice(0, 200) || null;

  if (name.length < 2 || name.length > 100) {
    return json(res, 400, { ok: false, error: 'name must be 2–100 characters' });
  }
  if (!/^https?:\/\/\S+\.\S+/.test(url)) {
    return json(res, 400, { ok: false, error: 'url must be a valid http(s) link' });
  }
  if (description.length < 10 || description.length > 500) {
    return json(res, 400, { ok: false, error: 'description must be 10–500 characters' });
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return json(res, 400, { ok: false, error: 'email looks invalid' });
  }

  const db = await getDb();
  await db.execute(
    `INSERT INTO submissions (name, url, description, author, email, status, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6)`,
    [name, url, description, author, email, new Date().toISOString()],
  );

  return json(res, 200, { ok: true });
}

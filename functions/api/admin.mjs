import { getDb, json, readJsonBody, safeEqual } from '../lib/db.mjs';

/**
 * /api/admin — moderation endpoint (token-gated).
 *
 *   GET  → all submissions, newest first        { submissions: [...] }
 *   POST { id, status: 'approved'|'rejected' }  { ok: true }
 *
 * Auth: x-admin-token header must equal the ADMIN_TOKEN env var.
 */
export default async function handler(req, res) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || !safeEqual(req.headers['x-admin-token'], expected)) {
    return json(res, 401, { ok: false, error: 'unauthorized' });
  }

  const db = await getDb();

  if (req.method === 'GET') {
    const { results } = await db.execute(
      `SELECT id, name, url, description, author, email, status, created_at, reviewed_at
       FROM submissions ORDER BY created_at DESC, id DESC LIMIT 200`,
    );
    return json(res, 200, { submissions: results });
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return json(res, 400, { ok: false, error: 'invalid JSON body' });
    }
    const id = Number(body.id);
    const status = String(body.status ?? '');
    if (!Number.isInteger(id) || !['approved', 'rejected', 'pending'].includes(status)) {
      return json(res, 400, { ok: false, error: 'expected { id, status: approved|rejected|pending }' });
    }
    await db.execute(
      `UPDATE submissions SET status = ?2, reviewed_at = ?3 WHERE id = ?1`,
      [id, status, new Date().toISOString()],
    );
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { ok: false, error: 'method not allowed' });
}

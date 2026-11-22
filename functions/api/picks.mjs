import { getDb, json } from '../lib/db.mjs';

/**
 * GET /api/picks — public list of approved community picks, newest first.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'method not allowed' });
  }
  const db = await getDb();
  const { results } = await db.execute(
    `SELECT name, url, description, author, reviewed_at
     FROM submissions WHERE status = 'approved'
     ORDER BY reviewed_at DESC, id DESC LIMIT 50`,
  );
  return json(res, 200, {
    picks: results.map((r) => ({
      name: r.name,
      url: r.url,
      description: r.description,
      author: r.author,
      featuredAt: r.reviewed_at,
    })),
  });
}

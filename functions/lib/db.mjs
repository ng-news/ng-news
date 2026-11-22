import { createClient } from '@libsql/client';

/**
 * Shared Turso access for the ng-news functions.
 *
 * The schema is intentionally tiny (one table) and is created lazily with
 * CREATE TABLE IF NOT EXISTS — no migration tooling needed at this scale.
 *
 * Env (set in the Vercel dashboard or a local .env for `vercel dev`):
 *   TURSO_DATABASE_URL  libsql://…
 *   TURSO_AUTH_TOKEN    …
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);
`;

let clientPromise = null;

export function getDb() {
  if (!clientPromise) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL / TURSO_AUTH_TOKEN are not set');
    }
    clientPromise = Promise.resolve(
      createClient({ url, authToken }),
    ).then(async (client) => {
      // Idempotent; once per warm process.
      await client.execute(SCHEMA);
      return client;
    });
  }
  return clientPromise;
}

/** Constant-time string compare for the admin token. */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function json(res, status, body) {
  res.status(status).json(body);
}

export async function readJsonBody(req, limit = 8192) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('body too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

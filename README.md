# ng-news

Website for **ng-news** — the weekly curated newsletter about the Angular ecosystem (issues like "Ng-News 26/21: Angular 22.2 — Router Resources, Error Boundaries…").

## What it is

A content-driven site, built like a docs product:

- **Home = latest issue digest**: hero with the newest issue, "inside this issue" topic list, an archive rail of all issues, a tag filter, and the most recent topics across issues as cards.
- **Issue pages**: `/issues/26/21` — full issue text (where available), topic table of contents, prev/next navigation, share buttons (Medium, YouTube, LinkedIn, RSS), and a Giscus comment section (GitHub-authenticated; disabled until `GISCUS_REPO` is set).
- **Archive**: every issue as a card, filterable by tag (Releases, Signals, Router, AI, Ecosystem, …).
- **Search**: topbar search box, client-side full-text search (MiniSearch) over a build-time index (`app/public/search-index.json`) — no backend.
- **Community**: `/community` — approved community project picks (from Turso via `/api/picks`).
- **Submit**: `/submit` — project submission form → `/api/submit` → Turso `submissions` table (pending).
- **Admin**: `/admin` — token-gated moderation of submissions (`/api/admin`, `x-admin-token` header).

## Layout

Design process in `designs/` (static mockups, one HTML file each):

| Concept | File | Idea |
|---|---|---|
| 01 — Digest | `designs/01-digest/` | minimal, typography-first, "newsletter in the browser" |
| 02 — Pulse | `designs/02-pulse/` | bento card grid, gradient accent, dark-native |
| 03 — Stream | `designs/03-stream/` | chronological feed, single column, scroll-driven |
| 04 — Broadsheet | `designs/04-broadsheet/` | editorial newspaper grid, serif, dense |
| Brand | `designs/brand/` | real ng-news visual system (gradient #fa2aa5→#f40d57→#a80cb4, near-black covers, crimson accent) |

Winner (applied to the app): **02 — Pulse**, re-tokened to the real ng-news brand system.

## Research

See `RESEARCH.md` — key findings:

- ng-news publishes **weekly** (Monday), ~20 topics/issue across Medium + YouTube (100-sec briefings) + LinkedIn + X.
- Full Medium text is **Cloudflare-gated** (RSS gives titles + teasers only) → issue pages link out to Medium for full text; the site carries the structured digest.
- Content lives in `content/`: `sync.mjs` (Medium RSS + YouTube RSS), `index.json` (11 issues), `26-01.md` (one full-text example).

## Architecture

- `app/` — Angular 22 (zoneless) app with `@angular/ssr`, SSR + SSG (prerender).
- `content/` — source of truth; `build-content.mjs` compiles `index.json` into `app/src/app/generated/content.generated.ts` **and** emits `app/public/search-index.json` (client-side search) at build time (no runtime HTTP).
- `functions/` — Vercel serverless functions (ESM, `@libsql/client`) against one Turso database:
  - `api/submit.mjs` — `POST /api/submit` (honeypot + validation → `submissions` table)
  - `api/picks.mjs` — `GET /api/picks` (approved picks, newest first)
  - `api/admin.mjs` — `GET/POST /api/admin` (token-gated moderation via `x-admin-token`)
  - `lib/db.mjs` — shared client; schema is created lazily (`CREATE TABLE IF NOT EXISTS`)
  - `test/smoke.mjs` — handler smoke tests without a live DB (`pnpm --dir functions test`)
- Home: `app/src/app/features/home/` — hero, inside-issue, issue-rail, tag-filter, topic-cards, stats, video, subscribe.
- Issue: `app/src/app/features/issue/` — TOC, full text (Markdown→HTML for issues with a local `.md`), prev/next, share, Giscus comments.
- Shared: `app/src/app/shared/topbar.ts` — nav + search UI; `app/src/app/core/search.ts` — `SearchService` (MiniSearch, browser-only).

## Commands (from the repo root; Node 22 + pnpm 12 via Volta)

```bash
pnpm sync           # fetch Medium + YouTube feeds, report new issues (read-only)
pnpm sync:write     # merge new issues into content/index.json
pnpm content:build  # regenerate content.generated.ts + search-index.json
pnpm dev            # dev server (SSR), :4200
pnpm build          # production build incl. prerender (SSG)
pnpm start          # serve the production SSR build (PORT=4000)
pnpm preview:static # serve the prerendered output statically, :8080
pnpm --dir functions test   # API handler smoke tests (no DB needed)
```

## Deploy (Vercel)

`vercel.json` is committed: `@vercel/static-build` runs the root `pnpm build`, serves `app/dist/ng-news-app/browser/` statically, routes `/api/*` to the functions in `functions/api/`, and falls back to `index.csr.html` for client routes.

1. Create a Turso database (any region) and copy its `TURSO_DATABASE_URL` + auth token. The `submissions` table is created automatically on first request.
2. Set env vars in the Vercel project: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_TOKEN` (long random string).
3. `npx vercel` (login first with `npx vercel login`). PRs get preview deployments (Vercel Pro).

Local functions testing: `cp .env.example .env` (fill in values) → `npx vercel dev`.

- Alternative (no functions): `app/dist/ng-news-app/server/` + `node server.mjs` (SSR, e.g. Cloudflare Pages / Node).

## Current state

- [x] Research: profile, sources, issue format, archetypes (RESEARCH.md)
- [x] Layout design: 3 concepts as interactive mockups (designs/, winner: 02-pulse)
- [x] Content pipeline: sync.mjs + index.json (11 issues synced)
- [x] Angular app: home digest + issue pages, Pulse tokens, @ngrx/signals
- [x] SSG output: 12 routes prerendered, SSR + static serving verified locally
- [x] Client-side search (MiniSearch + build-time search index)
- [x] Community submissions: /submit, /community, /admin + Turso-backed Vercel functions (smoke-tested)
- [x] Giscus comments scaffolding on issue pages (enabled by setting GISCUS_REPO)
- [ ] Deploy (Vercel)
- [ ] Turso database created + env vars set

## Next

1. Deploy to Vercel (see above) + create the Turso DB + set env vars.
2. Enable Giscus: create the GitHub repo's Discussions, set `GISCUS_REPO` in `app/src/app/features/issue/issue.ts`.
3. Weekly cadence: `pnpm sync` on Monday → draft PR with new `index.json` entries → review → merge → Vercel rebuild.
4. Optional: full-text ingestion for older issues (needs Medium API or manual export) to replace the link-out.
5. Optional (v2): own comments in Turso, or Vercel Blob for full article text.

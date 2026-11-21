# Feature suggestions — ng-news website

> For the future official ng-news website. Grounded in [RESEARCH.md](RESEARCH.md):
> content = weekly curated issues (Medium RSS today), plus a YouTube channel.
> Priorities: **P1 = launch**, **P2 = soon after**, **P3 = later/optional**.

## Content model (drives everything)

```
Issue { number: "26/21", title, topics: [Topic], publishedAt, teaser, mediumUrl }
Topic { id, title, tag, summary, body (markdown/html) }
Tag   { Releases | Signals | RFCs | Tooling | Libraries | Community | Ecosystem | Testing | AI | … }
```

The issue is the unit of the site. Topics inside an issue are the unit of scanning.

## P1 — Launch

| # | Feature | Notes |
|---|---------|-------|
| 1 | **Issue archive** | Chronological list: number, date, title, topic tags. The site's backbone. |
| 2 | **Latest issue on home** | Digest view: topic cards with 1–2 line summaries + "read full issue". |
| 3 | **Issue detail page** | Full issue: TOC of topics with anchor links, tag badges, prev/next issue nav, share. |
| 4 | **Full-text pipeline** | Medium RSS gives titles/teasers only (10 items, Cloudflare-gated full text). Need a small fetcher/cacher (Worker or Node) that stores each issue's body at publish time. Until then: graceful "read on Medium" link-out. |
| 5 | **Topic tags + filter** | Tag system (Releases, Signals, RFCs, Tooling, …); filter the archive by tag. Cheap, high value for a curated tech pub. |
| 6 | **Subscribe CTA** | Prominent "follow on Medium" + (recommended) own email list (Buttondown/MailerLite-class) so the audience isn't locked to Medium. |
| 7 | **Own RSS/Atom feed** | `/feed.xml` generated from the issue store. Readers shouldn't depend on Medium; it also makes the site a first-class citizen for feed readers. |
| 8 | **SEO per issue** | SSR/prerender or at least static generation: canonical URL, title, OG/Twitter cards, `Article`/`BlogPosting` JSON-LD. Shareability is how dev newsletters grow. |
| 9 | **Dark mode** | Dev audience; class-based theme toggle, persisted. (Mockups 02 is dark-native; 01/03 need dark variants.) |
| 10 | **Responsive + fast** | Mobile-first; no heavy JS for reading. |

## P2 — Soon after launch

| # | Feature | Notes |
|---|---------|-------|
| 11 | **Search** | Full-text across issues/topics (e.g. FlexSearch client-side for <100 issues, then a real index). |
| 12 | **Topic pages** | `/topics/signals` — all issues touching a tag, chronological. Turns tags into a second navigation axis. |
| 13 | **YouTube integration** | Channel embed on home/about; optional per-issue "watch this week" video. The channel already exists (`@ng-news`). |
| 14 | **Continue reading** | Remember last read position per issue; resume on return. |
| 15 | **About page** | What ng-news is, the curation criteria (the "most important topics + explanations/analyses" line), link out to all channels. |
| 16 | **Sponsors section** | If monetizing: one quiet, clearly-labelled slot per issue. Common in dev newsletters, keeps the curation credible if limited. |
| 17 | **Email digest on publish** | New-issue announcement email from the list in #6 (plain link to the site). |
| 18 | **Reading progress + TOC scrollspy** | Long issues with many topics need an in-page TOC that tracks position. |

## P3 — Later / ideas

| # | Feature | Notes |
|---|---------|-------|
| 19 | **Angular release radar** | Auto-track GitHub releases of the Angular org + key libs (NgRx, PrimeNG, spartan/ui, AnalogJS…); a "new this week in the ecosystem" panel. Directly extends the curation with machine help. |
| 20 | **Community picks** | Weekly links to standout community posts (blog posts, PRs, talks) with a submission form. |
| 21 | **Angular version changelog viewer** | Structured per-version changelog (22.1, 22.2, …) derived from issue content — evergreen SEO content. |
| 22 | **PDF/print per issue** | One-click printable/PDF version. |
| 23 | **Issue API** | Read-only JSON API of the issue store (`/api/issues`) — feeds the site, the feed, and anyone building on the data. |
| 24 | **Podcast companion** | If the YouTube content gets audio: per-issue audio player. |
| 25 | **Localization** | If the audience grows beyond EN. |

## Technical implications (from research)

- **Data**: issue store (SQLite/JSON) + fetcher that mirrors Medium RSS at publish time. This one small backend component solves #4, #7, #22 and the Cloudflare problem in one move.
- **Rendering**: Angular with `@angular/ssr` (or prerendering) — a newsletter site lives on shared links; client-only rendering would hurt #8.
- **Scope guard**: P1 is deliberately small — archive, latest issue, issue pages, tags, subscribe, feed, SEO, dark mode. Everything else waits for real usage.

## Open (see RESEARCH.md §7)

- Branding: wordmark/colors don't exist yet — part of the design task (mockups each propose one).
- Does the site host full text, or link out to Medium? (Affects #3/#4 scope.)
- Is the YouTube channel in scope for v1?

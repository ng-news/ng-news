# Research — ng-news

> Research pass before committing to a design direction.
> Date: 2026-11-20. Status: **open** — see [Open questions](#7-open-questions).

## 1. What is "ng-news"?

**It's a real publication, not a common tutorial-repo name.** `ng-news` is a **weekly, curated newsletter about the Angular ecosystem** — framework releases, RFCs, tooling, licensing, community news — with its own description (from the Medium feed):

> "ng-news is published on a weekly basis. It brings you the latest updates from the Angular community. ng-news is curated which means it focuses only on the most important topics. It also comes with additional explanations and analyses."

Presence found:

| Channel | URL | Notes |
|---|---|---|
| Medium publication | `medium.com/ng-news` | Primary home; issue format "Ng-News YY/NN: Topics" |
| Medium RSS | `medium.com/feed/ng-news` | **Works without JS/auth** (verified 2026-11-20): 10 latest issues, titles + short teaser. Full text is teaser-only in feed. |
| YouTube | `youtube.com/@ng-news` | Channel + playlists ("Ng-News: Angular in 2024") |
| LinkedIn newsletter | `linkedin.com/newsletters/ng-news-7095802643150692352` | Mirror |
| X | `x.com/_ng_news` | Mirror |
| dev.to | `dev.to/ng_news` | Mirror |
| Angular In Depth | `angularindepth.com/author/ng-news/` | Syndication |

### Issue format (from live RSS, newest first)

- **26/21** — Angular 22.2: Router Resources, Error Boundaries, Private Template Members (03 Oct 2026)
- **26/19** — Angular 22.1 (22 Aug 2026)
- **26/18** — Angular Annual Releases, CopilotKit Integration (06 Aug 2026)
- **26/17** — PrimeNG's New Licensing, A2UI for Angular (13 Jul 2026)
- **26/16** — OpenNG Foundation, spartan/ui, AnalogJS in Storybook (02 Jul 2026)
- **26/15** — Angular 22 (23 Jun 2026)
- **26/14** — linkedSignal Write-Back, Error Boundaries (02 Jun 2026)
- **26/13** — @Service, Native Federation, Angular Feature Lifecycles (05 May 2026)
- **26/12** — Future of Selectorless, Skills vs. MCP, Zoneless Testing (10 Apr 2026)
- **26/11** — TypeScript 6, NgRx RFCs delegatedSignal, Resource Extensions (03 Apr 2026)

Pattern: **issue number (YY/NN) + headline topics**, each issue = a digest of the most important Angular-community topics with explanations/analysis. Topics cluster into: **framework releases · signals/RFCs · tooling & libraries · community & foundations · ecosystem news (TS, tooling, licensing)**.

> Note (2026-11-20): the YouTube video feed runs **ahead** of the Medium feed (videos for 26/23 and 26/24 already exist; Medium's latest is 26/21). Video titles often split one issue into several ~100-second videos (e.g. "26/24: Angular's New Compiler Is 2–3× Faster in First Benchmarks" / "26/24: Markdown Slides Built with Angular").

### Brand system (extracted from the YouTube channel, 2026-11-20)

Channel: **`@ng-news`** (id `UCpNgAFB5-_3WSHD_olBv7nw`, ~4.6K subscribers). Tagline (verbatim from channel description): **"The latest updates from the Angular community within 100 seconds every week."**

Extracted from the channel avatar and ~12 video covers (pixel analysis; reference images in [`designs/brand/`](designs/brand/)):

| Element | Finding |
|---|---|
| Avatar/logo | **White background + a mark in a diagonal gradient: pink `#fa2aa5` (top-left) → crimson `#f40d57` (core, ~75% of mark pixels) → purple `#a80cb4` (bottom-right)** — direction ≈ 135° |
| Cover template (standard) | **Near-pure black `#0a0a0a`** (87-92% of frame) with **small white/grey line marks**, **corner dot pairs** and a **small crimson accent** (~1% saturated px, hue cluster #f00050-#f05080) — extremely minimal |
| Cover variants | Occasional light covers (white bg with purple/orange/red accents) and raw video frames; the black template is the house style |
| Tone | Fast, punchy, minimal — "100 seconds" format; no gradients, no photography |

**Design implications:** dark theme should be **neutral black** (not blue-tinted); primary accent = the **pink→crimson→purple gradient** (`linear-gradient(135deg, #fa2aa5, #f40d57, #a80cb4)`) for brand-mark moments (logo wordmark, hero issue number, CTA bands), with solid crimson `#f40d57` for small text accents (not Angular's official red `#DD0031`); hero/issue art should be typographic (issue numbers) + corner-dot motif; video is first-class content. Concept 02 (Pulse) has been re-tokened accordingly.

## 2. Data sources

The site's content **is the newsletter itself**, so:

| Source | Free? | Notes |
|---|---|---|
| **Medium RSS** (`medium.com/feed/ng-news`) | Yes, no key | Verified: 10 latest issues with title, pubDate, teaser, link. Sufficient for archive + home page. Limit: 10 items per fetch — need pagination strategy for older issues (Medium pagination via `?offset=`, or archive on first run). |
| Medium full text | Partial | RSS description is teaser-only; full article body requires fetching each article page (Cloudflare-gated for plain HTTP — needs a proper fetch strategy or stored content). |
| YouTube RSS (`youtube.com/feeds/videos.xml?channel_id=…`) | Yes, no key | For the video side, if the site embeds the channel. |
| Third-party news APIs (NewsAPI, GNews, …) | — | **Not needed** for the core use case (displaying our own issues). Only relevant if the site later aggregates live community news beyond the newsletter. |

**Recommendation:** data layer = one service pulling Medium RSS (issue model: `number, title, topics[], date, teaser, url`) + YouTube channel feed as optional. Store/cache server-side if we build a small backend (also solves the Cloudflare full-text fetch and CORS for browser-side fetching).

## 3. Design references & archetypes

This is a **dev-newsletter site**, so the right references are dev-media products, not broadsheet news sites:

| Reference | Archetype | Notable traits |
|---|---|---|
| JavaScript Weekly / CSS-Tricks | Digest list | Issue = unit; clean archive list; strong masthead; subscribe CTA. |
| The Angular Blog (angular.dev/blog) | Official product blog | Minimal, docs-adjacent, category tags, release-callout styling. |
| Changelog | Dev-media hub | Video+text mix, show-style branding, horizontal cards. |
| Smashing Magazine | Technical magazine | Editorial hierarchy, deep articles, section color-coding. |
| Angular In Depth | Curated analysis site | Opinion/analysis tone, author identity front and center. |

Candidate archetypes for the ng-news site:

1. **Issue-first digest** — home = latest issue as a digest of topic cards; archive = clean chronological list of issues with topic tags. (Best default.)
2. **Front-page magazine** — hero latest issue + bento of "topics inside" + archive rail + subscribe band. (Closer to the `02-pulse` mockup.)
3. **Minimal stream** — single column of issues, quiet type, issue number as typographic anchor. (Closer to `03-stream`.)
4. **Show-style hub** (Changelog-like) — video-forward, since there's a YouTube channel. (Unmocked.)

Design tokens to settle: masthead/wordmark treatment, issue-number typography (it's the strongest identity element), tag/topic system, Angular-brand adjacency (should we use Angular's red `#f44` or stay neutral?), light/dark, motion level.

## 4. Tech stack (brief)

- **Angular** (LTS; Angular 22.x era per the issues), standalone components + signals.
- Styling: custom CSS + design tokens (closest to mockups), Tailwind, or Material/Mantine — decide with the chosen archetype.
- Data: `HttpClient` → Medium RSS (XML → `Article/Issue` model). If keys/fetching become an issue: tiny backend (Node/Cloudflare Worker) that proxies + caches RSS and stores full issue HTML.
- SSR (`@angular/ssr`) worth considering early: a newsletter site lives and dies by SEO/shareability of issue pages.
- The site can be its own portfolio-grade Angular app — matching the publication's subject.

## 5. How this maps to the existing mockups

The three concepts in `designs/` were drafted **before** this research, assuming a generic news-reader app. Their *layout archetypes* still map, but their *content* (fictional city news) is wrong for this publication:

| Concept | Archetype | Verdict for ng-news |
|---|---|---|
| `01-broadsheet` | Broadsheet | Print-heritage vibe is off-brand for a dev newsletter — keep as reference only |
| `02-pulse` | Front-page magazine | **Plausible** with recontenting: hero = latest issue, bento = topics inside, pulse → "latest issues" rail |
| `03-stream` | Minimal stream | **Plausible** as the archive view: issue list, numbers as anchors |

Likely end state: **one** chosen archetype, recontented with real issue data (titles above), replacing the fictional stories.

## 6. Recommendation

1. Confirm relationship to the publication (see §7) before investing in a direction.
2. If building the publication's site: prototype **issue-first digest** or **front-page magazine** with the 10 real issues from the RSS feed as content.
3. Data layer first: a working `IssueService` on Medium RSS is a half-day task and de-risks everything else.
4. Recontent (not redesign) the chosen mockup with real issue titles/topics before porting to Angular.

## 7. Open questions

1. **Relationship:** are you the publisher of ng-news, and is this folder for the publication's official website? (The name match is strong, but I don't want to assume.)
2. **Content scope:** only the newsletter issues, or also live curated links / the YouTube channel / a subscription form?
3. **Branding:** is there an existing wordmark/color for ng-news, or is branding part of the design task?
4. **Archetype preference** from §3 — or should I mock a 4th (show-style/video-forward)?
5. **Light, dark, or both** as primary mode?

## 8. Sources

- Medium RSS feed: `medium.com/feed/ng-news` — channel description + 10 issues (verified 2026-11-20)
- Medium publication: `medium.com/ng-news` (Cloudflare-gated for plain HTTP; RSS is the reliable access path)
- Web search ("ng-news" angular): YouTube `@ng-news`, LinkedIn newsletter, X `@_ng_news`, dev.to `/ng_news`, angularindepth.com author page (2026-11-20)
- YouTube channel page + RSS feed `youtube.com/feeds/videos.xml?channel_id=UCpNgAFB5-_3WSHD_olBv7nw` (tagline, 15 latest videos, channel id — 2026-11-20); avatar/banner/cover images pixel-analyzed via ffmpeg (see §1 brand table, images in `designs/brand/`)
- Earlier (superseded) checks: GitHub repo search + npm registry — the *name* is also used by small personal Angular tutorial repos, but that is incidental, not the identity of ng-news.

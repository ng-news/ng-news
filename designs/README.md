# Design concepts

Four layout directions for the ng-news website. Each folder is self-contained (inline CSS, no external assets) and contains:

- `index.html` — home / front page
- `issue.html` — issue detail page (uses issue 26/21)

All content is **real issue data** (titles, numbers, dates from the Medium RSS) with **placeholder topic summaries** — full bodies are synced from Medium at publish time (see RESEARCH.md §2).

## 01 — Digest (light, editorial)

The "curated publication" look: warm paper, serif display type, the issue number as the identity element, a numbered topic index for the latest issue, clean archive list, subscribe band. Closest to JavaScript Weekly / changelog-style dev pubs. Calm, trustworthy, print-heritage.

## 02 — Pulse (dark, bento) — **brand-aligned**

Dashboard-style front page: latest issue as a hero card (typographic issue number + corner-dot motif, echoing the video covers), "inside this issue" panel, recent-issues rail, topic cards from older issues, stats, 100-Second Briefings video card, subscribe CTA — all in a bento grid. Tag chips as primary navigation. Re-tokened to the **actual brand system** extracted from the YouTube channel: neutral black `#0a0a0a`, the **pink `#fa2aa5` → crimson `#f40d57` → purple `#a80cb4` gradient** of the channel mark (wordmark, hero issue number, CTA bands), real channel tagline, typographic issue-number hero with corner-dot motif. Dark-native (would need a light variant). Brand reference images in [`brand/`](brand/).

## 03 — Stream (light, minimal)

Single-column issue feed, mono accents, issue number as anchor, tag filter row, reader bar (position + older/newer). The most content-dense and the cheapest to build; scales best to a long archive. Feels like a good feed reader.

## 04 — Broadsheet (reference only)

Classic newspaper layout, drafted before ng-news' identity was confirmed. Kept as a typography/layout reference; **off-brand** for a dev newsletter (see RESEARCH.md §5). Content is fictional placeholder.

## How to compare

```bash
python3 -m http.server 8080
# http://localhost:8080/designs/01-digest/      (+ /issue.html)
# http://localhost:8080/designs/02-pulse/       (+ /issue.html)
# http://localhost:8080/designs/03-stream/      (+ /issue.html)
```

## Choosing

- **01 Digest** — if the site should feel like the *publication itself* (editorial authority).
- **02 Pulse** — if it should feel like a *product* (modern, feature-rich front page).
- **03 Stream** — if the *archive and reading experience* is the star (utility-first).

Note: 03 Stream's home could equally serve as the **archive page** of 01 or 02 — the concepts are not mutually exclusive; mixing (e.g., 01's home + 03's archive view) is a legitimate option.

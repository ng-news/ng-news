# ng-news

Website for **ng-news** — the weekly curated newsletter about the Angular ecosystem (issues like "Ng-News 26/21: Angular 22.2 — Router Resources, Error Boundaries…").

This repo starts with **research + design exploration**: see [RESEARCH.md](RESEARCH.md) for what ng-news is, its content format, and data sources; three initial layout directions live in [`designs/`](designs/) (mockups currently use placeholder content — see RESEARCH.md §5).

## Current state

- [x] Git repo initialized
- [x] Research pass ([RESEARCH.md](RESEARCH.md)) — publication profile, issue format, data sources, archetypes
- [x] Three initial layout concepts (mockups, no build tooling yet)
- [ ] Confirm scope/branding — open questions in [RESEARCH.md §7](RESEARCH.md#7-open-questions)
- [ ] Choose a direction (see [RESEARCH.md §3](RESEARCH.md#3-design-references--archetypes) + `designs/`)
- [ ] Recontent the chosen mockup with real issues (Medium RSS: `medium.com/feed/ng-news`)
- [ ] Port the chosen design to an Angular project (`ng new ng-news`)

## Research

See [RESEARCH.md](RESEARCH.md): what ng-news is, its issue format, the Medium RSS data source, design archetypes for a dev-newsletter site, and open questions.

## Design concepts

| # | Concept | One-liner |
|---|---------|-----------|
| 01 | **Broadsheet** | Classic newspaper: serif type, multi-column, ink-on-paper density |
| 02 | **Pulse** | Modern dashboard: bento card grid, chips, gradient accent, light/dark ready |
| 03 | **Stream** | Minimal feed: single column, chronological, quiet typography |

Preview any mockup locally:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/designs/01-broadsheet/
```

## Conventions

- Each concept lives in `designs/<nn>-<name>/index.html` — self-contained (inline CSS, no external assets) so it renders anywhere.
- Headlines and bylines in the mockups are **fictional placeholder content**.
- When a concept is chosen: the winning mockup's layout/typography tokens become the Angular app's theme (design tokens file), and sections become components (`<app-masthead>`, `<app-story-card>`, ...).

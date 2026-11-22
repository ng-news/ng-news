import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { ISSUES } from './generated/content.generated';

/**
 * Per-route rendering strategy.
 *
 * The site is pure SSG: the home page and every issue route are prerendered
 * at build time from the generated content module, so the Vercel deployment
 * is fully static — no server runtime needed.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'issues/:year/:week',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    getPrerenderParams: async () =>
      ISSUES.map((issue) => ({ year: issue.id.slice(0, 2), week: issue.id.slice(3) })),
  },
  {
    // Unknown paths never hit a server (static hosting); keep them client-rendered
    // so the app can redirect them to the home page.
    path: '**',
    renderMode: RenderMode.Client,
  },
];

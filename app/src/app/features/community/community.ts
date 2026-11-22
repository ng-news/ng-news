import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

export interface Pick {
  name: string;
  url: string;
  description: string;
  author: string | null;
  featuredAt: string | null;
}

const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function featured(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : monthDay.format(d);
}

/**
 * /community — approved community picks (public).
 *
 * Reads the /api/picks Vercel function (Turso) at runtime; this is a CSR
 * page. If the function/DB isn't configured yet it degrades to the
 * "picks coming soon" state instead of an error.
 */
@Component({
  selector: 'community-page',
  imports: [RouterLink],
  templateUrl: './community.html',
  styleUrl: './community.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityPage {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    inject(Title).setTitle('Community picks — ng-news');
    if (this.isBrowser) this.load();
  }

  protected readonly picks = signal<Pick[] | null>(null); // null = not loaded
  protected readonly failed = signal(false);
  protected readonly featured = featured;

  private async load() {
    try {
      const res = await fetch('/api/picks');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !Array.isArray(data.picks)) throw new Error(String(res.status));
      this.picks.set(data.picks);
    } catch {
      this.failed.set(true);
      this.picks.set([]);
    }
  }
}

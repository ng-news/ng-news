import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';

interface Submission {
  id: number;
  name: string;
  url: string;
  description: string;
  author: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const when = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function fmt(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : when.format(d);
}

/**
 * /admin — moderation queue for community submissions (token-gated).
 *
 * The token is entered once and kept in sessionStorage; every request sends
 * it as the x-admin-token header, checked against the ADMIN_TOKEN env var
 * by the /api/admin function.
 */
@Component({
  selector: 'admin-page',
  imports: [NgClass],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    inject(Title).setTitle('Admin — ng-news');
    if (this.isBrowser) {
      const token = sessionStorage.getItem('ng-news-admin-token');
      if (token) {
        this.token.set(token);
        this.load();
      }
    }
  }

  protected readonly token = signal('');
  protected readonly authed = signal(false);
  protected readonly authError = signal(false);
  protected readonly list = signal<Submission[] | null>(null);
  protected readonly filter = signal<Filter>('pending');
  protected readonly busy = signal(false);
  protected readonly fmt = fmt;
  protected readonly filters: Filter[] = ['pending', 'approved', 'rejected', 'all'];

  protected readonly visible = signal<Submission[]>([]);

  protected setToken(v: string) {
    this.token.set(v);
  }

  protected async login() {
    const t = this.token().trim();
    if (!t) return;
    sessionStorage.setItem('ng-news-admin-token', t);
    const ok = await this.load();
    if (ok) {
      this.authed.set(true);
      this.authError.set(false);
    } else {
      sessionStorage.removeItem('ng-news-admin-token');
      this.authError.set(true);
    }
  }

  protected logout() {
    sessionStorage.removeItem('ng-news-admin-token');
    this.authed.set(false);
    this.list.set(null);
    this.visible.set([]);
  }

  protected setFilter(f: Filter) {
    this.filter.set(f);
    this.applyFilter();
  }

  private applyFilter() {
    const all = this.list() ?? [];
    const f = this.filter();
    this.visible.set(f === 'all' ? all : all.filter((s) => s.status === f));
  }

  private async load(): Promise<boolean> {
    try {
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-token': this.token().trim() },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !Array.isArray(data.submissions)) return false;
      this.list.set(data.submissions);
      this.applyFilter();
      return true;
    } catch {
      return false;
    }
  }

  protected async decide(sub: Submission, status: 'approved' | 'rejected' | 'pending') {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': this.token().trim(),
        },
        body: JSON.stringify({ id: sub.id, status }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // Local optimistic update, then a fresh list to be safe.
      this.list.update((all) =>
        all?.map((s) => (s.id === sub.id ? { ...s, status } : s)) ?? null,
      );
      this.applyFilter();
      await this.load();
    } catch {
      // keep the previous state
    } finally {
      this.busy.set(false);
    }
  }
}

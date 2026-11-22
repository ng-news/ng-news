import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterEvent, RouterLink } from '@angular/router';
import { SearchHit, SearchService } from '../core/search';
import { site } from '../core/issues-store';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar implements OnDestroy {
  private readonly router = inject(Router);
  protected readonly search = inject(SearchService);
  protected readonly site = site;

  protected readonly hits = signal<SearchHit[]>([]);
  protected readonly open = signal(false);
  /** Index of the result highlighted for keyboard selection (-1 = none). */
  protected readonly active = signal(-1);

  private debounce: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Close the dropdown on any navigation (a result was picked or the
    // user left via keyboard/anchor). Constructor = injection context.
    this.router.events
      .pipe(takeUntilDestroyed())
      .subscribe((e) => {
        if (e instanceof RouterEvent) this.open.set(false);
      });
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  protected onInput(value: string) {
    if (this.debounce) clearTimeout(this.debounce);
    const q = value.trim();
    if (q.length < 2) {
      this.hits.set([]);
      this.open.set(false);
      return;
    }
    this.debounce = setTimeout(async () => {
      try {
        this.hits.set(await this.search.search(q, 8));
        this.active.set(-1);
        this.open.set(true);
      } catch {
        this.hits.set([]);
        this.open.set(false);
        this.active.set(-1);
      }
    }, 150);
  }

  protected onKeydown(e: KeyboardEvent) {
    const n = this.hits().length;
    if (e.key === 'ArrowDown' && n > 0) {
      e.preventDefault();
      this.active.set(Math.min(this.active() + 1, n - 1));
    } else if (e.key === 'ArrowUp' && n > 0) {
      e.preventDefault();
      this.active.set(Math.max(this.active() - 1, 0));
    } else if (e.key === 'Enter' && n > 0) {
      e.preventDefault();
      const hit = this.hits()[Math.max(this.active(), 0)];
      this.pick(hit);
    } else if (e.key === 'Escape') {
      this.open.set(false);
      this.active.set(-1);
    }
  }

  protected pick(hit: SearchHit) {
    this.clearTimers();
    this.open.set(false);
    this.hits.set([]);
    this.active.set(-1);
    this.router.navigateByUrl(hit.doc.url);
  }

  protected onBlur() {
    // Deferred so the result's mousedown (which clears it) can win.
    this.closeTimer = setTimeout(() => {
      this.open.set(false);
      this.active.set(-1);
    }, 150);
  }

  protected onResultDown() {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  private clearTimers() {
    if (this.debounce) clearTimeout(this.debounce);
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }
}

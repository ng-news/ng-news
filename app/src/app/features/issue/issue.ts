import { AfterViewInit, ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { longDateOnly, pad, shortDateOnly } from '../../core/format';
import { Issue } from '../../core/issue.model';
import { site, useIssuesStore } from '../../core/issues-store';

/**
 * Giscus — comments via GitHub Discussions rendered on the page (free, no
 * backend; commenters log in with GitHub, which keeps spam out).
 *
 * To enable: set GISCUS_REPO to '<github-user-or-org>/<repo>' where the
 * repository has the Discussions feature turned on. Each issue page gets its
 * own discussion, keyed by the page path. Leave the repo empty to show the
 * "coming soon" placeholder instead.
 */
const GISCUS_REPO = ''; // e.g. 'ng-news/ng-news'
const GISCUS_CATEGORY = 'General'; // must match a category in that repo

@Component({
  selector: 'issue-page',
  imports: [RouterLink],
  templateUrl: './issue.html',
  styleUrl: './issue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuePage implements AfterViewInit {
  private readonly store = inject(useIssuesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly giscusEnabled = () => GISCUS_REPO !== '';

  ngAfterViewInit() {
    if (this.isBrowser && GISCUS_REPO && this.currentIssue()) {
      this.initGiscus();
    }
  }

  /** Injects the giscus client script; it renders the discussion into #giscus-comments. */
  private initGiscus() {
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', GISCUS_REPO);
    s.setAttribute('data-category', GISCUS_CATEGORY);
    // One discussion per page, keyed by the page path (/issues/26/21 → own thread).
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', 'dark_dimmed');
    s.setAttribute('data-lang', 'en');
    s.setAttribute('data-emit-metadata', '0');
    document.getElementById('giscus-comments')?.appendChild(s);
  }

  protected readonly issueId = computed(() => {
    const params = this.route.snapshot.paramMap;
    const year = params.get('year') ?? '';
    const week = params.get('week') ?? '';
    return `${year}/${week}`;
  });
  protected readonly currentIssue = computed<Issue | null>(() => this.store.getIssue(this.issueId()));
  protected readonly previous = computed(() => this.currentIssue() ? this.store.previousIssue(this.currentIssue()!.id) : null);
  protected readonly next = computed(() => this.currentIssue() ? this.store.nextIssue(this.currentIssue()!.id) : null);
  protected readonly pad = pad;
  protected readonly date = shortDateOnly;
  protected readonly longDate = longDateOnly;
  protected readonly site = site;

  constructor() {
    // Synchronous so the titles/meta land in the prerendered HTML.
    const issue = this.currentIssue();
    if (!issue) {
      this.titleService.setTitle('Issue not found — ng-news');
      return;
    }
    this.titleService.setTitle(`${issue.id}: ${issue.title} — ng-news`);
    this.meta.addTag({ name: 'description', content: issue.teaser });
    if (issue.mediumUrl) {
      this.meta.addTag({ property: 'og:url', content: issue.mediumUrl });
    }
  }

  protected readonly copied = signal(false);

  protected async copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore.
    }
  }
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HeroCard } from './hero-card';
import { InsideIssue } from './inside-issue';
import { IssueRail } from './issue-rail';
import { StatsCard } from './stats-card';
import { SubscribeCard } from './subscribe-card';
import { TagFilter } from './tag-filter';
import { TopicCard } from './topic-card';
import { VideoCard } from './video-card';
import { Issue, Topic } from '../../core/issue.model';
import { useIssuesStore } from '../../core/issues-store';

interface Featured {
  issue: Issue;
  topic: Topic;
}

@Component({
  selector: 'app-home',
  imports: [TagFilter, HeroCard, InsideIssue, IssueRail, TopicCard, StatsCard, VideoCard, SubscribeCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly store = inject(useIssuesStore);

  constructor() {
    // Synchronous so the title lands in the prerendered HTML.
    inject(Title).setTitle('ng-news — the Angular community in 100 seconds, every week');
  }

  /** Wide topic cards: the first topic of each visible (filtered) issue, newest first. */
  protected readonly featured = computed<Featured[]>(() =>
    this.store
      .visibleIssues()
      .slice(0, 6)
      .filter((issue) => issue.topics.length > 0)
      .map((issue) => ({ issue, topic: issue.topics[0] })),
  );

  protected readonly tag = this.store.selectedTag;
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { useIssuesStore } from '../../core/issues-store';

@Component({
  selector: 'stats-card',
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCard {
  private readonly store = inject(useIssuesStore);

  protected readonly issueCount = computed(() => this.store.issues().length);
  protected readonly topicCount = computed(() =>
    this.store.issues().reduce((sum, issue) => sum + issue.topics.length, 0),
  );
}

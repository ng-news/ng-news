import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { shortDateOnly } from '../../core/format';
import { useIssuesStore } from '../../core/issues-store';

@Component({
  selector: 'issue-rail',
  imports: [RouterLink],
  templateUrl: './issue-rail.html',
  styleUrl: './issue-rail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueRail {
  private readonly store = inject(useIssuesStore);

  protected readonly issues = computed(() => this.store.recentIssues().slice(0, 8));
  protected readonly date = shortDateOnly;
}

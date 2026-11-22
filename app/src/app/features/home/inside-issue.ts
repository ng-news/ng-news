import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { pad } from '../../core/format';
import { useIssuesStore } from '../../core/issues-store';

@Component({
  selector: 'inside-issue',
  imports: [RouterLink],
  templateUrl: './inside-issue.html',
  styleUrl: './inside-issue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsideIssue {
  protected readonly pad = pad;
  protected readonly issue = inject(useIssuesStore).latestIssue;
}

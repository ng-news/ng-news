import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { longDateOnly } from '../../core/format';
import { useIssuesStore } from '../../core/issues-store';

@Component({
  selector: 'hero-card',
  imports: [RouterLink],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCard {
  private readonly store = inject(useIssuesStore);

  protected readonly issue = this.store.latestIssue;
  protected readonly dateLabel = computed(() => {
    const iso = this.issue()?.date;
    return iso ? longDateOnly(iso).replace(', 2026', '') : '';
  });
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { useIssuesStore } from '../../core/issues-store';

@Component({
  selector: 'tag-filter',
  templateUrl: './tag-filter.html',
  styleUrl: './tag-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFilter {
  private readonly store = inject(useIssuesStore);

  protected readonly tags = this.store.tags;
  protected readonly selectedTag = this.store.selectedTag;
  protected readonly totalCount = this.store.issues;

  protected select(tag: string) {
    this.store.selectTag(tag);
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Issue, Topic } from '../../core/issue.model';
import { shortDateOnly } from '../../core/format';

@Component({
  selector: 'topic-card',
  imports: [RouterLink],
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicCard {
  public readonly issue = input.required<Issue>();
  public readonly topic = input.required<Topic>();
  protected readonly date = shortDateOnly;
}

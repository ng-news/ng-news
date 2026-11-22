import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../core/issues-store';

@Component({
  selector: 'subscribe-card',
  templateUrl: './subscribe-card.html',
  styleUrl: './subscribe-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeCard {
  protected readonly site = site;
}

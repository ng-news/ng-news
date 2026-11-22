import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../core/issues-store';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly site = site;
}

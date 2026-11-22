import { ChangeDetectionStrategy, Component } from '@angular/core';
import { latestVideo, site } from '../../core/issues-store';

@Component({
  selector: 'video-card',
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCard {
  protected readonly latestVideo = latestVideo;
  protected readonly site = site;
}

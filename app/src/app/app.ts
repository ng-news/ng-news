import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/footer';
import { Topbar } from './shared/topbar';

@Component({
  selector: 'app-root',
  imports: [Topbar, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

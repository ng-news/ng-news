import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

interface SubmissionForm {
  name: string;
  url: string;
  description: string;
  author: string;
  email: string;
  /** Honeypot — hidden from humans; bots fill it and get a fake success. */
  website: string;
}

/**
 * /submit — community project submission form.
 *
 * POSTs to the /api/submit Vercel function (Turso). This is a CSR page
 * (client-rendered; see app.routes.server.ts), so there is nothing to
 * prerender here.
 */
@Component({
  selector: 'submit-page',
  imports: [RouterLink],
  templateUrl: './submit.html',
  styleUrl: './submit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitPage {
  constructor() {
    inject(Title).setTitle('Submit your project — ng-news');
  }

  protected readonly form = signal<SubmissionForm>({
    name: '',
    url: '',
    description: '',
    author: '',
    email: '',
    website: '',
  });

  protected readonly sending = signal(false);
  protected readonly done = signal(false);
  protected readonly error = signal<string | null>(null);

  protected update<K extends keyof SubmissionForm>(key: K, value: string) {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected async onSubmit() {
    if (this.sending()) return;
    this.sending.set(true);
    this.error.set(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(this.form()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      this.done.set(true);
    } catch (err) {
      this.error.set(
        err instanceof Error && /HTTP (404|502)/.test(err.message)
          ? 'The submission service is not available right now — please try again later.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong.',
      );
    } finally {
      this.sending.set(false);
    }
  }
}

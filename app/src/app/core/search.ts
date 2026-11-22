import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import MiniSearch from 'minisearch';

/** One searchable document in the build-time search index. */
export interface SearchDoc {
  id: string;
  type: 'issue' | 'topic';
  title: string;
  /** Route the result navigates to. */
  url: string;
  tags: string[];
  /** Extra words (teaser, issue title, …) that don't appear in the visible title. */
  text: string;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

/**
 * Client-side full-text search over the build-time search index
 * (`app/public/search-index.json`, emitted by content/build-content.mjs).
 *
 * No backend: the index is fetched once (local static file, cached by the
 * browser) and MiniSearch builds an in-memory index in the browser.
 * Browser-only by design — during SSR/prerender nothing is fetched.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly loading = signal(false);
  readonly ready = signal(false);

  private engine: MiniSearch<SearchDoc> | null = null;
  private docsById = new Map<string, SearchDoc>();
  private pending: Promise<void> | null = null;

  /**
   * Search issues and topics. Empty/short queries return nothing.
   * Throws in SSR (there is no index there) — callers are browser-only.
   */
  async search(query: string, limit = 8): Promise<SearchHit[]> {
    const q = query.trim();
    if (q.length < 2 || !this.engine) await this.init();
    if (!this.engine) return [];
    const results = this.engine
      .search(q, { prefix: true, fuzzy: 0.2, boost: { title: 4 } })
      .slice(0, limit);
    return results
      .map((r) => {
        const doc = this.docsById.get(String(r.id));
        return doc ? { doc, score: r.score } : null;
      })
      .filter((hit): hit is SearchHit => hit !== null);
  }

  private init(): Promise<void> {
    if (this.pending) return this.pending;
    this.pending = new Promise<void>((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('Search is only available in the browser.'));
        return;
      }
      this.loading.set(true);
      fetch('/search-index.json')
        .then((r) => {
          if (!r.ok) throw new Error(`search index: ${r.status}`);
          return r.json();
        })
        .then((data: { docs: SearchDoc[] }) => {
          const engine = new MiniSearch<SearchDoc>({
            idField: 'id',
            fields: ['title', 'text', 'tags'],
            storeFields: ['id'],
          });
          for (const doc of data.docs) {
            this.docsById.set(doc.id, doc);
          }
          engine.addAll(data.docs);
          this.engine = engine;
          this.ready.set(true);
          this.loading.set(false);
          resolve();
        })
        .catch((err) => {
          this.loading.set(false);
          this.pending = null; // allow a retry on the next query
          reject(err);
        });
    });
    return this.pending;
  }
}

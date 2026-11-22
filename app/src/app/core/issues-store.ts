import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ISSUES, LATEST_VIDEO, SITE } from '../generated/content.generated';
import { Issue, LatestVideo, SiteMeta } from './issue.model';

interface IssuesState {
  issues: Issue[];
  /** Active tag filter; '' = all issues. */
  selectedTag: string;
}

/**
 * Content store, seeded at build time from `content/` (Medium + YouTube sync).
 * No runtime network dependency: everything the site renders is in the bundle.
 */
export const useIssuesStore = signalStore(
  withState<IssuesState>({
    issues: ISSUES,
    selectedTag: '',
  }),

  withMethods((store) => ({
    /** Toggle the tag filter; clicking the active tag clears it. */
    selectTag(tag: string) {
      patchState(store, (s) => ({ selectedTag: s.selectedTag === tag ? '' : tag }));
    },

    getIssue(id: string): Issue | null {
      return store.issues().find((i) => i.id === id) ?? null;
    },

    /** Issue immediately before `id` in the archive (older), if any. */
    previousIssue(id: string): Issue | null {
      const idx = store.issues().findIndex((i) => i.id === id);
      return idx >= 0 && idx < store.issues().length - 1 ? store.issues()[idx + 1] : null;
    },

    /** Issue immediately after `id` in the archive (newer), if any. */
    nextIssue(id: string): Issue | null {
      const idx = store.issues().findIndex((i) => i.id === id);
      return idx > 0 ? store.issues()[idx - 1] : null;
    },
  })),

  withComputed((store) => {
    const latestIssue = computed<Issue | null>(() => store.issues()[0] ?? null);

    const recentIssues = computed<Issue[]>(() => store.issues().slice(1));

    const tags = computed(() => {
      const counts = new Map<string, number>();
      for (const issue of store.issues()) {
        for (const topic of issue.topics) {
          counts.set(topic.tag, (counts.get(topic.tag) ?? 0) + 1);
        }
      }
      return [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    });

    const visibleIssues = computed<Issue[]>(() => {
      const tag = store.selectedTag();
      if (!tag) return store.issues();
      return store.issues().filter((i) => i.topics.some((t) => t.tag === tag));
    });

    return { latestIssue, recentIssues, tags, visibleIssues };
  }),
);

export const site = SITE as SiteMeta;
export const latestVideo = LATEST_VIDEO as LatestVideo;

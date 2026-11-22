/** Content model shared by the generated content module and the store. */

export interface Topic {
  title: string;
  tag: string;
  /** 100-second briefing for this topic, when the channel has one. */
  videoUrl?: string;
}

export interface Issue {
  /** Issue number, e.g. "26/21". */
  id: string;
  title: string;
  /** ISO date (yyyy-mm-dd); null when the issue is not on Medium yet. */
  date: string | null;
  teaser: string;
  mediumUrl?: string;
  /** Episode-level video, when the channel has one. */
  videoUrl?: string;
  readMinutes?: number;
  tags: string[];
  topics: Topic[];
  /** Full issue text (rendered HTML) from the content pipeline. */
  bodyHtml?: string;
}

export interface LatestVideo {
  issue: string;
  title: string;
  url: string;
}

export interface SiteMeta {
  name: string;
  tagline: string;
  medium: string;
  rss: string;
  youtube: string;
  youtubeChannelId: string;
  x: string;
  linkedin: string;
}

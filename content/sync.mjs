#!/usr/bin/env node
/**
 * Weekly content sync — run before a new issue is published:
 *
 *   node content/sync.mjs            # report what changed upstream
 *   node content/sync.mjs --write    # also merge new issues into index.json
 *
 * Sources:
 *   Medium RSS   https://medium.com/feed/ng-news
 *   YouTube RSS  https://www.youtube.com/feeds/videos.xml?channel_id=...
 *
 * What it does:
 *   1. Fetches both feeds (no auth needed).
 *   2. Finds Medium items that are not in index.json yet.
 *   3. Matches YouTube videos to issue numbers ("Ng-News 26/NN" prefix) and
 *      to topics (titles without the prefix become topic-level videos).
 *   4. With --write: adds new issues to index.json with their Medium URL,
 *      date, teaser and video links. Topics/tags for a new issue must be
 *      filled in by hand (or from the draft markdown), then:
 *          pnpm content:build && pnpm build
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const write = process.argv.includes('--write');
const index = JSON.parse(readFileSync(join(here, 'index.json'), 'utf8'));

const MEDIUM_RSS = 'https://medium.com/feed/ng-news';
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${index.site.youtubeChannelId}`;

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'ng-news-content-sync/1.0' } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

function stripTags(s) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseMedium(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const g = (re) => {
      const x = m[1].match(re);
      return x ? stripTags(x[1]) : '';
    };
    const link = m[1].match(/<link>([\s\S]*?)<\/link>/);
    return {
      title: g(/<title>[\s\S]*?<\/title>/).replace(/^Ng-News\s+\d+\/\d+:\s*/, ''),
      link: link ? link[1].trim() : '',
      pubDate: g(/<pubDate>[\s\S]*?<\/pubDate>/),
      teaser: g(/<description>[\s\S]*?<\/description>/),
      raw: m[1],
    };
  });
  // The title may carry the "Ng-News 26/21:" prefix.
  return items.map((it) => {
    const idMatch = it.raw.match(/Ng-News\s+(\d+\/\d+)/);
    return { ...it, id: idMatch ? idMatch[1] : null };
  });
}

function parseYoutube(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const g = (re) => {
      const x = m[1].match(re);
      return x ? x[1].trim() : '';
    };
    const id = g(/<yt:videoId>[\s\S]*?<\/yt:videoId>/);
    const title = g(/<title>[\s\S]*?<\/title>/);
    return { id, title, url: `https://www.youtube.com/watch?v=${id}` };
  });
}

const [mediumXml, ytXml] = await Promise.all([get(MEDIUM_RSS), get(YT_RSS)]);
const mediumItems = parseMedium(mediumXml).filter((i) => i.id);
const videos = parseYoutube(ytXml);

const known = new Set(index.issues.map((i) => i.id));
const newIssues = mediumItems.filter((i) => !known.has(i.id));

console.log('--- Medium RSS ---');
for (const it of mediumItems) console.log(`  ${it.id}  ${it.title}`);
console.log(`  new: ${newIssues.length}`);

console.log('--- YouTube ---');
for (const v of videos) console.log(`  ${v.id}  ${v.title}`);

if (!write) {
  console.log('\nRun with --write to merge new issues into content/index.json');
  process.exit(0);
}

for (const it of newIssues) {
  const d = new Date(it.pubDate);
  const issueVideos = videos.filter((v) => v.title.includes(`Ng-News ${it.id}:`));
  const episodeVideo = issueVideos.find((v) => !v.title.includes('Shorts')) ?? null;
  const episode = {
    id: it.id,
    title: it.title,
    date: Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10),
    teaser: it.teaser ? it.teaser.slice(0, 200) : '',
    mediumUrl: it.link,
    ...(episodeVideo ? { videoUrl: episodeVideo.url } : {}),
    tags: [],
    topics: issueVideos
      .filter((v) => v !== episodeVideo)
      .map((v) => ({ title: v.title.replace(/^Ng-News\s+\d+\/\d+:\s*/, ''), tag: '', videoUrl: v.url })),
  };
  index.issues = [episode, ...index.issues];
  console.log(`  added ${it.id} to index.json (fill in tags/topics)`);
}

// Refresh latest video (first non-Shorts video that has an issue number).
const latest = videos.find((v) => /Ng-News \d+\/\d+:/.test(v.title) && !v.title.includes('Shorts'));
if (latest) {
  index.latestVideo = {
    issue: latest.title.match(/Ng-News (\d+\/\d+)/)[1],
    title: latest.title.replace(/^Ng-News \d+\/\d+:\s*/, ''),
    url: latest.url,
  };
  console.log(`  latestVideo -> ${index.latestVideo.issue}`);
}

writeFileSync(join(here, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('\nWrote content/index.json. Next: pnpm content:build && pnpm build');

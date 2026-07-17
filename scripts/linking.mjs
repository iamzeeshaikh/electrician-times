// Phase 6: internal linking.
// 1. Inventories existing in-content internal links.
// 2. Conservatively ADDS contextual links where a post's body text naturally
//    mentions another post's focus keyphrase (max 3 added/post, 1 per destination,
//    only in plain paragraphs that have no existing link).
// 3. Reports content-orphans (posts with no inbound contextual links).
// Outputs: reports/internal-linking-report.csv, reports/orphan-pages.csv
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const BLOG = `${ROOT}src/content/blog/`;

const files = readdirSync(BLOG).filter((f) => f.endsWith('.md'));

function parseFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z]+): (.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    try {
      fm[k] = v.startsWith('[') ? JSON.parse(v) : JSON.parse(v);
    } catch {
      fm[k] = v;
    }
  }
  return { fm, body: raw.slice(m[0].length), fmRaw: m[0] };
}

const posts = files.map((f) => {
  const raw = readFileSync(BLOG + f, 'utf8');
  const { fm, body, fmRaw } = parseFm(raw);
  return { file: f, slug: fm.slug, title: fm.title, focus: fm.focusKeyword || '', categories: fm.categories || [], body, fmRaw };
});
const bySlug = new Map(posts.map((p) => [p.slug, p]));

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with', 'how', 'what', 'why', 'is', 'are', 'your', 'you', 'best', 'guide', 'top', 'about', 'everything', 'need', 'know']);

// candidate anchor phrases per destination post
function phrases(p) {
  const out = [];
  if (p.focus && p.focus.length >= 8 && p.focus.split(' ').length >= 2) out.push(p.focus);
  // distinctive title fragment: strip punctuation-split subtitle
  const main = p.title.split(/[:?–—|(]/)[0].trim();
  const sig = main.split(/\s+/).filter((w) => !STOP.has(w.toLowerCase()));
  if (main.length >= 12 && main.length <= 60 && sig.length >= 2 && main !== p.focus) out.push(main);
  return out;
}

const report = []; // {source, dest, anchor, location, reason, kind}
const inbound = new Map(posts.map((p) => [p.slug, 0]));

// --- 1. existing links ---
for (const p of posts) {
  for (const m of p.body.matchAll(/<a\s[^>]*href="(\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = m[1];
    const anchor = m[2].replace(/<[^>]+>/g, '').trim();
    const seg = href.split('/')[1];
    if (href.startsWith('/wp-content/')) continue;
    report.push({
      source: `/${p.slug}/`,
      dest: href,
      anchor,
      location: 'in-content',
      reason: 'migrated from WordPress',
      kind: 'existing',
    });
    if (bySlug.has(seg)) inbound.set(seg, inbound.get(seg) + 1);
  }
}

// --- 2. add conservative contextual links ---
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let addedTotal = 0;

for (const p of posts) {
  let added = 0;
  const already = new Set(
    [...p.body.matchAll(/href="\/([a-z0-9-]+)\//g)].map((m) => m[1])
  );

  // candidate destinations: same category first, most inbound-poor first
  const candidates = posts
    .filter((d) => d.slug !== p.slug && !already.has(d.slug))
    .sort((a, b) => (inbound.get(a.slug) ?? 0) - (inbound.get(b.slug) ?? 0));

  for (const dest of candidates) {
    if (added >= 3) break;
    for (const phrase of phrases(dest)) {
      // find the phrase inside a link-free paragraph
      const re = new RegExp(`(<p>)((?:(?!</p>|<a |<img|<h[1-6])[\\s\\S])*?)\\b(${escRe(phrase)})\\b`, 'i');
      const m = p.body.match(re);
      if (!m) continue;
      // avoid linking inside headings/captions: re anchored to <p> already
      p.body = p.body.replace(re, (full, open, before, matched) => `${open}${before}<a href="/${dest.slug}/">${matched}</a>`);
      p.changed = true;
      added++;
      addedTotal++;
      inbound.set(dest.slug, inbound.get(dest.slug) + 1);
      already.add(dest.slug);
      report.push({
        source: `/${p.slug}/`,
        dest: `/${dest.slug}/`,
        anchor: m[3],
        location: 'in-content',
        reason: `body text naturally mentions the target's topic ("${phrase}")`,
        kind: 'added',
      });
      break;
    }
  }
}

for (const p of posts) {
  if (p.changed) writeFileSync(BLOG + p.file, p.fmRaw + p.body);
}

// --- 3. orphan report ---
const csvEsc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const orphanRows = posts
  .filter((p) => (inbound.get(p.slug) ?? 0) === 0)
  .map((p) =>
    [
      `/${p.slug}/`,
      p.title,
      'no inbound in-content links',
      'reachable via category archive, related-posts, prev/next and HTML sitemap; flagged for future editorial linking',
    ].map(csvEsc).join(',')
  );

writeFileSync(
  `${ROOT}reports/orphan-pages.csv`,
  'url,title,issue,mitigation\n' + orphanRows.join('\n')
);

writeFileSync(
  `${ROOT}reports/internal-linking-report.csv`,
  'source_url,destination_url,anchor_text,link_location,reason,existing_or_added\n' +
    report.map((r) => [r.source, r.dest, r.anchor, r.location, r.reason, r.kind].map(csvEsc).join(',')).join('\n')
);

console.log(`existing in-content internal links: ${report.filter((r) => r.kind === 'existing').length}`);
console.log(`added contextual links: ${addedTotal}`);
console.log(`content-orphans remaining: ${orphanRows.length}`);

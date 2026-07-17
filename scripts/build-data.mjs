// Merge XML + SQL data into a single normalized dataset: data/merged/posts.json,
// pages.json, categories.json, media.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DATA = fileURLToPath(new URL('../data/', import.meta.url));
const load = (f) => JSON.parse(readFileSync(`${DATA}${f}`, 'utf8'));

const items = load('xml/items.json');
const sqlPosts = load('sql/wp_posts.json');
const postmeta = load('sql/wp_postmeta.json');
const terms = load('sql/wp_terms.json');
const termTax = load('sql/wp_term_taxonomy.json');
const termRel = load('sql/wp_term_relationships.json');
const indexables = load('sql/wp_yoast_indexable.json');
const primaryTerms = load('sql/wp_yoast_primary_term.json');

mkdirSync(`${DATA}merged/`, { recursive: true });

// --- lookups ---
const metaByPost = new Map();
for (const m of postmeta) {
  if (!metaByPost.has(m.post_id)) metaByPost.set(m.post_id, {});
  metaByPost.get(m.post_id)[m.meta_key] = m.meta_value;
}
const idxByObject = new Map(); // `${type}:${id}`
for (const ix of indexables) idxByObject.set(`${ix.object_type}:${ix.object_id}`, ix);

const termById = new Map(terms.map((t) => [t.term_id, t]));
const taxByTermId = new Map(termTax.map((tt) => [tt.term_id, tt]));
const taxByTTId = new Map(termTax.map((tt) => [tt.term_taxonomy_id, tt]));

const primaryCatByPost = new Map();
for (const pt of primaryTerms) {
  if (pt.taxonomy === 'category') primaryCatByPost.set(pt.post_id, pt.term_id);
}

const attachments = new Map(); // id -> {url, alt, caption, title}
for (const it of items.filter((i) => i.type === 'attachment')) {
  attachments.set(String(it.id), {
    id: it.id,
    url: it.attachmentUrl,
    alt: it.meta._wp_attachment_image_alt || '',
    title: it.title,
    caption: it.excerpt || '',
    file: it.meta._wp_attached_file || '',
  });
}

const SITE = 'https://electriciantimes.com';
const OLD_HOSTS = [
  'https://orangered-mouse-231438.hostingersite.com',
  'http://orangered-mouse-231438.hostingersite.com',
  'http://electriciantimes.com',
  'https://www.electriciantimes.com',
  'http://www.electriciantimes.com',
];
export function normalizeHost(url) {
  if (!url) return url;
  let out = url;
  for (const h of OLD_HOSTS) out = out.split(h).join(SITE);
  return out;
}

const num = (v) => (v == null || v === '' ? null : Number(v));
const yes = (v) => v === '1' || v === 1;

// --- posts ---
const posts = [];
for (const it of items.filter((i) => i.type === 'post' && i.status === 'publish')) {
  const pid = String(it.id);
  const meta = { ...(metaByPost.get(pid) || {}), ...it.meta };
  const ix = idxByObject.get(`post:${pid}`) || {};

  const thumbId = meta._thumbnail_id || null;
  const featured = thumbId ? attachments.get(String(thumbId)) : null;

  // categories: prefer XML (has names); mark primary from Yoast
  const primaryTermId = primaryCatByPost.get(pid) || null;
  let primaryCategory = null;
  if (primaryTermId && termById.has(primaryTermId)) {
    primaryCategory = termById.get(primaryTermId).slug;
  }
  const categories = it.categories.map((c) => c.slug);
  if (primaryCategory && !categories.includes(primaryCategory)) primaryCategory = categories[0] || null;
  if (!primaryCategory) primaryCategory = categories[0] || null;

  posts.push({
    id: it.id,
    slug: it.slug,
    url: `${SITE}/${it.slug}/`,
    title: it.title,
    author: it.author,
    publishDate: it.postDateGmt ? it.postDateGmt + 'Z' : null,
    modifiedDate: it.modifiedGmt ? it.modifiedGmt + 'Z' : null,
    content: normalizeHost(it.content),
    excerpt: it.excerpt || '',
    categories,
    categoryNames: Object.fromEntries(it.categories.map((c) => [c.slug, c.name])),
    tags: it.tags.map((t) => t.slug),
    primaryCategory,
    featuredImage: featured ? { url: normalizeHost(featured.url), alt: featured.alt, caption: featured.caption } : null,
    yoast: {
      title: ix.title || meta._yoast_wpseo_title || null,
      description: ix.description || meta._yoast_wpseo_metadesc || null,
      canonical: ix.canonical ? normalizeHost(ix.canonical) : null,
      focusKeyword: ix.primary_focus_keyword || meta._yoast_wpseo_focuskw || null,
      noindex: yes(ix.is_robots_noindex),
      nofollow: yes(ix.is_robots_nofollow),
      ogTitle: ix.open_graph_title || null,
      ogDescription: ix.open_graph_description || null,
      ogImage: ix.open_graph_image ? normalizeHost(ix.open_graph_image) : null,
      twitterTitle: ix.twitter_title || null,
      twitterDescription: ix.twitter_description || null,
      twitterImage: ix.twitter_image ? normalizeHost(ix.twitter_image) : null,
      breadcrumbTitle: ix.breadcrumb_title || null,
      readingTime: num(ix.estimated_reading_time_minutes),
    },
  });
}

// --- pages (from SQL, XML export was posts-only) ---
const KEEP_PAGES = new Set(['about-us', 'contact-us', 'privacy-policy', 'terms-and-conditions', 'write-for-us']);
const pages = [];
for (const p of sqlPosts.filter((p) => p.post_type === 'page' && p.post_status === 'publish')) {
  const ix = idxByObject.get(`post:${p.ID}`) || {};
  pages.push({
    id: Number(p.ID),
    slug: p.post_name,
    title: p.post_title,
    keep: KEEP_PAGES.has(p.post_name),
    publishDate: p.post_date_gmt + 'Z',
    modifiedDate: p.post_modified_gmt + 'Z',
    content: normalizeHost(p.post_content),
    yoast: {
      title: ix.title || null,
      description: ix.description || null,
      noindex: yes(ix.is_robots_noindex),
    },
  });
}

// --- categories (only ones actually used by posts, plus counts) ---
const catCount = {};
for (const p of posts) for (const c of p.categories) catCount[c] = (catCount[c] || 0) + 1;
const categories = [];
for (const t of terms) {
  const tt = taxByTermId.get(t.term_id);
  if (!tt || tt.taxonomy !== 'category') continue;
  const ix = indexables.find((i) => i.object_type === 'term' && i.object_id === t.term_id);
  categories.push({
    id: Number(t.term_id),
    slug: t.slug,
    name: t.name,
    description: tt.description || '',
    parent: Number(tt.parent) || 0,
    postCount: catCount[t.slug] || 0,
    yoastTitle: ix?.title || null,
    yoastDescription: ix?.description || null,
  });
}

writeFileSync(`${DATA}merged/posts.json`, JSON.stringify(posts, null, 1));
writeFileSync(`${DATA}merged/pages.json`, JSON.stringify(pages, null, 1));
writeFileSync(`${DATA}merged/categories.json`, JSON.stringify(categories, null, 1));
writeFileSync(`${DATA}merged/media.json`, JSON.stringify([...attachments.values()], null, 1));

console.log(`posts: ${posts.length}, pages: ${pages.length} (keep ${pages.filter((p) => p.keep).length}), categories: ${categories.length} (used ${categories.filter((c) => c.postCount > 0).length}), media: ${attachments.size}`);

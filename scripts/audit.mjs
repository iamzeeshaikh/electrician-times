// Phase 1 audit -> reports/source-audit.md
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const load = (f) => JSON.parse(readFileSync(`${ROOT}data/${f}`, 'utf8'));
mkdirSync(`${ROOT}reports`, { recursive: true });

const posts = load('merged/posts.json');
const pages = load('merged/pages.json');
const categories = load('merged/categories.json');
const media = load('merged/media.json');
const items = load('xml/items.json');
const sqlPosts = load('sql/wp_posts.json');
const opts = load('sql/wp_options.json');

const stripTags = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const words = (h) => (stripTags(h).match(/\S+/g) || []).length;

// duplicate slugs
const slugCount = {};
for (const p of posts) slugCount[p.slug] = (slugCount[p.slug] || 0) + 1;
const dupSlugs = Object.entries(slugCount).filter(([, n]) => n > 1);

// media file check against uploads backup
const missingMedia = [];
for (const m of media) {
  if (!m.file) continue;
  if (!existsSync(`${ROOT}uploads/${m.file}`)) missingMedia.push(m.file);
}

// image refs in content that don't resolve to uploads backup
const imgRefs = new Set();
const brokenImgRefs = new Set();
for (const p of posts) {
  for (const m of p.content.matchAll(/https:\/\/electriciantimes\.com\/wp-content\/uploads\/([^\s"'<>?]+)/g)) {
    imgRefs.add(m[1]);
    if (!existsSync(`${ROOT}uploads/${m[1]}`)) brokenImgRefs.add(m[1]);
  }
}

// old host refs remaining after normalization (raw XML check)
const rawOldHost = items.filter((i) => i.type === 'post' && i.content.includes('hostingersite.com')).length;

// metadata gaps
const noSeoTitle = posts.filter((p) => !p.yoast.title);
const noMetaDesc = posts.filter((p) => !p.yoast.description);
const noFeatured = posts.filter((p) => !p.featuredImage);
const noindexPosts = posts.filter((p) => p.yoast.noindex);
const thin = posts.filter((p) => words(p.content) < 300);

// internal links to non-existent slugs
const slugSet = new Set(posts.map((p) => p.slug));
const pageSlugSet = new Set(pages.map((p) => p.slug));
const badInternal = [];
const catSlugSet = new Set(categories.map((c) => c.slug));
for (const p of posts) {
  for (const m of p.content.matchAll(/https:\/\/electriciantimes\.com\/([^\s"'<>]*)/g)) {
    const path = m[1];
    const seg = path.split(/[/?#]/)[0];
    if (seg === '' || seg === 'wp-content' || seg === 'category' || slugSet.has(seg) || catSlugSet.has(seg) || pageSlugSet.has(seg)) continue;
    badInternal.push({ post: p.slug, target: seg });
  }
}

// shortcodes
const shortcodes = {};
for (const p of posts) {
  for (const m of p.content.matchAll(/\[(\/?[a-z_-]+)[^\]]*\]/gi)) {
    const tag = m[1].replace('/', '');
    shortcodes[tag] = (shortcodes[tag] || 0) + 1;
  }
}

const usedCats = categories.filter((c) => c.postCount > 0).sort((a, b) => b.postCount - a.postCount);

const fmtList = (arr, f) => (arr.length ? arr.map(f).join('\n') : '_none_');

const md = `# Source Audit — Electrician Times WordPress → Astro

Generated: ${new Date().toISOString()}

## Source files
| File | Role |
|---|---|
| \`electriciantimes.WordPress.2026-07-17 (1).xml\` | WXR export (WordPress 6.9.4, posts + attachments only — **no pages in XML**) |
| \`u285414217_6CRas.sql\` | Full DB dump, table prefix \`wp_\` (source of pages, Yoast indexables, primary categories) |
| \`uploads/\` | wp-content/uploads backup (2022–2026) |
| \`Logo.webp\` | Brand logo |

## Site settings (from wp_options)
- Site URL: \`${opts.siteurl}\` — permalink structure: \`${opts.permalink_structure}\` (root-level post slugs, trailing slash)
- Theme: Soledad (Penci). Front page: static page ID ${opts.page_on_front} (theme demo homepage — not migrated as content; replaced by custom Astro homepage)
- Category base: \`/category/\` (default), no tag base usage (0 tags found)
- Active plugins include Yoast SEO, Classic Editor, Akismet, WPForms/Elementor artifacts

## Content inventory
| Type | Count |
|---|---|
| Published posts (XML) | ${posts.length} |
| Draft posts | 0 (1 auto-draft ignored) |
| Published pages (SQL only) | ${pages.length} — keeping ${pages.filter((p) => p.keep).length}: ${pages.filter((p) => p.keep).map((p) => p.slug).join(', ')} (others are theme demo homepages) |
| Categories defined | ${categories.length} |
| Categories actually used | ${usedCats.length} |
| Tags | 0 |
| Media attachments (XML) | ${media.length} |
| Authors | 1 (display name "Steven") |
| Comments | not migrated (none of editorial value) |

## Categories in use
| Slug | Name | Posts |
|---|---|---|
${usedCats.map((c) => `| ${c.slug} | ${c.name} | ${c.postCount} |`).join('\n')}

Note: ${categories.length - usedCats.length} empty categories exist in the DB (created but never assigned). They will NOT get archive pages.

## Editor formats
- Classic editor HTML: 174 posts
- Gutenberg blocks: 24 posts
- Elementor-built posts: 1 (meta only; content parses as regular HTML)

## SEO metadata coverage (Yoast — indexables + postmeta merged)
| Check | Count |
|---|---|
| Posts with custom Yoast SEO title | ${posts.length - noSeoTitle.length} |
| Posts WITHOUT custom SEO title (fall back to post title template) | ${noSeoTitle.length} |
| Posts with meta description | ${posts.length - noMetaDesc.length} |
| Posts WITHOUT meta description (will be generated from content, marked for review) | ${noMetaDesc.length} |
| Posts with custom canonical | ${posts.filter((p) => p.yoast.canonical).length} |
| noindex posts | ${noindexPosts.length} |
| Focus keyphrases present | ${posts.filter((p) => p.yoast.focusKeyword).length} |
| Yoast noindex site areas | 404, search results, date archives (preserved in Astro) |

## Content quality flags
- Thin content (<300 words): ${thin.length}
${fmtList(thin.slice(0, 30), (p) => `  - /${p.slug}/ (${words(p.content)} words)`)}
- Posts without featured image: ${noFeatured.length}
${fmtList(noFeatured, (p) => `  - /${p.slug}/`)}
- Duplicate slugs: ${dupSlugs.length ? dupSlugs.map(([s]) => s).join(', ') : 'none'}

## Link & host hygiene
- Posts containing old staging host (orangered-mouse-231438.hostingersite.com) in raw XML: ${rawOldHost} — **normalized to https://electriciantimes.com during merge**
- Internal links pointing at non-existent slugs: ${badInternal.length}
${fmtList(badInternal.slice(0, 40), (b) => `  - in /${b.post}/ → /${b.target}/`)}
- External domains are mostly guest-post backlinks (flooringjourney.com, various electrician businesses). Left untouched — removing them would alter editorial commitments.

## Media integrity
- Attachment files missing from uploads backup: ${missingMedia.length}
${fmtList(missingMedia.slice(0, 30), (f) => `  - ${f}`)}
- Content image URLs not found in uploads backup: ${brokenImgRefs.size}
${fmtList([...brokenImgRefs].slice(0, 30), (f) => `  - ${f}`)}

## Shortcodes / plugin markup found in content
${Object.keys(shortcodes).length ? Object.entries(shortcodes).sort((a, b) => b[1] - a[1]).map(([t, n]) => `- \`[${t}]\` × ${n}`).join('\n') : '_none detected_'}

## Redirect rules found in source
- No redirect plugin tables found in the DB; no .htaccess in the backup set. Redirect map will be built from URL analysis (www/http variants, feeds, attachment pages).

## Migration decisions
1. **URL preservation:** every post stays at \`/<slug>/\` with trailing slash. No structural change → minimal redirects needed.
2. **Pages:** migrate about-us, contact-us, privacy-policy, terms-and-conditions, write-for-us. The three theme demo homepages (home-2, home-3, soledad_home) are Elementor/theme demo content and are replaced by a purpose-built Astro homepage. Their URLs get 301s to /.
3. **Categories:** keep the ${usedCats.length} used categories at \`/category/<slug>/\`. Empty categories get no pages (they were never indexed with content).
4. **Media:** copy only referenced files (content refs + featured images + all original attachment files), preserving \`/wp-content/uploads/YYYY/MM/…\` paths exactly.
5. **Author:** single author "Steven" — author archive at /author/steven/ preserved.
6. **Tags:** none exist; no tag pages will be generated.
7. **Comments:** not migrated.
`;

writeFileSync(`${ROOT}reports/source-audit.md`, md);
console.log('Wrote reports/source-audit.md');
console.log({ noSeoTitle: noSeoTitle.length, noMetaDesc: noMetaDesc.length, thin: thin.length, noFeatured: noFeatured.length, badInternal: badInternal.length, missingMedia: missingMedia.length, brokenImgRefs: brokenImgRefs.size, shortcodes });

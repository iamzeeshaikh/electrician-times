// Phase 4: convert merged WordPress data into Astro content files + copy media.
// Outputs: src/content/blog/*.md, src/content/pages/*.md,
//          public/wp-content/uploads/**, reports/media-map.csv,
//          reports/manual-review.md, data/merged/authors.json
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSize } from 'image-size';
import { cleanContent, generateDescription, stripTags } from './lib/clean-html.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const load = (f) => JSON.parse(readFileSync(`${ROOT}data/${f}`, 'utf8'));

const posts = load('merged/posts.json');
const pages = load('merged/pages.json');
const media = load('merged/media.json');

const BLOG_DIR = `${ROOT}src/content/blog/`;
const PAGES_DIR = `${ROOT}src/content/pages/`;
const UPLOADS_SRC = `${ROOT}uploads/`;
const UPLOADS_DEST = `${ROOT}public/wp-content/uploads/`;
rmSync(BLOG_DIR, { recursive: true, force: true });
rmSync(PAGES_DIR, { recursive: true, force: true });
mkdirSync(BLOG_DIR, { recursive: true });
mkdirSync(PAGES_DIR, { recursive: true });
mkdirSync(`${ROOT}reports`, { recursive: true });

const SITE = 'https://electriciantimes.com';

// ---------- media helpers ----------
const mediaMap = []; // rows for media-map.csv
const copied = new Set();
const dims = new Map();

function copyUpload(relPath, sourcePost, alt, caption) {
  const src = join(UPLOADS_SRC, relPath);
  const dest = join(UPLOADS_DEST, relPath);
  const found = existsSync(src);
  if (found && !copied.has(relPath)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    copied.add(relPath);
  }
  if (found && !dims.has(relPath)) {
    try {
      const d = imageSize(readFileSync(src));
      dims.set(relPath, { width: d.width, height: d.height });
    } catch {
      dims.set(relPath, null);
    }
  }
  mediaMap.push({
    original: `${SITE}/wp-content/uploads/${relPath}`,
    new: `/wp-content/uploads/${relPath}`,
    filename: relPath.split('/').pop(),
    sourcePost,
    alt: alt || '',
    caption: caption || '',
    status: found ? 'found' : 'MISSING',
  });
  return found;
}

const altByFile = new Map();
for (const m of media) {
  if (m.file) altByFile.set(m.file, { alt: m.alt, caption: stripTags(m.caption || '') });
}

// ---------- content processing ----------
const manualReview = [];

function processImages(html, slug) {
  // absolute internal upload URLs -> root-relative, with dimensions + lazy loading
  html = html.replace(/https:\/\/electriciantimes\.com\/wp-content\/uploads\//g, '/wp-content/uploads/');
  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcM = tag.match(/src="([^"]+)"/i);
    if (!srcM) return tag;
    let t = tag;
    const src = srcM[1];
    if (src.startsWith('/wp-content/uploads/')) {
      const rel = decodeURIComponent(src.replace('/wp-content/uploads/', '').split('?')[0]);
      const meta = altByFile.get(rel) || altByFile.get(rel.replace(/-\d+x\d+(\.\w+)$/, '$1'));
      copyUpload(rel, slug, meta?.alt, meta?.caption);
      // ensure original (non-resized) file is also available for srcset fallbacks
      const orig = rel.replace(/-\d+x\d+(\.\w+)$/, '$1');
      if (orig !== rel && existsSync(join(UPLOADS_SRC, orig))) copyUpload(orig, slug, meta?.alt, meta?.caption);
      const d = dims.get(rel);
      if (d && !/\bwidth=/.test(t)) t = t.replace('<img', `<img width="${d.width}" height="${d.height}"`);
      // add alt from attachment metadata if missing/empty
      if (!/\balt="[^"]+"/.test(t) && meta?.alt) {
        t = t.replace(/\balt=""/, '').replace('<img', `<img alt="${meta.alt.replace(/"/g, '&quot;')}"`);
      }
      if (!/\balt=/.test(t)) t = t.replace('<img', '<img alt=""');
    }
    if (!/\bloading=/.test(t)) t = t.replace('<img', '<img loading="lazy"');
    if (!/\bdecoding=/.test(t)) t = t.replace('<img', '<img decoding="async"');
    return t;
  });
  // srcset URLs
  html = html.replace(/srcset="([^"]+)"/gi, (m, val) => {
    for (const part of val.split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith('/wp-content/uploads/')) {
        copyUpload(decodeURIComponent(u.replace('/wp-content/uploads/', '')), 'srcset', '', '');
      }
    }
    return m;
  });
  return html;
}

function internalLinksRelative(html) {
  // internal page links -> root-relative with trailing slash
  return html.replace(/href="https:\/\/electriciantimes\.com(\/[^"]*)"/g, (m, path) => {
    if (path.startsWith('/wp-content/')) return `href="${path}"`;
    let p = path.split('#')[0].split('?')[0];
    if (!p.endsWith('/')) p += '/';
    const hash = path.includes('#') ? '#' + path.split('#')[1] : '';
    return `href="${p}${hash}"`;
  }).replace(/href="https:\/\/electriciantimes\.com"/g, 'href="/"');
}

const yamlStr = (v) => JSON.stringify(v ?? '');
const isoDate = (d) => (d ? d.replace(' ', 'T') : d);

function frontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => yamlStr(x)).join(', ')}]`);
    } else if (typeof v === 'object') {
      lines.push(`${k}:`);
      for (const [k2, v2] of Object.entries(v)) {
        if (v2 === undefined || v2 === null) continue;
        lines.push(`  ${k2}: ${typeof v2 === 'number' || typeof v2 === 'boolean' ? v2 : yamlStr(v2)}`);
      }
    } else if (typeof v === 'boolean' || typeof v === 'number') {
      lines.push(`${k}: ${v}`);
    } else {
      lines.push(`${k}: ${yamlStr(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ---------- posts ----------
let genDescCount = 0;
for (const p of posts) {
  const isGutenberg = p.content.includes('<!-- wp:');
  let { html, notes } = cleanContent(p.content, { isGutenberg });

  // Known defect: unfilled editorial placeholder in one post — neutralize and flag.
  if (html.includes('[Insert Potential Fault')) {
    html = html.replace(
      /, but early indications suggest that \[Insert Potential Fault[^\]]*\] may have contributed to the incident/,
      ''
    );
    notes.push('removed-unfilled-editorial-placeholder');
  }

  html = processImages(html, p.slug);
  html = internalLinksRelative(html);

  // featured image
  let featured = null;
  if (p.featuredImage?.url) {
    const rel = decodeURIComponent(p.featuredImage.url.replace(`${SITE}/wp-content/uploads/`, ''));
    const found = copyUpload(rel, `featured:${p.slug}`, p.featuredImage.alt, p.featuredImage.caption);
    const d = dims.get(rel);
    featured = {
      src: `/wp-content/uploads/${rel}`,
      alt: p.featuredImage.alt || '',
      width: d?.width,
      height: d?.height,
      found,
    };
    if (!found) notes.push('featured-image-missing');
  }

  const description = p.yoast.description || generateDescription(html);
  if (!p.yoast.description) genDescCount++;

  const fm = frontmatter({
    title: p.title,
    slug: p.slug,
    description,
    seoTitle: p.yoast.title || undefined,
    seoDescription: p.yoast.description || undefined,
    descriptionGenerated: p.yoast.description ? undefined : true,
    canonical: p.yoast.canonical || undefined,
    focusKeyword: p.yoast.focusKeyword || undefined,
    publishDate: isoDate(p.publishDate),
    modifiedDate: isoDate(p.modifiedDate),
    author: p.author || 'Steven',
    categories: p.categories,
    tags: p.tags,
    primaryCategory: p.primaryCategory,
    featuredImage: featured ? featured.src : undefined,
    featuredImageAlt: featured ? featured.alt : undefined,
    featuredImageWidth: featured?.width,
    featuredImageHeight: featured?.height,
    ogImage: p.yoast.ogImage ? p.yoast.ogImage.replace(SITE, '') : undefined,
    breadcrumbTitle: p.yoast.breadcrumbTitle && p.yoast.breadcrumbTitle !== p.title ? p.yoast.breadcrumbTitle : undefined,
    noindex: p.yoast.noindex || undefined,
    nofollow: p.yoast.nofollow || undefined,
    draft: false,
    format: 'html',
    sourceWordPressId: p.id,
  });

  writeFileSync(`${BLOG_DIR}${p.slug}.md`, `${fm}\n\n${html}\n`);
  if (notes.length) manualReview.push({ slug: p.slug, notes: [...new Set(notes)] });
}

// ---------- pages ----------
for (const pg of pages.filter((x) => x.keep)) {
  const isGutenberg = pg.content.includes('<!-- wp:');
  let { html, notes } = cleanContent(pg.content, { isGutenberg });
  html = processImages(html, `page:${pg.slug}`);
  html = internalLinksRelative(html);
  const fm = frontmatter({
    title: pg.title === 'Contact US' ? 'Contact Us' : pg.title,
    slug: pg.slug,
    description: pg.yoast.description || generateDescription(html),
    seoTitle: pg.yoast.title || undefined,
    publishDate: isoDate(pg.publishDate),
    modifiedDate: isoDate(pg.modifiedDate),
    noindex: pg.yoast.noindex || undefined,
    format: 'html',
    sourceWordPressId: pg.id,
  });
  writeFileSync(`${PAGES_DIR}${pg.slug}.md`, `${fm}\n\n${html}\n`);
  if (notes.length) manualReview.push({ slug: `page:${pg.slug}`, notes: [...new Set(notes)] });
}

// ---------- copy every ORIGINAL attachment file (preserves indexed image URLs) ----------
for (const m of media) {
  // skip stray non-media attachments (e.g. an uploaded .html page snapshot)
  if (m.file && /\.(html?|php|zip)$/i.test(m.file)) continue;
  if (m.file && existsSync(join(UPLOADS_SRC, m.file)) && !copied.has(m.file)) {
    copyUpload(m.file, `attachment:${m.id}`, m.alt, stripTags(m.caption || ''));
  }
}

// ---------- logo + brand assets ----------
mkdirSync(`${ROOT}public/images`, { recursive: true });
copyFileSync(`${ROOT}Logo.webp`, `${ROOT}public/images/logo.webp`);

// ---------- reports ----------
const csvEsc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
writeFileSync(
  `${ROOT}reports/media-map.csv`,
  'original_url,new_url,filename,source_post,alt,caption,status\n' +
    mediaMap.map((r) => [r.original, r.new, r.filename, r.sourcePost, r.alt, r.caption, r.status].map(csvEsc).join(',')).join('\n')
);

writeFileSync(
  `${ROOT}reports/manual-review.md`,
  `# Manual review items (content cleanup)\n\nGenerated: ${new Date().toISOString()}\n\n` +
    (manualReview.length
      ? manualReview.map((r) => `- \`${r.slug}\`: ${r.notes.join(', ')}`).join('\n')
      : '_nothing flagged_') +
    `\n\nNotes legend:\n- \`ms-word-markup-removed\`: Word-paste conditional comments stripped; verify list rendering.\n- \`removed-unfilled-editorial-placeholder\`: an unfilled "[Insert …]" placeholder sentence fragment was removed.\n- \`shortcode:[x]\`: bracket token left in content — verify it is prose, not an unrendered shortcode.\n`
);

console.log(`Posts written: ${posts.length}`);
console.log(`Pages written: ${pages.filter((x) => x.keep).length}`);
console.log(`Media files copied: ${copied.size}`);
console.log(`Descriptions generated: ${genDescCount}`);
console.log(`Manual review items: ${manualReview.length}`);
const missing = mediaMap.filter((r) => r.status === 'MISSING');
console.log(`Missing media refs: ${missing.length}`);
missing.slice(0, 10).forEach((r) => console.log('  MISSING:', r.original));

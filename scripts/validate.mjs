// Phase 16: automated post-build validation over dist/.
// Checks pages, metadata, links, images, headings, canonicals, JSON-LD, sitemap.
// Outputs: reports/final-validation.md, url-inventory.csv, seo-metadata.csv, broken-links.csv
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const SITE = 'https://electriciantimes.com';

if (!existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

// collect all html files
function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (e.endsWith('.html')) yield p;
  }
}

const pages = [];
for (const file of walk(DIST)) {
  const rel = relative(DIST, file);
  let route = '/' + rel.replace(/index\.html$/, '').replace(/\\/g, '/');
  if (rel === '404.html') route = '/404.html';
  pages.push({ file, route, html: readFileSync(file, 'utf8') });
}

const issues = [];
const add = (severity, page, check, detail) => issues.push({ severity, page, check, detail });

const get = (html, re) => html.match(re)?.[1]?.trim() ?? '';

// route set for internal link checking
const routes = new Set(pages.map((p) => p.route));
routes.add('/rss.xml');
routes.add('/sitemap-index.xml');
routes.add('/sitemap-0.xml');
routes.add('/sitemap/');

const redirectSources = new Set([
  '/home-2/', '/home-3/', '/soledad_home/', '/feed/', '/comments/feed/',
  '/wp-sitemap.xml', '/sitemap.xml', '/sitemap_index.xml', '/post-sitemap.xml',
  '/page-sitemap.xml', '/category-sitemap.xml', '/author/admin/',
]);

const titles = new Map();
const descriptions = new Map();
const inventory = [];
const seoRows = [];
const brokenLinks = [];

const sitemapXml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '') || '/'));

for (const p of pages) {
  const { html, route } = p;
  const title = get(html, /<title>([^<]*)<\/title>/);
  const desc = get(html, /<meta name="description" content="([^"]*)"/);
  const canonical = get(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = get(html, /<meta name="robots" content="([^"]*)"/);
  const noindex = robots.includes('noindex');
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;

  // title/desc checks
  if (!title) add('error', route, 'missing-title', '');
  if (title.length > 65) add('warn', route, 'long-title', `${title.length} chars: ${title.slice(0, 70)}`);
  if (!desc) add('error', route, 'missing-description', '');
  if (desc && desc.length < 40) add('warn', route, 'short-description', `${desc.length} chars`);
  if (route !== '/404.html') {
    if (titles.has(title)) add('warn', route, 'duplicate-title', `same as ${titles.get(title)}`);
    else titles.set(title, route);
    if (desc) {
      if (descriptions.has(desc)) add('warn', route, 'duplicate-description', `same as ${descriptions.get(desc)}`);
      else descriptions.set(desc, route);
    }
  }

  // H1 checks
  if (h1s === 0) add('error', route, 'missing-h1', '');
  if (h1s > 1) add('error', route, 'multiple-h1', `${h1s} found`);

  // canonical checks
  if (route !== '/404.html') {
    if (!canonical) add('error', route, 'missing-canonical', '');
    else {
      if (!canonical.startsWith(SITE)) add('error', route, 'bad-canonical-host', canonical);
      const canonPath = canonical.replace(SITE, '') || '/';
      if (!noindex && canonPath !== route) add('error', route, 'canonical-mismatch', canonical);
      if (redirectSources.has(canonPath)) add('error', route, 'canonical-to-redirect', canonical);
    }
  }

  // sitemap vs noindex
  const inSitemap = sitemapUrls.has(route);
  if (noindex && inSitemap) add('error', route, 'noindex-in-sitemap', '');
  if (!noindex && !inSitemap && route !== '/404.html') add('warn', route, 'indexable-not-in-sitemap', '');

  // internal links
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    let url = m[1].split('#')[0].split('?')[0];
    if (!url) continue;
    if (url.startsWith('/_astro/') || url.startsWith('/pagefind/')) continue;
    if (/\.(css|js|png|jpg|jpeg|webp|gif|svg|ico|xml|webmanifest|avif|mp4|pdf|ttf|woff2?)$/i.test(url)) {
      const fsPath = join(DIST, decodeURIComponent(url));
      if (!existsSync(fsPath)) {
        add('error', route, 'broken-asset', url);
        brokenLinks.push({ page: route, url, type: 'asset' });
      }
      continue;
    }
    if (!url.endsWith('/')) url += '/';
    if (!routes.has(url) && !redirectSources.has(url)) {
      add('error', route, 'broken-internal-link', url);
      brokenLinks.push({ page: route, url, type: 'page' });
    }
  }

  // http:// links (insecure)
  for (const m of html.matchAll(/(?:href|src)="(http:\/\/[^"]+)"/g)) {
    add('warn', route, 'http-link', m[1]);
  }

  // images: alt + dimensions
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\balt[=\s>]/.test(tag)) add('warn', route, 'img-missing-alt', tag.slice(0, 90));
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) add('warn', route, 'img-missing-dims', (tag.match(/src="([^"]*)"/)?.[1] ?? '').slice(0, 90));
  }

  // JSON-LD validity
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      add('error', route, 'invalid-jsonld', String(e).slice(0, 120));
    }
  }

  // inventory rows
  const isPost = /article:published_time/.test(html);
  inventory.push({
    route,
    status: route === '/404.html' ? 404 : 200,
    canonical,
    indexable: noindex ? 'noindex' : 'index',
    inSitemap: inSitemap ? 'yes' : 'no',
    type: route === '/404.html' ? '404' : isPost ? 'post' : route.startsWith('/category/') ? 'category' : route.startsWith('/author/') ? 'author' : 'page',
  });
  seoRows.push({ route, title, desc, canonical, robots, h1s });
}

// sitemap URLs that don't exist as pages
for (const u of sitemapUrls) {
  if (!routes.has(u)) add('error', 'sitemap-0.xml', 'sitemap-url-missing-page', u);
}

// ---- outputs ----
const csvEsc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
writeFileSync(
  join(ROOT, 'reports/url-inventory.csv'),
  'url,http_status,canonical,indexability,in_sitemap,content_type,redirect_target\n' +
    inventory
      .sort((a, b) => a.route.localeCompare(b.route))
      .map((r) => [SITE + r.route, r.status, r.canonical, r.indexable, r.inSitemap, r.type, ''].map(csvEsc).join(','))
      .join('\n')
);
writeFileSync(
  join(ROOT, 'reports/seo-metadata.csv'),
  'url,title,title_length,meta_description,description_length,canonical,robots,h1_count\n' +
    seoRows
      .sort((a, b) => a.route.localeCompare(b.route))
      .map((r) => [SITE + r.route, r.title, r.title.length, r.desc, r.desc.length, r.canonical, r.robots, r.h1s].map(csvEsc).join(','))
      .join('\n')
);
writeFileSync(
  join(ROOT, 'reports/broken-links.csv'),
  'page,broken_url,type\n' + brokenLinks.map((b) => [b.page, b.url, b.type].map(csvEsc).join(',')).join('\n')
);

const errors = issues.filter((i) => i.severity === 'error');
const warns = issues.filter((i) => i.severity === 'warn');
const byCheck = {};
for (const i of issues) byCheck[i.check] = (byCheck[i.check] || 0) + 1;

writeFileSync(
  join(ROOT, 'reports/final-validation.md'),
  `# Final validation report

Generated: ${new Date().toISOString()}
Pages checked: ${pages.length}

## Result: ${errors.length === 0 ? '✅ PASS (no errors)' : `❌ ${errors.length} errors`} — ${warns.length} warnings

## Issue counts by check
${Object.entries(byCheck).sort((a, b) => b[1] - a[1]).map(([c, n]) => `- ${c}: ${n}`).join('\n') || '- none'}

## Errors
${errors.map((i) => `- \`${i.page}\` **${i.check}** ${i.detail}`).join('\n') || '_none_'}

## Warnings (first 100)
${warns.slice(0, 100).map((i) => `- \`${i.page}\` ${i.check}: ${i.detail}`).join('\n') || '_none_'}
`
);

console.log(`pages: ${pages.length}, errors: ${errors.length}, warnings: ${warns.length}`);
for (const [c, n] of Object.entries(byCheck)) console.log(`  ${c}: ${n}`);
process.exit(errors.length ? 1 : 0);

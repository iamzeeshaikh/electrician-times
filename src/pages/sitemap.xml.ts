import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedPosts, categories } from '../utils/content';
import { SITE_URL } from '../utils/site';
import authors from '../data/authors.json';

const PER_PAGE = 12;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const pages = await getCollection('pages');

  type Entry = { loc: string; lastmod?: Date };
  const urls: Entry[] = [];

  // homepage — lastmod = newest post
  urls.push({ loc: `${SITE_URL}/`, lastmod: posts[0]?.data.modifiedDate ?? posts[0]?.data.publishDate });

  // posts
  for (const p of posts) {
    if (p.data.noindex) continue;
    urls.push({ loc: `${SITE_URL}/${p.data.slug}/`, lastmod: p.data.modifiedDate ?? p.data.publishDate });
  }

  // content pages + static pages
  for (const pg of pages) {
    if (pg.data.noindex) continue;
    urls.push({ loc: `${SITE_URL}/${pg.data.slug}/`, lastmod: pg.data.modifiedDate ?? pg.data.publishDate });
  }
  urls.push({ loc: `${SITE_URL}/write-for-us/` });
  urls.push({ loc: `${SITE_URL}/editorial-policy/` });
  urls.push({ loc: `${SITE_URL}/disclaimer/` });
  urls.push({ loc: `${SITE_URL}/sitemap/` });

  // category archives (+ pagination)
  for (const cat of categories) {
    const catPosts = posts.filter((p) => p.data.categories.includes(cat.slug));
    if (!catPosts.length) continue;
    const newest = catPosts[0].data.modifiedDate ?? catPosts[0].data.publishDate;
    urls.push({ loc: `${SITE_URL}/category/${cat.slug}/`, lastmod: newest });
    const pageCount = Math.ceil(catPosts.length / PER_PAGE);
    for (let n = 2; n <= pageCount; n++) {
      urls.push({ loc: `${SITE_URL}/category/${cat.slug}/page/${n}/` });
    }
  }

  // author archives (+ pagination)
  for (const [slug] of Object.entries(authors)) {
    const authored = posts.filter((p) => p.data.author.toLowerCase() === slug);
    if (!authored.length) continue;
    urls.push({ loc: `${SITE_URL}/author/${slug}/` });
    const pageCount = Math.ceil(authored.length / PER_PAGE);
    for (let n = 2; n <= pageCount; n++) {
      urls.push({ loc: `${SITE_URL}/author/${slug}/page/${n}/` });
    }
  }

  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `  <url><loc>${u.loc}</loc>${lastmod}</url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

import type { APIRoute } from 'astro';
import { getPublishedPosts, stripHtml } from '../utils/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../utils/site';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const posts = (await getPublishedPosts()).slice(0, 20);
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/${p.data.slug}/`;
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${p.data.publishDate.toUTCString()}</pubDate>
      <description>${esc(p.data.description || stripHtml(p.body ?? '').slice(0, 200))}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="/rss.xsl" type="text/xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};

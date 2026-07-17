// Parse the WordPress WXR export into data/xml/items.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const XML_FILE = fileURLToPath(new URL('../electriciantimes.WordPress.2026-07-17 (1).xml', import.meta.url));
const OUT_DIR = fileURLToPath(new URL('../data/xml/', import.meta.url));
mkdirSync(OUT_DIR, { recursive: true });

const xml = readFileSync(XML_FILE, 'utf8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  trimValues: false,
  parseTagValue: false,
});
const doc = parser.parse(xml);
const channel = doc.rss.channel;

const cdata = (v) => {
  if (v == null) return '';
  if (typeof v === 'object') return v.__cdata ?? '';
  return String(v);
};
const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

const items = asArray(channel.item).map((it) => {
  const meta = {};
  for (const pm of asArray(it['wp:postmeta'])) {
    meta[cdata(pm['wp:meta_key'])] = cdata(pm['wp:meta_value']);
  }
  const cats = [];
  const tags = [];
  for (const c of asArray(it.category)) {
    const entry = { slug: c['@_nicename'], name: cdata(c) };
    if (c['@_domain'] === 'category') cats.push(entry);
    else if (c['@_domain'] === 'post_tag') tags.push(entry);
  }
  return {
    id: Number(cdata(it['wp:post_id'])),
    title: cdata(it.title),
    link: cdata(it.link),
    slug: cdata(it['wp:post_name']),
    type: cdata(it['wp:post_type']),
    status: cdata(it['wp:status']),
    author: cdata(it['dc:creator']),
    pubDate: cdata(it.pubDate),
    postDate: cdata(it['wp:post_date']),
    postDateGmt: cdata(it['wp:post_date_gmt']),
    modifiedGmt: cdata(it['wp:post_modified_gmt']),
    content: cdata(it['content:encoded']),
    excerpt: cdata(it['excerpt:encoded']),
    parent: Number(cdata(it['wp:post_parent']) || 0),
    attachmentUrl: cdata(it['wp:attachment_url']),
    categories: cats,
    tags,
    meta,
  };
});

writeFileSync(`${OUT_DIR}items.json`, JSON.stringify(items, null, 1));

const byType = {};
for (const it of items) byType[`${it.type}/${it.status}`] = (byType[`${it.type}/${it.status}`] || 0) + 1;
console.log('Items parsed:', items.length, byType);

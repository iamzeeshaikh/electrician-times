import { getCollection, type CollectionEntry } from 'astro:content';
import categoriesData from '../data/categories.json';

export type BlogPost = CollectionEntry<'blog'>;

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  postCount: number;
  yoastTitle: string | null;
  yoastDescription: string | null;
}

export const categories = categoriesData as CategoryInfo[];
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

export function categoryName(slug: string): string {
  return categoryBySlug.get(slug)?.name ?? slug.replace(/-/g, ' ');
}

export function getCategory(slug: string): CategoryInfo | undefined {
  return categoryBySlug.get(slug);
}

/** Curated category descriptions for archives without WP descriptions. */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  blog: 'Articles, guides and news from Electrician Times covering electrical work, tools, technology and the trade.',
  electrical: 'Core electrical topics: circuits, components, systems, standards and how electrical equipment works.',
  device: 'Electrical and electronic devices explained: what they do, how they work and how to choose them.',
  cable: 'Cables and cable products: types, markings, selection, routing and safe installation.',
  lighting: 'Lighting guides: lamps, fixtures, layouts, controls and lighting design for homes and workplaces.',
  installing: 'Installation guides for electrical equipment, wiring accessories and household systems.',
  business: 'Running and growing an electrical or trade business: marketing, operations and customer work.',
  'electricial-safety': 'Electrical safety fundamentals: protective devices, safe working practices and hazard prevention.',
  wiring: 'Wiring guides: planning, layouts, junctions and safe wiring practice for buildings.',
  'power-lines': 'Power lines and distribution: clearances, safety zones and how electricity reaches buildings.',
  wire: 'Wires and conductors: sizes, materials, insulation and choosing the right wire for the job.',
  socket: 'Sockets and outlets: types, ratings, brands and installation advice.',
  machines: 'Electrical machines: motors, generators and the equipment that drives industry.',
  led: 'LED technology: strips, drivers, retrofits and energy-efficient lighting.',
  ai: 'Artificial intelligence and smart technology intersecting with electrical work and engineering.',
  meters: 'Electricity meters and measurement: how metering works and what the readings mean.',
  loops: 'Current loops and signal circuits used in measurement and control systems.',
  uncategorized: 'General articles from Electrician Times.',
};

export function categoryDescription(slug: string): string {
  const c = categoryBySlug.get(slug);
  return c?.description || CATEGORY_DESCRIPTIONS[slug] || `Articles about ${categoryName(slug)} from Electrician Times.`;
}

let _posts: BlogPost[] | null = null;
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!_posts) {
    _posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
      (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
    );
  }
  return _posts;
}

export function postUrl(post: BlogPost): string {
  return `/${post.data.slug}/`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerpt(post: BlogPost, length = 160): string {
  const d = post.data.description || stripHtml(post.body ?? '');
  return d.length > length ? d.slice(0, length).replace(/\s\S*$/, '') + '…' : d;
}

export function readingTime(html: string): number {
  const wordCount = stripHtml(html).split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 220));
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Adds ids to h2/h3 in raw HTML and returns the TOC. */
export function buildToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (m, level, attrs, inner) => {
    const text = stripHtml(inner);
    if (!text) return m;
    let id = slugifyHeading(text) || 'section';
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;
    if (/\bid=/.test(attrs)) return m;
    toc.push({ id, text, depth: Number(level) as 2 | 3 });
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
  return { html: out, toc };
}

/** Deterministic related-posts scoring: shared categories + title word overlap. */
export function relatedPosts(post: BlogPost, all: BlogPost[], count = 4): BlogPost[] {
  if (post.data.relatedPosts?.length) {
    const bySlug = new Map(all.map((p) => [p.data.slug, p]));
    const picked = post.data.relatedPosts.map((s) => bySlug.get(s)).filter(Boolean) as BlogPost[];
    if (picked.length >= count) return picked.slice(0, count);
  }
  const stop = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with', 'how', 'what', 'why', 'is', 'are', 'your', 'you', 'it', 'its', 'best', 'guide']);
  const words = (t: string) => new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2 && !stop.has(w)));
  const myWords = words(post.data.title);
  const myCats = new Set(post.data.categories);
  return all
    .filter((p) => p.data.slug !== post.data.slug)
    .map((p) => {
      let score = 0;
      for (const c of p.data.categories) if (myCats.has(c)) score += c === 'blog' ? 1 : 3;
      if (p.data.primaryCategory && p.data.primaryCategory === post.data.primaryCategory) score += 2;
      for (const w of words(p.data.title)) if (myWords.has(w)) score += 2;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || b.p.data.publishDate.valueOf() - a.p.data.publishDate.valueOf())
    .slice(0, count)
    .map((x) => x.p);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

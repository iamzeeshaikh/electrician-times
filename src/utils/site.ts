export const SITE_URL = 'https://electriciantimes.com';
export const SITE_NAME = 'Electrician Times';
export const SITE_TAGLINE =
  'Practical guides on electrical work, wiring, tools, safety and technology';
/** Shorter than SITE_TAGLINE so the homepage <title> fits a search snippet. */
export const HOME_TITLE = 'Electrician Times - Wiring, Tools & Electrical Safety Guides';
export const SITE_DESCRIPTION =
  'Practical articles on electrical installations, wiring, cables, sockets, lighting, tools and safety — written for electricians, technicians and homeowners.';
export const SITE_LOGO = '/images/logo.webp';
export const DEFAULT_OG_IMAGE = '/images/logo.webp';
export const TITLE_SEPARATOR = ' - ';

/** Google truncates around here; past it the suffix costs us the tail of the title. */
const TITLE_BUDGET = 65;

/** Yoast fallback pattern preserved: "%%title%% - %%sitename%%" */
export function pageTitle(title: string, useSiteName = true): string {
  if (!useSiteName || title.includes(SITE_NAME)) return title;
  return `${title}${TITLE_SEPARATOR}${SITE_NAME}`;
}

/**
 * Drop the trailing "- Electrician Times" when it pushes the title past the
 * snippet budget. The article title earns those pixels; the brand name doesn't,
 * and Google truncates it away anyway. Applied to every title on the way out —
 * including the Yoast-migrated `seoTitle` values, which bake the suffix in.
 */
export function trimTitle(title: string): string {
  if (title.length <= TITLE_BUDGET) return title;
  const suffix = `${TITLE_SEPARATOR}${SITE_NAME}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

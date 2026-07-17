export const SITE_URL = 'https://electriciantimes.com';
export const SITE_NAME = 'Electrician Times';
export const SITE_TAGLINE =
  'Practical guides on electrical work, wiring, tools, safety and technology';
export const SITE_DESCRIPTION =
  'Electrician Times publishes practical articles on electrical installations, wiring, cables, sockets, lighting, tools and electrical safety for electricians, technicians and homeowners.';
export const SITE_LOGO = '/images/logo.webp';
export const DEFAULT_OG_IMAGE = '/images/logo.webp';
export const TITLE_SEPARATOR = ' - ';

/** Yoast fallback pattern preserved: "%%title%% - %%sitename%%" */
export function pageTitle(title: string, useSiteName = true): string {
  if (!useSiteName || title.includes(SITE_NAME)) return title;
  return `${title}${TITLE_SEPARATOR}${SITE_NAME}`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

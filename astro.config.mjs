// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URLs that must stay out of the XML sitemap (noindex or utility pages)
const NOINDEX_PATHS = ['/search/'];

export default defineConfig({
  site: 'https://electriciantimes.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.some((p) => page.endsWith(p)),
    }),
  ],
});

# Redirect review

Generated: 2026-07-17

## Guiding principle
The permalink structure (`/%postname%/`, trailing slash) is preserved exactly, so **no post URL
changes and no post redirects are required**. All 198 published posts remain at
`https://electriciantimes.com/<slug>/`. Category archives remain at `/category/<slug>/` with
WordPress-style pagination (`/category/<slug>/page/N/`). The author archive remains at
`/author/steven/`.

## Rules created (vercel.json)
See `reports/redirect-map.csv`. Summary:

| Group | Count | Notes |
|---|---|---|
| Host canonicalization (www → apex) | 1 | HTTPS redirect is automatic on Vercel |
| Theme demo homepages → `/` | 3 | `home-2`, `home-3`, `soledad_home` were Soledad demo pages set as front page content |
| Feeds → `/rss.xml` | 4 | includes per-post `/slug/feed/` variants |
| Legacy sitemaps → `/sitemap.xml` | 6 | Yoast + WP-core sitemap paths |
| Author variants | 1 | `/author/admin/` → `/author/steven/` |
| WP admin/login | 3 | 302 (not permanent — intentional, so they can be repurposed) |

## Decisions and non-redirects
- **Attachment pages:** Yoast's "redirect attachment URLs to the attachment itself" was already
  enabled on the WordPress site (`disable-attachment: 1`), so attachment pages were never
  indexable pages. No redirects needed; media files keep their exact
  `/wp-content/uploads/YYYY/MM/…` URLs.
- **Date archives** (`/2024/01/` …): were noindexed by Yoast. They now return 404. No equity to
  preserve; intentionally not redirected to avoid soft-redirect clutter.
- **Empty category archives** (146 categories with 0 posts): never had content; now 404. Not
  redirected.
- **Trailing slashes:** `"trailingSlash": true` in `vercel.json` 301s `/slug` → `/slug/`,
  matching the WordPress behaviour exactly.
- **No redirect chains:** every rule targets a final destination directly. The www rule rewrites
  the full path so `www → apex` resolves in a single hop (plus the platform HTTPS hop where the
  request arrives over HTTP, which is unavoidable).

## Verification checklist (post-deploy)
- `curl -I http://electriciantimes.com/security-zones-of-power-lines-and-rules-for-staying-in-them` → 301 → https + trailing slash, single hop each
- `curl -I https://www.electriciantimes.com/about-us/` → 301 → apex
- `curl -I https://electriciantimes.com/feed/` → 301 → /rss.xml
- `curl -I https://electriciantimes.com/sitemap_index.xml` → 301 → /sitemap.xml
- Spot-check 10 post URLs from Search Console → all 200

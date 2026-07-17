# Source Audit — Electrician Times WordPress → Astro

Generated: 2026-07-17T06:12:31.788Z

## Source files
| File | Role |
|---|---|
| `electriciantimes.WordPress.2026-07-17 (1).xml` | WXR export (WordPress 6.9.4, posts + attachments only — **no pages in XML**) |
| `u285414217_6CRas.sql` | Full DB dump, table prefix `wp_` (source of pages, Yoast indexables, primary categories) |
| `uploads/` | wp-content/uploads backup (2022–2026) |
| `Logo.webp` | Brand logo |

## Site settings (from wp_options)
- Site URL: `https://electriciantimes.com` — permalink structure: `/%postname%/` (root-level post slugs, trailing slash)
- Theme: Soledad (Penci). Front page: static page ID 9 (theme demo homepage — not migrated as content; replaced by custom Astro homepage)
- Category base: `/category/` (default), no tag base usage (0 tags found)
- Active plugins include Yoast SEO, Classic Editor, Akismet, WPForms/Elementor artifacts

## Content inventory
| Type | Count |
|---|---|
| Published posts (XML) | 198 |
| Draft posts | 0 (1 auto-draft ignored) |
| Published pages (SQL only) | 8 — keeping 5: about-us, contact-us, privacy-policy, terms-and-conditions, write-for-us (others are theme demo homepages) |
| Categories defined | 160 |
| Categories actually used | 18 |
| Tags | 0 |
| Media attachments (XML) | 363 |
| Authors | 1 (display name "Steven") |
| Comments | not migrated (none of editorial value) |

## Categories in use
| Slug | Name | Posts |
|---|---|---|
| blog | Blog | 94 |
| electrical | Electrical | 40 |
| device | Device | 10 |
| cable | Cable | 9 |
| lighting | Lighting | 7 |
| installing | Installing | 7 |
| business | Business | 6 |
| electricial-safety | Electricial Safety | 5 |
| wiring | Wiring | 4 |
| power-lines | Power Lines | 4 |
| socket | Socket | 3 |
| wire | Wire | 3 |
| machines | Machines | 3 |
| led | LED | 3 |
| ai | AI | 3 |
| uncategorized | Uncategorized | 2 |
| meters | Meters | 2 |
| loops | Loops | 2 |

Note: 142 empty categories exist in the DB (created but never assigned). They will NOT get archive pages.

## Editor formats
- Classic editor HTML: 174 posts
- Gutenberg blocks: 24 posts
- Elementor-built posts: 1 (meta only; content parses as regular HTML)

## SEO metadata coverage (Yoast — indexables + postmeta merged)
| Check | Count |
|---|---|
| Posts with custom Yoast SEO title | 88 |
| Posts WITHOUT custom SEO title (fall back to post title template) | 110 |
| Posts with meta description | 87 |
| Posts WITHOUT meta description (will be generated from content, marked for review) | 111 |
| Posts with custom canonical | 0 |
| noindex posts | 0 |
| Focus keyphrases present | 116 |
| Yoast noindex site areas | 404, search results, date archives (preserved in Astro) |

## Content quality flags
- Thin content (<300 words): 1
  - /how-to-calculate-wire-cross-section/ (297 words)
- Posts without featured image: 0
_none_
- Duplicate slugs: none

## Link & host hygiene
- Posts containing old staging host (orangered-mouse-231438.hostingersite.com) in raw XML: 43 — **normalized to https://electriciantimes.com during merge**
- Internal links pointing at non-existent slugs: 0
_none_
- External domains are mostly guest-post backlinks (flooringjourney.com, various electrician businesses). Left untouched — removing them would alter editorial commitments.

## Media integrity
- Attachment files missing from uploads backup: 0
_none_
- Content image URLs not found in uploads backup: 0
_none_

## Shortcodes / plugin markup found in content
- `[if]` × 18
- `[endif]` × 18
- `[Insert]` × 2

## Redirect rules found in source
- No redirect plugin tables found in the DB; no .htaccess in the backup set. Redirect map will be built from URL analysis (www/http variants, feeds, attachment pages).

## Migration decisions
1. **URL preservation:** every post stays at `/<slug>/` with trailing slash. No structural change → minimal redirects needed.
2. **Pages:** migrate about-us, contact-us, privacy-policy, terms-and-conditions, write-for-us. The three theme demo homepages (home-2, home-3, soledad_home) are Elementor/theme demo content and are replaced by a purpose-built Astro homepage. Their URLs get 301s to /.
3. **Categories:** keep the 18 used categories at `/category/<slug>/`. Empty categories get no pages (they were never indexed with content).
4. **Media:** copy only referenced files (content refs + featured images + all original attachment files), preserving `/wp-content/uploads/YYYY/MM/…` paths exactly.
5. **Author:** single author "Steven" — author archive at /author/steven/ preserved.
6. **Tags:** none exist; no tag pages will be generated.
7. **Comments:** not migrated.

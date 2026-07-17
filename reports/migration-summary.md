# Migration summary — electriciantimes.com

Date: 2026-07-17 · WordPress 6.9.4 (Soledad theme, Yoast SEO) → Astro 7 static site for Vercel

## Numbers

| Metric | Value |
|---|---|
| Posts migrated | **198 / 198** published posts (0 lost) |
| Pages migrated | **5** (about-us, contact-us, privacy-policy, terms-and-conditions, write-for-us) |
| Pages intentionally not migrated | 3 theme-demo homepages (home-2, home-3, soledad_home) → 301 to `/` |
| Media files copied | **369** (all referenced content images, featured images and originals; original `/wp-content/uploads/` paths preserved; 0 missing) |
| Yoast metadata records mapped | **88 SEO titles, 87 meta descriptions, 178 primary categories, focus keyphrases, robots flags, OG/Twitter fields** (indexables + postmeta merged) |
| Meta descriptions generated where Yoast had none | 111 (flagged `descriptionGenerated: true` for review) |
| Redirect rules created | **19** (host canonicalization, demo homepages, feeds, legacy sitemaps, author variant, wp-admin) — zero post URLs changed |
| Broken links fixed | 44 posts carried staging-host URLs (orangered-mouse-231438.hostingersite.com) — all normalized; 1 unfilled editorial placeholder removed; 1 src-less `<img>` removed; 6 posts had in-content `<h1>` demoted |
| Internal links | 48 existing preserved + **17 contextual links added** (report: internal-linking-report.csv) |
| Orphan handling | 0 unreachable pages — every post is linked from category archives, related-posts, prev/next and the HTML sitemap; 156 posts still lack in-body inbound links (orphan-pages.csv, flagged for editorial linking) |
| New articles created | **10** (see new-content-plan.csv — all published, all with internal links + verified external citations) |
| Build result | **✅ 265 pages, validator 0 errors / 102 documented warnings** |
| Categories | 18 in-use categories preserved at `/category/<slug>/` (+ WP-style `/page/N/` pagination); 142 empty categories not given pages |
| Tags | none existed; none created |
| Search | Pagefind static index (198+10 posts), `/search/` (noindex) |

## Key decisions

1. **URLs are sacred.** `/%postname%/` structure, lowercase slugs, trailing slashes and the
   `/category/`, `/author/` bases all preserved exactly. No content URL changed.
2. **XML as content source, SQL for everything else.** The WXR export contained no pages, so
   pages, Yoast indexables, primary categories and options were parsed from the SQL dump.
3. **HTML-preserving migration.** Classic-editor posts got a faithful wpautop conversion;
   Gutenberg/HTML markup kept as-is; content stored as HTML bodies in content-collection
   files (`format: html`) rendered without markdown reinterpretation. New content can use
   `format: markdown`.
4. **The `electricial-safety` category slug typo is preserved** (it's the indexed URL); only
   the display name was corrected to "Electrical Safety".
5. **Attachment pages** were already disabled by Yoast on the old site — nothing to redirect.
6. **Date archives and empty category archives** (noindexed on WP) intentionally 404.
7. **Cleanups applied:** Gutenberg comments stripped, MS-Word conditional markup removed,
   staging/HTTP hosts normalized, utm params stripped, empty paragraphs removed, images given
   dimensions + lazy loading, alt text carried over from the WP media library.
8. **Nothing fabricated:** author bio is a clearly-marked placeholder; legal/editorial pages
   use general language; new articles avoid jurisdiction-specific code citations and cite
   verified sources (HSE, ESFI, Electrical Safety First — all checked live 2026-07-17).

## Reports index

| Report | Contents |
|---|---|
| reports/source-audit.md | Phase-1 inventory and issues found in the WordPress data |
| reports/media-map.csv | every media URL: original → new, alt, caption, status |
| reports/redirect-map.csv + redirect-review.md | all redirect rules + rationale |
| reports/internal-linking-report.csv | every internal link, existing and added, with reasons |
| reports/orphan-pages.csv | posts lacking in-body inbound links + mitigation |
| reports/manual-review.md | posts needing human eyes after automated cleanup |
| reports/content-gap-analysis.md | cluster analysis behind the new content |
| reports/new-content-plan.csv | the 10 new articles: queries, intent, clusters, status |
| reports/content-refresh-plan.csv | prioritized fixes for existing posts (incl. 2 high-risk) |
| reports/url-inventory.csv | every URL: status, canonical, indexability, sitemap |
| reports/seo-metadata.csv | title/description/robots/H1 dump for every page |
| reports/broken-links.csv | broken internal links found in the final build (none) |
| reports/final-validation.md | full validator output for the shipped build |

## Manual-review shortlist (important)

1. `/natasha-fester-car-accident/` — off-topic post about a real person; contained an unfilled
   AI placeholder (removed). Decide: rewrite responsibly, noindex, or remove+redirect.
2. `/10-interesting-facts-about-mary-joan-martelly-you-didnt-know/` — same class of problem.
3. Newcastle duplicate pair — consolidate with a 301.
4. `src/data/authors.json` — replace placeholder bio with real details.
5. 111 generated meta descriptions — fine to ship, better after human polish (grep
   `descriptionGenerated: true`).
6. Analytics was not migrated (was plugin-based) — add your snippet before cutover if needed.

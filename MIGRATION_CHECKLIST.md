# Migration checklist — electriciantimes.com (WordPress → Astro/Vercel)

## Completed during migration (verified by scripts)

- [x] Backup confirmed — original XML, SQL and uploads untouched in project root
- [x] Post count matched — 198 published posts in XML → 198 files in `src/content/blog` (+10 new)
- [x] Page count matched — 5 content pages migrated (3 theme-demo homepages intentionally
      replaced by the new homepage, with 301s)
- [x] Media checked — 369 referenced files copied to original `/wp-content/uploads/` paths;
      0 missing references (`reports/media-map.csv`)
- [x] URLs matched — all post slugs byte-identical, root-level, trailing slash
      (`reports/url-inventory.csv`)
- [x] Redirects defined — `vercel.json` + `reports/redirect-map.csv`, no chains/loops
- [x] Metadata checked — 88 Yoast titles + 87 descriptions mapped; generated descriptions
      flagged with `descriptionGenerated` (`reports/seo-metadata.csv`)
- [x] Schema checked — JSON-LD parses on every page (validator); BlogPosting/BreadcrumbList/
      CollectionPage/WebSite/Organization/FAQPage only where content supports it
- [x] Sitemap checked — `/sitemap-index.xml` contains all indexable pages, zero noindex URLs
- [x] Robots checked — `public/robots.txt` allows all content, blocks only `/search/`,
      references the sitemap
- [x] Forms checked — contact form builds and degrades gracefully without credentials
- [x] Production build green — 265 pages, validator: 0 errors

## To do at/after cutover (requires production access)

- [ ] DNS switched — A/CNAME updated at Hostinger per DEPLOYMENT.md §4
- [ ] Email tested — send + receive on the Hostinger mailbox AFTER the DNS change
- [ ] Live redirect spot-checks (DEPLOYMENT.md §5 curl list)
- [ ] Search Console — sitemap submitted, coverage monitored for 2–4 weeks
- [ ] Analytics — add your analytics snippet (none was migrated; the WP site's tracking setup
      was plugin-based) and verify page views
- [ ] Final crawl completed — crawl the live domain with Screaming Frog/similar; compare
      against `reports/url-inventory.csv`
- [ ] Review editorial flags in `reports/content-refresh-plan.csv` (two posts about real
      people need an editorial decision; two near-duplicate Newcastle posts to consolidate)
- [ ] Replace placeholder author bio in `src/data/authors.json`
- [ ] Configure `PUBLIC_FORM_ENDPOINT` (+ optional Turnstile) and test the contact form
- [ ] Decommission WordPress hosting only after several stable weeks

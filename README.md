# Electrician Times — Astro site

Static Astro site for https://electriciantimes.com/, migrated from WordPress (Soledad theme +
Yoast) with all 198 original posts, 5 pages, categories, media and SEO metadata preserved at
their original URLs.

## Architecture

- **Astro 7** (static output) + TypeScript + Content Collections
- **Pagefind** static search (index built after each `astro build`)
- Custom flat XML sitemap endpoint → `/sitemap.xml` (all URLs in one file)
- Zero client-side framework; the only JS is the mobile-nav toggle and the search page
- Deployed on **Vercel** (`vercel.json` handles trailing slashes, redirects, caching, headers)

```
src/
  components/   Header, Footer, Breadcrumbs, ArticleCard, Pagination, SeoHead, JsonLd,
                TableOfContents, RelatedPosts, AuthorBox, SocialShare, FaqSection,
                CalloutBox, NewsletterBox
  content/
    blog/       one .md file per post  (frontmatter + HTML or Markdown body)
    pages/      migrated WordPress pages (about, privacy, terms, write-for-us, contact intro)
  data/         categories.json (generated), authors.json (edit me)
  layouts/      BaseLayout.astro
  pages/        index, [slug], category/[category]/[...page], author/[author]/[...page],
                search, sitemap (HTML), 404, rss.xml, contact-us, editorial-policy, disclaimer
  styles/       global.css (design tokens derived from the logo)
  utils/        site.ts (constants), content.ts (post helpers, TOC, related posts)
public/
  wp-content/uploads/   migrated media at ORIGINAL WordPress paths (do not rename)
  images/logo.webp      brand logo
scripts/        migration + validation pipeline (see below)
reports/        all audit/migration/SEO reports
data/           extracted WordPress data (generated; not committed)
```

## Commands

| Command | What it does |
|---|---|
| `npm install` | install dependencies |
| `npm run dev` | dev server at http://localhost:4321 |
| `npm run build` | production build to `dist/` + Pagefind search index |
| `npm run preview` | serve the production build locally |
| `npm run extract` | re-parse WordPress XML/SQL into `data/` (only needed to redo migration) |
| `npm run migrate` | regenerate `src/content` from `data/` (**overwrites content edits!**) |
| `npm run reports` | rebuild internal-linking + orphan reports (also adds contextual links) |
| `npm run validate` | run the full SEO/QA validation over `dist/` |

**Migration pipeline order:** `extract` → `migrate` → `reports` → `build` → `validate`.
The pipeline is only needed if you re-import from WordPress; day-to-day you just edit content.

## Adding a new post

Create `src/content/blog/my-post-slug.md`:

```markdown
---
title: "My Post Title"
slug: "my-post-slug"
description: "Meta description, roughly 120–155 characters."
publishDate: "2026-08-01T09:00:00Z"
author: "Steven"
categories: ["electrical"]
primaryCategory: "electrical"
featuredImage: "/wp-content/uploads/2026/08/my-image.webp"
featuredImageAlt: "Describe the image"
featuredImageWidth: 1200
featuredImageHeight: 675
draft: false
format: "markdown"        # write the body in Markdown; use "html" for raw HTML
---

Your content here. With `format: "markdown"` you can write normal Markdown.
```

Optional frontmatter: `seoTitle`, `seoDescription`, `canonical`, `noindex`, `nofollow`,
`focusKeyword`, `tags`, `ogImage`, `breadcrumbTitle`, `faq` (question/answer list → renders a
visible FAQ + FAQPage schema), `relatedPosts` (list of slugs to pin related articles).

The post automatically appears on the homepage, its category archives, the author page, RSS,
the sitemaps and search. URL will be `https://electriciantimes.com/my-post-slug/`.

## Editing an existing post

Edit its file in `src/content/blog/`. **Never change the `slug`** of a migrated post — that
changes the URL. If a URL must change, add a 301 in `vercel.json`.

## Images

- Put new images in `public/wp-content/uploads/YYYY/MM/` (keeps one consistent scheme) or
  `public/images/`.
- Always set `width`/`height` (prevents layout shift) and meaningful `alt`.
- Migrated media must keep their exact paths — they are indexed by Google Images.

## Categories

Category metadata lives in `src/data/categories.json` (name, description, counts are
informational). Archive pages are generated for every category that has posts, at
`/category/<slug>/` (+ `/page/N/`). To add a category, add it to a post's frontmatter AND to
`categories.json`. The display name for `electricial-safety` is intentionally corrected to
"Electrical Safety" while the slug (indexed URL) keeps the original typo.

## Authors

`src/data/authors.json` — replace the placeholder bio; do not invent credentials. Adding an
author there + using their name in posts creates `/author/<slug>/`.

## SEO fields

- `seoTitle`/`seoDescription` override the defaults (migrated Yoast values live here).
- Default title pattern is `{title} - Electrician Times` (matches the old Yoast template).
- `noindex: true` removes the page from the XML sitemap and sets robots noindex.
- Canonical defaults to the page's own URL; override with `canonical` only for syndicated content.
- Structured data is automatic: BlogPosting + BreadcrumbList on posts, CollectionPage on
  categories, WebSite + Organization on the homepage, FAQPage when `faq` is present.

## Sitemaps, robots, RSS

- XML sitemap: `/sitemap.xml` (referenced in `public/robots.txt`)
- HTML sitemap for users: `/sitemap/`
- RSS: `/rss.xml` (old `/feed/` URLs 301 to it)

## Redirects

All redirects live in `vercel.json` (301s). See `reports/redirect-map.csv` and
`reports/redirect-review.md`. Never delete a published URL without adding a redirect.

## Search

Pagefind indexes `data-pagefind-body` regions (post content) during `npm run build`.
The UI lives at `/search/` and works on any static host. No external service, no cost.

## Contact form

The form on `/contact-us/` posts to the URL in `PUBLIC_FORM_ENDPOINT`. Without it, the page
shows a friendly "not configured" note and the build still succeeds.

1. Create a form at any POST-endpoint provider with a free tier (Formspree, FormSubmit, Basin…)
2. Set `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxx` in Vercel → Project → Environment Variables
3. Optional spam protection: set `PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare Turnstile) — the widget
   renders only when the key exists. Configure the secret-key check at your form provider.

Email for the domain stays at Hostinger — see DEPLOYMENT.md before touching DNS.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PUBLIC_FORM_ENDPOINT` | no | contact form POST target |
| `PUBLIC_TURNSTILE_SITE_KEY` | no | Cloudflare Turnstile widget on the contact form |

No private keys are needed to build or deploy the site.

## Reports

Everything generated during the migration is in `reports/`: source audit, media map,
redirect map/review, internal linking, orphan pages, content-gap analysis, new-content plan,
content-refresh plan, URL inventory, SEO metadata dump, broken links, final validation and
the migration summary.

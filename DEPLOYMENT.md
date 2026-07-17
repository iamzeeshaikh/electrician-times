# Deploying Electrician Times to Vercel

The site is a fully static Astro build. Email for `electriciantimes.com` is hosted at
**Hostinger and must keep working** — read the DNS section carefully before changing records.

## 1. GitHub setup

```bash
cd "Electrician Times"
git init
git add .
git commit -m "Astro migration of electriciantimes.com"
# create a private repo, then:
git remote add origin git@github.com:<your-account>/electrician-times.git
git push -u origin main
```

`.gitignore` already excludes the original WordPress backups (XML, SQL, uploads/), `data/`,
`dist/` and `node_modules/`. **Keep the backup files locally / in cold storage — never delete
them.**

## 2. Vercel import

1. https://vercel.com/new → Import the GitHub repo.
2. Framework preset: **Astro** (auto-detected).
3. Build command: `npm run build` (this also builds the Pagefind search index).
4. Output directory: `dist`.
5. Node version: 22.x (default is fine).
6. Environment variables (optional, can be added later):
   - `PUBLIC_FORM_ENDPOINT` — contact-form backend URL
   - `PUBLIC_TURNSTILE_SITE_KEY` — Turnstile site key
7. Deploy. Verify the `*.vercel.app` preview: homepage, a few post URLs, `/search/`,
   `/sitemap-index.xml`, `/rss.xml`, `/robots.txt`.

## 3. Domain connection

1. Vercel → Project → Settings → Domains → add `electriciantimes.com` **and**
   `www.electriciantimes.com` (set the apex as primary; www will redirect).
2. Vercel shows the DNS records it needs — currently an `A` record for the apex and a
   `CNAME` for `www`.

## 4. DNS changes at Hostinger — READ THIS

Make the changes in **Hostinger hPanel → Domains → DNS Zone**. Hostinger's nameservers stay
active; you are only editing individual records.

**Change ONLY these records:**

| Record | Name | New value |
|---|---|---|
| A | `@` | Vercel's IP (as shown in the Vercel Domains screen, typically `76.76.21.21`) |
| CNAME | `www` | `cname.vercel-dns.com` |

Delete/replace only the old `A`/`CNAME` records that pointed the website at Hostinger's
webserver.

**DO NOT touch (email will break):**

- ❌ **MX records** (`mx1.hostinger.com`, `mx2.hostinger.com`, …) — Hostinger mailboxes
- ❌ **TXT record with `v=spf1`** — SPF, keeps outgoing mail deliverable
- ❌ **TXT/CNAME records containing `dkim` or `_domainkey`** — DKIM signing
- ❌ **TXT record `_dmarc`** — DMARC policy
- ❌ Any `autoconfig`/`autodiscover`/webmail records

After saving, DNS propagates in minutes-to-hours. The site keeps working on the old host
until propagation completes, so there is no downtime window to schedule.

## 5. Post-deployment testing

```bash
# URL preservation — expect 200 with trailing slash
curl -sI https://electriciantimes.com/security-zones-of-power-lines-and-rules-for-staying-in-them/ | head -1
# Redirects — expect 301 + location
curl -sI https://electriciantimes.com/feed/ | grep -iE "http|location"
curl -sI https://www.electriciantimes.com/ | grep -iE "http|location"
curl -sI https://electriciantimes.com/home-2/ | grep -iE "http|location"
# Trailing slash normalization — expect 308/301 → /about-us/
curl -sI https://electriciantimes.com/about-us | grep -iE "http|location"
# Sitemap + robots
curl -s https://electriciantimes.com/robots.txt
curl -sI https://electriciantimes.com/sitemap-index.xml | head -1
# 404 handling — expect 404
curl -sI https://electriciantimes.com/this-page-does-not-exist/ | head -1
```

Also test **email**: send a message to and from a mailbox on the domain after DNS changes.

## 6. Search Console

1. Google Search Console → the existing `electriciantimes.com` property.
2. Sitemaps → remove old Yoast sitemap if listed → submit `https://electriciantimes.com/sitemap-index.xml`.
   (The old Yoast sitemap URLs 301 to the new index anyway.)
3. Over the following weeks watch Coverage for unexpected 404s; every legitimate URL from the
   WordPress era should be 200 or a deliberate 301 (see `reports/redirect-review.md`).

## 7. Rollback procedure

The WordPress site remains intact at the old host until you decommission it.

1. Hostinger DNS Zone → restore the previous `A` record for `@` (the old server IP) and the
   old `www` record.
2. Wait for propagation — the WordPress site is serving again.
3. Nothing on the Vercel side needs to be deleted; fix and re-point when ready.

Take a screenshot/export of the current DNS zone **before** making changes so rollback values
are at hand. Keep the WordPress hosting active for at least a few weeks after cutover.

## 8. Caching / headers

Already configured in `vercel.json`: immutable long-cache for `/_astro/*` and
`/wp-content/uploads/*`, security headers sitewide, `trailingSlash: true` for WP-style URLs.

// Returns 410 Gone for intentionally removed posts (see reports/removed-posts.csv).
// Routed via "rewrites" in vercel.json.
export default function handler(req, res) {
  res.status(410).setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>410 — Content Removed - Electrician Times</title>
<style>
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1d2b38;background:#f4f7fa;display:grid;min-height:100vh;place-items:center;padding:1.5rem}
  .card{max-width:34rem;background:#fff;border:1px solid #dbe4ec;border-radius:12px;padding:2.25rem;text-align:center;box-shadow:0 4px 16px rgba(20,41,60,.08)}
  h1{font-family:Georgia,serif;color:#1f3b52;margin:0 0 .5rem;font-size:1.6rem}
  p{color:#55677a;line-height:1.65;margin:.5rem 0}
  a.btn{display:inline-block;margin-top:1rem;background:#e8681a;color:#fff;text-decoration:none;font-weight:700;border-radius:999px;padding:.65rem 1.5rem}
  a{color:#2b5f87}
</style>
</head>
<body>
<div class="card">
  <h1>410 — This article has been removed</h1>
  <p>This page was permanently removed as part of an editorial cleanup and will not be coming back.</p>
  <p>You might find what you need in our <a href="/sitemap/">article index</a> or via <a href="/search/">search</a>.</p>
  <a class="btn" href="/">Back to Electrician Times</a>
</div>
</body>
</html>`);
}

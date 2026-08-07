// Catch-all 410 for hacked-era spam URLs (numeric slugs, *.phtml, and any
// other path that doesn't exist in the static build). Vercel serves the
// filesystem (static pages + api/) before rewrites, so only unknown paths
// ever reach this function.
export default function handler(req, res) {
  res.statusCode = 410;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>410 Gone — Electrician Times</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;background:#f5f6f8;color:#1c2733;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .box{text-align:center;padding:2rem;max-width:32rem}
  h1{font-size:1.5rem;margin:0 0 .5rem}
  p{color:#5a6a7a;line-height:1.6}
  a{color:#0b63c4;text-decoration:none;font-weight:600}
</style>
</head>
<body>
<div class="box">
<h1>410 &mdash; This page is gone</h1>
<p>The page you requested was removed permanently and is no longer available.</p>
<p><a href="https://electriciantimes.com/">Go to the Electrician Times homepage</a></p>
</div>
</body>
</html>`);
}

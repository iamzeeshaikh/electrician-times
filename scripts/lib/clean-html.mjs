// HTML cleanup for migrated WordPress content.
import { wpautop } from './wpautop.mjs';

export function cleanContent(rawHtml, { isGutenberg }) {
  let html = rawHtml;
  const notes = [];

  // 1. Gutenberg block comments
  if (isGutenberg) {
    html = html.replace(/<!-- \/?wp:[^>]*-->\n?/g, '');
  }

  // 2. MS Word conditional comments and list-bullet spans
  if (/<!--\[if/.test(html)) {
    notes.push('ms-word-markup-removed');
    html = html.replace(/<!--\[if [^\]]*\]-->[\s\S]*?<!--\[?endif\]?-->/gi, '');
    html = html.replace(/<!--\[?endif\]?-->/gi, '');
    html = html.replace(/<!--\[if [^\]]*\]-->/gi, '');
  }

  // 3. Strip mso- inline styles and Word class soup, keep other styles
  html = html.replace(/\s+style="[^"]*mso-[^"]*"/gi, '');
  html = html.replace(/\s+class="(?:Mso[^"]*|16|15|apple-converted-space)"/gi, '');
  html = html.replace(/<o:p>[\s\S]*?<\/o:p>/gi, '');

  // 4. wpautop for classic-editor content (no <p> wrapping in DB)
  if (!isGutenberg) {
    html = wpautop(html);
  }

  // 5. Demote in-content <h1> to <h2> (the page template provides the single H1)
  if (/<h1[\s>]/i.test(html)) {
    notes.push('demoted-content-h1');
    html = html.replace(/<h1(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
  }

  // 6. Remove images that have no src (broken in the source CMS)
  if (/<img(?![^>]*\bsrc=)[^>]*\/?>/i.test(html)) {
    notes.push('removed-src-less-img');
    html = html.replace(/<figure[^>]*>\s*<img(?![^>]*\bsrc=)[^>]*\/?>\s*(<figcaption[\s\S]*?<\/figcaption>\s*)?<\/figure>/gi, '');
    html = html.replace(/<img(?![^>]*\bsrc=)[^>]*\/?>/gi, '');
  }

  // 6b. Normalize/strip junk
  html = html
    // empty paragraphs / nbsp-only paragraphs
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\n?/gi, '')
    // stray Gutenberg class remnants are harmless; keep wp-block-heading etc. off
    .replace(/\s+class="wp-block-heading"/g, '')
    // tracking params on links
    .replace(/(href="[^"]*?)\?(utm_[^"]*)"/gi, '$1"')
    // protocol-relative → https
    .replace(/(href|src)="\/\/(www\.)?/gi, '$1="https://$2')
    // duplicated <br>
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
    // WordPress smart-quote entities are fine; strip zero-width chars
    .replace(/[​﻿]/g, '');

  // 7. Remove align attributes deprecated in HTML5 on p/div (keep on td/th via CSS later)
  html = html.replace(/<(p|div)([^>]*?)\s+align="[^"]*"/gi, '<$1$2');

  // 8. Detect leftover shortcodes for the review report (exclude prose brackets)
  for (const m of html.matchAll(/\[\/?([a-z_]+)(?:\s[^\]]*)?\]/g)) {
    notes.push(`shortcode:[${m[1]}]`);
  }

  return { html: html.trim(), notes };
}

export function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|’/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a meta description from content when Yoast has none.
export function generateDescription(html) {
  const text = stripTags(html);
  if (text.length <= 155) return text;
  const cut = text.slice(0, 152);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 100 ? lastSpace : 152).replace(/[,;:.\s]+$/, '') + '…';
}

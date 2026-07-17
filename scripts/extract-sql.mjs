// Extract needed WordPress tables from the SQL dump into data/sql/*.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extractTable } from './lib/sql-parser.mjs';

const SQL_FILE = fileURLToPath(new URL('../u285414217_6CRas.sql', import.meta.url));
const OUT_DIR = fileURLToPath(new URL('../data/sql/', import.meta.url));
mkdirSync(OUT_DIR, { recursive: true });

const sql = readFileSync(SQL_FILE, 'utf8');
console.log(`Loaded SQL dump: ${(sql.length / 1024 / 1024).toFixed(1)} MB`);

const tables = [
  'wp_posts',
  'wp_postmeta',
  'wp_terms',
  'wp_term_taxonomy',
  'wp_term_relationships',
  'wp_termmeta',
  'wp_users',
  'wp_yoast_indexable',
  'wp_yoast_primary_term',
  'wp_yoast_seo_links',
];

for (const t of tables) {
  const rows = extractTable(sql, t);
  writeFileSync(`${OUT_DIR}${t}.json`, JSON.stringify(rows, null, 1));
  console.log(`${t}: ${rows.length} rows`);
}

// Options: keep only the interesting ones (the table stores big serialized blobs)
const options = extractTable(sql, 'wp_options');
const keep = new Set([
  'siteurl', 'home', 'blogname', 'blogdescription', 'permalink_structure',
  'category_base', 'tag_base', 'active_plugins', 'template', 'stylesheet',
  'page_on_front', 'page_for_posts', 'show_on_front', 'posts_per_page',
  'wpseo', 'wpseo_titles', 'wpseo_social', 'date_format', 'timezone_string',
  'blog_charset', 'admin_email', 'site_icon',
]);
const optOut = {};
for (const o of options) if (keep.has(o.option_name)) optOut[o.option_name] = o.option_value;
writeFileSync(`${OUT_DIR}wp_options.json`, JSON.stringify(optOut, null, 1));
console.log(`wp_options: kept ${Object.keys(optOut).length} of ${options.length}`);

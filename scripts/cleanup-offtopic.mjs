// Remove off-topic (non-electrical) posts per owner's decision (2026-07-17).
// - deletes the content files (recoverable from git history / WP backups)
// - unwraps internal links pointing at deleted posts in the remaining content
// - regenerates src/data/categories.json postCounts from remaining posts
// - writes reports/removed-posts.csv
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const BLOG = `${ROOT}src/content/blog/`;

// slug -> reason
const REMOVE = {
  '10-interesting-facts-about-mary-joan-martelly-you-didnt-know': 'celebrity content',
  'a-beginners-guide-to-using-muchotorrents-safely': 'torrent site guide',
  'a-step-by-step-guide-to-getting-started-with-vy6ys': 'unrelated brand promo',
  'ams39k': 'vague tech promo, no electrical substance',
  'an-overview-of-data-architecture': 'IT/data topic',
  'andrigolitis': 'pseudo-medical content',
  'appfordown': 'app-download site promo',
  'ar-clothes-interactive-designs-and-prints': 'fashion/AR',
  'artificial-intelligence-problems': 'general AI essay',
  'atlantic-business-brokers-helping-you-navigate-smooth-business-transactions': 'business brokerage',
  'bebasinindo-celebrates-freedom-and-innovation-in-indonesia': 'unrelated promo',
  'beholderen-unveiling-the-mystery-behind-the-name': 'meaningless SEO filler',
  'blackboarduct': 'chalkboard material (construction/decor)',
  'bring-your-photos-and-artworks-to-life-with-stories-ar': 'AR photo app promo',
  'certidor': 'professional-profile service promo',
  'chagaras': 'pseudo-medical content',
  'chelsea-actons-famous-parenting-techniques-explained': 'parenting',
  'clickbaitosaurus': 'media/clickbait essay',
  'comprehensive-auto-repair-and-fire-protection-solutions': 'auto repair promo',
  'corma-ai-ashees': 'AI brand promo',
  'cubvh-a-transformative-concept-shaping-modern-possibilities': 'meaningless SEO filler',
  'cyber-security-services-for-modern-businesses': 'IT security services',
  'dagesteron': 'pseudo-medical content',
  'digital-art-ankinsart-exploring-the-fusion-of-technology-and-creativity': 'digital art',
  'discovering-figu-the-sweet-jewel-of-nature': 'food/fruit',
  'discovering-opportunities-at-dallas-spark': 'networking-hub promo, not electrical',
  'dzombz-pc-game-trainer': 'video games',
  'elettronica-di-consumo-italys-leading-online-store-for-consumer-electronics': 'consumer-electronics shop promo',
  'exploring-coelocaliente-definition-applications-and-benefits': 'meaningless SEO filler',
  'exploring-the-world-through-albino-monkey-net-travel-archives': 'travel',
  'geekzilla-ces-2023': 'tech news/CES',
  'hagie-tunkara-chef': 'chef profile',
  'himalayan-resting-place': 'travel',
  'homarazzi': 'celebrity culture',
  'how-coomersu-is-changing-online-consumer-behavior': 'meaningless SEO filler',
  'how-cowordle-is-taking-word-puzzles-to-the-next-level': 'word games',
  'how-fmybrainsout-stands-out-in-the-world-of-digital-content': 'digital-content site promo',
  'how-qxefv-is-changing-the-landscape-of-technology': 'meaningless SEO filler',
  'how-the-kennedy-funding-lawsuit-is-impacting-the-financial-sector': 'finance/legal',
  'how-to-make-the-image-background-transparent-with-ai-eases-ai-background-remover': 'AI image tool promo',
  'how-to-use-a-silicone-sealant-properly-the-essential-dos-and-donts': 'general construction sealant',
  'https-electriciantimes-com-energy-saving-lamp-do-it-yourself-repair': 'junk post (Danlar promo on malformed slug)',
  'juvgwg': 'meaningless SEO filler',
  'keeper-standards-test': 'football goalkeeping',
  'kentuckio': 'travel',
  'kingymab': 'fitness promo',
  'krete-kot-system': 'concrete coating (construction)',
  'lorphenadine': 'pseudo-medical content',
  'lyncconf-game-mods': 'video games',
  'manhiascan': 'manga site promo',
  'master-spreadsheet-rectangles-to-unlock-the-power-of-organized-data': 'spreadsheets',
  'maximizing-productivity-with-jablw-rv-tips-and-tricks': 'meaningless SEO filler',
  'methstreams-the-ultimate-sports-streaming-guide-for-fans': 'pirated sports streaming',
  'mydearquotes-com-quotes-archives': 'quotes site promo',
  'myfastbroker-insurance-brokers': 'insurance brokerage',
  'myfastbroker-stock-brokers': 'stock brokerage',
  'mylt34': 'meaningless SEO filler',
  'natasha-fester-car-accident': 'car-accident story about a private person',
  'nftrandomize': 'NFT promo',
  'nuoilo-12h': 'supplement promo',
  'oridzin': 'meaningless SEO filler',
  'papxnmoxk': 'meaningless SEO filler',
  'prince-narula-digital-paypal': 'celebrity/payments',
  'qivation-company-leading-the-way-in-air-purification-with-nanotechnology': 'air-purifier brand PR',
  'retro-bowl-3kh0': 'video games',
  'rout-hair': 'hair care',
  'seamless-tech-upgrades-explore-the-magic-of-xannytech-net': 'tech blog promo',
  'sector-nyt-crossword': 'crossword puzzles',
  'srt-lebron-huskies': 'sports',
  'stars-923': 'meaningless SEO filler',
  'stay-ahead-with-the-latest-tech-trends-from-news-jotechgeeks': 'tech news site promo',
  'supjavaa-shop': 'coffee shop promo',
  'surface-treated-cnc-components-for-high-load-exoskeletons': 'CNC/exoskeletons, empty title',
  'the-best-can-am-defender-windshield-protection-for-harsh-weather-conditions': 'ATV accessories',
  'the-journeyman-camera-is-a-balanced-choice-for-aspiring-photographers': 'photography',
  'the-power-of-gutsy-boldness-reflections-from-the-nyt': 'NYT essay',
  'the-psychology-of-visual-cues-how-floor-markings-influence-behavior-and-productivity': 'floor-marking promo',
  'thewifevo': 'relationship stories',
  'top-benefits-of-using-weatherguard-for-your-roof-and-siding': 'roofing/siding',
  'top-reasons-to-call-6463276197-for-expert-services': 'phone-number spam',
  'traceloans': 'loans promo',
  'transforming-your-mobile-home-exterior-proven-ways-to-boost-curb-appeal': 'home exterior/curb appeal',
  'travel-tweaks-offers': 'travel',
  'uncuymaza': 'meaningless SEO filler',
  'understanding-fearscans-the-future-of-emotion-detection-technology': 'emotion-detection promo',
  'understanding-kashito_toto-and-its-growing-popularity': 'meaningless SEO filler',
  'understanding-plangud-and-its-features': 'meaningless SEO filler',
  'unraveling-the-mysteries-of-ancient-artz': 'art history filler',
  'unveiling-pondershort-com-where-creativity-meets-brevity': 'writing site promo',
  'waethicc': 'internet slang filler',
  'what-the-etsiosapp-release-date-means-for-users-in-2024': 'app release news',
  'white-oak-impact-fund': 'investment fund',
  'why-businesses-benefit-from-professional-google-ads-services': 'marketing services',
  'why-dining-rooms-are-fading-away-in-modern-homes': 'interior design',
  'why-stoneway-is-the-ideal-choice-for-modern-architecture': 'architecture/materials',
  'yadontube': 'video-sharing site promo',
  'your-ultimate-guide-to-easy-downloading-with-appfordown-applications': 'app-download promo',
  // duplicate consolidation (relevant topic, but exact duplicate of the kept URL)
  'electrician-newcastle-your-trusted-electrical-experts-2': 'duplicate of electrician-newcastle-your-trusted-electrical-expert',
};

// 1. delete files
const removed = [];
for (const [slug, reason] of Object.entries(REMOVE)) {
  const f = `${BLOG}${slug}.md`;
  if (!existsSync(f)) {
    console.warn(`MISSING (already gone?): ${slug}`);
    continue;
  }
  const raw = readFileSync(f, 'utf8');
  const title = JSON.parse((raw.match(/^title: (.*)$/m) || [null, '""'])[1]);
  rmSync(f);
  removed.push({ slug, title, reason });
}

// 2. unwrap links to deleted posts in remaining content
const deletedSlugs = new Set(Object.keys(REMOVE));
let unwrapped = 0;
for (const f of readdirSync(BLOG).filter((x) => x.endsWith('.md'))) {
  let raw = readFileSync(BLOG + f, 'utf8');
  const before = raw;
  raw = raw.replace(/<a\s[^>]*href="\/([a-z0-9_-]+)\/"[^>]*>([\s\S]*?)<\/a>/g, (m, slug, inner) =>
    deletedSlugs.has(slug) ? (unwrapped++, inner) : m
  );
  if (raw !== before) writeFileSync(BLOG + f, raw);
}

// 3. regenerate category counts from remaining posts
const counts = {};
for (const f of readdirSync(BLOG).filter((x) => x.endsWith('.md'))) {
  const raw = readFileSync(BLOG + f, 'utf8');
  const cats = JSON.parse((raw.match(/^categories: (.*)$/m) || [null, '[]'])[1]);
  for (const c of cats) counts[c] = (counts[c] || 0) + 1;
}
const catFile = `${ROOT}src/data/categories.json`;
const cats = JSON.parse(readFileSync(catFile, 'utf8'))
  .map((c) => ({ ...c, postCount: counts[c.slug] || 0 }))
  .filter((c) => c.postCount > 0);
writeFileSync(catFile, JSON.stringify(cats, null, 2));

// 4. report
const csvEsc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
writeFileSync(
  `${ROOT}reports/removed-posts.csv`,
  'url,title,reason,http_after_removal\n' +
    removed
      .map((r) =>
        [
          `https://electriciantimes.com/${r.slug}/`,
          r.title,
          r.reason,
          r.slug === 'electrician-newcastle-your-trusted-electrical-experts-2' ? '301 to kept duplicate' : '404 (intentional removal)',
        ].map(csvEsc).join(',')
      )
      .join('\n')
);

console.log(`removed: ${removed.length} posts`);
console.log(`links unwrapped in remaining posts: ${unwrapped}`);
console.log(`categories now: ${cats.map((c) => `${c.slug}(${c.postCount})`).join(', ')}`);
console.log(`posts remaining: ${readdirSync(BLOG).filter((x) => x.endsWith('.md')).length}`);

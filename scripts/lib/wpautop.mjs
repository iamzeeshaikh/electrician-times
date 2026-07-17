// Pragmatic port of WordPress wpautop(): wraps double-newline-separated text in <p> tags
// while leaving block-level HTML alone. Mirrors the WP algorithm closely enough for
// classic-editor content in this dataset (text + h2/h3/img/a/ul/table markup).

const BLOCKS =
  'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|form|map|area|blockquote|address|style|p|h[1-6]|hr|fieldset|legend|section|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary|iframe';

export function wpautop(input) {
  if (!input || !input.trim()) return '';
  let pee = input + '\n';

  // Preserve <pre> content
  const preTags = [];
  pee = pee.replace(/<pre[\s\S]*?<\/pre>/gi, (m) => {
    preTags.push(m);
    return `<!--wpautop-pre-${preTags.length - 1}-->`;
  });

  pee = pee.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n');
  const blockRe = new RegExp(`(<(?:${BLOCKS})(?: [^>]*)?>)`, 'gi');
  const blockCloseRe = new RegExp(`(</(?:${BLOCKS})>)`, 'gi');
  pee = pee.replace(blockRe, '\n\n$1');
  pee = pee.replace(blockCloseRe, '$1\n\n');
  pee = pee.replace(/\r\n|\r/g, '\n');

  // option/object/source handling not needed for this dataset

  pee = pee.replace(/\n\n+/g, '\n\n');
  const paras = pee.split(/\n\s*\n/).filter((p) => p.trim());

  pee = '';
  for (let para of paras) {
    para = para.trim();
    // If the chunk starts AND ends as a block element, leave as-is
    const startsBlock = new RegExp(`^<(?:${BLOCKS})(?: [^>]*)?>`, 'i').test(para);
    if (startsBlock) {
      pee += para + '\n';
    } else {
      pee += `<p>${para}</p>\n`;
    }
  }

  // Remove <p> wrapping around lone block tags that slipped through
  const pFixOpen = new RegExp(`<p>\\s*(</?(?:${BLOCKS})(?: [^>]*)?>)`, 'gi');
  const pFixClose = new RegExp(`(</?(?:${BLOCKS})(?: [^>]*)?>)\\s*</p>`, 'gi');
  pee = pee.replace(pFixOpen, '$1');
  pee = pee.replace(pFixClose, '$1');

  // Newlines inside paragraphs -> <br> (WP behaviour), but not after block tags
  pee = pee.replace(/<p>([\s\S]*?)<\/p>/g, (m, inner) => {
    const withBr = inner.trim().replace(/\n/g, '<br>\n');
    return `<p>${withBr}</p>`;
  });

  // Restore <pre>
  pee = pee.replace(/<!--wpautop-pre-(\d+)-->/g, (m, i) => preTags[Number(i)]);

  return pee.trim();
}

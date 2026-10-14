/**
 * cover-art.mjs — the checklist cover for the download card.
 *
 * VERSION HISTORY, because the first attempt is worth remembering
 * v1 was a drawing sheet: a gridded frame with crop marks, a dashed site
 * boundary, six buildings with internals (assembly lines, mould racks, a
 * goods-in arrow) and an index row of VET-01…05. At 520x300 it read as a
 * deliberate engineering drawing. At 120px — the size the download card
 * actually renders it — it read as grey mush. The user's verdict was
 * "好难看 做个简约的风格吧", which was correct: the detail was calibrated
 * for the wrong size.
 *
 * v2 is typographic and nothing else: a red rule, the title, hairlines, and
 * a lot of white. It survives being 120px wide because the only thing asked
 * of it at that size is the red mark and the title, and both are big enough.
 *
 * v2.1 is landscape (4:3). v2 was portrait A4, which was the honest shape
 * for a document page and the wrong shape for this layout: 120px wide meant
 * 170px tall, and that stretched the whole download block. The user's
 * verdict: 把整个版块也拉长了, 很难看. It is a cover *card* now, not a
 * miniature of the page — same type treatment, a shape that fits the slot.
 *
 * WHY VECTOR AND NOT A PHOTOGRAPH
 *   · Size: ~1.5 KB. A JPEG doing a comparable job is 120-250 KB.
 *   · Honesty: a stock photo of somebody else's factory on the cover of a
 *     vetting checklist is the kind of unverifiable claim the site exists to
 *     avoid, and there is no photograph of this checklist to put on it.
 *   · Crisp at any size, including retina and print.
 *
 * The PDF cover page is typographic too (scripts/build-checklist-pdf.mjs),
 * so this thumbnail is a fair miniature of the real first page rather than a
 * different design wearing the same colours.
 *
 * Run: node scripts/build-cover-svg.mjs  (also runs with `npm run pdf`)
 */

/* ------------------------------------------------------------------- palette */
const INK = '#1A1917';
const RED = '#D0202A';
const HAIR = '#C7C3BD';
const RULE = '#DCD9D4';

/* The site's display stack (src/styles/tokens.css --font-display), so the
   thumbnail's type matches the page it sits on. Local families resolve inside
   <img>; a webfont would not, which is why this is a system stack. */
const FONT =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * The cover card: landscape 4:3, displayed at 120x90 in the download card.
 * Portrait A4 was 170px tall at that width and stretched the block.
 */
export function svgSheet() {
  const W = 200;
  const H = 150;
  const M = 20;
  const PW = W - M * 2; // 160

  const title = ['FACTORY VETTING', 'CHECKLIST']
    .map(
      (line, i) =>
        `<text x="${M}" y="${68 + i * 22}" fill="${INK}" font-family="${FONT}"` +
        ` font-size="16" font-weight="600" letter-spacing="0.2">${line}</text>`
    )
    .join('');

  /* The meta line stands in for the real copy, which is unreadable at 6px —
     drawn as weight rather than as text. */
  const bars =
    `<rect x="${M}" y="114" width="${PW}" height="1" fill="${RULE}"/>` +
    `<rect x="${M}" y="122" width="56" height="2" fill="${HAIR}"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Factory vetting checklist cover">` +
    `<rect width="${W}" height="${H}" fill="#FFFFFF"/>` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${RULE}" stroke-width="0.8"/>` +
    `<rect x="${M}" y="30" width="34" height="3" fill="${RED}"/>` +
    title +
    bars +
    `</svg>`
  );
}

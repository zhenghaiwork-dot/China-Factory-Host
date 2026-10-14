/**
 * cover-art.mjs — the checklist cover drawing, defined once, rendered twice.
 *
 * WHY VECTOR AND NOT A PHOTOGRAPH
 *   · Size. This drawing is ~2 KB as SVG and adds ~4 KB to the PDF. A JPEG that
 *     looks this deliberate at 1600px is 120-250 KB, which would take a 16 KB
 *     PDF to roughly ten times its current weight for the same visual job.
 *   · Honesty. The site is built on evidence. A stock photo of somebody else's
 *     factory on the cover of a vetting checklist is exactly the kind of
 *     unverifiable claim the brand exists to avoid.
 *   · Tone. The established visual language is documentary line work
 *     (public/images/china-outline.svg, the mono nameplates). Line drawing is
 *     the native dialect; a photo would be a visitor.
 *   · Print. People print this and tick boxes by hand. Vector stays crisp at
 *     any zoom and any printer, and costs no more toner than the text.
 *
 * WHAT IT IS
 *   A drawing sheet: a site plan of a factory, reduced to the five things the
 *   checklist actually inspects — production hall, tooling store, goods-in,
 *   finished goods, office — with the five check codes along the bottom as an
 *   index row. VET-04 and the tooling store share the red accent because check
 *   04 is the one that looks for the tooling store.
 *
 * The PDF renderer draws with pdfkit primitives (no raster is embedded at all).
 * The SVG renderer emits the same primitives as markup for the site thumbnail.
 * One source of geometry, so the two can never drift.
 */

/* ------------------------------------------------------------------- palette */
const INK = '#1A1917';
const RED = '#D0202A';
const GREY = '#616670';
const HAIR = '#C7C3BD';
const RULE = '#DCD9D4';
const ZEBRA = '#F7F6F4';
const REDTINT = '#FDF1F2';
const GRID = '#F0EEEA';

export const ART = { w: 520, h: 300 };

/* ------------------------------------------------------------------ geometry
 * Plot:  x 46 -> 474, y 52 -> 248. Buildings keep a 22 margin inside it.      */
const PLOT = { x: 46, y: 52, w: 428, h: 196 };

const CHIP = { y: 260, w: 80, h: 26, gap: 7, x0: 46 };
const CODES = ['VET-01', 'VET-02', 'VET-03', 'VET-04', 'VET-05'];
const ACCENT = 3; // VET-04 — "walking the floor", which is where the tooling store is

function chipX(i) {
  return CHIP.x0 + i * (CHIP.w + CHIP.gap);
}

/* ---------------------------------------------------------------- operations
 * One ordered list. Order is paint order: the dashed plot goes down first so
 * the buildings sit on top of it, and a building's contents follow the
 * building so nothing is painted over.                                        */
export const OPS = [
  { t: 'grid', z: 'frame', step: 26, x: 0, y: 0, w: ART.w, h: ART.h, color: GRID, lw: 0.5 },

  /* sheet border + crop marks */
  { t: 'rect', z: 'frame', x: 5, y: 5, w: 510, h: 290, stroke: RULE, lw: 0.8 },
  { t: 'line', z: 'frame', x1: 5, y1: 19, x2: 5, y2: 5, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 5, y1: 5, x2: 19, y2: 5, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 515, y1: 19, x2: 515, y2: 5, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 515, y1: 5, x2: 501, y2: 5, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 5, y1: 281, x2: 5, y2: 295, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 5, y1: 295, x2: 19, y2: 295, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 515, y1: 281, x2: 515, y2: 295, stroke: INK, lw: 1 },
  { t: 'line', z: 'frame', x1: 515, y1: 295, x2: 501, y2: 295, stroke: INK, lw: 1 },

  /* the industrial plot — dashed, because it is a boundary, not a building */
  { t: 'rect', z: 'plan', x: PLOT.x, y: PLOT.y, w: PLOT.w, h: PLOT.h, stroke: HAIR, lw: 0.9, dash: [6, 4] },

  /* production hall + three lines with station ticks */
  { t: 'rect', z: 'plan', x: 68, y: 68, w: 246, h: 116, stroke: INK, lw: 1.3 },
  ...[92, 122, 152].flatMap((y) => [
    { t: 'rect', z: 'plan', x: 88, y, w: 206, h: 6, stroke: GREY, lw: 0.9 },
    ...[104, 156, 208, 260].map((x) => ({ t: 'rect', z: 'plan', x, y: y + 10, w: 4, h: 4, fill: HAIR })),
  ]),

  /* tooling and mould store — the red accent, paired with VET-04 below */
  { t: 'rect', z: 'plan', x: 332, y: 68, w: 120, h: 44, stroke: RED, lw: 1.4, fill: REDTINT },
  ...[344, 372, 400, 428].map((x) => ({ t: 'rect', z: 'plan', x, y: 82, w: 16, h: 16, stroke: RED, lw: 1 })),

  /* raw material and work in progress */
  { t: 'rect', z: 'plan', x: 332, y: 132, w: 120, h: 52, stroke: GREY, lw: 1, fill: ZEBRA },
  ...[346, 382, 418].map((x) => ({ t: 'rect', z: 'plan', x, y: 146, w: 24, h: 26, stroke: GREY, lw: 0.9 })),

  /* goods in — the arrow points into the building */
  { t: 'rect', z: 'plan', x: 68, y: 196, w: 116, h: 32, stroke: INK, lw: 1.1 },
  { t: 'line', z: 'plan', x1: 92, y1: 212, x2: 152, y2: 212, stroke: INK, lw: 1.1 },
  { t: 'line', z: 'plan', x1: 146, y1: 206, x2: 152, y2: 212, stroke: INK, lw: 1.1 },
  { t: 'line', z: 'plan', x1: 146, y1: 218, x2: 152, y2: 212, stroke: INK, lw: 1.1 },

  /* finished goods / QC */
  { t: 'rect', z: 'plan', x: 200, y: 196, w: 112, h: 32, stroke: INK, lw: 1.1, fill: ZEBRA },
  ...[214, 244, 274].map((x) => ({ t: 'rect', z: 'plan', x, y: 205, w: 18, h: 18, stroke: GREY, lw: 0.8 })),

  /* office — where the meeting either has a decision-maker in it or does not */
  { t: 'rect', z: 'plan', x: 332, y: 196, w: 120, h: 32, stroke: GREY, lw: 1 },
  { t: 'rect', z: 'plan', x: 376, y: 208, w: 34, h: 12, stroke: GREY, lw: 0.8 },

  /* index row: the five checks, in the order they are run */
  ...CODES.map((code, i) => ({
    t: 'rect',
    z: 'index',
    x: chipX(i),
    y: CHIP.y,
    w: CHIP.w,
    h: CHIP.h,
    stroke: i === ACCENT ? RED : RULE,
    lw: i === ACCENT ? 1.1 : 0.8,
    fill: '#FFFFFF',
  })),
  ...CODES.map((code, i) => ({
    t: 'text',
    z: 'index',
    s: code,
    x: chipX(i),
    y: CHIP.y + 9,
    w: CHIP.w,
    size: 8.5,
    fill: i === ACCENT ? RED : INK,
    weight: 'bold',
    align: 'center',
    tracking: 0.6,
  })),
];

/* --------------------------------------------------------- pdfkit renderer */
/**
 * Draw the artwork into a pdfkit document.
 * @param doc  PDFDocument
 * @param x,y  top-left in PDF points
 * @param w    target width in PDF points (height follows ART ratio)
 */
export function drawCoverArt(doc, x, y, w) {
  const s = w / ART.w;
  doc.save();
  for (const op of OPS) {
    if (op.t === 'grid') {
      doc.lineWidth(op.lw * s).strokeColor(op.color);
      for (let gx = op.x + op.step; gx < op.x + op.w; gx += op.step) {
        doc.moveTo(x + gx * s, y + op.y * s).lineTo(x + gx * s, y + (op.y + op.h) * s).stroke();
      }
      for (let gy = op.y + op.step; gy < op.y + op.h; gy += op.step) {
        doc.moveTo(x + op.x * s, y + gy * s).lineTo(x + (op.x + op.w) * s, y + gy * s).stroke();
      }
      continue;
    }
    if (op.t === 'rect') {
      const lw = op.lw ? op.lw * s : 0;
      doc.rect(x + op.x * s, y + op.y * s, op.w * s, op.h * s);
      if (op.dash) doc.dash(op.dash[0] * s, { space: op.dash[1] * s });
      if (op.fill && op.stroke) doc.lineWidth(lw).fillAndStroke(op.fill, op.stroke);
      else if (op.fill) doc.fill(op.fill);
      else doc.lineWidth(lw).stroke(op.stroke);
      if (op.dash) doc.undash();
      continue;
    }
    if (op.t === 'line') {
      if (op.dash) doc.dash(op.dash[0] * s, { space: op.dash[1] * s });
      doc
        .lineWidth(op.lw * s)
        .strokeColor(op.stroke)
        .moveTo(x + op.x1 * s, y + op.y1 * s)
        .lineTo(x + op.x2 * s, y + op.y2 * s)
        .stroke();
      if (op.dash) doc.undash();
      continue;
    }
    if (op.t === 'text') {
      doc
        .font(op.weight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(op.size * s)
        .fillColor(op.fill);
      doc.text(op.s, x + op.x * s, y + op.y * s, {
        width: op.w * s,
        align: op.align || 'left',
        characterSpacing: op.tracking || 0,
        lineBreak: false,
      });
    }
  }
  doc.restore();
}

/* ------------------------------------------------------------- svg renderer */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Emit the primitives as SVG.
 * @param opts.grid     include the faint grid (off for the 120px thumbnail,
 *                      where 26-unit spacing would turn into moire)
 * @param opts.texts    include the code labels (off below ~8px of real size)
 * @param opts.lwScale  stroke multiplier to survive downscaling
 */
export function svgOps(opts = {}) {
  const { grid = true, texts = true, lwScale = 1, zones = ['frame', 'plan', 'index'] } = opts;
  const out = [];
  for (const op of OPS) {
    if (!zones.includes(op.z)) continue;
    if (op.t === 'grid') {
      if (!grid) continue;
      const d = `M${op.step} 0H0V${op.step}`;
      out.push(
        `<pattern id="cagrid" width="${op.step}" height="${op.step}" patternUnits="userSpaceOnUse">` +
          `<path d="${d}" fill="none" stroke="${op.color}" stroke-width="${op.lw * lwScale}"/></pattern>`
      );
      out.push(
        `<rect x="${op.x}" y="${op.y}" width="${op.w}" height="${op.h}" fill="url(#cagrid)"/>`
      );
      continue;
    }
    if (op.t === 'rect') {
      const a = [`x="${op.x}"`, `y="${op.y}"`, `width="${op.w}"`, `height="${op.h}"`];
      a.push(`fill="${op.fill || 'none'}"`);
      if (op.stroke) {
        a.push(`stroke="${op.stroke}"`, `stroke-width="${op.lw * lwScale}"`);
        if (op.dash) a.push(`stroke-dasharray="${op.dash[0]} ${op.dash[1]}"`);
      }
      out.push(`<rect ${a.join(' ')}/>`);
      continue;
    }
    if (op.t === 'line') {
      const a = [
        `x1="${op.x1}"`,
        `y1="${op.y1}"`,
        `x2="${op.x2}"`,
        `y2="${op.y2}"`,
        `stroke="${op.stroke}"`,
        `stroke-width="${op.lw * lwScale}"`,
        `fill="none"`,
      ];
      out.push(`<line ${a.join(' ')}/>`);
      continue;
    }
    if (op.t === 'text') {
      if (!texts) continue;
      const cx = op.align === 'center' ? op.x + op.w / 2 : op.x;
      const anchor = op.align === 'center' ? 'middle' : 'start';
      /* SVG puts y on the baseline; pdfkit puts it on the line box top. */
      out.push(
        `<text x="${cx}" y="${(op.y + op.size * 0.78).toFixed(1)}" fill="${op.fill}"` +
          ` font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="${op.size}"` +
          ` font-weight="600" letter-spacing="${op.tracking || 0}" text-anchor="${anchor}">` +
          `${esc(op.s)}</text>`
      );
    }
  }
  return out.join('');
}

/**
 * The site thumbnail: an A4 portrait miniature of the real cover page —
 * red rule, title, lead, the site plan, the five code chips, footer rule.
 * Strokes are multiplied because this is displayed at 120px wide.
 */
export function svgSheet() {
  const W = 200;
  const H = 283; // 1:1.414, the .photo-slot--doc ratio
  const M = 24;
  const PW = W - M * 2; // 152
  const planScale = PW / ART.w;
  const planY = 110;
  /* The plan is drawn at ~0.29 scale and then displayed at ~0.6, so a 1.3
     stroke would land on the screen at 0.23px — invisible. Multiply to put it
     back near 1px. */
  const lwScale = 4.6;

  const bars = [
    [M, 26, 44, 3, RED], // the red rule the cover opens with
    [M, 36, 56, 2, RED], // eyebrow
    [M, 46, 124, 5, INK], // title, line 1
    [M, 57, 82, 5, INK], // title, line 2
    [M, 72, PW, 2, HAIR], // lead
    [M, 79, 134, 2, HAIR],
    [M, 86, 100, 2, HAIR],
  ]
    .map(([x, y, w, h, fill]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`)
    .join('');

  /* Index row: five chips, the fourth red. No labels — at this size "VET-04"
     would be 3px of grey mush. */
  const chipW = 26;
  const chipGap = (PW - chipW * 5) / 4;
  const chips = [0, 1, 2, 3, 4]
    .map((i) => {
      const x = M + i * (chipW + chipGap);
      const red = i === ACCENT;
      return `<rect x="${x.toFixed(1)}" y="208" width="${chipW}" height="8" rx="1" fill="none" stroke="${
        red ? RED : HAIR
      }" stroke-width="${red ? 1.4 : 0.9}"/>`;
    })
    .join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Factory vetting checklist cover">` +
    `<rect width="${W}" height="${H}" fill="#FFFFFF"/>` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${RULE}" stroke-width="0.8"/>` +
    bars +
    /* plan only: the sheet draws its own frame and its own index row, so
       including the band's would put two of each on the page. */
    `<g transform="translate(${M},${planY}) scale(${planScale.toFixed(4)})">` +
    svgOps({ grid: false, texts: false, lwScale, zones: ['plan'] }) +
    `</g>` +
    chips +
    `<rect x="${M}" y="232" width="${PW}" height="1" fill="${RULE}"/>` +
    `<rect x="${M}" y="240" width="44" height="2" fill="${HAIR}"/>` +
    `<rect x="${W - M - 12}" y="240" width="12" height="2" fill="${HAIR}"/>` +
    `</svg>`
  );
}

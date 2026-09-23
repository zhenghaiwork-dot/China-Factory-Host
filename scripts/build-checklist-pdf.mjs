/**
 * build-checklist-pdf.mjs
 *
 * Generates public/downloads/factory-vetting-checklist.pdf — the asset behind the
 * DownloadGate email gate on /about/how-we-vet-factories/.
 *
 * CONTENT PROVENANCE
 * Every string below is copied verbatim from a single source file:
 *   src/pages/about/how-we-vet-factories/index.astro
 * Nothing is invented, paraphrased or "improved". Field-by-field origin:
 *   - STEPS[].n / code / title / body / evidence[]  -> <ProcessSteps items={[...]}>   (lines 76-139)
 *   - SIGNALS.caption / labelCol / columns / rows / footnote
 *                                                  -> <ComparisonTable ...>            (lines 151-214)
 *   - RED_FLAGS[] (HTML <b> stripped, bold preserved in type) -> <RedFlags items={...}> (lines 225-239)
 *   - COVER_LEAD -> const description                                                  (lines 16-17)
 *   - COVER_TITLE words -> "Get the factory vetting checklist" hero button             (line 50)
 *   - FOOTER_COMMISSION -> TrustBar figure 00 / "Commission taken from suppliers"      (line 63)
 *                          + FAQ "Do you take commission from factories?" / "Never."   (lines 292-294)
 *
 * ENCODING NOTE
 * pdfkit's standard 14 fonts use WinAnsiEncoding, which covers U+2019 (’), U+201C/201D (“ ”),
 * U+2014 (—) and U+00B7 (·). In practice those still trip up when text comes from different
 * editors/toolchains. `norm()` below downgrades them to ASCII before any measurement or drawing,
 * so layout math and encoding can never disagree. Keep it applied everywhere.
 *
 * Run: node scripts/build-checklist-pdf.mjs
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'downloads');
const OUT_FILE = path.join(OUT_DIR, 'factory-vetting-checklist.pdf');

/* ------------------------------------------------------------------ palette */
const RED = '#D0202A';
const GREEN = '#166534';
const INK = '#1A1917';
const GREY = '#616670';
const RULE = '#DCD9D4';
const ZEBRA = '#F7F6F4';

/* -------------------------------------------------------------------- layout */
const PAGE = 'A4';
const MARGIN = 52; // pt, both sides
const W = 595.28;
const H = 841.89;
const FOOT_ZONE = 34; // reserved strip above the bottom margin
const CONTENT_W = W - MARGIN * 2;
const BOTTOM = H - MARGIN - FOOT_ZONE;

const F = { reg: 'Helvetica', bold: 'Helvetica-Bold', obl: 'Helvetica-Oblique' };

/* ------------------------------------------------------------------- helpers */

/** Downgrade typographic punctuation that can upset WinAnsiEncoding. See header note. */
function norm(s) {
  return String(s)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2012\u2013\u2014\u2015]/g, '-')
    .replace(/\u00B7/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ');
}

/** Strip the one inline markup pattern used by the site (<b>…</b>) into runs. */
function stripMarkup(html) {
  const runs = [];
  const re = /<b>([\s\S]*?)<\/b>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) runs.push({ text: norm(html.slice(last, m.index)), font: F.reg });
    runs.push({ text: norm(m[1]), font: F.bold });
    last = re.lastIndex;
  }
  if (last < html.length) runs.push({ text: norm(html.slice(last)), font: F.reg });
  return runs;
}

/* -------------------------------------------------------------------- content
 * Copied verbatim from src/pages/about/how-we-vet-factories/index.astro.      */

const COVER_TITLE = 'Factory Vetting Checklist';
const COVER_EYEBROW = 'Vetting method';
const COVER_LEAD =
  'The single most expensive mistake in China sourcing is paying a company that does not make anything. Here are the five checks we run, in order, and what each is allowed to conclude.';

const STEPS_LEAD =
  'We run them in the same sequence every time, because each one decides whether it is worth running the next.';

const STEPS = [
  {
    n: '01',
    code: 'VET-01',
    title: 'Business licence and legal status',
    body: "Before anything else we pull the company's registration record and read the fields that matter, not just the licence photo they send you.",
    evidence: [
      'Unified Social Credit Code checked against the national enterprise credit register',
      'Registered capital, establishment date and operating status — whether the entity is still active',
      'Legal representative name, and whether the person you are talking to is that person',
      'Whether the legal entity name would match the beneficiary name on a bank transfer later',
    ],
  },
  {
    n: '02',
    code: 'VET-02',
    title: 'Registered scope versus registered address',
    body: 'A company can be legally real and still not manufacture anything. The gap between what it says it makes and where it says it makes it is where most trading companies show up.',
    evidence: [
      'Registered business scope — does it list production and manufacturing, or only wholesale and retail?',
      'Registered address compared with the address they want to take you to',
      'Whether the address resolves to an industrial plot or to an office floor in a commercial building',
      'Whether multiple "factories" they offer share one registered address',
    ],
  },
  {
    n: '03',
    code: 'VET-03',
    title: 'Capacity and equipment, arithmetically',
    body: 'Claimed output is easy to say and easy to test. We check whether the floor, the headcount and the machine list can physically produce what they quoted.',
    evidence: [
      'Machine list with counts, and whether those machines are the ones that make your product',
      'Shift pattern and working days per month, multiplied against per-unit cycle time',
      'Floor area against stated output — a surprisingly reliable smell test',
      'Recent production evidence: order book, utility records, or a line actually running during the visit',
    ],
  },
  {
    n: '04',
    code: 'VET-04',
    title: 'Walking the floor',
    body: 'This step only exists because it is easy to be polite and be fooled. We look for the specific things that separate a plant from a showroom with a good speaker.',
    evidence: [
      'The tooling and mould store — a real maker keeps its own tooling, marked and traceable',
      'Raw material and work-in-progress inventory, not only finished samples',
      'Worker count and line activity at the hour we arrive, not at the hour they prefer',
      'Incoming goods labelling, which often reveals who actually made the parts',
    ],
  },
  {
    n: '05',
    code: 'VET-05',
    title: 'Somebody who can say yes',
    body: 'A visit without a decision-maker produces photos and no quotes. We treat "the boss is travelling" as a failed visit and say so in the report.',
    evidence: [
      'Production manager or owner physically present for the meeting, not only a sales representative',
      'Can they quote tooling lead time and MOQ without calling someone else?',
      'Do they know their own tolerances, defects rates and scrap handling?',
      'Written confirmation of who signs the contract and who receives payment',
    ],
  },
];

const SIGNALS = {
  caption: 'Typical signals of a real factory versus a trading company',
  labelCol: 'Signal',
  columns: [
    { name: 'Real factory', sub: 'what we expect to see' },
    { name: 'Trading company', sub: 'what usually shows instead' },
  ],
  rows: [
    {
      label: 'Live video walk-through request',
      values: ['Arranged within a day or two', 'Excuses, delays, or a pre-recorded clip'],
    },
    {
      label: 'Registered business scope',
      values: [
        'Includes production and manufacturing',
        'Only wholesale, retail or import/export',
      ],
    },
    {
      label: 'Registered address',
      values: [
        'Matches the production site',
        'Office address, or several "factories" share one',
      ],
    },
    {
      label: 'Tooling and mould store',
      values: [
        'Exists, labelled, traceable to customers',
        'Cannot be shown, or "kept at a partner plant"',
      ],
    },
    {
      label: 'Equipment photos',
      values: [
        'Floor and machines, dated and specific',
        'Catalogue rooms and product close-ups only',
      ],
    },
    {
      label: 'Price against peers',
      values: [
        'Explainable by process or material choice',
        'Far below peers for identical specification',
      ],
    },
    {
      label: 'Who receives payment',
      values: [
        'The legal entity on the licence',
        'A personal account, or a different company name',
      ],
    },
    {
      label: 'Technical answers',
      values: [
        'Answered by the production manager',
        'Every question needs "checking with the factory"',
      ],
    },
  ],
  footnote:
    'These are patterns observed on visits, not a certification. We publish them because teaching you to spot them costs us nothing and makes our actual on-site work easier to trust.',
};

const SIGNALS_LEAD =
  'None of these signals proves anything alone. Three or four together is usually enough to decide whether to spend a day visiting.';

const RED_FLAGS = [
  '<b>Refuses any live or unedited video of the floor</b> before you commit to a visit',
  '<b>The registered address is not where they want to take you</b>, and the explanation keeps changing',
  '<b>No production equipment in any photo, ever</b> — only showroom and catalogue images',
  '<b>Quoted far below comparable suppliers</b> for a specification described as identical',
  '<b>Payment details do not match the licence entity</b>, or a personal account is requested',
  '<b>Scope of business lists trading only</b> while they describe themselves as the manufacturer',
  '<b>Pressure to place the deposit now</b> to "lock the line", before any visit has happened',
];

const FLAGS_LEAD =
  'Red flags we treat as the end of the conversation.';

const FOOTER_DOMAIN = 'chinafactoryhost.com';
const FOOTER_COMMISSION = 'We take no commission from suppliers.';

/* -------------------------------------------------------------------- drawing */

function stairs(doc, str, opts) {
  return doc.heightOfString(norm(str), opts);
}

/** Mixed-font paragraph (used to render the <b> runs without losing them). */
function richText(doc, runs, x, width, opts = {}) {
  const words = [];
  runs.forEach((r) => {
    r.text.split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, font: r.font }));
  });
  doc.x = x;
  doc.y = opts.y !== undefined ? opts.y : doc.y;
  words.forEach((word, i) => {
    doc.font(word.font).fontSize(opts.size || 9.5);
    doc.text(word.w + (i < words.length - 1 ? ' ' : ''), x, doc.y, {
      width,
      continued: i < words.length - 1,
      align: opts.align || 'left',
      lineGap: opts.lineGap || 0,
    });
  });
  doc.font(F.reg);
}

function measureRich(doc, runs, width, size, lineGap = 0) {
  const str = runs.map((r) => r.text).join(' ');
  doc.font(F.reg).fontSize(size);
  return doc.heightOfString(str, { width, lineGap });
}

function newPage(doc) {
  doc.addPage();
  doc.x = MARGIN;
  doc.y = MARGIN;
}

function sectionHead(doc, eyebrow, title, lead) {
  ensure(doc, lead ? 96 : 78);
  const y0 = doc.y;
  doc.font(F.bold).fontSize(8.5).fillColor(RED).text(norm(eyebrow).toUpperCase(), MARGIN, y0, {
    characterSpacing: 1.3,
  });
  doc.moveDown(0.35);
  doc.font(F.bold).fontSize(16).fillColor(INK).text(norm(title), MARGIN, doc.y, { width: CONTENT_W });
  doc.moveDown(0.15);
  doc
    .save()
    .rect(MARGIN, doc.y + 5, 34, 2)
    .fill(RED)
    .restore();
  doc.y += 16;
  if (lead) {
    doc.font(F.reg).fontSize(9.5).fillColor(GREY).text(norm(lead), MARGIN, doc.y, {
      width: CONTENT_W,
      lineGap: 2,
    });
    doc.y += 12;
  } else {
    doc.y += 4;
  }
}

function my(doc, h) {
  return doc.y + h <= BOTTOM;
}

function ensure(doc, h) {
  if (!my(doc, h)) newPage(doc);
}

/* ---------------------------------------------------------------------- cover */

function drawCover(doc) {
  doc.y = MARGIN + 26;
  doc.save().rect(MARGIN, doc.y, 44, 3).fill(RED).restore();
  doc.y += 22;
  doc.font(F.bold).fontSize(8.5).fillColor(RED).text(norm(COVER_EYEBROW).toUpperCase(), MARGIN, doc.y, {
    characterSpacing: 1.4,
  });
  doc.y += 16;
  doc.font(F.bold).fontSize(30).fillColor(INK).text(norm(COVER_TITLE), MARGIN, doc.y, {
    width: CONTENT_W - 30,
    lineGap: 2,
  });
  doc.y += 16;
  doc.font(F.reg).fontSize(11.5).fillColor(INK).text(norm(COVER_LEAD), MARGIN, doc.y, {
    width: CONTENT_W - 60,
    lineGap: 3,
  });
  doc.y += 26;

  doc.save().rect(MARGIN, doc.y, CONTENT_W, 1).fill(RULE).restore();
  doc.y += 18;

  doc.font(F.reg).fontSize(9).fillColor(GREY).text(
    norm(
      'Contents: 01-05 five documented checks, each with the evidence we ask for · eight comparison signals · seven red flags. Tick the boxes as you go; the page leaves room for your own notes.'
    ),
    MARGIN,
    doc.y,
    { width: CONTENT_W, lineGap: 2.5 }
  );
  doc.y += 20;

  doc.font(F.reg).fontSize(9).fillColor(GREY).text(norm(STEPS_LEAD), MARGIN, doc.y, {
    width: CONTENT_W - 60,
    lineGap: 2.5,
  });
  doc.fillColor(INK);
}

/* ---------------------------------------------------------------------- steps */

function stepHeight(doc, step) {
  let h = 26; // number + code row
  doc.font(F.bold).fontSize(13);
  h += doc.heightOfString(norm(step.title), { width: CONTENT_W - 60 }) + 8;
  doc.font(F.reg).fontSize(9.5);
  h += doc.heightOfString(norm(step.body), { width: CONTENT_W, lineGap: 2 }) + 10;
  step.evidence.forEach((ev) => {
    h += doc.heightOfString(norm(ev), { width: CONTENT_W - 22, lineGap: 2 }) + 9; // 9 = handwriting slack
  });
  h += 34; // notes block
  return h;
}

function drawStep(doc, step) {
  ensure(doc, stepHeight(doc, step));
  const x = MARGIN;
  const top = doc.y;

  doc.font(F.bold).fontSize(20).fillColor(RED).text(step.n, x, top, { characterSpacing: 1 });
  doc.font(F.bold).fontSize(8).fillColor(GREY).text(step.code, x + 34, top + 9, {
    characterSpacing: 0.8,
  });
  const titleRight = x + 100;
  const titleW = CONTENT_W - 100;
  const nLines =
    doc.font(F.bold).fontSize(13).heightOfString(norm(step.title), { width: titleW }) / 15.6;
  doc.font(F.bold).fontSize(13).fillColor(INK).text(norm(step.title), titleRight, top + (20 - 15.6 * Math.ceil(nLines)) / 2, {
    width: titleW,
    lineGap: 1,
  });
  doc.y = Math.max(doc.y, top + 24);

  doc.font(F.reg).fontSize(9.5).fillColor(INK).text(norm(step.body), x, doc.y + 2, {
    width: CONTENT_W,
    lineGap: 2,
  });
  doc.y += 12;

  step.evidence.forEach((ev) => {
    const evH = doc.font(F.reg).fontSize(9.5).heightOfString(norm(ev), {
      width: CONTENT_W - 22,
      lineGap: 2,
    });
    ensure(doc, evH + 9);
    const boxY = doc.y + 1;
    doc.save().rect(x + 1, boxY, 9, 9).lineWidth(0.7).stroke(INK).restore();
    doc.font(F.reg).fontSize(9.5).fillColor(INK).text(norm(ev), x + 22, doc.y, {
      width: CONTENT_W - 22,
      lineGap: 2,
    });
    doc.y += 9; // handwriting slack between items
  });

  doc.y += 2;
  ensure(doc, 40);
  doc.font(F.bold).fontSize(7.5).fillColor(GREY).text('NOTES', x, doc.y + 1, { characterSpacing: 0.8 });
  doc.font(F.reg).fontSize(9.5).fillColor(INK);
  const ruleTop = doc.y + 13;
  doc.save().lineWidth(0.5).strokeColor(RULE);
  for (let i = 0; i < 2; i++) {
    const ly = ruleTop + i * 15;
    doc.moveTo(x, ly).lineTo(x + CONTENT_W, ly).stroke();
  }
  doc.restore();
  doc.y = ruleTop + 2 * 15 + 16;
}

/* ----------------------------------------------------------------- comparison */

const LBL_W = 150;
const COL_GAP = 12;
const COL_W = (CONTENT_W - LBL_W - COL_GAP * 2) / 2;

function tableHeader(doc) {
  const top = doc.y;
  doc.font(F.bold).fontSize(8).fillColor(GREY).text(norm(SIGNALS.labelCol).toUpperCase(), MARGIN, top, {
    width: LBL_W - COL_GAP,
    characterSpacing: 1,
  });
  doc.font(F.bold).fontSize(8.5).fillColor(GREEN).text(norm(SIGNALS.columns[0].name).toUpperCase(), MARGIN + LBL_W, top, {
    width: COL_W,
    characterSpacing: 1,
  });
  doc.font(F.bold).fontSize(8.5).fillColor(GREY).text(norm(SIGNALS.columns[1].name).toUpperCase(), MARGIN + LBL_W + COL_W + COL_GAP, top, {
    width: COL_W,
    characterSpacing: 1,
  });
  doc.font(F.obl).fontSize(8).fillColor(GREY);
  doc.text(norm(SIGNALS.columns[0].sub), MARGIN + LBL_W, doc.y, { width: COL_W });
  doc.y = top;
  doc.font(F.obl).fontSize(8).fillColor(GREY).text(norm(SIGNALS.columns[1].sub), MARGIN + LBL_W + COL_W + COL_GAP, doc.y, {
    width: COL_W,
  });
  doc.y += 8;
  doc.save().rect(MARGIN, doc.y, CONTENT_W, 1).fill(INK).restore();
  doc.y += 9;
}

function drawTable(doc) {
  tableHeader(doc);
  SIGNALS.rows.forEach((row, idx) => {
    doc.font(F.bold).fontSize(9);
    const hLabel = doc.heightOfString(norm(row.label), { width: LBL_W - COL_GAP, lineGap: 1 });
    doc.font(F.reg).fontSize(8.8);
    const h0 = doc.heightOfString(norm(row.values[0]), { width: COL_W, lineGap: 1 });
    const h1 = doc.heightOfString(norm(row.values[1]), { width: COL_W, lineGap: 1 });
    const rowH = Math.max(hLabel, h0, h1) + 14;

    if (!my(doc, rowH + 6)) {
      newPage(doc);
      tableHeader(doc);
    }
    const top = doc.y;
    if (idx % 2 === 1) {
      doc.save().rect(MARGIN, top - 5, CONTENT_W, rowH).fill(ZEBRA).restore();
    }
    doc.font(F.bold).fontSize(9).fillColor(INK).text(norm(row.label), MARGIN, top, {
      width: LBL_W - COL_GAP,
      lineGap: 1,
    });
    doc.y = top;
    doc.font(F.reg).fontSize(8.8).fillColor(GREEN).text(norm(row.values[0]), MARGIN + LBL_W, top, {
      width: COL_W,
      lineGap: 1,
    });
    doc.y = top;
    doc.font(F.reg).fontSize(8.8).fillColor(INK).text(norm(row.values[1]), MARGIN + LBL_W + COL_W + COL_GAP, top, {
      width: COL_W,
      lineGap: 1,
    });
    doc.y = top + rowH;
    doc.save().rect(MARGIN, doc.y - 6, CONTENT_W, 0.5).fill(RULE).restore();
  });

  doc.y += 12;
  doc.font(F.reg).fontSize(8.3).fillColor(GREY).text(norm(SIGNALS.footnote), MARGIN, doc.y, {
    width: CONTENT_W,
    lineGap: 2,
  });
}

/* ------------------------------------------------------------------ red flags */

function drawRedFlags(doc) {
  RED_FLAGS.forEach((item) => {
    const runs = stripMarkup(item);
    const h = measureRich(doc, runs, CONTENT_W - 18, 10, 2);
    ensure(doc, h + 12);
    const top = doc.y;
    doc.save().rect(MARGIN, top + 3, 6, 6).fill(RED).restore();
    richText(doc, runs, MARGIN + 18, CONTENT_W - 18, { size: 10, lineGap: 2, y: top });
    doc.y += 12;
  });
}

/* ----------------------------------------------------------------------- main */

function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const chunks = [];
  const doc = new PDFDocument({
    size: PAGE,
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true,
    info: {
      Title: COVER_TITLE,
      Author: FOOTER_DOMAIN,
      Subject: COVER_LEAD,
      Creator: 'chinafactoryhost.com',
    },
  });

  doc.on('data', (c) => chunks.push(c));

  drawCover(doc);

  newPage(doc);
  sectionHead(doc, 'The method', 'Five checks, in this order.', STEPS_LEAD);
  STEPS.forEach((s, i) => {
    drawStep(doc, s);
    if (i < STEPS.length - 1) doc.y += 8;
  });

  newPage(doc);
  sectionHead(doc, 'Pattern recognition', 'What the difference actually looks like.', SIGNALS_LEAD);
  doc.font(F.reg).fontSize(9).fillColor(INK).text(norm(SIGNALS.caption), MARGIN, doc.y, {
    width: CONTENT_W,
  });
  doc.y += 14;
  drawTable(doc);

  newPage(doc);
  sectionHead(doc, 'Walk-away list', FLAGS_LEAD, null);
  drawRedFlags(doc);

  // Page furniture — page numbers once pagination is known.
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const footY = H - MARGIN - 6;
    doc.save().rect(MARGIN, footY - 14, CONTENT_W, 0.5).fill(RULE).restore();
    doc.font(F.reg).fontSize(8).fillColor(GREY);
    doc.text(i === 0 ? FOOTER_COMMISSION : norm(FOOTER_DOMAIN), MARGIN, footY, { width: CONTENT_W - 60 });
    doc.text(String(i + 1), MARGIN + CONTENT_W - 40, footY, { width: 40, align: 'right' });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(OUT_FILE, buf);
      resolve({ file: OUT_FILE, pages: range.count, bytes: buf.length });
    });
    doc.on('error', reject);
  });
}

build()
  .then(({ file, pages, bytes }) => {
    console.log(`PDF written: ${file}`);
    console.log(`Pages: ${pages}`);
    console.log(`Size: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KB)`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

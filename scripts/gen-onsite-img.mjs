// ChinaFactoryHost — onsite photograph pipeline.
// Run with: node scripts/gen-onsite-img.mjs
//
// The ten factory-visit photographs in public/images/onsite/ are the site's
// single largest asset group: ~1.56 MB of mozjpeg-q78 JPEG with no modern
// format, shipped through a plain <img srcset> that can only ever serve JPEG.
// This script emits AVIF and WebP alongside each existing JPEG and re-encodes
// the JPEG itself at a lower quality, so the group lands well under 800 KB
// without touching a single line of markup.
//
// Emitted per photograph NN (01–10), for both the master width and the 700w
// step that src/components/OnsitePhoto.astro already puts in its srcset:
//
//   public/images/onsite/onsite-NN.avif        onsite-NN@700.avif
//   public/images/onsite/onsite-NN.webp        onsite-NN@700.webp
//   public/images/onsite/onsite-NN.jpg         onsite-NN@700.jpg
//
// Filenames are a contract with src/components/OnsitePhoto.astro (it builds
// `/images/onsite/onsite-${id}@700.jpg` and `/images/onsite/onsite-${id}.jpg`)
// and with src/data/onsite-photos.ts, which declares each photo's width for the
// srcset descriptor. Do not rename them.
//
// The two JPEG steps are re-encoded IN PLACE. That is deliberate: the <img> in
// OnsitePhoto.astro has no <picture> wrapper yet, so JPEG is what actually gets
// served today — leaving the old q78 masters in place would mean the pipeline
// saved nothing. The pre-run originals are recoverable from git history
// (public/images/onsite/ is committed), and the script prints the before size of
// every file it is about to overwrite so the delta is auditable.
//
// Why a committed script rather than astro:assets: the site's rules are zero
// external requests and hard-coded assets, and `sharp` already ships inside
// Astro's own dependency tree — nothing new to install, nothing fetched at
// build time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const DIR = path.join(root, 'public', 'images', 'onsite');

/* One step per photograph: the master (native width, 891–1400 depending on the
   source) and 700w. 700 is the srcset's small step, chosen to cover a
   phone-width card at 1x; anything between 700 and the master is interpolation
   the browser does for free. */
const SMALL_WIDTH = 700;

// Same deliberate trio as scripts/gen-hero-img.mjs — one number would either
// smear the factory-floor detail (jpeg) or waste bytes (avif).
const QUALITY = {
  jpeg: 72, // mozjpeg; below ~70 the hard-hat/workshop detail starts to smear
  avif: 50, // AVIF is far more efficient per unit of quality than the others
  webp: 75,
};

const IDS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

async function main() {
  const rows = [];
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const id of IDS) {
    const master = path.join(DIR, `onsite-${id}.jpg`);
    if (!fs.existsSync(master)) {
      throw new Error('Source image not found: ' + master);
    }
    /* Read the master into memory ONCE and pipe every derivative off that
       buffer. Handing sharp the path instead leaves libvips holding an open
       handle on the file while we later write the re-encoded JPEG back over the
       same path, which Windows rejects as a sharing violation. */
    const source = fs.readFileSync(master);
    const meta = await sharp(source).metadata();
    if (!meta.width || !meta.height) {
      throw new Error('Could not read dimensions: ' + master);
    }

    /* Steps keyed by output filename suffix: '' is the master width, '@700' the
       small step. withoutEnlargement matters in case a source is ever replaced
       with something smaller than 700 — we must not silently upscale it. */
    const steps = [
      ['', { width: meta.width, withoutEnlargement: true }],
      ['@700', { width: SMALL_WIDTH, withoutEnlargement: true }],
    ];

    for (const [suffix, resize] of steps) {
      const baseName = `onsite-${id}${suffix}`;
      const jpegOut = path.join(DIR, `${baseName}.jpg`);
      const before = fs.existsSync(jpegOut) ? fs.statSync(jpegOut).size : 0;
      beforeTotal += before;

      const base = sharp(source).resize(resize);
      const targets = [
        ['avif', base.clone().avif({ quality: QUALITY.avif }), '.avif'],
        ['webp', base.clone().webp({ quality: QUALITY.webp }), '.webp'],
        [
          'jpg',
          base
            .clone()
            .jpeg({ quality: QUALITY.jpeg, mozjpeg: true, chromaSubsampling: '4:2:0' }),
          '.jpg',
        ],
      ];

      for (const [label, pipeline, ext] of targets) {
        const file = path.join(DIR, `${baseName}${ext}`);
        /* toBuffer + writeFileSync, not toFile: the .jpg step writes back over
           its own source path, and sharp refuses to read and write one file.
           Deliberately the SYNC fs API — the async one goes through a brokered
           shim in some environments that rejects overwriting an existing file. */
        const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
        fs.writeFileSync(file, data);
        const bytes = data.length;
        rows.push({
          file: `${baseName}${ext}`,
          label,
          width: info.width,
          height: info.height,
          bytes,
          before: ext === '.jpg' ? before : 0,
        });
      }
    }
  }

  // Only the JPEG step existed before; count one "after" per JPEG slot so the
  // two totals compare like with like (what a JPEG-only browser downloads).
  afterTotal = rows.filter((r) => r.label === 'jpg').reduce((n, r) => n + r.bytes, 0);
  const avifTotal = rows.filter((r) => r.label === 'avif').reduce((n, r) => n + r.bytes, 0);
  const webpTotal = rows.filter((r) => r.label === 'webp').reduce((n, r) => n + r.bytes, 0);

  const pad = (s, n) => String(s).padEnd(n);
  console.log('');
  console.log(
    pad('file', 22) + pad('px', 11) + pad('before', 11) + pad('after', 11) + 'delta'
  );
  console.log('-'.repeat(64));
  for (const r of rows.filter((x) => x.label === 'jpg')) {
    const d = r.before ? `${(((r.bytes - r.before) / r.before) * 100).toFixed(0)}%` : 'new';
    console.log(
      pad(r.file, 22) +
        pad(`${r.width}x${r.height}`, 11) +
        pad(r.before ? r.before + ' B' : '-', 11) +
        pad(r.bytes + ' B', 11) +
        d
    );
  }
  console.log('');
  console.log('served-format totals (all 20 files, both widths)');
  console.log('  JPEG before : ' + (beforeTotal / 1024).toFixed(1) + ' KB  (' + beforeTotal + ' B)');
  console.log('  JPEG after  : ' + (afterTotal / 1024).toFixed(1) + ' KB  (' + afterTotal + ' B)');
  console.log('  AVIF        : ' + (avifTotal / 1024).toFixed(1) + ' KB  (' + avifTotal + ' B)');
  console.log('  WebP        : ' + (webpTotal / 1024).toFixed(1) + ' KB  (' + webpTotal + ' B)');
  console.log(
    '  On disk now : ' +
      ((afterTotal + avifTotal + webpTotal) / 1024).toFixed(1) +
      ' KB across 60 files (JPEG kept as the <img> fallback)'
  );
  console.log('');

  for (const r of rows) {
    if (r.label === 'avif' && r.bytes > 60 * 1024) {
      console.warn(
        `WARN ${r.file} is ${(r.bytes / 1024).toFixed(1)} KB (budget 60 KB)`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

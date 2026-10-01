// ChinaFactoryHost — hero raster pipeline.
// Run with: node scripts/gen-hero-img.mjs
//
// The hero is the only photograph above the fold, and it is the single largest
// first-screen asset: public/images/hero.jpg is 1600x1000 / ~117 KB with no
// modern format and no srcset. This script emits the six files the homepage
// <picture> element points at:
//
//   public/images/hero-800.avif  hero-800.webp  hero-800.jpg
//   public/images/hero-1600.avif hero-1600.webp hero-1600.jpg
//
// Filenames are a contract with src/pages/index.astro — do not rename them.
// public/images/hero.jpg itself is deliberately left untouched: it is the
// <img> fallback inside <picture> and the og:image-style legacy URL.
//
// Why the pipeline exists as a committed script rather than an astro:assets
// call: the site's rules are zero external requests and hard-coded assets, and
// `sharp` already ships inside Astro's own dependency tree — so there is
// nothing new to install and nothing to fetch at build time.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'public', 'images', 'hero.jpg');
const OUT_DIR = path.join(root, 'public', 'images');

/* Two widths only. 1600 covers the widest hero slot on a 2x laptop; 800 serves
   phones and 1x tablet widths, where a 1600-wide file is four times the pixels
   anybody can see. Anything between is interpolation the browser can do for
   free, so a third step would buy nothing but another cached variant. */
const WIDTHS = [800, 1600];

// Quality settings are a deliberate trio, not one number applied everywhere.
const QUALITY = {
  jpeg: 72, // mozjpeg; below ~70 the factory-floor detail starts to smear
  avif: 50, // AVIF is far more efficient per unit of quality than the others
  webp: 75,
};

async function main() {
  if (!fs.existsSync(SRC)) {
    throw new Error('Source image not found: ' + SRC);
  }

  const meta = await sharp(SRC).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('Could not read hero.jpg dimensions');
  }
  console.log(
    `source: public/images/hero.jpg ${meta.width}x${meta.height} ${meta.format}` +
      ` — ${fs.statSync(SRC).size} B`
  );

  const rows = [];
  for (const width of WIDTHS) {
    // `withoutEnlargement` matters for the 1600 step: if the source is ever
    // replaced with something smaller, we must not silently upscale it.
    const base = sharp(SRC).resize({ width, withoutEnlargement: true });
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
      const file = path.join(OUT_DIR, `hero-${width}${ext}`);
      const info = await pipeline.toFile(file);
      const bytes = (await fsp.stat(file)).size;
      rows.push({
        file: `hero-${width}${ext}`,
        label,
        width: info.width,
        height: info.height,
        bytes,
      });
    }
  }

  const srcBytes = fs.statSync(SRC).size;
  const pad = (s, n) => String(s).padEnd(n);
  console.log('');
  for (const r of rows) {
    console.log(
      pad(r.file, 20) + pad(`${r.width}x${r.height}`, 12) +
        pad(`${(r.bytes / 1024).toFixed(1)} KB`, 11) + pad(r.bytes + ' B', 10)
    );
  }
  console.log('');

  const avif800 = rows.find((r) => r.file === 'hero-800.avif');
  if (avif800 && avif800.bytes > 25 * 1024) {
    console.warn(
      `WARN hero-800.avif is ${(avif800.bytes / 1024).toFixed(1)} KB (budget 25 KB)`
    );
  }
  console.log('source stays as fallback: hero.jpg ' + srcBytes + ' B');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

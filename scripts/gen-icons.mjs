// ChinaFactoryHost — favicon + apple-touch-icon generator.
// Single source of truth for the brand mark. Run with: node scripts/gen-icons.mjs
// Output: public/favicon.svg         (transparent bg, big RED open-bay mark, ~80% fill)
//         public/favicon.ico         (16/32/48 PNG layers — Google Search requires pixel formats)
//         public/apple-touch-icon.png (180x180, white bg, same red mark — iOS needs opaque)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

// Brand palette (v3: red is now the primary colour).
const RED = '#E63946'; // the mark colour — primary colour
const RED_GLOW = '#FF8C7A'; // lighter red "lit bay" — the little red accent inside the opening
const WHITE = '#FFFFFF'; // apple-touch background (iOS requires opaque)

// Open-bay factory mark (same path as Logo.astro / favicon.svg).
const MARK =
  'M4,26 V19 L11,13 V19 L18,13 V19 L25,13 V26 H22 V20 H13 V26 H4 Z';
const VENT = 'M22,20 L27,15';
// Open-bay doorway interior (the "lit" rectangle x13..22, y20..26).
const DOOR = { x: 13, y: 20, w: 9, h: 6 };

// --- favicon.svg: transparent bg, red mark blown up to ~80% of the 32px canvas ---
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 11 27 17" width="32" height="32" role="img" aria-labelledby="cfh-f-title">
  <title id="cfh-f-title">ChinaFactoryHost</title>
  <!-- little red accent inside the open bay -->
  <rect x="${DOOR.x}" y="${DOOR.y}" width="${DOOR.w}" height="${DOOR.h}" fill="${RED_GLOW}"/>
  <g fill="none" stroke="${RED}" stroke-width="3" stroke-linejoin="miter" stroke-linecap="butt">
    <path d="${MARK}"/>
    <path d="${VENT}"/>
  </g>
</svg>
`;

// --- apple-touch SVG at 180x180, white bg, mark centred & scaled to ~80% width ---
const S = 6.26; // scale (mark width ~80% of 180)
const TX = -7; // translate x — centre horizontally
const TY = -32.1; // translate y — centre vertically
const doorX = DOOR.x * S + TX;
const doorY = DOOR.y * S + TY;
const doorW = DOOR.w * S;
const doorH = DOOR.h * S;
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="${WHITE}"/>
  <rect x="${doorX.toFixed(1)}" y="${doorY.toFixed(1)}" width="${doorW.toFixed(1)}" height="${doorH.toFixed(1)}" fill="${RED_GLOW}"/>
  <g transform="translate(${TX},${TY}) scale(${S})" fill="none" stroke="${RED}" stroke-width="3" stroke-linejoin="miter" stroke-linecap="butt">
    <path d="${MARK}"/>
    <path d="${VENT}"/>
  </g>
</svg>
`;

/* --- ICO container -----------------------------------------------------------
   We used to build this with png-to-ico, which does NOT store the PNGs you give
   it: it decodes them and re-emits every layer as an UNCOMPRESSED 32-bit BMP
   (plus a legacy AND mask). That makes the file size a pure function of the
   pixel count — w*h*4 bytes per layer — so 16+32+48 floored out at exactly
   15,086 B and the old 96 layer alone cost 38 KB. No encoder option can move
   it, because there is nothing to compress.

   The ICO format has allowed PNG-stored image data since Vista and every
   consumer we care about (all current browsers, Windows, macOS, and Google's
   favicon fetcher) reads it. So write the 6-byte header + 16-byte directory
   entries ourselves and append each layer's PNG bytes verbatim. Same sizes,
   same pixels, ~1/10th of the bytes. */
function buildIco(images) {
  const HEADER = 6;
  const ENTRY = 16;
  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved, must be 0
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4); // number of images

  const dir = Buffer.alloc(ENTRY * images.length);
  let offset = HEADER + dir.length;
  images.forEach((img, i) => {
    const e = i * ENTRY;
    dir.writeUInt8(img.size, e); // width  (0 would mean 256)
    dir.writeUInt8(img.size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette count — PNG layers have none
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // colour planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(img.data.length, e + 8); // bytes in resource
    dir.writeUInt32LE(offset, e + 12); // offset of image data
    offset += img.data.length;
  });

  return Buffer.concat([
    header,
    dir,
    ...images.map((img) => img.data),
  ]);
}

async function main() {
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favicon.trim() + '\n');

  /* favicon.ico: Google Search only accepts pixel formats (BMP/GIF/ICO/PNG/JPEG/
     PPM/TIFF — SVG is NOT supported since the 2026-08-28 doc update) AND wants
     at least 48px. The layer list is therefore a floor, not a budget line:
       16 — browser tab, bookmarks bar
       32 — Windows taskbar, retina tabs
       48 — Google SERP, Windows medium icons
     A 96 layer existed for no consumer we have and cost ~38 KB of the old
     51.9 KB file. Never shrink this to a single 32 layer: that is what breaks
     the SERP favicon again. */
  const sizes = [16, 32, 48];
  const layers = await Promise.all(
    sizes.map(async (size) => {
      // Render each size from the SVG at 4x, then downsample — the outline gets
      // smooth edges instead of 1-bit stair-stepping at 16px.
      const data = await sharp(Buffer.from(favicon), {
        density: 72 * (size / 32) * 4,
      })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();
      return { size, data };
    })
  );
  const ico = buildIco(layers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log(
    'Wrote public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png'
  );
  console.log(
    'favicon.ico: ' + ico.length + ' B · ' + layers.length + ' layers [' +
      layers.map((l) => l.size + '×' + l.size + ' ' + l.data.length + 'B').join(', ') +
      ']'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

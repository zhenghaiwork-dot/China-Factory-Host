// ChinaFactoryHost — favicon + apple-touch-icon generator.
// Single source of truth for the brand mark. Run with: node scripts/gen-icons.mjs
// Output: public/favicon.svg         (transparent bg, big RED open-bay mark, ~80% fill)
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

async function main() {
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favicon.trim() + '\n');
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Wrote public/favicon.svg and public/apple-touch-icon.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

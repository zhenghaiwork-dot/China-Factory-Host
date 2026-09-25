// ChinaFactoryHost — favicon + apple-touch-icon generator.
// Single source of truth for the brand mark. Run with: node scripts/gen-icons.mjs
// Output: public/favicon.svg  (teal tile, dark open-bay mark, lit doorway)
//         public/apple-touch-icon.png (180x180, full-bleed teal, for iOS home screen)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

// Brand palette (from og-default.svg / design system §3.2).
const TEAL = '#3FA9BC'; // "Host" wordmark accent — the eye-catching tile colour
const INK = '#171613'; // dark plate / mark ink
const LIGHT = '#F4F1EB'; // lit open-bay doorway — invites the click

// Open-bay factory mark (same path as Logo.astro / favicon.svg).
const MARK =
  'M4,26 V19 L11,13 V19 L18,13 V19 L25,13 V26 H22 V20 H13 V26 H4 Z';
const VENT = 'M22,20 L27,15';

// --- favicon.svg: framed viewBox so the mark fills the 32x32 tile ---
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 11 28 18" width="32" height="32" role="img" aria-labelledby="cfh-f-title">
  <title id="cfh-f-title">ChinaFactoryHost</title>
  <rect x="2" y="11" width="28" height="18" rx="5" fill="${TEAL}"/>
  <!-- lit open bay: the doorway glow that invites a click -->
  <rect x="13" y="20" width="9" height="6" fill="${LIGHT}"/>
  <g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="miter" stroke-linecap="butt">
    <path d="${MARK}"/>
    <path d="${VENT}"/>
  </g>
</svg>
`;

// --- apple-touch SVG at 180x180, mark centred & scaled, full-bleed teal ---
const S = 5.2; // scale
const TX = 9.4; // translate x
const TY = -6.4; // translate y
const doorX = 13 * S + TX;
const doorY = 20 * S + TY;
const doorW = 9 * S;
const doorH = 6 * S;
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="${TEAL}"/>
  <rect x="${doorX.toFixed(1)}" y="${doorY.toFixed(1)}" width="${doorW.toFixed(1)}" height="${doorH.toFixed(1)}" fill="${LIGHT}"/>
  <g transform="translate(${TX},${TY}) scale(${S})" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="miter" stroke-linecap="butt">
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

/**
 * build-cover-svg.mjs
 *
 * Writes public/images/checklist-cover.svg — the DownloadGate thumbnail.
 * Generated from scripts/cover-art.mjs so the thumbnail and the PDF cover page
 * can never drift apart.
 *
 * Run: node scripts/build-cover-svg.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgSheet } from './cover-art.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'images', 'checklist-cover.svg');

const svg = svgSheet();
fs.writeFileSync(OUT, svg + '\n');
console.log(`Cover SVG written: ${OUT}`);
console.log(`Size: ${Buffer.byteLength(svg)} bytes`);

// ChinaFactoryHost — decorative China outline watermark for .cta--inverse.
// Data source: AMap/DataV GeoAtlas standard boundaries (compliant source):
//   https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
//   35 features = 34 provincial-level regions (incl. Taiwan, HK, Macao, Hainan)
//   + adcode "100000_JD" = South China Sea ten-dash-line features.
// Compliance: full territory representation per national standards — Taiwan,
//   Hainan, HK/Macao and the dash line are all rendered; nothing omitted.
// Output: public/images/china-outline.svg
//   Monochrome warm-white (#F5F2EE family — same hue as the existing blueprint
//   grid) at low opacity, so it can never clash with the site palette.
// Run with: node scripts/gen-china-bg.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const cache = path.join(root, '_tmp_china_full.json');
const outPath = path.join(root, 'public', 'images', 'china-outline.svg');
const DATA_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

async function loadGeo() {
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8'));
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`fetch ${DATA_URL} -> ${res.status}`);
  const j = await res.json();
  fs.writeFileSync(cache, JSON.stringify(j));
  return j;
}

// Warm-white family — identical hue to the blueprint grid (rgba(245,242,238,.06)).
const INK = { r: 245, g: 242, b: 238 };
const FILL_OP = 0.03; // landmass fill
const STROKE_OP = 0.13; // coastline / provincial borders
const DASH_OP = 0.2; // nine-dash line — slightly stronger so it reads

async function main() {
  const geo = await loadGeo();

  // Collect polygons: { jd, rings: [outer, ...holes] }
  const polys = [];
  let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
  const see = (lon, lat) => {
    if (lon < lonMin) lonMin = lon;
    if (lon > lonMax) lonMax = lon;
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
  };
  for (const f of geo.features) {
    const g = f.geometry;
    if (!g) continue;
    const jd = String(f.properties.adcode) === '100000_JD';
    const multi = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
    for (const poly of multi) {
      for (const ring of poly) for (const [lon, lat] of ring) see(lon, lat);
      polys.push({ jd, rings: poly });
    }
  }

  // Equirectangular projection with a cos(mid-lat) x-correction, fitted to ~1000u.
  const lat0 = ((latMin + latMax) / 2) * (Math.PI / 180);
  const W0 = (lonMax - lonMin) * Math.cos(lat0);
  const H0 = latMax - latMin;
  const k = 1000 / Math.max(W0, H0);
  const W = +(W0 * k).toFixed(1);
  const H = +(H0 * k).toFixed(1);
  const px = (lon) => Math.round((lon - lonMin) * Math.cos(lat0) * k);
  const py = (lat) => Math.round((latMax - lat) * k);

  // Ring -> path string, dropping points closer than EPS to the last kept one.
  // Watermark-grade simplification: coarse but silhouette-accurate.
  const EPS = 2.2;
  // Drop micro-islets below MIN_RING — invisible at watermark opacity, but
  // they dominate the file size. Major islands (Taiwan / Hainan / coast) stay.
  const MIN_RING = 3;
  const ringToPath = (ring) => {
    let d = '';
    let lx = -1e9, ly = -1e9;
    for (let i = 0; i < ring.length; i++) {
      const x = px(ring[i][0]), y = py(ring[i][1]);
      const first = i === 0, last = i === ring.length - 1;
      if (!first && !last && Math.hypot(x - lx, y - ly) < EPS) continue;
      d += (first ? 'M' : 'L') + x + ',' + y;
      lx = x; ly = y;
    }
    return d + 'Z';
  };
  const ringBigEnough = (ring) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [lon, lat] of ring) {
      const x = px(lon), y = py(lat);
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    return Math.hypot(x1 - x0, y1 - y0) >= MIN_RING;
  };

  const land = [];
  const dash = [];
  for (const p of polys) {
    const rings = p.jd ? p.rings : p.rings.filter(ringBigEnough);
    if (!rings.length) continue;
    const d = rings.map(ringToPath).join('');
    (p.jd ? dash : land).push(`<path d="${d}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="China map outline">
  <!-- Decorative watermark. Boundary data: AMap/DataV GeoAtlas 100000_full
       (34 provincial regions incl. Taiwan / HK / Macao / Hainan + South China
       Sea ten-dash line). Full territory per national standards. -->
  <g fill="rgb(${INK.r} ${INK.g} ${INK.b})" fill-opacity="${FILL_OP}" stroke="rgb(${INK.r} ${INK.g} ${INK.b})" stroke-opacity="${STROKE_OP}" stroke-width="0.9" stroke-linejoin="round" fill-rule="evenodd">
    ${land.join('\n    ')}
  </g>
  <g fill="rgb(${INK.r} ${INK.g} ${INK.b})" fill-opacity="${DASH_OP}" stroke="rgb(${INK.r} ${INK.g} ${INK.b})" stroke-opacity="${DASH_OP}" stroke-width="0.8" stroke-linejoin="round" fill-rule="evenodd">
    ${dash.join('\n    ')}
  </g>
</svg>
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(
    `Wrote public/images/china-outline.svg (${kb} KB, viewBox ${W}x${H}, ` +
      `${land.length} land polys, ${dash.length} dash polys)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/* Regression guard: inline elements that butt straight up against surrounding text.

   Astro/JSX trims the newline that ends a line, so this source

       ...is in
       <a href="/guides/...">the guide</a>.

   renders as "is inthe guide." — no space between the text and the link.
   The fix is an explicit {' '} expression, which survives trimming.

   This checks the *built* output, not the source, because that is where the
   bug is visible. Run a build first. If dist/client is missing it skips
   rather than failing, so `npm test` still works on a clean checkout.

   Usage: node scripts/check-inline-spacing.mjs   (exit 1 if any hit) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'client');

if (!fs.existsSync(ROOT)) {
  console.log('skip: no dist/client — run `npm run build` first.');
  process.exit(0);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const INLINE = 'a|strong|em|b|i|code';
const hits = [];

for (const p of walk(ROOT)) {
  const rel = '/' + path.relative(ROOT, p).split(path.sep).join('/');
  /* script/style and attribute values can legitimately abut; ignore them */
  const body = fs
    .readFileSync(p, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '');

  /* before: [1]=preceding char [2]=open tag [3]=tag name
     after:  [1]=close tag     [2]=tag name  [3]=following char */
  const patterns = [
    ['before', new RegExp(`([A-Za-z0-9,.;:!?)\\]])(<(${INLINE})\\b[^>]*>)`, 'g'), 3],
    ['after', new RegExp(`(<\\/(${INLINE})>)([A-Za-z0-9(])`, 'g'), 2],
  ];

  for (const [kind, re, tagGroup] of patterns) {
    let m;
    while ((m = re.exec(body)) !== null) {
      const ctx = body.slice(Math.max(0, m.index - 45), m.index + 70).replace(/\s+/g, ' ');
      hits.push({ rel, kind, tag: m[tagGroup], ctx });
    }
  }
}

if (!hits.length) {
  console.log('inline spacing: no abutting inline elements found.');
  process.exit(0);
}

console.log(hits.length + ' abutting inline element(s)\n');
const byPage = new Map();
for (const h of hits) {
  if (!byPage.has(h.rel)) byPage.set(h.rel, []);
  byPage.get(h.rel).push(h);
}
for (const [rel, list] of byPage) {
  console.log(rel + '  (' + list.length + ')');
  for (const h of list) console.log(`   [${h.kind} <${h.tag}>]  …${h.ctx}…`);
}
console.log('\nFix by putting an explicit {\' \} between the text and the tag.');
process.exit(1);

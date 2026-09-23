/* build-sitemap.mjs — generates public/sitemap.xml from src/pages.
   Runs automatically before every `astro build` via the "prebuild" hook.
   Why not @astrojs/sitemap: zero new dependencies, and the route set is a
   plain directory walk (output:'static', every page is an index.astro under
   src/pages — note: writing a glob with star-star-slash inside a block comment
   terminates the comment, which is why this sentence is spelled out).
   Excludes the API route (server-rendered, not a document) and any draft dir.
   lastmod = the page file's own mtime, so pages that did not change keep
   their old lastmod and crawlers can trust the value. */
import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const PAGES = join(ROOT, 'src', 'pages');
const SITE_URL = 'https://chinafactoryhost.com';
const SKIP_DIRS = new Set(['api', 'prototypes']); // server routes / non-published drafts

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const urls = [];
  for (const e of entries) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      urls.push(...(await walk(full)));
    } else if (e.name === 'index.astro') {
      urls.push(full);
    }
  }
  return urls;
}

const files = await walk(PAGES);
const today = new Date().toISOString().slice(0, 10);

const rows = [];
for (const file of files) {
  const rel = relative(PAGES, file);
  // toPosix first: on Windows `sep` is '\', and the split('index.astro') prefix
  // already carries a trailing separator — appending another gave "path//".
  const dir = rel.split('index.astro')[0].split(sep).join('/');
  const urlPath = dir === '' ? '/' : '/' + dir;
  const mtime = (await stat(file)).mtime;
  rows.push(
    `  <url>\n    <loc>${SITE_URL}${urlPath}</loc>\n    <lastmod>${mtime
      .toISOString()
      .slice(0, 10)}</lastmod>\n  </url>`,
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join(
  '\n',
)}\n</urlset>\n`;

await mkdir(join(ROOT, 'public'), { recursive: true });
await writeFile(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap: wrote ${rows.length} urls to public/sitemap.xml`);

import { readFile } from 'node:fs/promises';

const { host, key } = JSON.parse(await readFile(new URL('../indexnow.config.json', import.meta.url), 'utf8'));
const origin = `https://${host}`;
const keyLocation = `${origin}/${key}.txt`;
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const supplied = args.filter(x => x !== '--dry-run');
if (!supplied.length) throw new Error('Provide changed URLs: node scripts/indexnow.mjs /contact/ /guides/yiwu-jewelry-market/');
const urlList = [...new Set(supplied.map(value => {
  const url = new URL(value, origin);
  if (url.origin !== origin || url.search || url.hash || url.username || url.password || !url.pathname.endsWith('/')) {
    throw new Error(`Use canonical HTTPS URLs on ${host}, without query strings or fragments: ${value}`);
  }
  return url.href;
}))];
if (urlList.length > 10000) throw new Error('Maximum 10,000 URLs per request.');
const payload = { host, key, keyLocation, urlList };
if (dry) {
  console.log(JSON.stringify({ ...payload, key: '[verification key]' }, null, 2));
} else {
  const get = url => fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  const proof = await get(keyLocation);
  if (!proof.ok || (await proof.text()).trim() !== key) throw new Error('Verification file is not live yet. Deploy first, then retry.');
  for (const url of urlList) {
    const response = await get(url);
    if (!response.ok) throw new Error(`Page not available: ${url} (${response.status})`);
    const html = await response.text();
    const tags = html.match(/<(?:link|meta)\b[^>]*>/gi) || [];
    const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
    const canonical = tags.find(tag => attr(tag, 'rel')?.toLowerCase() === 'canonical');
    if (attr(canonical || '', 'href') !== url) throw new Error(`Canonical mismatch: ${url}`);
    if (tags.some(tag => /^(robots|bingbot)$/i.test(attr(tag, 'name') || '') && /noindex|none/i.test(attr(tag, 'content') || '')) || /noindex|none/i.test(response.headers.get('x-robots-tag') || '')) throw new Error(`Page blocks indexing: ${url}`);
  }
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(30000),
  });
  if (![200, 202].includes(response.status)) throw new Error(`IndexNow HTTP ${response.status}: ${await response.text()}`);
  console.log(`IndexNow HTTP ${response.status}: ${urlList.length} URLs received${response.status === 202 ? '; key validation pending' : ''}. This does not confirm indexing.`);
}

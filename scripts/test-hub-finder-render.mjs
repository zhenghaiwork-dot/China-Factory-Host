/** Validate the built document and generate a no-script QA fixture in build output only.
 * Run after the isolated build: node scripts/test-hub-finder-render.mjs */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { SOURCING_PRODUCTS } from '../src/data/sourcing-products.ts';
import { HUB_FINDER_PATH } from '../src/lib/match-manufacturing-hubs.ts';
import { HUB_FINDER_TITLE, HUB_FINDER_DESCRIPTION, HUB_FINDER_CANONICAL, productDirectionSummary } from '../src/data/hub-finder-editorial.ts';

const build = resolve(process.argv[2] || '_hub-finder-preview');
const client = join(build, 'client');
const page = join(client, HUB_FINDER_PATH, 'index.html');
const html = readFileSync(page, 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, 'No duplicate DOM IDs');
assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'One page title');
assert.ok(html.includes('href="https://chinafactoryhost.com/tools/china-manufacturing-hub-finder/"'), 'Stable canonical');
assert.ok(/data-hf-interactive[^>]*hidden/.test(html), 'Interactive controls remain hidden without enhancement');
assert.ok(html.includes(`<title>${HUB_FINDER_TITLE} | ChinaFactoryHost</title>`), 'Descriptive tool title with site brand');
assert.ok(html.includes(`content="${HUB_FINDER_DESCRIPTION}"`), 'Matching meta description');
assert.ok(!/name="robots"[^>]*content="[^"]*noindex/.test(html), 'Public tool is indexable');
const seoScript = html.match(/<script\b[^>]*data-hf-structured-data[^>]*>([\s\S]*?)<\/script>/i);
assert.ok(seoScript, 'Tool structured data emitted server-side');
const graph = JSON.parse(seoScript[1])['@graph'];
assert.equal(new Set(graph.map((node) => node['@id'])).size, graph.length, 'Unique graph identities');
const collection = graph.find((node) => node['@type'] === 'CollectionPage');
const application = graph.find((node) => node['@type'] === 'WebApplication');
const productList = graph.find((node) => node['@type'] === 'ItemList');
assert.equal(collection.url, HUB_FINDER_CANONICAL);
assert.equal(application.url, HUB_FINDER_CANONICAL);
assert.equal(collection.mainEntity['@id'], productList['@id']);
assert.equal(collection.hasPart['@id'], application['@id']);
assert.equal(productList.numberOfItems, SOURCING_PRODUCTS.length);
assert.equal(application.isAccessibleForFree, true);
assert.ok(collection.citation.length > 0 && collection.citation.every((source) => html.includes(source.url)), 'Schema citations are present in the document');
assert.ok(!JSON.stringify(graph).match(/aggregateRating|reviewCount|"@type":"Product"/), 'No invented ratings or product-offer markup');
const answerTable = html.match(/<table\b[^>]*data-hf-answer-table[^>]*>([\s\S]*?)<\/table>/i)?.[1];
assert.ok(answerTable, 'Visible product-to-region answer table');
assert.equal([...answerTable.matchAll(/data-hf-answer-product=/g)].length, SOURCING_PRODUCTS.length);
for (const p of SOURCING_PRODUCTS) {
  assert.ok(html.includes(`id="product-${p.id}"`), 'Static product record: ' + p.id);
  assert.ok(html.includes(p.prepare[0]) && html.includes(p.questions[0]), 'Static practical advice: ' + p.id);
  const item = productList.itemListElement.find((row) => row.item.url === HUB_FINDER_CANONICAL + '#product-' + p.id)?.item;
  assert.equal(item?.name, p.name, 'Schema entry matches the product');
  assert.equal(item?.description, productDirectionSummary(p), 'Schema answer matches visible answer');
  assert.ok(answerTable.includes(productDirectionSummary(p)), 'Answer is HTML text, not only client state');
  assert.ok(answerTable.includes(`href="${HUB_FINDER_PATH}#product-${p.id}"`), 'Stable canonical fragment link');
}
assert.ok(html.includes('Specific direction: Develop or change the product'), 'Static custom-product branch');
assert.ok(html.includes('Huangyan, Taizhou') && html.includes('Longjiang, Shunde, Foshan'), 'Static manufacturing branches');
assert.ok(!html.includes('Ningbo would not be interested'), 'No unsupported quantity-to-region claim');
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map((m) => m[1]);
assert.ok(scripts.length > 0, 'Client scripts emitted');
for (const src of scripts) assert.ok(existsSync(join(client, src)), 'Emitted client script exists: ' + src);
const clientCode = scripts.map((src) => readFileSync(join(client, src), 'utf8')).join('\n');
assert.ok(clientCode.includes('data-hf-interactive'), 'Tool enhancement is in the emitted bundle');
assert.ok(clientCode.includes('plastic-household-goods'), 'Product rules are bundled locally');
// Remove comments first: BaseLayout’s explanatory comment contains the literal
// text “<script>”, which is not an HTML element and must not eat the closing comment.
const noScript = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
assert.ok(!/<script\b/i.test(noScript), 'No-script fixture has no scripts');
assert.ok(noScript.includes('data-hub-finder') && noScript.includes('</head><body'), 'Static body survives script removal');
assert.ok(noScript.includes('data-hf-answer-table') && noScript.includes('how-this-directory-works'), 'Answers and methodology survive without JavaScript');
const fixtureDir = join(client, '__hub-nojs');
mkdirSync(fixtureDir, { recursive: true });
writeFileSync(join(fixtureDir, 'index.html'), noScript, 'utf8');
console.log(`Hub finder rendered document passed: ${SOURCING_PRODUCTS.length} static products, conditional branches, unique IDs, canonical and local bundle. HTML ${(Buffer.byteLength(html) / 1024).toFixed(1)} KiB / gzip ${(gzipSync(html).length / 1024).toFixed(1)} KiB.`);
console.log('No-script fixture: /__hub-nojs/ (verification build only).');

/** Independent product expectations + exhaustive option coverage. Node 22.12+: use --experimental-strip-types. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SOURCING_PRODUCTS, PRODUCT_CATEGORIES } from '../src/data/sourcing-products.ts';
import { MANUFACTURING_HUBS } from '../src/data/manufacturing-hubs.ts';
import { HUB_DATA_VERSION } from '../src/data/hub-sources.ts';
import { matchManufacturingHubs as match, searchProducts, finderUrl, readFinderUrl, validateHubDirectory } from '../src/lib/match-manufacturing-hubs.ts';

assert.deepEqual(validateHubDirectory(), []);
const expected = {
  'seasonal-decorations': ['yiwu'], stationery: ['yiwu'], 'stock-toys': ['yiwu'],
  'plastic-household-goods': ['yiwu'], 'injection-moulds': ['huangyan'], 'vacuum-flasks': ['yongkang'],
  'electric-fans': ['cixi'], 'electric-heaters': ['cixi'], blenders: ['cixi'], pcb: ['baoan'],
  'smart-hardware': ['shenzhen'], 'cosmetic-packaging': ['baiyun'], 'cosmetic-filling': ['baiyun'],
  'woven-fabric': ['keqiao'], 'knitted-fabric': ['keqiao'], 'curtain-fabric': ['keqiao'],
  'office-chairs': ['anji'], sofas: ['longjiang', 'lecong'],
};
const regions = (r) => r.recommendations.map((item) => item.hub.id);
assert.equal(SOURCING_PRODUCTS.length, Object.keys(expected).length);
for (const [product, hubs] of Object.entries(expected)) assert.deepEqual(regions(match({ product })), hubs, product);
assert.deepEqual(regions(match({ product: 'plastic-household-goods', mode: 'custom' })), ['huangyan']);
assert.deepEqual(regions(match({ product: 'sofas', mode: 'stock' })), ['lecong']);
assert.deepEqual(regions(match({ product: 'sofas', mode: 'custom' })), ['longjiang']);

let combinations = 0;
for (const p of SOURCING_PRODUCTS) {
  assert.equal(match({ product: p.id }).notices.length, 0);
  for (const mode of p.modes) {
    for (const material of ['unknown', ...p.materials.map((m) => m.id)]) {
      const baseline = match({ product: p.id, mode, material });
      for (const quantity of ['', '1', '500', '10000', '1000000000']) {
        const input = { product: p.id, mode, material, quantity };
        const r = match(input);
        assert.deepEqual(r, match(input), 'Deterministic result');
        assert.equal(r.notices.length, 0);
        assert.deepEqual(regions(r), regions(baseline), 'Quantity cannot manufacture a new region recommendation');
        assert.ok(r.recommendations.length >= 1 && r.recommendations.length <= 3);
        assert.ok(r.recommendations.every((item) => item.sources.length && item.sources.every((source) => source.supports && source.limitation)));
        assert.ok(r.product.prepare.length >= 3 && r.product.questions.length >= 3);
        assert.ok(r.brief.includes(p.name) && r.brief.includes(HUB_DATA_VERSION));
        assert.deepEqual(readFinderUrl(new URL(finderUrl(input), 'https://chinafactoryhost.com').search).result.state, r.state, 'Share URL roundtrip');
        combinations++;
      }
    }
  }
  const invalid = match({ product: p.id, mode: 'constructor', material: '<script>', quantity: '-1' });
  assert.equal(invalid.state.mode, 'unknown');
  assert.equal(invalid.state.material, 'unknown');
  assert.equal(invalid.state.quantity, '');
  assert.equal(invalid.notices.length, 3);
  assert.ok(!invalid.brief.includes('<script>'));
  assert.ok(!finderUrl({ product: p.id, material: '<script>', quantity: '-1' }).includes('script'));
  assert.ok(searchProducts(p.name).some((item) => item.id === p.id), 'Every product is findable by its display name');
  for (const alias of p.aliases) assert.ok(searchProducts(alias).some((item) => item.id === p.id), `Findable alias: ${alias}`);
}
for (const category of PRODUCT_CATEGORIES) {
  const found = searchProducts('', category.id);
  assert.ok(found.length > 0);
  assert.ok(found.every((p) => p.category === category.id));
}
assert.equal(searchProducts('unlisted industrial centrifuge').length, 0);
assert.ok(searchProducts('bottle').length > 1, 'Ambiguous bottle query returns choices');
assert.ok(searchProducts('  VACUUM   FLASK ').some((p) => p.id === 'vacuum-flasks'));
assert.ok(searchProducts('office chair', 'furniture').some((p) => p.id === 'office-chairs'));
assert.equal(searchProducts('office chair', 'beauty').length, 0);
assert.equal(searchProducts('finished garments').length, 0, 'Do not pretend fabric suppliers make garments');
assert.equal(match({ product: 'constructor' }), null);
assert.equal(match({ product: '__proto__' }), null);
assert.equal(readFinderUrl('?product=missing').result, null);
assert.ok(readFinderUrl('?product=missing').notices.length > 0);
assert.ok(readFinderUrl('?product=pcb&v=old-version').notices.some((s) => s.includes('different directory version')));
assert.ok(readFinderUrl('?product=pcb&product=sofas').notices.some((s) => s.includes('repeats')));
assert.equal(readFinderUrl('?category=electronics').category, 'electronics');
assert.equal(readFinderUrl('?category=unlisted').category, '');
assert.ok(match({ product: 'cosmetic-packaging', material: 'glass' }).notes.some((s) => s.includes('formed')));
assert.ok(match({ product: 'woven-fabric' }).product.boundary.includes('garments'));
assert.equal(match({ product: 'woven-fabric', quantity: '12.5' }).state.quantity, '12.5');
assert.equal(match({ product: 'pcb', quantity: '12.5' }).state.quantity, '');
for (const quantity of ['0', '-2', '1e6', 'Infinity', '1000000001', '0.0001', '1,000', 'NaN']) {
  assert.equal(match({ product: 'pcb', quantity }).state.quantity, '', `Reject ${quantity}`);
}

for (const href of [...Object.values(MANUFACTURING_HUBS).map((h) => h.href), ...SOURCING_PRODUCTS.map((p) => p.industryHref), '/about/how-we-vet-factories/', '/contact/']) {
  assert.ok(existsSync(resolve('src/pages', '.' + href, 'index.astro')), 'Existing internal link: ' + href);
}
const script = readFileSync('src/scripts/manufacturing-hub-finder.ts', 'utf8');
assert.ok(!/\b(fetch|localStorage|sessionStorage)\s*[.(]/.test(script), 'Core tool is independent of network and storage');
assert.ok(!script.includes('innerHTML'), 'Result text is not interpolated as HTML');
console.log(`Hub finder: 18 product expectations, ${combinations} option combinations, search, boundaries, URL roundtrips, invalid inputs and internal links passed.`);

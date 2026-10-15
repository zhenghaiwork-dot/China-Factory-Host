import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import source from '../src/data/trade-fairs/fairs_final.json' with { type: 'json' };
import { fairs, clusters } from '../src/data/trade-fairs/directory.mjs';

assert.equal(fairs.length, source.meta.counts.fairs);
assert.equal(clusters.length, source.meta.counts.cluster_routes);
assert.equal(new Set(fairs.map(f=>f.id)).size, fairs.length);
for (const f of fairs) {
  if (!f.confirmed) {
    assert.equal(f.start, '');
    assert.equal(f.end, '');
    assert.ok(!/\b\d{1,2}-\d{1,2}\s+[A-Z][a-z]{2}/.test(f.dates), f.id);
  } else {
    assert.ok(f.start <= f.end, f.id);
  }
  if (f.url) assert.ok(/^https?:\/\/[^\s；]+$/.test(f.url), f.id);
}
const publicData = JSON.stringify({fairs,clusters});
for (const key of ['editor_notes','overseas_buyer_claims_internal','buyer_services_internal','nearby_clusters_zh_internal','confidence','url_needs_check','watchlist','B-level','already running','A-file']) assert.ok(!publicData.includes(key), key);
assert.equal(fairs.filter(f=>f.id==='nb_ecom').length,1);
assert.ok(fairs.find(f=>f.id==='nb_ecom').detail.includes('Yuyao satellite venue'));
const html = readFileSync('dist/client/china-trade-fairs/index.html','utf8');
assert.equal((html.match(/data-fair /g)||[]).length, fairs.length);
for (const f of fairs.filter(f=>!f.confirmed)) assert.ok(html.includes(`id="fair-${f.id}"`));
for (const key of ['editor_notes','overseas_buyer_claims_internal','buyer_services_internal','nearby_clusters_zh_internal','B-level','already running','A-file']) assert.ok(!html.includes(key),key);
console.log('Trade fair data: counts, date certainty, safe URLs, satellite venue, public projection and generated HTML passed.');

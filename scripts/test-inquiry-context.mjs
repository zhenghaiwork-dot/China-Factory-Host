import assert from 'node:assert/strict';
import { sourcePath, sourcePlacement } from '../src/lib/inquiry-context.js';
for (const value of ['/', '/china-trade-fairs/', '/destinations/shaoxing-keqiao/', '/tools/china-manufacturing-hub-finder/']) assert.equal(sourcePath(value), value);
for (const value of [null, {}, '//evil.example/', 'https://evil.example/', '/contact/?email=private', '/foo#private', '/<script>/', '/a/../b/', '/'+'a'.repeat(201)]) assert.equal(sourcePath(value), '');
assert.equal(sourcePlacement('header'), 'header');
assert.equal(sourcePlacement('injected text'), '');
console.log('PASS: inquiry source path and placement validation');

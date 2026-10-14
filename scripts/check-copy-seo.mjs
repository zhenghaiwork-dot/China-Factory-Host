/** Validate editorial changes against rendered pages, without changing shared build scripts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { formatPageTitle } from '../src/lib/page-title.ts';
const base=path.resolve(process.argv[2]||'_hub-finder-preview/client');
assert.equal(formatPageTitle(' Topic ', 'ChinaFactoryHost'),'Topic | ChinaFactoryHost');
assert.equal(formatPageTitle('Topic | ChinaFactoryHost','ChinaFactoryHost'),'Topic | ChinaFactoryHost');
const pages=[];
function text(s){return s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory()){if(e.name!=='__hub-nojs')walk(file);}else if(e.name==='index.html'){const rel=path.relative(base,path.dirname(file)).split(path.sep).filter(Boolean).join('/');pages.push({route:rel?'/'+rel+'/':'/',file,html:fs.readFileSync(file,'utf8').replace(/<!--[\s\S]*?-->/g,'')});}}}
walk(base);assert.ok(pages.length>=62,'All editorial routes built');
const by=new Map(pages.map(p=>[p.route,p]));const titles=new Set();let schemaCount=0;
for(const p of pages){const h=p.html;const title=text(h.match(/<title>([\s\S]*?)<\/title>/i)?.[1]??'');assert.ok(title.endsWith(' | ChinaFactoryHost'),p.route+' brand suffix');assert.equal(title.split(' | ChinaFactoryHost').length,2,p.route+' one suffix');assert.ok(!titles.has(title),p.route+' unique title');titles.add(title);assert.equal([...h.matchAll(/<h1\b/gi)].length,1,p.route+' one H1');assert.ok(/<meta\b[^>]*name="description"[^>]*content="[^"]+"/.test(h),p.route+' description');assert.ok(h.includes(`rel="canonical" href="https://chinafactoryhost.com${p.route}"`),p.route+' canonical');
  const og=h.match(/<meta\b[^>]*property="og:title"[^>]*content="([^"]+)"/)?.[1];const twitter=h.match(/<meta\b[^>]*name="twitter:title"[^>]*content="([^"]+)"/)?.[1];assert.equal(text(og??''),title,p.route+' OG title');assert.equal(text(twitter??''),title,p.route+' Twitter title');
  for(const m of h.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){assert.doesNotThrow(()=>JSON.parse(m[1]),p.route+' valid JSON-LD');schemaCount++;}
  const main=h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??'';for(const m of main.matchAll(/<a\b[^>]*href="([^"]+)"/gi)){const href=m[1].replace(/&amp;/g,'&');if(!href.startsWith('/')||href.startsWith('//'))continue;const u=new URL(href,'https://chinafactoryhost.com');const target=by.get(u.pathname);assert.ok(target||fs.existsSync(base+u.pathname)||u.pathname.startsWith('/api/'),p.route+' link '+href);if(target&&u.hash)assert.ok(target.html.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),p.route+' anchor '+href);}
  const body=text(main);for(const forbidden of ['Nothing is subcontracted.','never trade companies','Five fields, one mandatory choice.','Six fields, one mandatory choice.','Ningbo will not be interested','A fixed price list would be fiction.'])assert.ok(!body.includes(forbidden),p.route+' removed claim '+forbidden);
  if(p.route.startsWith('/case-studies/')&&p.route!=='/case-studies/')assert.ok(title.startsWith('Sample report: '),p.route+' illustrative report identity');
}
assert.ok(text(by.get('/plan-my-trip/').html).includes('What to include in your trip request'),'No incorrect list count');
assert.ok(text(by.get('/canton-fair/').html).includes('four visits within one cluster'),'Consistent visit example');
assert.ok(by.get('/industries/small-home-appliances/').html.includes('What affects MOQ, sampling and lead time'),'No invented numeric ranges');
assert.ok(by.get('/about/how-we-vet-factories/').html.includes('Unified Social Credit Code'),'Registration evidence retained');
assert.ok(by.get('/services/on-site-support/filming-coordination/').html.includes('equipment'),'Filming preparation retained');
assert.ok(by.get('/tools/china-manufacturing-hub-finder/').html.includes('data-hf-answer-table'),'Search-readable tool answers retained');
console.log(`Copy/SEO checks passed: ${pages.length} pages, title/H1/canonical/OG/Twitter, ${schemaCount} JSON-LD blocks, internal links, sample identities and editorial boundaries.`);

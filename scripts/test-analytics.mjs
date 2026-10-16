import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('src/scripts/analytics.js','utf8');
function fixture(host='chinafactoryhost.com',stored=null){
 const listeners={}, clicks={}, scripts=[];const panel={hidden:true,querySelector:()=>({focus(){}})};const settings={hidden:true,addEventListener:(e,fn)=>clicks.settings=fn};
 const root={dataset:{measurementId:'G-TEST123'},querySelector:s=>s==='[data-analytics-choice]'?panel:{addEventListener:(e,fn)=>clicks[s]=fn}};
 const document={readyState:'complete',referrer:'https://example.org/?email=secret',cookie:'',querySelector:s=>s==='[data-analytics-root]'?root:settings,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)},addEventListener:(e,fn)=>listeners[e]=fn};
 const context={document,location:{hostname:host,origin:'https://'+host,pathname:'/contact/',reload(){}},localStorage:{getItem:()=>stored,setItem(){}},URL,Date,window:{addEventListener(){}}};
 vm.runInNewContext(source,context);return {context,clicks,scripts,listeners,panel};
}
const x=fixture();assert.equal(x.scripts.length,0);x.clicks['[data-analytics-reject]']();assert.equal(x.scripts.length,0);x.listeners['cfh:inquiry-success']();assert.equal(x.scripts.length,0);
x.clicks['[data-analytics-accept]']();assert.equal(x.scripts.length,1);x.clicks['[data-analytics-accept]']();assert.equal(x.scripts.length,1);x.listeners['cfh:inquiry-success']();
const events=x.context.window.dataLayer.map(a=>Array.from(a));assert.equal(events.filter(a=>a[1]==='generate_lead').length,1);assert.equal(events.find(a=>a[0]==='config')[2].page_referrer,'https://example.org');assert.ok(!JSON.stringify(events).includes('secret'));
assert.equal(fixture('127.0.0.1',JSON.stringify({value:'granted',expires:Date.now()+10000})).scripts.length,0);
assert.equal(fixture('chinafactoryhost.com',JSON.stringify({value:'granted',expires:Date.now()+10000})).scripts.length,1);
console.log('PASS: consent gating, rejection, single load, success event, sanitized URLs, preview exclusion, saved consent');

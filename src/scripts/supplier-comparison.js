import { CRITERIA, blankComparison, parseComparison } from '../data/supplier-comparison.mjs';
const form = document.querySelector('[data-comparison-form]');
if (form instanceof HTMLFormElement) {
  const status = document.querySelector('[data-comparison-status]');
  const field = name => form.elements.namedItem(name);
  const read = () => {
    const value = blankComparison();
    value.product = field('product').value; value.date = field('date').value;
    value.suppliers.forEach((s,i) => {
      s.name = field('supplier-' + i).value;
      s.records.forEach(r => {r.status=field('status-'+i+'-'+r.criterion).value;r.evidence=field('evidence-'+i+'-'+r.criterion).value;});
    });
    return value;
  };
  let saved = JSON.stringify(read());
  const dirty = () => JSON.stringify(read()) !== saved;
  const resize = () => form.querySelectorAll('textarea').forEach(el => {el.style.height='auto';el.style.height=el.scrollHeight+'px';});
  const refresh = () => {
    resize();
    for (let i=0;i<3;i++) document.querySelectorAll('[data-supplier-label="'+i+'"]').forEach(el=>{el.textContent=field('supplier-'+i).value.trim() || 'Supplier '+(i+1);});
    const count=[...form.querySelectorAll('textarea')].filter(el=>el.value.trim()).length;
    const counter=document.querySelector('[data-note-count]');
    const countText=count+' / 18 notes added';
    if(counter.textContent!==countText)counter.textContent=countText;
    form.querySelectorAll('[data-evidence-status]').forEach(el=>{el.dataset.state=String(el.selectedIndex);});
  };
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',refresh);
  form.addEventListener('change',refresh);
  document.querySelector('[data-open]').addEventListener('click',()=>document.querySelector('[data-import]').click());
  window.addEventListener('beforeunload', e => {if(dirty()){e.preventDefault();e.returnValue='';}});
  window.addEventListener('beforeprint',()=>{
    resize();
    const summary=document.querySelector('[data-print-summary]');
    summary.replaceChildren();
    const value=read();
    const add=(parent,tag,text)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);};
    value.suppliers.forEach((supplier,i)=>{
      const section=document.createElement('section');
      add(section,'h2',supplier.name || 'Supplier '+(i+1));
      add(section,'p','Product: '+(value.product||'Not entered')+' · Date: '+(value.date||'Not entered'));
      supplier.records.forEach(r=>{
        add(section,'h3',CRITERIA.find(c=>c.id===r.criterion).label+' — '+r.status);
        add(section,'p',r.evidence||'No evidence entered.');
      });
      summary.append(section);
    });
  });
  document.querySelector('[data-export]').addEventListener('click',()=>{
    status.dataset.kind='notice';
    const text=JSON.stringify(read(),null,2);
    const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='supplier-comparison.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    saved=JSON.stringify(read());status.textContent='Comparison file downloaded. Use “Open saved comparison” to continue later.';
  });
  document.querySelector('[data-print]').addEventListener('click',()=>{resize();window.print();});
  document.querySelector('[data-clear]').addEventListener('click',()=>{
    if(!window.confirm('Clear all entries? Download a comparison file first if you need to keep them.'))return;
    form.reset();saved=JSON.stringify(read());refresh();status.textContent='Entries cleared.';
    status.dataset.kind='notice';
  });
  document.querySelector('[data-import]').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try {
      if(file.size>400000)throw new Error('File is too large.');
      const value=parseComparison(await file.text());
      if(dirty()&&!window.confirm('Replace your current unsaved entries with this file?'))return;
      field('product').value=value.product;field('date').value=value.date;
      value.suppliers.forEach((s,i)=>{
        field('supplier-'+i).value=s.name;
        s.records.forEach(r=>{field('status-'+i+'-'+r.criterion).value=r.status;field('evidence-'+i+'-'+r.criterion).value=r.evidence;});
      });
      saved=JSON.stringify(read());refresh();status.dataset.kind='notice';status.textContent='Saved comparison opened. No file contents were sent to a server.';
    }catch{status.dataset.kind='error';status.textContent='Could not open this file. Choose an unmodified JSON comparison saved from this tool.';}
    finally{e.target.value='';}
  });
  document.querySelector('[data-comparison-actions]').hidden=false;
  refresh();
}

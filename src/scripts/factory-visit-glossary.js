const root=document.querySelector('[data-glossary]');
if(root){
  const search=root.querySelector('#glossary-search');
  const entries=[...root.querySelectorAll('[data-glossary-term]')];
  const stages=[...root.querySelectorAll('[data-glossary-stage]')];
  const count=root.querySelector('[data-glossary-count]');
  const expand=root.querySelector('[data-expand]');
  const normalise=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/mould/g,'mold').replace(/licence/g,'license').replace(/[^a-z0-9\u3400-\u9fff]/g,'');
  const contents=new Map(entries.map(entry=>[entry,normalise(entry.textContent)]));
  const syncButton=()=>{
    const visible=entries.filter(e=>!e.hidden);
    const allOpen=visible.length>0&&visible.every(e=>e.querySelector('details').open);
    expand.textContent=allOpen?'Collapse visit notes':'Expand visit notes';
    expand.setAttribute('aria-expanded',String(allOpen));
    expand.disabled=visible.length===0;
  };
  const filter=()=>{
    const query=normalise(search.value.trim());
    let matches=0;
    entries.forEach(entry=>{entry.hidden=!contents.get(entry).includes(query);if(!entry.hidden)matches++;});
    stages.forEach(stage=>{stage.hidden=![...stage.querySelectorAll('[data-glossary-term]')].some(e=>!e.hidden);});
    count.textContent=query?matches+' of 20 terms match your search':'20 terms · 5 stages of a visit';
    root.querySelector('[data-glossary-empty]').hidden=matches>0;
    syncButton();
  };
  search.addEventListener('input',filter);
  root.querySelector('[data-clear-search]').addEventListener('click',()=>{search.value='';filter();search.focus();});
  expand.addEventListener('click',()=>{
    const open=expand.getAttribute('aria-expanded')!=='true';
    entries.filter(e=>!e.hidden).forEach(e=>{e.querySelector('details').open=open;});
    syncButton();
  });
  entries.forEach(e=>e.querySelector('details').addEventListener('toggle',syncButton));
  const showHash=()=>{
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const entry=entries.find(e=>e.id===id);
    const target=entry||stages.find(s=>s.id===id);
    if(!target)return;
    if(search.value){search.value='';filter();}
    if(entry)entry.querySelector('details').open=true;
    requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  };
  window.addEventListener('hashchange',showHash);
  let printState=[];
  window.addEventListener('beforeprint',()=>{printState=entries.map(e=>e.querySelector('details').open);entries.forEach(e=>{e.querySelector('details').open=true;});});
  window.addEventListener('afterprint',()=>{entries.forEach((e,i)=>{e.querySelector('details').open=printState[i]??false;});syncButton();});
  root.querySelector('[data-glossary-tools]').hidden=false;
  filter();showHash();
}

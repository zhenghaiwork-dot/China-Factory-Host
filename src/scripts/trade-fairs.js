const root = document.querySelector('.fair-directory');
if (root) {
  const cards = [...root.querySelectorAll('[data-fair]')];
  const controls = [...root.querySelectorAll('[data-group]')];
  const groups = ['when', 'province', 'city', 'industry'];
  const state = Object.fromEntries(groups.map(g => [g, new Set()]));
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const horizon = new Date(Date.parse(today+'T00:00:00Z')+90*86400000).toISOString().slice(0,10);
  const past = c => c.dataset.end && c.dataset.end < today;
  const list = root.querySelector('#fair-list');
  const recentList = root.querySelector('#recent-list');
  const recent = root.querySelector('#recent-fairs');
  const more = root.querySelector('#fair-more');
  let limit = 12;
  cards.forEach(c => (past(c) ? recentList : list).append(c));
  root.querySelector('#fair-filters').hidden = false;
  if (matchMedia('(max-width:640px)').matches) root.querySelector('#fair-filters>details').open = false;
  if (matchMedia('(max-width:760px)').matches) root.querySelector('.calendar-disclosure').open = false;

  function matches(c) {
    const d = c.dataset;
    return groups.every(g => !state[g].size || [...state[g]].some(v => g === 'when'
      ? (v === 'tbc' ? d.confirmed === 'false' : v === '90' ? d.confirmed === 'true' && d.end >= today && d.start <= horizon : d.month === v)
      : d[g] === v));
  }
  function render() {
    controls.forEach(b => {
      b.setAttribute('aria-pressed', String(state[b.dataset.group].has(b.dataset.value)));
      b.hidden = b.dataset.group === 'city' && state.province.size > 0 && !state.province.has(b.dataset.province);
    });
    let count = 0, held = 0;
    cards.forEach(c => {
      const match = matches(c);
      if (past(c)) { c.hidden = !match; if (match) held++; }
      else { c.hidden = !match || ++count > limit; }
    });
    root.querySelector('#fair-count').textContent = `${count + held} fairs · showing ${Math.min(count,limit)}${held ? ` upcoming · ${held} recently held` : ''}`;
    const selected = root.querySelector('#selected-filters');
    selected.replaceChildren();
    groups.forEach(g => [...state[g]].forEach(v => {
      const button = document.createElement('button');
      const label = controls.find(b => b.dataset.group === g && b.dataset.value === v)?.textContent || v;
      button.type = 'button';
      button.textContent = label + ' ×';
      button.setAttribute('aria-label', 'Remove filter: ' + label);
      button.addEventListener('click', () => {
        controls.find(b => b.dataset.group === g && b.dataset.value === v)?.click();
        const remaining = selected.querySelector('button');
        (remaining || root.querySelector('#clear-fairs')).focus();
      });
      selected.append(button);
    }));
    selected.hidden = !selected.childElementCount;
    const badge = root.querySelector('#active-filter-count');
    badge.textContent = String(selected.childElementCount);
    badge.hidden = !selected.childElementCount;
    root.querySelector('#fair-empty').hidden = count + held > 0;
    root.querySelector('#recent-count').textContent = `(${held})`;
    recent.hidden = !held;
    more.hidden = count <= limit;
    more.textContent = `Show ${count-limit} more fairs`;
  }
  function writeHash() {
    const params = new URLSearchParams();
    groups.forEach(g => [...state[g]].sort().forEach(v => params.append(g,v)));
    history.replaceState(null,'',location.pathname+location.search+(params.size ? '#filters='+encodeURIComponent(params.toString()) : ''));
  }
  function readHash() {
    groups.forEach(g=>state[g].clear());
    if (location.hash.startsWith('#filters=')) {
      try {
        const p = new URLSearchParams(decodeURIComponent(location.hash.slice(9)));
        controls.forEach(b => { if (p.getAll(b.dataset.group).includes(b.dataset.value)) state[b.dataset.group].add(b.dataset.value); });
      } catch { /* Ignore malformed bookmarked filter state. */ }
    }
    limit=12;
    render();
    revealAnchor();
  }
  function revealAnchor() {
    const c = cards.find(c=>'#'+c.id === location.hash);
    if (!c) return;
    groups.forEach(g=>state[g].clear()); limit=cards.length; render();
    c.open = true;
    if (past(c)) recent.open = true;
    requestAnimationFrame(()=>c.scrollIntoView({block:'start'}));
  }
  controls.forEach(b=>b.addEventListener('click',()=>{
    const {group:g,value:v}=b.dataset;
    state[g].has(v) ? state[g].delete(v) : state[g].add(v);
    if(g==='province') [...state.city].forEach(city=>{if(!cards.some(c=>c.dataset.city===city&&(!state.province.size||state.province.has(c.dataset.province))))state.city.delete(city);});
    limit=12;render();writeHash();
  }));
  root.querySelector('#clear-fairs').addEventListener('click',()=>{groups.forEach(g=>state[g].clear());limit=12;render();writeHash();});
  more.addEventListener('click',()=>{const next=cards.find(c=>!past(c)&&matches(c)&&c.hidden);limit=cards.length;render();next?.querySelector('summary').focus();});
  window.addEventListener('hashchange',readHash);
  root.querySelectorAll('.calendar-months a').forEach(link => link.addEventListener('click', () => {
    requestAnimationFrame(() => root.querySelector('#directory').scrollIntoView({block:'start'}));
  }));
  // Rebuild the strip from existing HTML when a cached build crosses a fair date.
  const nextCards = cards.filter(c=>c.dataset.confirmed==='true'&&!past(c)).sort((a,b)=>a.dataset.start.localeCompare(b.dataset.start)).slice(0,3);
  root.querySelectorAll('[data-next-id]').forEach((link,i)=>{
    const c=nextCards[i]; if(!c){link.hidden=true;return;}
    link.href='#'+c.id;
    link.querySelector('strong').textContent=c.querySelector('.dates').textContent;
    link.querySelector('.next-title').textContent=c.querySelector('h3').textContent;
    link.querySelector('small').textContent=`${c.dataset.city} · ${c.dataset.province}`;
  });
  readHash();
}

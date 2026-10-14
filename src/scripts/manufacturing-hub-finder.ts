import { SOURCING_MODES } from '../data/sourcing-products.ts';
import { HUB_DATA_VERSION } from '../data/hub-sources.ts';
import { HUB_FINDER_PATH, finderUrl, matchManufacturingHubs, readFinderUrl, searchProducts, type FinderResult } from '../lib/match-manufacturing-hubs.ts';

/** Progressive enhancement of the static directory. No fetch, storage or AI dependency. */
function initialiseFinder(root: HTMLElement) {
  if (root.dataset.ready) return;
  function required<T extends HTMLElement>(selector: string): T {
    const node = root.querySelector<T>(selector);
    if (!node) throw new Error('Missing hub finder element: ' + selector);
    return node;
  }
  const interactive = required<HTMLElement>('[data-hf-interactive]');
  const search = required<HTMLInputElement>('[data-hf-search]');
  const category = required<HTMLSelectElement>('[data-hf-category]');
  const count = required<HTMLElement>('[data-hf-count]');
  const list = required<HTMLElement>('[data-hf-product-list]');
  const empty = required<HTMLElement>('[data-hf-empty]');
  const notice = required<HTMLElement>('[data-hf-notice]');
  const selection = required<HTMLElement>('[data-hf-selection]');
  const heading = required<HTMLElement>('[data-hf-result-heading]');
  const mode = required<HTMLSelectElement>('[data-hf-mode]');
  const material = required<HTMLSelectElement>('[data-hf-material]');
  const quantity = required<HTMLInputElement>('[data-hf-quantity]');
  const results = required<HTMLElement>('[data-hf-results]');
  const notes = required<HTMLElement>('[data-hf-condition-notes]');
  const live = required<HTMLElement>('[data-hf-live]');
  const share = required<HTMLInputElement>('[data-hf-share]');
  const brief = required<HTMLTextAreaElement>('[data-hf-brief]');
  const saveStatus = required<HTMLElement>('[data-hf-save-status]');
  const goal = required<HTMLTextAreaElement>('[data-hf-inquiry] textarea[name="goal"]');
  const inquiryDestination = required<HTMLInputElement>('[data-hf-inquiry] input[name="destination"]');
  const inquiryStatus = required<HTMLElement>('[data-hf-inquiry-status]');
  let current: FinderResult | null = null;
  let lastGeneratedBrief = '';

  function el<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function link(text: string, href: string) {
    const node = el('a', text);
    node.href = href;
    return node;
  }
  function textList(items: string[]) {
    const node = el('ul');
    items.forEach((item) => node.append(el('li', item)));
    return node;
  }
  function setNotice(items: string[]) {
    notice.textContent = items.join(' ');
    notice.hidden = items.length === 0;
  }
  function writeUrl(path: string, replace = false) {
    if (location.pathname + location.search + location.hash === path) return;
    try { history[replace ? 'replaceState' : 'pushState'](null, '', path); }
    catch { setNotice(['Your browser could not update the address. You can still use the result link below.']); }
  }
  function baseUrl() {
    return category.value ? HUB_FINDER_PATH + '?category=' + encodeURIComponent(category.value) : HUB_FINDER_PATH;
  }
  function clearSelection(updateUrl = false) {
    const hadResult = current !== null;
    current = null;
    selection.hidden = true;
    root.dataset.hasResult = 'false';
    list.hidden = false;
    root.querySelectorAll('[data-hf-select]').forEach((node) => node.removeAttribute('aria-current'));
    if (updateUrl && hadResult) writeUrl(baseUrl());
  }
  function filterProducts(announce = false) {
    const found = searchProducts(search.value, category.value);
    const ids = new Set(found.map((p) => p.id));
    root.querySelectorAll<HTMLElement>('[data-hf-product-item]').forEach((node) => { node.hidden = !ids.has(node.dataset.hfProductItem || ''); });
    list.hidden = false;
    empty.hidden = found.length > 0;
    count.textContent = found.length ? `${found.length} ${found.length === 1 ? 'product' : 'products'} found. Choose the exact product to see its sourcing direction.` : 'No matching products in this directory.';
    if (announce) live.textContent = count.textContent;
  }
  function refreshInquiry(force = false) {
    if (!current) return;
    inquiryDestination.value = current.recommendations.map((r) => r.hub.name).join(' / ');
    if (force || !goal.value.trim() || goal.value === lastGeneratedBrief) {
      goal.value = current.brief;
      lastGeneratedBrief = current.brief;
      inquiryStatus.textContent = 'The inquiry includes your current product and research starting points.';
    } else {
      inquiryStatus.textContent = 'Your edited inquiry has been kept. Use “Use current results in my inquiry” if you want to replace it with the new sourcing brief.';
    }
  }
  function renderResult(result: FinderResult, focus = false, updateUrl = false, extraNotices: string[] = []) {
    current = result;
    selection.hidden = false;
    root.dataset.hasResult = 'true';
    list.hidden = true;
    empty.hidden = true;
    heading.textContent = 'Where to start: ' + result.product.name;
    const materialLabel = result.product.materials.find((m) => m.id === result.state.material)?.label;
    required<HTMLElement>('[data-hf-selected-label]').textContent = [SOURCING_MODES[result.state.mode], materialLabel, result.state.quantity ? `${result.state.quantity} ${result.product.unit} per design / colour` : 'Quantity not specified'].filter(Boolean).join(' · ');
    count.textContent = 'Selected: ' + result.product.name + '. Search again to choose a different product.';
    root.querySelectorAll<HTMLElement>('[data-hf-select]').forEach((node) => {
      if (node.dataset.hfSelect === result.product.id) node.setAttribute('aria-current', 'true');
      else node.removeAttribute('aria-current');
    });
    mode.replaceChildren(...result.product.modes.map((value) => {
      const option = el('option', SOURCING_MODES[value]); option.value = value; return option;
    }));
    mode.value = result.state.mode;
    const materialOptions = [el('option', 'Not sure yet'), ...result.product.materials.map((m) => { const o = el('option', m.label); o.value = m.id; return o; })];
    materialOptions[0].value = 'unknown';
    material.replaceChildren(...materialOptions);
    material.value = result.state.material;
    required<HTMLElement>('[data-hf-material-field]').hidden = result.product.materials.length === 0;
    quantity.value = result.state.quantity;
    quantity.inputMode = result.product.unit === 'metres' ? 'decimal' : 'numeric';
    required<HTMLElement>('[data-hf-quantity-label]').textContent = `Quantity per design / colour (${result.product.unit}, optional)`;
    notes.replaceChildren(textList(result.notes));
    setNotice([...new Set([...extraNotices, ...result.notices])]);
    const content = el('div', '', 'hf-result-content');
    content.append(el('p', result.product.description, 'hf-description'));
    const regions = el('div', '', 'hf-regions');
    for (const r of result.recommendations) {
      const article = el('article', '', 'hf-region');
      article.append(el('h3', r.hub.name), el('p', `${r.hub.chinese} · ${r.hub.province}, China`, 'hf-location'));
      const facts = el('dl', '', 'hf-facts');
      for (const [label, text] of [['Who to look for', r.role], ['Why start here', r.reason], ['Useful when', r.fit], ['Check before choosing', r.caution]]) {
        const row = el('div'); row.append(el('dt', label), el('dd', text)); facts.append(row);
      }
      const explore = el('p'); explore.append(link('Explore this region', r.hub.href));
      const evidence = el('details', '', 'hf-evidence');
      evidence.append(el('summary', 'Sources & what they establish'));
      const sources = el('ul');
      for (const s of r.sources) {
        const item = el('li');
        const sourceLink = link(s.title, s.url); sourceLink.rel = 'noopener noreferrer';
        item.append(sourceLink, el('p', `${s.publisher}. ${s.supports}`), el('p', `${s.limitation} Reviewed ${s.reviewed}.`, 'hf-muted'));
        sources.append(item);
      }
      evidence.append(sources);
      article.append(facts, explore, evidence); regions.append(article);
    }
    const advice = el('div', '', 'hf-advice');
    for (const [label, items] of [['Prepare before contacting suppliers', result.product.prepare], ['Questions worth asking', result.product.questions]] as [string, string[]][]) {
      const section = el('div'); section.append(el('h3', label), textList(items)); advice.append(section);
    }
    const next = el('p', '', 'hf-next');
    next.append(link('Read the industry guide', result.product.industryHref), ' · ', link('How to verify a factory', '/about/how-we-vet-factories/'));
    content.append(regions, advice, el('p', result.product.boundary, 'hf-boundary'), next, el('p', `Regional information reviewed ${result.product.reviewed}. Confirm supplier details and appointments before travelling.`, 'hf-muted'));
    results.replaceChildren(content);
    share.value = new URL(finderUrl(result.state), location.origin).href;
    brief.value = result.brief;
    saveStatus.textContent = '';
    refreshInquiry();
    if (updateUrl) writeUrl(finderUrl(result.state));
    if (focus) {
      if (!notice.hidden) { notice.tabIndex = -1; notice.focus(); }
      else heading.focus();
      live.textContent = [...extraNotices, ...result.notices, `${result.product.name}: ${result.recommendations.map((r) => r.hub.name).join('; ')}. Results updated.`].join(' ');
    }
  }
  function restoreUrl() {
    const parsed = readFinderUrl(location.search);
    search.value = '';
    category.value = parsed.category;
    filterProducts();
    if (parsed.result) renderResult(parsed.result, false, false, parsed.notices);
    else { clearSelection(); setNotice(parsed.notices); }
    openProductFragment();
  }
  function openProductFragment() {
    let fragment: string;
    try { fragment = decodeURIComponent(location.hash.slice(1)); }
    catch { return; }
    if (!fragment.startsWith('product-')) return;
    // Find only server-rendered product entries; arbitrary fragments cannot
    // select DOM outside this tool or inject a selector.
    const entry = [...root.querySelectorAll<HTMLDetailsElement>('[data-hf-directory-product]')].find((node) => node.id === fragment);
    if (entry) entry.open = true;
  }
  async function copyValue(field: HTMLInputElement | HTMLTextAreaElement, success: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(field.value);
      saveStatus.textContent = success;
    } catch {
      const disclosure = field.closest('details');
      if (disclosure) disclosure.open = true;
      field.focus(); field.select();
      saveStatus.textContent = 'Automatic copying is unavailable. The text is selected below; copy it using your browser or keyboard.';
    }
  }

  required<HTMLFormElement>('[data-hf-search-form]').addEventListener('submit', (event) => {
    event.preventDefault(); clearSelection(true); filterProducts(true); count.focus();
  });
  search.addEventListener('input', () => { clearSelection(true); setNotice([]); filterProducts(); });
  category.addEventListener('change', () => { clearSelection(true); setNotice([]); filterProducts(true); writeUrl(baseUrl(), true); });
  list.addEventListener('click', (event) => {
    const anchor = (event.target as Element).closest<HTMLElement>('[data-hf-select]');
    if (!anchor) return;
    const result = matchManufacturingHubs({ product: anchor.dataset.hfSelect || '' });
    if (!result) return;
    event.preventDefault(); renderResult(result, true, true);
  });
  required<HTMLFormElement>('[data-hf-refine-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!current) return;
    const result = matchManufacturingHubs({ product: current.product.id, mode: mode.value, material: material.value, quantity: quantity.value });
    if (result) renderResult(result, true, true);
  });
  required<HTMLElement>('[data-hf-change-product]').addEventListener('click', () => {
    clearSelection(true); search.value = ''; filterProducts(); search.focus();
  });
  required<HTMLElement>('[data-hf-clear-search]').addEventListener('click', () => {
    clearSelection(true); search.value = ''; category.value = ''; setNotice([]); filterProducts(true); writeUrl(HUB_FINDER_PATH, true); search.focus();
  });
  required<HTMLElement>('[data-hf-copy-link]').addEventListener('click', () => { void copyValue(share, 'Result link copied.'); });
  required<HTMLElement>('[data-hf-copy-brief]').addEventListener('click', () => { void copyValue(brief, 'Sourcing brief copied.'); });
  required<HTMLElement>('[data-hf-refresh-inquiry]').addEventListener('click', () => { refreshInquiry(true); goal.focus(); });

  let printDetails: { node: HTMLDetailsElement; open: boolean }[] = [];
  function expandPrintEvidence() {
    if (printDetails.length) return;
    printDetails = [...results.querySelectorAll<HTMLDetailsElement>('details')].map((node) => ({ node, open: node.open }));
    printDetails.forEach(({ node }) => { node.open = true; });
  }
  function restorePrintEvidence() {
    printDetails.forEach(({ node, open }) => { node.open = open; }); printDetails = [];
  }
  required<HTMLElement>('[data-hf-print]').addEventListener('click', () => { expandPrintEvidence(); window.print(); });
  window.addEventListener('beforeprint', expandPrintEvidence);
  window.addEventListener('afterprint', restorePrintEvidence);
  window.addEventListener('popstate', restoreUrl);
  window.addEventListener('hashchange', openProductFragment);
  // Reveal controls only after the entire markup contract and initial result work.
  restoreUrl();
  required<HTMLElement>('[data-hf-fallback-note]').hidden = true;
  interactive.hidden = false;
  root.dataset.ready = HUB_DATA_VERSION;
}

document.querySelectorAll<HTMLElement>('[data-hub-finder]').forEach((root) => {
  try { initialiseFinder(root); }
  catch (error) {
    console.error('[hub finder] Enhancement unavailable; static directory remains accessible.', error);
    const controls = root.querySelector<HTMLElement>('[data-hf-interactive]');
    if (controls) controls.hidden = true;
    const fallback = root.querySelector<HTMLElement>('[data-hf-fallback-note]');
    if (fallback) fallback.hidden = false;
  }
});

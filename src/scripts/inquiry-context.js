import { sourcePath, sourcePlacement } from '../lib/inquiry-context.js';

const params = new URLSearchParams(location.search);
const isContact = /^\/contact\/?$/.test(location.pathname);
const inheritedPath = isContact ? sourcePath(params.get('from')) : '';
const inheritedPlacement = inheritedPath ? sourcePlacement(params.get('cta')) : '';

function placement(element) {
  if (element.closest('header')) return 'header';
  if (element.closest('footer')) return 'footer';
  if (element.closest('.wa-fab, .wa-bar')) return 'floating';
  return 'content';
}

function decorate(link) {
  if (!link || !link.getAttribute('href')) return;
  let url;
  try { url = new URL(link.getAttribute('href'), location.href); } catch { return; }
  if (url.origin !== location.origin || !/^\/contact\/?$/.test(url.pathname)) return;
  const from = isContact ? inheritedPath : sourcePath(location.pathname);
  if (!from) return;
  url.searchParams.set('from', from);
  url.searchParams.set('cta', isContact ? inheritedPlacement || 'content' : placement(link));
  const href = url.pathname + url.search + url.hash;
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
}

document.querySelectorAll('a[href]').forEach(decorate);
// Also handle links created or updated by interactive tools, including new-tab clicks.
['pointerover', 'focusin', 'click', 'auxclick'].forEach(type => {
  document.addEventListener(type, event => decorate(event.target.closest?.('a[href]')), true);
});

document.querySelectorAll('form[data-form]').forEach(form => {
  const values = {
    source: sourcePath(location.pathname),
    entry_page: inheritedPath || sourcePath(location.pathname),
    entry_placement: inheritedPlacement || placement(form),
  };
  Object.entries(values).forEach(([name, value]) => {
    let input = form.querySelector('input[name="' + name + '"]');
    if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; form.appendChild(input); }
    input.value = value;
  });
});

// Direct Google tag. No GTM container. Never load on local/preview hosts.
const root = document.querySelector('[data-analytics-root]');
if (root && ['chinafactoryhost.com', 'www.chinafactoryhost.com'].includes(location.hostname)) {
  const id = root.dataset.measurementId;
  const panel = root.querySelector('[data-analytics-choice]');
  const settings = document.querySelector('[data-analytics-settings]');
  const key = 'cfh-analytics-consent-v1';
  let allowed = false;
  let started = false;
  const gtag = function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
  function remember(value) {
    try { localStorage.setItem(key, JSON.stringify({ value, expires: Date.now() + 180 * 86400000 })); } catch {}
  }
  function start() {
    if (started || !allowed) return;
    started = true;
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // Do not send query strings, hashes or free-text form values.
      page_location: location.origin + location.pathname,
      page_referrer: (() => { try { return new URL(document.referrer).origin; } catch { return ''; } })(),
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }
  function choose(value) {
    allowed = value === 'granted';
    remember(value);
    panel.hidden = true;
    if (allowed) start();
    else if (started) {
      window['ga-disable-' + id] = true;
      // Remove first-party GA cookies before reloading without the tag.
      document.cookie.split(';').forEach(part => {
        const name = part.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) return;
        ['', '; domain=chinafactoryhost.com', '; domain=www.chinafactoryhost.com'].forEach(domain => {
          document.cookie = name + '=; Max-Age=0; path=/' + domain;
        });
      });
      location.reload();
    }
  }
  let saved;
  try { const record = JSON.parse(localStorage.getItem(key)); if (record?.expires > Date.now()) saved = record.value; } catch {}
  allowed = saved === 'granted';
  panel.hidden = saved === 'granted' || saved === 'denied';
  if (settings) {
    settings.hidden = false;
    settings.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
  }
  root.querySelector('[data-analytics-accept]').addEventListener('click', () => choose('granted'));
  root.querySelector('[data-analytics-reject]').addEventListener('click', () => choose('denied'));
  // Returning visitors: keep the tag off the initial loading path.
  if (allowed) {
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }
  document.addEventListener('cfh:inquiry-success', () => {
    if (!allowed) return;
    start();
    gtag('event', 'generate_lead', { form_id: 'inquiry', page_path: location.pathname });
  });
  document.addEventListener('click', event => {
    if (!allowed) return;
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    const method = href.startsWith('mailto:') ? 'email' : /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href) ? 'whatsapp' : null;
    if (method) { start(); gtag('event', 'contact_click', { contact_method: method, page_path: location.pathname }); }
  });
}

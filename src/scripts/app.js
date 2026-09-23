/* ============================================================
   ChinaFactoryHost.com — Prototype behaviour layer
   Pure vanilla JS. No framework, no build step, no network calls.
   ------------------------------------------------------------
   1) progressive-enhancement flag + reveal observer
   2) sticky header shadow
   3) desktop dropdown aria sync
   4) mobile navigation drawer
   5) case-study filter (client-side, URL-synced, with empty state)
   6) lead-magnet / inquiry form states (simulated; no endpoint yet)
   Every block is defensive: missing markup never throws.
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* ---------------------------------------------------------
     1) Progressive enhancement + reveal
     --------------------------------------------------------- */
  root.classList.add('js');

  var revealed = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && revealed.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     2) Sticky header shadow
     --------------------------------------------------------- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     3) Desktop dropdowns — keep aria-expanded in sync
        (open/close itself is CSS :hover + :focus-within)
     --------------------------------------------------------- */
  Array.prototype.forEach.call(doc.querySelectorAll('.nav-group'), function (group) {
    var trigger = group.querySelector('.nav-trigger');
    if (!trigger) { return; }
    trigger.setAttribute('aria-expanded', 'false');
    var open = function () { trigger.setAttribute('aria-expanded', 'true'); };
    var close = function () { trigger.setAttribute('aria-expanded', 'false'); };
    group.addEventListener('mouseenter', open);
    group.addEventListener('mouseleave', close);
    group.addEventListener('focusin', open);
    group.addEventListener('focusout', function (e) {
      if (!group.contains(e.relatedTarget)) { close(); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); }
    });
  });

  /* ---------------------------------------------------------
     4) Mobile navigation drawer
     --------------------------------------------------------- */
  var burger = doc.querySelector('[data-burger]');
  var drawer = doc.querySelector('#mobile-nav');

  function setDrawer(open) {
    if (!burger || !drawer) { return; }
    drawer.classList.toggle('is-open', open);
    doc.body.classList.toggle('is-menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      var first = drawer.querySelector('a, button');
      if (first) { first.focus(); }
    } else {
      burger.focus();
    }
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setDrawer(false); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setDrawer(false); }
    });
  }

  /* ---------------------------------------------------------
     5) Case-study filter grid
        Markup contract:
        <div data-filter-grid>
          <button class="chip" data-filter-group="type" data-value="creator" aria-pressed="false">
          <div data-filter-count>SHOWING 6 OF 6</div>
          <div data-filter-live aria-live="polite">
          <div class="case-grid">
            <a class="case-card" data-type="creator" data-destination="yiwu">
          <div data-filter-empty hidden>
     --------------------------------------------------------- */
  var grid = doc.querySelector('[data-filter-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.case-card'));
    var chips = Array.prototype.slice.call(grid.querySelectorAll('.chip[data-filter-group]'));
    var countEl = grid.querySelector('[data-filter-count]');
    var liveEl = grid.querySelector('[data-filter-live]');
    var emptyEl = grid.querySelector('[data-filter-empty]');
    var resetBtn = grid.querySelector('[data-filter-reset]');
    var state = { type: 'all', destination: 'all' };

    function readUrl() {
      try {
        var q = new URLSearchParams(window.location.search);
        if (q.get('type')) { state.type = q.get('type'); }
        if (q.get('destination')) { state.destination = q.get('destination'); }
      } catch (err) { /* file:// safe guard */ }
    }

    function syncChips() {
      chips.forEach(function (chip) {
        var on = state[chip.getAttribute('data-filter-group')] === chip.getAttribute('data-value');
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var okType = state.type === 'all' || card.getAttribute('data-type') === state.type;
        var okDest = state.destination === 'all' || card.getAttribute('data-destination') === state.destination;
        var visible = okType && okDest;
        card.hidden = !visible;
        if (visible) { shown += 1; }
      });
      if (countEl) {
        countEl.textContent = 'SHOWING ' + shown + ' OF ' + cards.length;
      }
      if (liveEl) {
        liveEl.textContent = shown === 0
          ? 'No case studies match this combination.'
          : shown + ' case ' + (shown === 1 ? 'study' : 'studies') + ' shown.';
      }
      if (emptyEl) { emptyEl.hidden = shown !== 0; }
      syncChips();
      try {
        var q = new URLSearchParams();
        if (state.type !== 'all') { q.set('type', state.type); }
        if (state.destination !== 'all') { q.set('destination', state.destination); }
        var qs = q.toString();
        window.history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
      } catch (err) { /* ignore history errors on file:// */ }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var group = chip.getAttribute('data-filter-group');
        var value = chip.getAttribute('data-value');
        state[group] = state[group] === value ? 'all' : value;
        apply();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.type = 'all';
        state.destination = 'all';
        apply();
        var firstChip = grid.querySelector('.chip[data-filter-group]');
        if (firstChip) { firstChip.focus(); }
      });
    }

    readUrl();
    apply();
  }

  /* ---------------------------------------------------------
     6) Forms — POST to the site's own endpoint
        The endpoint is `src/pages/api/inquiry.ts`, the single
        server-rendered route on this otherwise-static site
        (`export const prerender = false`). It returns real
        HTTP statuses: 200 sent, 400 bad input, 429 rate-limited,
        502 SMTP failure, 503 SMTP not configured. The UI only
        shows "sent" on a genuine 2xx with `ok: true`.

        NOTE: the endpoint URL must keep its trailing slash. This
        site sets `trailingSlash: 'always'`, so POSTing to the
        slash-less path gets a 301 that downgrades POST to GET and
        ends on the GET handler's 405.
     --------------------------------------------------------- */
  function showStatus(form, kind) {
    var target = form.parentNode.querySelector('[data-form-status="' + kind + '"]');
    if (!target) { return; }
    target.hidden = false;
    if (kind === 'ok') {
      form.hidden = true;
      var focus = target.querySelector('[tabindex="-1"]');
      if (focus) { focus.focus(); }
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  Array.prototype.forEach.call(doc.querySelectorAll('form[data-form]'), function (form) {
    var endpoint = form.getAttribute('data-endpoint') || '/api/inquiry/';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var button = form.querySelector('[data-submit]');
      var label = button ? button.textContent : null;
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }

      var payload = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) { return; }
        if (el.type === 'radio' && !el.checked) { return; }
        payload[el.name] = el.value;
      });
      payload.source = location.pathname;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: false }; }).then(function (json) {
            return { status: res.status, json: json };
          });
        })
        .then(function (out) {
          if (out.status >= 200 && out.status < 300 && out.json && out.json.ok) {
            showStatus(form, 'ok');
          } else {
            var detail = form.parentNode.querySelector('[data-form-error]');
            if (detail && out.json && out.json.error) { detail.textContent = out.json.error; }
            showStatus(form, 'err');
          }
        })
        .catch(function () {
          var detail = form.parentNode.querySelector('[data-form-error]');
          if (detail) { detail.textContent = 'The connection failed. Please try again, or message us on WhatsApp.'; }
          showStatus(form, 'err');
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            if (label !== null) { button.textContent = label; }
          }
        });
    });
  });
})();

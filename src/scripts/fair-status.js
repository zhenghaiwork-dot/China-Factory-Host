/* ============================================================================
   Canton Fair phase status — the pure part.

   Kept out of app.js and out of the DOM on purpose: "which day of the fair is
   it" has five answers and every one of them is a date comparison, which is
   exactly the kind of logic that is wrong at the edges and impossible to check
   by looking at a page. As a pure function it can be asserted against.

   Every date is handled as UTC midnight. "Today" is the visitor's instant
   shifted to UTC+8 — Guangzhou keeps one offset all year round, so adding
   eight hours is exact and needs no timezone database. Differences between
   UTC midnights are then whole days, with no DST edge cases.

   Returns null whenever it cannot produce a trustworthy answer, so the caller
   leaves the server-rendered date range in place. A wrong "Day 4" is far worse
   than no day at all.
   ========================================================================== */

const DAY = 86400000;
const GZ_OFFSET = 8 * 3600 * 1000;

/** "2026-10-15" -> UTC midnight ms, or NaN if it is not that shape. */
export function midnight(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso == null ? '' : iso));
  if (!m) { return NaN; }
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Whole days between two UTC midnights. */
function daysBetween(a, b) {
  return Math.round((b - a) / DAY);
}

/**
 * @param {{no:number, from:string, to:string}[]} windows  one per phase, in order
 * @param {number} nowMs  Date.now(), i.e. a real instant, not a date
 * @returns {{text:string, pct:number, phaseNo:number|null}|null}
 */
export function fairStatus(windows, nowMs) {
  if (!Array.isArray(windows) || windows.length === 0 || typeof nowMs !== 'number') {
    return null;
  }

  const spans = [];
  for (const w of windows) {
    const from = midnight(w && w.from);
    const to = midnight(w && w.to);
    const span = daysBetween(from, to) + 1;
    if (isNaN(from) || isNaN(to) || span < 1) { return null; }
    spans.push({ no: w.no, from, to, span });
  }

  /* Today, as a UTC midnight, in Guangzhou. */
  const shifted = new Date(nowMs + GZ_OFFSET);
  const today = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());

  const exhibitionDays = spans.reduce((n, s) => n + s.span, 0);

  let current = null;
  let done = 0;
  for (const s of spans) {
    if (today >= s.from && today <= s.to) { current = s; break; }
    if (today > s.to) { done += s.span; }
  }

  if (current) {
    const dayNo = daysBetween(current.from, today) + 1;
    const pretty = shifted.toLocaleDateString('en-GB', {
      timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
    });
    return {
      text: 'Day ' + dayNo + ' of ' + current.span + ' · Phase ' + current.no + ' · ' + pretty,
      pct: ((done + dayNo) / exhibitionDays) * 100,
      phaseNo: current.no,
    };
  }

  if (today < spans[0].from) {
    const opens = daysBetween(today, spans[0].from);
    return {
      text: opens === 1 ? 'Phase 1 opens tomorrow' : 'Phase 1 opens in ' + opens + ' days',
      pct: 0,
      phaseNo: null,
    };
  }

  const last = spans[spans.length - 1];
  if (today > last.to) {
    return { text: 'The 140th session has ended', pct: 100, phaseNo: null };
  }

  /* Between two phases: the halls are closed for switch-over. */
  const next = spans.find((s) => today < s.from);
  if (!next) { return null; }
  const gap = daysBetween(today, next.from);
  return {
    text: 'Switch-over — no exhibition · Phase ' + next.no +
      (gap === 1 ? ' opens tomorrow' : ' opens in ' + gap + ' days'),
    pct: (done / exhibitionDays) * 100,
    phaseNo: null,
  };
}

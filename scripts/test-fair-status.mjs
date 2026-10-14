/* Assertions for the Canton Fair phase status.
   Run: node scripts/_test-fair-status.mjs */
import { fairStatus } from '../src/scripts/fair-status.js';

const windows = [
  { no: 1, from: '2026-10-15', to: '2026-10-19' },
  { no: 2, from: '2026-10-23', to: '2026-10-27' },
  { no: 3, from: '2026-10-31', to: '2026-11-04' },
];

/* Build an instant that is "HH:MM in Guangzhou" on a given UTC date.
   Guangzhou is UTC+8 all year, so 00:30 local is 16:30 UTC the day before. */
function atGz(iso, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const base = Date.parse(iso + 'T00:00:00Z');
  return base + h * 3600000 + m * 60000 - 8 * 3600000;
}

const cases = [
  /* well before */
  ['2026-09-01', '10:00', (r) => r.text.match(/^Phase 1 opens in \d+ days$/) && r.pct === 0],
  /* the day before, late evening local */
  ['2026-10-14', '23:30', (r) => r.text === 'Phase 1 opens tomorrow' && r.pct === 0],
  /* opening day */
  ['2026-10-15', '09:00', (r) => r.text.startsWith('Day 1 of 5 · Phase 1') && r.phaseNo === 1 && Math.abs(r.pct - 100 / 15) < 0.01],
  /* middle of phase 1 */
  ['2026-10-17', '14:00', (r) => r.text.startsWith('Day 3 of 5 · Phase 1') && Math.abs(r.pct - 300 / 15) < 0.01],
  /* last day of phase 1 */
  ['2026-10-19', '18:00', (r) => r.text.startsWith('Day 5 of 5 · Phase 1') && Math.abs(r.pct - 500 / 15) < 0.01],
  /* first switch-over day */
  ['2026-10-20', '09:00', (r) => r.text.includes('Switch-over') && r.text.includes('Phase 2 opens in 3 days') && Math.abs(r.pct - 500 / 15) < 0.01],
  /* last switch-over day */
  ['2026-10-22', '09:00', (r) => r.text.includes('Phase 2 opens tomorrow')],
  /* phase 2 first day */
  ['2026-10-23', '09:00', (r) => r.text.startsWith('Day 1 of 5 · Phase 2') && r.phaseNo === 2 && Math.abs(r.pct - 600 / 15) < 0.01],
  /* second switch-over */
  ['2026-10-29', '09:00', (r) => r.text.includes('Switch-over') && r.text.includes('Phase 3') && Math.abs(r.pct - 1000 / 15) < 0.01],
  /* phase 3 last day — spans a month boundary */
  ['2026-11-04', '11:00', (r) => r.text.startsWith('Day 5 of 5 · Phase 3') && r.pct === 100],
  /* the day after the session ends */
  ['2026-11-05', '09:00', (r) => r.text === 'The 140th session has ended' && r.pct === 100],
  /* long after */
  ['2027-03-01', '09:00', (r) => r.text === 'The 140th session has ended'],
];

let failed = 0;
for (const [iso, hhmm, check] of cases) {
  const r = fairStatus(windows, atGz(iso, hhmm));
  const label = iso + ' ' + hhmm + ' GZ';
  if (!r) { console.log('  FAIL ' + label + ' -> null'); failed++; continue; }
  const ok = check(r);
  console.log((ok ? '  OK   ' : '  FAIL ') + label + '  "' + r.text + '"  pct=' + r.pct.toFixed(2));
  if (!ok) { failed++; }
}

/* Refuses to invent an answer rather than printing a wrong one. */
const bad = [
  [[], Date.now(), 'no windows'],
  [null, Date.now(), 'null windows'],
  [[{ no: 1, from: 'nonsense', to: '2026-10-19' }], Date.now(), 'unparseable date'],
  [[{ no: 1, from: '2026-10-19', to: '2026-10-15' }], Date.now(), 'reversed range'],
  [windows, 'not a number', 'bad nowMs'],
];
for (const [w, n, label] of bad) {
  const r = fairStatus(w, n);
  const ok = r === null;
  console.log((ok ? '  OK   ' : '  FAIL ') + 'refuses: ' + label);
  if (!ok) { failed++; }
}

/* The UTC+8 shift has to matter. Both instants below fall on 14 October in
   UTC, so a naive UTC-date reading would answer "opens tomorrow" for both —
   but in Guangzhou 15:00Z is already the 15th and 17:00Z is opening morning. */
const beforeMidnightGz = fairStatus(windows, Date.parse('2026-10-14T15:00:00Z'));  // 23:00 local, 14th
const afterMidnightGz = fairStatus(windows, Date.parse('2026-10-14T17:00:00Z'));   // 01:00 local, 15th
const shiftOk =
  beforeMidnightGz && beforeMidnightGz.text === 'Phase 1 opens tomorrow' &&
  afterMidnightGz && afterMidnightGz.text.startsWith('Day 1');
console.log((shiftOk ? '  OK   ' : '  FAIL ') + 'UTC+8 shift applied');
if (!shiftOk) { failed++; }

console.log('');
if (failed) { console.log(failed + ' ASSERTION(S) FAILED'); process.exit(1); }
console.log('ALL ' + (cases.length + bad.length + 1) + ' ASSERTIONS PASSED');

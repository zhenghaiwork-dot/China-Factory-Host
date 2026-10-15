import source from './fairs_final.json' with { type: 'json' };

export const meta = source.meta;
export const chinaToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const formatDate = value => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
export const monthLabel = value => new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + '-01T00:00:00Z'));

// Explicit public projection: never pass the research object into browser code.
export const fairs = source.fairs.filter(f => ['Publish', 'Publish with caveat'].includes(f.status)).map(f => {
  const n = f.next_edition;
  const confirmed = n.date_status === 'confirmed_by_source';
  const url = f.official_url?.match(/^https?:\/\/[^\s；]+/)?.[0] || null;
  const dates = confirmed ? `${formatDate(n.start)} – ${formatDate(n.end)}` : n.display_text
    .replace(/\s*\(past:.*\)/i, '')
    .replace(/\s*\([^)]*edition[^)]*\)/gi, '')
    .replace(/\b\d{1,2}-\d{1,2}\s+(?=[A-Z][a-z]{2}\b)/g, '');
  const detail = confirmed ? n.display_text.replace(/\s*\(B-level\)/g, '').replace(/\s*\(autumn 2026 edition:.*\)/, '') : null;
  return { id:f.id, name:f.name_en_display, chinese:f.name_zh, city:f.city, province:f.province, industry:f.industry,
    products:f.products_en, keywords:f.products_en.replace(/^Source factories:\s*/, '').split(/,\s*/).slice(0,5),
    confirmed, start:confirmed ? n.start : '', end:confirmed ? n.end : '', month:n.sort_month || '', dates, detail,
    cycle:f.edition_cycle, url, venue:f.venue_zh, organizer:f.organizer_zh, caveat:f.needs_caveat };
}).sort((a,b) => (a.month || '9999').localeCompare(b.month || '9999') || (a.start || '9999').localeCompare(b.start || '9999') || a.name.localeCompare(b.name));

export const clusters = source.cluster_routes.map(c => ({ id:c.id, name:c.cluster_en, route:c.route_en
  .replace(/ \(13 consecutive years per the county government\)/, '')
  .replace('About 50 local firms', 'Local firms')
  .replace('; do not list a Jieyang fair.', '.')
  .replace('For overseas buyers the A-file suggests', 'For overseas buyers, the suggested alternative is')
  .replace('The 2027 summer-mat fair (2-4 Mar 2027)', 'The local summer-mat fair') }));

export const faq = [
  ['Can overseas buyers attend these fairs?', 'Most listed fairs are open to trade visitors. Registration requirements, fees and badge types vary by fair and edition. Confirm with the organizer before travelling.'],
  ['Are the dates final?', 'Published dates are marked as source-confirmed in our research, but may still change. Dates to be announced means the exact schedule is awaiting confirmation, not that the fair has been cancelled. Confirm with the organizer before booking travel.'],
  ['Why do some fairs show only a month?', 'Where exact dates are not confirmed, we show the expected month or season as a planning lead, with a Dates to be announced label.'],
  ['What does organizer-reported mean?', 'It means a figure comes from the organizer’s own material and has not been independently verified. This directory does not publish visitor or exhibitor counts.'],
  ['Why are some export clusters missing from the fair list?', 'We have not identified a verified local sourcing fair for every cluster. The separate cluster routes describe other ways to reach suppliers, including specialist markets and fairs in other cities.'],
  ['Can ChinaFactoryHost help me visit factories near a fair?', 'Planning a trip around a fair? See how our factory visit service works.']
];

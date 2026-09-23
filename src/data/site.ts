/* Site-wide constants.
   NOTE: src/fetch.ts is reserved by Astro 7 — never create it. */

/* ---------- Reply-time promise ----------
   ONE source of truth. Every rail / footer / CTA / wa-bar string is built from
   REPLY_TIME below, so the site cannot publish two different response times
   again (critique M2).

   The wording is deliberately a COMMITMENT WE CONTROL, not a statistic. The old
   "Usually replies in <1h" was an invented, unmeasurable figure and contradicted
   the other three promises on the same screen. Do not put a number in here that
   we cannot be held to.

   REPLY_WINDOW is the only literal; the three sentence forms are derived from
   it, so there is nothing to keep in sync by hand. */
const REPLY_WINDOW = '1 business day';
/** lower-case fragment, for mid-sentence use: "we reply {REPLY_TIME}" */
export const REPLY_TIME = 'within ' + REPLY_WINDOW;              // "within 1 business day"
export const REPLY_TIME_PROMISE = 'Reply ' + REPLY_TIME;         // "Reply within 1 business day"
export const REPLY_TIME_SHORT = 'Within ' + REPLY_WINDOW;        // "Within 1 business day"
export const REPLY_TIME_MICRO =
  'No obligation. We reply ' + REPLY_TIME + ', China Time (GMT+8).';

/* ---------- Report turnaround ----------
   Same one-source rule as REPLY_TIME above: /services/ promised "three days
   after you fly home" while /services/brand-sourcing-visit/ promised "within 3
   working days of your departure" — a real 1–2 day gap in what we owe a client
   (critique: two promises, one fact).

   The CONSERVATIVE reading ("within 3 working days of your departure") is the
   one published, because it is stricter on us and safer for the client.

   NOT YET CONFIRMED BY ZHENHAI. This value is a holding decision so the site
   stops contradicting itself; he still has to pick the real number. Until he
   does, treat REPORT_WINDOW_DAYS as provisional and do not quote it as settled
   policy anywhere else. */
const REPORT_WINDOW_DAYS = 3;
const REPORT_WINDOW = REPORT_WINDOW_DAYS + ' working days';
/** mid-sentence fragment: "a written report {REPORT_TURNAROUND_SHORT}" */
export const REPORT_TURNAROUND_SHORT = 'within ' + REPORT_WINDOW;
/** full commitment, tied to the trigger event */
export const REPORT_TURNAROUND = REPORT_TURNAROUND_SHORT + ' of your departure';
export const REPORT_TURNAROUND_PROMISE = 'Written report ' + REPORT_TURNAROUND;

/* ---------- Filming lead time ----------
   "Ten working days" was hand-copied across five files in four different
   wordings ("inside ten working days", "under 10 working days", "less than ten
   working days out", "Under ten working days"). One literal, two derived
   wordings: use FILMING_LEAD_TIME mid-sentence and FILMING_LEAD_TIME_SHORT
   where the digit form reads better (tables, fact grids).

   REMAINING OUT OF SCOPE — still hand-copied, not yet switched over:
     · src/pages/destinations/shenzhen/index.astro — "inside ten working days"
     · src/pages/contact/index.astro — "inside the next ten working days"
   Change those to FILMING_LEAD_TIME too when their files are free. */
export const FILMING_LEAD_TIME_DAYS = 10;
export const FILMING_LEAD_TIME = 'ten working days';
export const FILMING_LEAD_TIME_SHORT = FILMING_LEAD_TIME_DAYS + ' working days';

/* ---------- The five vetting checks ----------
   AUTHORITATIVE SOURCE: the ProcessSteps `title` values on
   /about/how-we-vet-factories/ (src/pages/about/how-we-vet-factories/index.astro).
   VET_STEPS is a verbatim copy of those five titles — do not reword them here.

   VET_STEPS_SHORT is the paired short form, one entry per step, used where the
   checks are listed inline in running copy (VetLink, DestinationPage). The two
   arrays are POSITIONALLY LINKED: VET_STEPS_SHORT[i] must stay the short form
   of VET_STEPS[i].

   If a step is ever renamed, reworded or reordered on the vetting page, BOTH
   arrays must change in the same commit — otherwise the inline lists drift from
   the page that actually defines the method. */
export const VET_STEPS: string[] = [
  'Business licence and legal status',
  'Registered scope versus registered address',
  'Capacity and equipment, arithmetically',
  'Walking the floor',
  'Somebody who can say yes',
];
export const VET_STEPS_SHORT: string[] = [
  'business licence',
  'registered scope',
  'capacity and equipment',
  'walking the floor',
  'somebody who can say yes',
];
/** the short list as running copy: "a, b, c and d" */
export const VET_STEPS_INLINE =
  VET_STEPS_SHORT.slice(0, -1).join(', ') + ' and ' + VET_STEPS_SHORT[VET_STEPS_SHORT.length - 1];

/* ---------- WhatsApp ----------
   Empty until the real WhatsApp Business number is provisioned.
   A wa.me link built from a placeholder number is a LIVE link to whoever owns
   that number: 113 of them shipped in one build (critique M3). So the number is
   a configuration point that starts empty, and waLink() returns '' while it is.
   Every call site must treat '' as "render no wa.me anchor at all". */
export const WA_NUMBER = '';
export const isWaConfigured = WA_NUMBER.length > 0;

/** Returns '' when no number is configured — callers MUST NOT emit an anchor. */
export function waLink(message: string): string {
  if (!isWaConfigured) return '';
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
}

/* ---------- Public contact email ----------
   Confirmed 2026-09-22: domain is chinafactoryhost.com, prefix is `support`.
   This is the PUBLIC, monitored inbox — rendered as a mailto on the contact
   page and in the footer. It must match INQUIRY_TO (the env var the inquiry
   notification lands in); INQUIRY_FROM stays a separate verified sender
   (e.g. inquiry@). Not a placeholder: both the prefix and the domain are
   decided, so this renders live rather than carrying a data-placeholder. */
export const CONTACT_EMAIL = 'support@chinafactoryhost.com';

/* ---------- Public host / contact persona ----------
   Confirmed 2026-09-22: the public-facing contact name is "Chenghai" (成海), a
   display persona — NOT the operator's legal name. Route A (named person):
   customers address the team by this name. Used on the About page, the contact
   page signature, the inquiry email From display name and (optionally) the
   WhatsApp greeting. Single source — keep every customer-facing "who you are
   dealing with" string in sync through these two constants.

   HOST_NAME     — the bare name customers use ("Hi Chenghai").
   HOST_SIGNATURE — the name + brand, for signatures and the email From header. */
export const HOST_NAME = 'Chenghai';
export const HOST_SIGNATURE = 'Chenghai · ChinaFactoryHost';

export const SITE = 'ChinaFactoryHost';
export const SITE_URL = 'https://chinafactoryhost.com';

/* Placeholder markers are namespaced by KIND, because one generic value made the
   pre-launch grep useless: 174 hits, no way to tell a dead phone number from an
   empty picture frame (critique M3).
     · data-placeholder="wa-number" — a slot waiting for the real WhatsApp number
     · data-placeholder="image"     — an empty PhotoSlot plate
   A pre-launch `grep -c 'data-placeholder="wa-number"' dist` must be 0. */
export const WA_ATTRS = {
  target: '_blank',
  rel: 'noopener',
  'data-placeholder': 'wa-number',
} as const;

export type NavItem = { href: string; label: string; sub?: string };
export type NavGroup = { key: string; label: string; title: string; items: NavItem[] };
export type NavLink = { key: string; label: string; href: string };
export type NavEntry = NavGroup | NavLink;

export const NAV: NavEntry[] = [
  { key: 'factory-visits', label: 'Factory visits', href: '/factory-visits/' },
  {
    key: 'services',
    label: 'Services',
    title: 'Services',
    items: [
      { href: '/services/existing-supplier-visits/', label: 'Visit existing suppliers', sub: 'you already have a shortlist' },
      { href: '/services/factory-matching/', label: 'Factory matching', sub: 'no shortlist yet' },
      { href: '/services/factory-visit-planning/', label: 'Visit planning', sub: 'route, appointments, timing' },
      { href: '/services/factory-visit-interpreter/', label: 'Interpreter', sub: 'business, not tourist, Chinese' },
      { href: '/services/creator-factory-tour/', label: 'Creator factory tour', sub: 'film inside real factories' },
      { href: '/services/brand-sourcing-visit/', label: 'Brand sourcing visit', sub: 'verify before you commit' },
      { href: '/services/on-site-support/', label: 'On-site support', sub: 'hosting, transport, interpreting' },
      { href: '/services/', label: 'All services', sub: 'overview & what comes next' },
    ],
  },
  { key: 'sourcing-trips', label: 'Sourcing trips', href: '/china-sourcing-trips/' },
  {
    key: 'destinations',
    label: 'Destinations',
    title: 'Destinations',
    items: [
      { href: '/destinations/zhejiang/', label: 'Zhejiang', sub: 'the home province' },
      { href: '/destinations/yiwu/', label: 'Yiwu', sub: 'small commodities' },
      { href: '/destinations/ningbo-hangzhou/', label: 'Ningbo / Hangzhou', sub: 'appliances, hardware, textiles' },
      { href: '/destinations/shaoxing-keqiao/', label: 'Shaoxing / Keqiao', sub: 'textiles & fabrics' },
      { href: '/destinations/shenzhen/', label: 'Shenzhen', sub: 'electronics' },
      { href: '/destinations/guangzhou-dongguan/', label: 'Guangzhou / Dongguan', sub: 'OEM & private label' },
      { href: '/destinations/foshan-shunde/', label: 'Foshan / Shunde', sub: 'furniture & appliances' },
    ],
  },
  {
    key: 'industries',
    label: 'Industries',
    title: 'Industries',
    items: [
      { href: '/industries/', label: 'All industries', sub: 'overview & how we pick' },
      { href: '/industries/beauty-packaging/', label: 'Beauty & packaging', sub: 'formula vs packaging plants' },
      { href: '/industries/toys-gifts-commodities/', label: 'Toys, gifts & commodities', sub: 'EN71 / ASTM basics' },
      { href: '/industries/electronics-smart-hardware/', label: 'Electronics & smart hardware', sub: 'PCB, SMT, assembly' },
      { href: '/industries/small-home-appliances/', label: 'Small home appliances', sub: 'motors, safety testing' },
      { href: '/industries/textiles-fabrics/', label: 'Textiles & fabrics', sub: 'weaving, dyeing, finishing' },
      { href: '/industries/furniture-home-furnishing/', label: 'Furniture & home furnishing', sub: 'materials, structure' },
    ],
  },
  /* The three hub pages below were built as children-first: 11 sub-pages existed
     with no parent entry point, so /guides/, /tools/ and /who-we-help/ were 404s
     and their children were orphans. These entries are the fix — do not remove
     them without providing another crawlable path to the children. */
  {
    key: 'resources',
    label: 'Resources',
    title: 'Guides, tools & who we help',
    items: [
      { href: '/guides/', label: 'Guides', sub: 'planning, checklists, vetting' },
      { href: '/tools/', label: 'Tools', sub: 'hub finder, visit scorecard' },
      { href: '/who-we-help/', label: 'Who we help', sub: 'buyers, founders, teams, creators' },
      { href: '/how-it-works/', label: 'How it works', sub: 'enquiry to follow-up' },
      { href: '/pricing/', label: 'Pricing', sub: 'how a visit is quoted' },
      { href: '/faq/', label: 'FAQ', sub: 'the questions we get first' },
    ],
  },
  /* Three separate top-level links used to sit here (How we vet / Case studies /
     About). With Services, Destinations and Industries expanded, that made nine
     header entries and the row no longer fit: measured at 1440px,
     .site-header__actions was pushed to L=1320 R=1456 — 16px past the viewport,
     on all 53 routes. The content map asks for seven top-level entries, so the
     three trust pages are now one group. */
  {
    key: 'about',
    label: 'About',
    title: 'Who is actually hosting you',
    items: [
      { href: '/about/', label: 'About the team', sub: 'based in Zhejiang' },
      { href: '/about/how-we-vet-factories/', label: 'How we vet factories', sub: 'the five documented checks' },
      { href: '/case-studies/', label: 'Case studies', sub: 'real trips, real findings' },
    ],
  },
];

export const FOOTER_SERVICES: NavItem[] = [
  { href: '/services/existing-supplier-visits/', label: 'Visit existing suppliers' },
  { href: '/services/factory-matching/', label: 'Factory matching' },
  { href: '/services/factory-visit-planning/', label: 'Visit planning' },
  { href: '/services/factory-visit-interpreter/', label: 'Interpreter' },
  { href: '/services/creator-factory-tour/', label: 'Creator factory tour' },
  { href: '/services/brand-sourcing-visit/', label: 'Brand sourcing visit' },
  { href: '/services/on-site-support/', label: 'On-site support' },
  { href: '/services/on-site-support/filming-coordination/', label: 'Filming coordination' },
  { href: '/services/', label: 'Service overview' },
];

/* Second crawlable path to the three hub pages. The header nav can be collapsed
   on narrow screens, so the hubs need a footer route too — otherwise the 11
   sub-pages depend on a single entry point. */
export const FOOTER_RESOURCES: NavItem[] = [
  { href: '/trade-shows/', label: 'Trade shows + factory visits' },
  { href: '/guides/', label: 'Guides' },
  { href: '/tools/', label: 'Tools' },
  { href: '/who-we-help/', label: 'Who we help' },
  { href: '/how-it-works/', label: 'How it works' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/plan-my-trip/', label: 'Plan my trip' },
];

export const FOOTER_DESTINATIONS: NavItem[] = [
  { href: '/destinations/zhejiang/', label: 'Zhejiang' },
  { href: '/destinations/yiwu/', label: 'Yiwu' },
  { href: '/destinations/ningbo-hangzhou/', label: 'Ningbo / Hangzhou' },
  { href: '/destinations/shaoxing-keqiao/', label: 'Shaoxing / Keqiao' },
  { href: '/destinations/shenzhen/', label: 'Shenzhen' },
  { href: '/destinations/guangzhou-dongguan/', label: 'Guangzhou / Dongguan' },
  { href: '/destinations/foshan-shunde/', label: 'Foshan / Shunde' },
];

export const FOOTER_TRUST: NavItem[] = [
  { href: '/industries/beauty-packaging/', label: 'Beauty & personal-care packaging' },
  { href: '/industries/toys-gifts-commodities/', label: 'Toys, gifts & commodities' },
  { href: '/industries/electronics-smart-hardware/', label: 'Electronics & smart hardware' },
  { href: '/about/how-we-vet-factories/', label: 'How we vet factories' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/case-studies/', label: 'Case studies' },
  { href: '/about/', label: 'About the team' },
];

/* Service JSON-LD, keyed by route.
 *
 * Why a table here instead of a per-page prop:
 *   · the eight service pages are being rewritten by the content build in
 *     parallel, and a prop would mean editing all eight at once — collision
 *     risk, and this project has no git to fall back on;
 *   · the service name and what it covers is metadata, not body copy. One
 *     table is the single source of truth for what we claim to offer.
 *
 * Evidence-gating applies here as it does everywhere else on this site
 * (see BaseLayout.astro): only fields the corresponding page actually states.
 * No price, no rating, no address, no phone until those are published — a
 * machine-readable field we cannot back with a page is worse than a missing
 * one, because it is fiction that parses.
 *
 * Keys must match Astro.url.pathname exactly: trailingSlash is 'always'.
 */
export interface ServiceSchema {
  name: string;
  description: string;
  serviceType: string;
}

export const SERVICE_SCHEMA: Record<string, ServiceSchema> = {
  '/services/brand-sourcing-visit/': {
    name: 'Brand sourcing visit',
    description:
      'A hosted verification trip to Chinese factories: five documented checks per factory, the production manager in the room, and a written report afterwards.',
    serviceType: 'Factory verification visit',
  },
  '/services/creator-factory-tour/': {
    name: 'Creator factory tour',
    description:
      'Group and private factory tours for creators: filming permission requested in writing in advance, a technical interpreter on the floor, and a straight answer on what cannot be filmed before you book.',
    serviceType: 'Factory filming tour',
  },
  '/services/existing-supplier-visits/': {
    name: 'Existing supplier visits',
    description:
      'Verification of suppliers you already have: we check each one, arrange the visits and run them so you meet the production manager instead of a sales representative.',
    serviceType: 'Supplier verification visit',
  },
  '/services/factory-matching/': {
    name: 'Factory matching',
    description:
      'For buyers who know the product but not the region: we name the right cluster, build and pre-screen a candidate pool, and hand over a shortlist worth visiting.',
    serviceType: 'Supplier shortlisting',
  },
  '/services/factory-visit-interpreter/': {
    name: 'Factory visit interpreter',
    description:
      'Technical interpreting on the factory floor: tolerances, tooling terms and payment conditions carried both ways without being softened.',
    serviceType: 'Technical interpreting',
  },
  '/services/factory-visit-planning/': {
    name: 'Factory visit planning',
    description:
      'Sequencing, transport and appointments built around production schedules and industrial clusters, so a trip covers ground instead of backtracking.',
    serviceType: 'Trip planning',
  },
  '/services/on-site-support/': {
    name: 'On-site support in China',
    description:
      'Interpreting, transport and logistics after you land. Pick the pieces rather than a package; coverage depends on the cluster.',
    serviceType: 'On-the-ground support',
  },
  '/services/on-site-support/filming-coordination/': {
    name: 'Filming coordination',
    description:
      'How filming permission inside Chinese factories is requested, what is usually refused, who owns the footage, and realistic lead times by cluster and category.',
    serviceType: 'Filming permission coordination',
  },
};

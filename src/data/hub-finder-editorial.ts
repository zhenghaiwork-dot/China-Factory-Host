import { SOURCING_PRODUCTS, SOURCING_MODES, type SourcingProduct, type SourcingMode } from './sourcing-products.ts';
import { MANUFACTURING_HUBS } from './manufacturing-hubs.ts';
import { HUB_DATA_VERSION, HUB_REVIEWED, HUB_SOURCES } from './hub-sources.ts';
import { SITE_URL } from './site.ts';
import { HUB_FINDER_PATH } from '../lib/match-manufacturing-hubs.ts';

/** Search-readable content and schema share the same reviewed product data. */
export const HUB_FINDER_TITLE = 'China Manufacturing Hub Finder: Product Sourcing Regions';
export const HUB_FINDER_DESCRIPTION = 'Find where to source products in China: manufacturing hubs, wholesale markets, supplier types, checks and cited sources. Free product-to-region finder.';
export const HUB_FINDER_CANONICAL = new URL(HUB_FINDER_PATH, SITE_URL).href;

export function productDirectionSummary(product: SourcingProduct): string {
  const base = product.recommendations.map((r) => MANUFACTURING_HUBS[r.hub].name).join(' or ');
  const branches = Object.entries(product.modeRecommendations || {});
  if (!branches.length) return `Start researching in ${base}.`;
  const branchDescriptions = branches.map(([mode, records]) => {
    const label = mode === 'stock' ? 'Existing collections' : mode === 'custom' ? 'Product development' : SOURCING_MODES[mode as SourcingMode];
    return `${label}: ${records!.map((r) => MANUFACTURING_HUBS[r.hub].name).join(' or ')}.`;
  });
  return [`Starting directions: ${base}.`, ...branchDescriptions].join(' ');
}

export const HUB_FINDER_QUESTIONS = [
  {
    question: 'How do I choose a sourcing region in China?',
    answer: 'Start with the exact product and the work you need done. Buying an existing design, developing a new shape and sourcing a component can require different suppliers. Use the regions in this directory as research starting points, then check each supplier against your specification.',
  },
  {
    question: 'Does a smaller order mean I should source from Yiwu?',
    answer: 'Order quantity alone does not decide the region. An existing market product and a new moulded part need different sourcing approaches even at the same quantity. Ask for the MOQ of your exact design, material, colour and packaging before deciding.',
  },
  {
    question: 'Is a wholesale market supplier the same as a factory?',
    answer: 'A market supplier can be a trader, a manufacturer’s sales outlet or another intermediary. Ask who makes the exact item and where production happens. A market stall or showroom address is not a verified factory address.',
  },
  {
    question: 'Can this finder confirm a supplier or factory visit?',
    answer: 'The finder identifies regional research directions and preparation questions. It does not confirm an individual supplier’s capability, certifications, MOQ, price or permission to visit. Confirm the actual production address, suitable processes and appointment before travelling.',
  },
  {
    question: 'How is the information checked and what is covered?',
    answer: 'The directory uses public government, market-operator, chamber and manufacturer material. Each source states what it supports and what still needs verification. The review date describes our check of regional information. This is a selected product directory; an unlisted product may still have suitable suppliers elsewhere in China.',
  },
];

export function hubFinderStructuredData() {
  const publisher = { '@id': SITE_URL + '/#organization' };
  const sourceIds = [...new Set(SOURCING_PRODUCTS.flatMap((p) =>
    [p.recommendations, ...Object.values(p.modeRecommendations || {})].flatMap((records) => records!.flatMap((r) => r.sourceIds))
  ))];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage', '@id': HUB_FINDER_CANONICAL + '#page', url: HUB_FINDER_CANONICAL,
        name: HUB_FINDER_TITLE, description: HUB_FINDER_DESCRIPTION, inLanguage: 'en',
        publisher, isAccessibleForFree: true, dateModified: HUB_REVIEWED,
        mainEntity: { '@id': HUB_FINDER_CANONICAL + '#product-directory' },
        hasPart: { '@id': HUB_FINDER_CANONICAL + '#application' },
        citation: sourceIds.map((id) => ({ '@type': 'CreativeWork', name: HUB_SOURCES[id].title, url: HUB_SOURCES[id].url })),
      },
      {
        '@type': 'ItemList', '@id': HUB_FINDER_CANONICAL + '#product-directory',
        name: 'Product-to-region sourcing directory', numberOfItems: SOURCING_PRODUCTS.length,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: SOURCING_PRODUCTS.map((product, index) => ({
          '@type': 'ListItem', position: index + 1,
          item: {
            '@type': 'Thing', '@id': HUB_FINDER_CANONICAL + '#product-' + product.id,
            url: HUB_FINDER_CANONICAL + '#product-' + product.id,
            name: product.name, description: productDirectionSummary(product),
          },
        })),
      },
      {
        '@type': 'WebApplication', '@id': HUB_FINDER_CANONICAL + '#application',
        name: 'China Manufacturing Hub Finder', url: HUB_FINDER_CANONICAL, publisher,
        applicationCategory: 'BusinessApplication', operatingSystem: 'Any', inLanguage: 'en',
        isAccessibleForFree: true, softwareVersion: HUB_DATA_VERSION,
        browserRequirements: 'A web browser. JavaScript enables interactive filtering; the full product directory remains readable without JavaScript.',
        featureList: ['Product and category search', 'Sourcing approach and material filters', 'Regional evidence and supplier questions', 'Shareable sourcing directions'],
      },
    ],
  };
}

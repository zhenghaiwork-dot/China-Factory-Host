import { HUB_DATA_VERSION, HUB_SOURCES, type HubSource } from '../data/hub-sources.ts';
import { MANUFACTURING_HUBS, type ManufacturingHub } from '../data/manufacturing-hubs.ts';
import { PRODUCT_CATEGORIES, SOURCING_MODES, SOURCING_PRODUCTS, type SourcingMode, type SourcingProduct, type HubRecommendation } from '../data/sourcing-products.ts';

export const HUB_FINDER_PATH = '/tools/china-manufacturing-hub-finder/';
export interface FinderInput { product: string; mode?: string; material?: string; quantity?: string; }
export interface FinderState { product: string; mode: SourcingMode; material: string; quantity: string; }
export interface FinderResult {
  state: FinderState;
  product: SourcingProduct;
  recommendations: (Omit<HubRecommendation, 'hub'> & { hub: ManufacturingHub; sources: HubSource[] })[];
  notes: string[];
  notices: string[];
  brief: string;
}

export function normalizeProductQuery(query: string): string {
  return query.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
export function searchProducts(query = '', category = ''): SourcingProduct[] {
  const tokens = normalizeProductQuery(query.slice(0, 100)).split(' ').filter(Boolean);
  return SOURCING_PRODUCTS.filter((p) => (!category || p.category === category) &&
    tokens.every((token) => normalizeProductQuery([p.name, ...p.aliases].join(' ')).includes(token)));
}
export function getProduct(id: string): SourcingProduct | undefined {
  return SOURCING_PRODUCTS.find((p) => p.id === id);
}

function quantityValue(value: string, unit: SourcingProduct['unit']): string | null {
  const raw = value.trim();
  if (!raw) return '';
  const pattern = unit === 'metres' ? /^\d{1,10}(?:\.\d{1,3})?$/ : /^\d{1,10}$/;
  if (!pattern.test(raw) || Number(raw) <= 0 || Number(raw) > 1_000_000_000) return null;
  return String(Number(raw));
}

export function matchManufacturingHubs(input: FinderInput): FinderResult | null {
  const product = getProduct(input.product);
  if (!product) return null;
  const notices: string[] = [];
  const rawMode = input.mode || 'unknown';
  const mode: SourcingMode = product.modes.includes(rawMode as SourcingMode) ? rawMode as SourcingMode : 'unknown';
  if (mode !== rawMode) notices.push('That sourcing option does not apply to this product. Please choose it again.');
  const rawMaterial = input.material || 'unknown';
  const material = rawMaterial === 'unknown' || product.materials.some((m) => m.id === rawMaterial) ? rawMaterial : 'unknown';
  if (material !== rawMaterial) notices.push('That material option does not apply to this product. Please choose it again.');
  const parsedQuantity = quantityValue(input.quantity || '', product.unit);
  const quantity = parsedQuantity ?? '';
  if (parsedQuantity === null) notices.push(`Quantity was not used. Enter a positive ${product.unit === 'pieces' ? 'whole number' : 'number with up to three decimal places'} of ${product.unit}.`);
  const state: FinderState = { product: product.id, mode, material, quantity };
  const selected = product.modeRecommendations?.[mode] ?? product.recommendations;
  const recommendations = selected.map((r) => ({
    ...r, hub: MANUFACTURING_HUBS[r.hub], sources: r.sourceIds.map((id) => HUB_SOURCES[id]),
  }));
  const notes: string[] = [];
  const modeNote = product.modeNotes[mode];
  if (modeNote) notes.push(modeNote);
  const materialNote = product.materials.find((m) => m.id === material)?.note;
  if (materialNote) notes.push(materialNote);
  if (quantity) notes.push(`For ${quantity} ${product.unit} per design or colour, request a quotation for the exact specification. MOQ depends on the supplier and process; quantity alone does not change the region shown here.`);
  if (mode === 'unknown') notes.push('This is the product’s starting direction. Select a sourcing approach below to see more specific supplier and preparation advice.');
  const brief = [
    'Sourcing brief · ChinaFactoryHost hub finder',
    `Product: ${product.name}`,
    `Approach: ${SOURCING_MODES[mode]}`,
    `Material / construction: ${product.materials.find((m) => m.id === material)?.label || 'Not specified'}`,
    `Quantity per design / colour: ${quantity ? `${quantity} ${product.unit}` : 'Not specified'}`,
    `Research starting points: ${recommendations.map((r) => `${r.hub.name} (${r.role})`).join('; ')}`,
    'Please help confirm supplier suitability and what a factory visit would cover.',
    `Directory version: ${HUB_DATA_VERSION}`,
  ].join('\n');
  return { state, product, recommendations, notes, notices, brief };
}

/** Only documented enum IDs and a validated quantity reach the shared URL. */
export function finderUrl(input: FinderInput): string {
  const result = matchManufacturingHubs(input);
  if (!result) return HUB_FINDER_PATH;
  const q = new URLSearchParams({ product: result.state.product, v: HUB_DATA_VERSION });
  if (result.state.mode !== 'unknown') q.set('mode', result.state.mode);
  if (result.state.material !== 'unknown') q.set('material', result.state.material);
  if (result.state.quantity) q.set('qty', result.state.quantity);
  return HUB_FINDER_PATH + '?' + q.toString();
}

export function readFinderUrl(search: string): { result: FinderResult | null; category: string; notices: string[] } {
  const q = new URLSearchParams(search);
  const notices: string[] = [];
  const categoryValue = q.get('category') || '';
  const category = PRODUCT_CATEGORIES.some((c) => c.id === categoryValue) ? categoryValue : '';
  if (categoryValue && !category) notices.push('That category is no longer in the directory. Browse the products below.');
  const productValue = q.get('product') || '';
  const result = matchManufacturingHubs({ product: productValue, mode: q.get('mode') || '', material: q.get('material') || '', quantity: q.get('qty') || '' });
  if (productValue && !result) notices.push('This product link is not in the current directory. Please choose a product below.');
  if (q.get('v') && q.get('v') !== HUB_DATA_VERSION) notices.push('This saved link uses a different directory version. The information below is the current reviewed version.');
  for (const key of ['product', 'mode', 'material', 'qty', 'v', 'category']) {
    if (q.getAll(key).length > 1) notices.push(`The link repeats ${key}. Only the first value was used; check your selection.`);
  }
  return { result, category, notices: [...notices, ...(result?.notices || [])] };
}

/** Run during page compilation and in tests; incomplete records must not publish. */
export function validateHubDirectory(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const aliases = new Map<string, string>();
  const dateValid = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(new Date(s).getTime()) && new Date(s).toISOString().slice(0, 10) === s;
  for (const [id, source] of Object.entries(HUB_SOURCES)) {
    if (id !== source.id || !/^https:\/\//.test(source.url) || !source.supports || !source.limitation || !dateValid(source.reviewed)) errors.push(`Invalid source: ${id}`);
  }
  for (const [id, hub] of Object.entries(MANUFACTURING_HUBS)) {
    if (hub.id !== id || !hub.name || !hub.chinese || !hub.province || !hub.href.startsWith('/') || !hub.href.endsWith('/')) errors.push(`Invalid hub: ${id}`);
  }
  for (const p of SOURCING_PRODUCTS) {
    if (ids.has(p.id) || !/^[a-z0-9-]+$/.test(p.id)) errors.push(`Duplicate or invalid product ID: ${p.id}`);
    ids.add(p.id);
    if (!PRODUCT_CATEGORIES.some((c) => c.id === p.category) || !p.name || !p.description || !p.boundary || !dateValid(p.reviewed)) errors.push(`Incomplete product: ${p.id}`);
    if (p.prepare.length < 3 || p.questions.length < 3 || p.recommendations.length === 0 || p.recommendations.length > 3) errors.push(`Incomplete advice: ${p.id}`);
    if (!p.modes.includes('unknown') || new Set(p.modes).size !== p.modes.length || p.modes.some((m) => !Object.hasOwn(SOURCING_MODES, m))) errors.push(`Invalid modes: ${p.id}`);
    if (!p.industryHref.startsWith('/') || !p.industryHref.endsWith('/')) errors.push(`Invalid industry link: ${p.id}`);
    const materialIds = p.materials.map((m) => m.id);
    if (materialIds.includes('unknown') || new Set(materialIds).size !== materialIds.length || p.materials.some((m) => !m.note || !m.label)) errors.push(`Invalid materials: ${p.id}`);
    for (const alias of [p.name, ...p.aliases]) {
      const normalized = normalizeProductQuery(alias);
      const prior = aliases.get(normalized);
      if (!normalized || (prior && prior !== p.id)) errors.push(`Ambiguous exact alias: ${alias}`);
      aliases.set(normalized, p.id);
    }
    const lists = [p.recommendations, ...Object.values(p.modeRecommendations || {})];
    for (const mode of Object.keys(p.modeRecommendations || {})) if (!p.modes.includes(mode as SourcingMode)) errors.push(`Unreachable mode branch: ${p.id}/${mode}`);
    for (const list of lists) {
      if (!list || list.length === 0 || list.length > 3 || new Set(list.map((r) => r.hub)).size !== list.length) errors.push(`Invalid region list: ${p.id}`);
      for (const r of list || []) {
        if (!Object.hasOwn(MANUFACTURING_HUBS, r.hub) || !r.role || !r.reason || !r.fit || !r.caution || r.sourceIds.length === 0 || r.sourceIds.some((id) => !Object.hasOwn(HUB_SOURCES, id))) errors.push(`Invalid recommendation: ${p.id}/${r.hub}`);
      }
    }
  }
  return errors;
}

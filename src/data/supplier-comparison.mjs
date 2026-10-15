export const CRITERIA = [
  { id: 'identity', label: 'Business identity', prompt: 'Registered entity, production address and who will invoice you. Record documents and any mismatch to clarify.' },
  { id: 'production', label: 'Production fit', prompt: 'Processes observed, equipment relevant to your product, capacity assumptions and outsourced steps.' },
  { id: 'quality', label: 'Quality process', prompt: 'Checks, records and sample requirements relevant to your specification. Note what you could not inspect.' },
  { id: 'commercial', label: 'Commercial terms', prompt: 'Quote reference, currency, quantity, MOQ, lead time, payment and tooling terms. Keep like-for-like assumptions.' },
  { id: 'communication', label: 'People and follow-up', prompt: 'Contact person, who can answer technical questions, outstanding decisions and agreed response dates.' },
  { id: 'next', label: 'Next action', prompt: 'What must be confirmed, who owns it and by when? Record your reason for continuing or pausing.' },
];
export const STATUSES = ['Not checked', 'Evidence recorded', 'Follow-up needed', 'Concern to resolve'];
export function blankComparison() {
  return { version: 1, product: '', date: '', suppliers: Array.from({length: 3}, () => ({
    name: '', records: CRITERIA.map(c => ({criterion: c.id, status: STATUSES[0], evidence: ''}))
  }))};
}
export function parseComparison(text) {
  if (text.length > 100000) throw new Error('File is too large. Use a comparison exported from this tool.');
  const v = JSON.parse(text);
  if (v?.version !== 1 || typeof v.product !== 'string' || v.product.length > 300 ||
      typeof v.date !== 'string' || !/^($|\d{4}-\d{2}-\d{2})$/.test(v.date) ||
      !Array.isArray(v.suppliers) || v.suppliers.length !== 3) throw new Error('This is not a supported comparison file.');
  const result = blankComparison();
  result.product = v.product; result.date = v.date;
  result.suppliers = v.suppliers.map(s => {
    if (typeof s.name !== 'string' || s.name.length > 200 || !Array.isArray(s.records) || s.records.length !== CRITERIA.length) throw new Error('Invalid supplier record.');
    return {name: s.name, records: s.records.map((r, i) => {
      if (r.criterion !== CRITERIA[i].id || !STATUSES.includes(r.status) || typeof r.evidence !== 'string' || r.evidence.length > 4000) throw new Error('Invalid evidence record.');
      return {criterion: r.criterion, status: r.status, evidence: r.evidence};
    })};
  });
  return result;
}

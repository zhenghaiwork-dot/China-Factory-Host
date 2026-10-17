// Inquiry context is visitor-supplied information, never a trusted audit trail.
export function sourcePath(value) {
  if (typeof value !== 'string' || value.length > 200) return '';
  // Only local ASCII route paths; exclude query strings, fragments and URLs.
  return /^\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]*\/?$/i.test(value) ? value : '';
}

export function sourcePlacement(value) {
  return ['header', 'footer', 'floating', 'content'].includes(value) ? value : '';
}

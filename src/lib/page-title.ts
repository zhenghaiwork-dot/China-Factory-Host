/** Keep page subjects distinct while using one site-name suffix. */
export function formatPageTitle(subject: string, siteName: string): string {
  const suffix = ' | ' + siteName;
  const clean = subject.trim();
  return clean.endsWith(suffix) ? clean : clean + suffix;
}

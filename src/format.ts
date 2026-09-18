/** Short display date such as "3 Mar" from an ISO date (YYYY-MM-DD), in the viewer's locale. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

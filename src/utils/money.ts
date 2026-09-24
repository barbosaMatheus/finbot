/** Shared money and date formatting, used by more than one feature. */

export function formatMoney(value: number): string {
  const rounded = Math.round(value);
  return `$${Math.abs(rounded).toLocaleString('en-US')}${value < 0 ? ' CR' : ''}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 29" from an ISO date; the raw string if it is not one. */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day)) return iso;
  return `${MONTHS[month - 1]} ${day}`;
}

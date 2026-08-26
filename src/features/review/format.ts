/** Formatting helpers for the financial review UI. */

export function formatMoney(value: number): string {
  const rounded = Math.round(value);
  return `$${Math.abs(rounded).toLocaleString('en-US')}${value < 0 ? ' CR' : ''}`;
}

export function formatMoneyExact(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCadence(cadence: string): string {
  switch (cadence) {
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'annual':
      return 'Yearly';
    default:
      return 'Irregular';
  }
}

export function evidenceOf(item: { evidence?: unknown }): Record<string, unknown> {
  return typeof item.evidence === 'object' && item.evidence !== null
    ? (item.evidence as Record<string, unknown>)
    : {};
}

export function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

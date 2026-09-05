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
    case 'semiannual':
      return 'Every 6 months';
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

export type AmountClass = 'fixed' | 'variable' | 'erratic';

export type AmountRange = { low: number; high: number };

export function asAmountClass(value: unknown): AmountClass | null {
  return value === 'fixed' || value === 'variable' || value === 'erratic' ? value : null;
}

export function asAmountRange(value: unknown): AmountRange | null {
  if (typeof value !== 'object' || value === null) return null;
  const low = asNumber((value as { low?: unknown }).low);
  const high = asNumber((value as { high?: unknown }).high);
  return low !== null && high !== null ? { low, high } : null;
}

function ordinal(day: number): string {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/**
 * "around the 12th" — the calendar day a bill lands on. Never "due": the
 * bank shows when money left, not when a bill was owed.
 */
export function formatLandingDay(day: number | null | undefined): string | null {
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 1 || day > 31) return null;
  return `around the ${ordinal(day)}`;
}

export function formatRange(range: AmountRange | null | undefined): string | null {
  return range ? `${formatMoney(range.low)}–${formatMoney(range.high)}` : null;
}

type PlanningFields = {
  amountClass?: AmountClass | null;
  planningAmount?: number | null;
  amountRange?: AmountRange | null;
};

/**
 * One line under a recurring bill: what a plan sets aside for the next
 * posting. Fixed bills by amount, variable ones by amount and range,
 * erratic ones not reserved at all. Null for a stream that predates the
 * planning fields — nothing is invented.
 */
export function formatPlanningLine(stream: PlanningFields): string | null {
  const range = formatRange(stream.amountRange);

  switch (stream.amountClass) {
    case 'fixed':
      return stream.planningAmount != null ? `${formatMoney(stream.planningAmount)} each time` : null;
    case 'variable':
      return stream.planningAmount != null
        ? `Sets aside ${formatMoney(stream.planningAmount)}${range ? ` · has run ${range}` : ''}`
        : null;
    case 'erratic':
      return `Varies${range ? ` ${range}` : ''} · not set aside as a bill`;
    default:
      return null;
  }
}

/**
 * The sentence on the confirm card: what saying "yes, it recurs" commits
 * the plan to. What the user confirms is what the plan will reserve.
 */
export function formatConfirmConsequence(stream: PlanningFields): string | null {
  const range = formatRange(stream.amountRange);

  switch (stream.amountClass) {
    case 'fixed':
      return stream.planningAmount != null
        ? `If you confirm it, your plan sets aside ${formatMoney(stream.planningAmount)} for the next one.`
        : null;
    case 'variable':
      return stream.planningAmount != null
        ? `If you confirm it, your plan sets aside ${formatMoney(stream.planningAmount)} for the next one${
            range ? ` — it has run ${range}` : ''
          }.`
        : null;
    case 'erratic':
      return `Even if it repeats, the amount varies too much${
        range ? ` (${range})` : ''
      } to set aside as a bill.`;
    default:
      return null;
  }
}

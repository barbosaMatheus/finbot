/**
 * Words for the anchor screen. Every number comes from the API's target
 * definitions and grade results; the vocabulary follows the design notes:
 * "set aside", "lands", "around" — never "due".
 */

import type { TargetDefinition, TargetResult } from '@/api/client';
import { formatMoney, formatShortDate } from '@/utils/money';

export { formatMoney, formatShortDate };

/** Free cash can be negative; it reads "−$139", never as a credit. */
export function formatSignedMoney(value: number): string {
  const rounded = Math.round(value);
  return `${rounded < 0 ? '−' : ''}$${Math.abs(rounded).toLocaleString('en-US')}`;
}

/** The one line under the targets about what is left. */
export function freeCashLine(freeCash: number, tight: boolean): string {
  if (freeCash < 0) {
    return `${formatSignedMoney(Math.abs(freeCash))} short after bills and essentials — a tight period, so no money target this time`;
  }
  return `${formatSignedMoney(freeCash)} left after bills and essentials${
    tight ? ' — a tight period, so no money target this time' : ''
  }`;
}

/** The one-line name of a target, from its computed definition. */
export function targetTitle(target: TargetDefinition): string {
  switch (target.type) {
    case 'spend_cap':
      return `Keep ${target.bucket} under ${formatMoney(target.cap)}`;
    case 'frequency_cap':
      return `No more than ${target.maxCount} ${target.bucket} purchases`;
    case 'bill_readiness':
      return `Have ${formatMoney(target.amount)} set aside${
        target.byDate ? ` by ${formatShortDate(target.byDate)}` : ''
      }`;
    case 'savings_transfer':
      return `Move ${formatMoney(target.amount)} to savings`;
    case 'debt_payment':
      return `Pay ${formatMoney(target.amount)} toward what you owe`;
    case 'awareness':
      switch (target.kind) {
        case 'tag_unknowns':
          return 'Tell us what the unlabelled spending was';
        case 'biggest_purchases':
          return `Look at your ${target.count ?? 3} biggest purchases`;
        case 'which_can_move':
          return 'Which of these bills can move?';
      }
  }
}

/** Money-commit targets spend free cash; the swap picker treats them specially. */
export function isMoneyCommit(target: TargetDefinition): boolean {
  return target.type === 'savings_transfer' || target.type === 'debt_payment';
}

export type Outcome = TargetResult['outcome'];

export const OUTCOME_LABELS: Record<Outcome, string> = {
  met: 'Met',
  close: 'Close',
  missed: 'Missed',
  unresolved: 'Not landed yet',
};

export const OUTCOME_COLORS: Record<Outcome, { text: string; background: string }> = {
  met: { text: '#1B7F4E', background: '#E6F6EE' },
  close: { text: '#b97a1e', background: '#FBF0DD' },
  missed: { text: '#c0392b', background: '#FBE4E1' },
  unresolved: { text: '#60646C', background: '#EEEFF2' },
};

/** "Sep 25 – Oct 8" */
export function formatPeriod(start: string, end: string): string {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export const ADJUSTMENT_KIND_LABELS: Record<string, string> = {
  cost: 'a one-off cost',
  spend_event: 'something that will raise spending',
  income_change: 'a change in money coming in',
  bill_change: 'a bill changing size',
  other: 'a note',
};

/** Ballpark chips for the amount box when the line carried no figure (§5a). */
export const BALLPARK_AMOUNTS = [100, 250, 500, 1000] as const;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

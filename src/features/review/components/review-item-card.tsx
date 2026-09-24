/**
 * One actionable review exception (APP-008/APP-010). Each item type maps
 * to a plain-language explanation and only the actions the API allows for
 * it. Resolved items stay visible with their outcome.
 */

import { StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { CorrectionAction, ReviewItem } from '@/api/client';
import { useTheme } from '@/hooks/use-theme';

import {
  asAmountClass,
  asAmountRange,
  asNumber,
  asString,
  evidenceOf,
  formatConfirmConsequence,
  formatLandingDay,
  formatMoney,
} from '../format';

type ReviewItemCardProps = {
  item: ReviewItem;
  busy: boolean;
  onAction: (action: CorrectionAction) => void;
  onConnectAccount: () => void;
};

type ActionSpec = {
  label: string;
  action?: CorrectionAction;
  connects?: boolean;
  variant?: 'primary' | 'secondary';
};

function describe(item: ReviewItem): { title: string; body: string; actions: ActionSpec[] } {
  const evidence = evidenceOf(item);

  switch (item.type) {
    case 'external_card_payment_unattributed': {
      const monthly = asNumber(evidence.averageMonthlyAmount);
      const description = asString(evidence.description);

      return {
        title: 'Payments to a card FinBot can’t see',
        body: `${description ?? 'A card payment'}${
          monthly ? ` (about ${formatMoney(monthly)}/month)` : ''
        } goes to a card that isn’t connected. FinBot can’t see what was bought, so that spending can’t be categorized.`,
        actions: [
          { label: 'Connect that card', connects: true, variant: 'primary' },
          {
            label: 'Continue without it',
            action: 'accept_coverage_limitation',
            variant: 'secondary',
          },
        ],
      };
    }

    case 'income_mismatch': {
      const manual = asNumber(evidence.manualMonthlyIncome);
      const observed = asNumber(evidence.observedMonthlyIncome);

      return {
        title: 'Your income answer doesn’t match your deposits',
        body: `You said about ${manual ? formatMoney(manual) : '—'}/month, but your accounts show about ${
          observed ? formatMoney(observed) : '—'
        }/month coming in. Which should FinBot use?`,
        actions: [
          { label: `Use ${observed ? formatMoney(observed) : 'observed'}`, action: 'use_observed_value', variant: 'primary' },
          { label: 'Keep my answer', action: 'keep_manual_value', variant: 'secondary' },
        ],
      };
    }

    case 'institution_connection_failed': {
      const name = asString(evidence.institutionName);

      return {
        title: `${name ?? 'An institution'} couldn’t be synced`,
        body: 'Its accounts and activity are missing from every number in this review. Reconnect it, or continue without it.',
        actions: [
          { label: 'Reconnect', connects: true, variant: 'primary' },
          {
            label: 'Continue without it',
            action: 'accept_coverage_limitation',
            variant: 'secondary',
          },
        ],
      };
    }

    case 'limited_history': {
      const days = asNumber(evidence.historyDays);
      const name = asString(evidence.institutionName);

      return {
        title: `Limited history from ${name ?? 'one institution'}`,
        body: `Only ${days ?? 'some'} days of history were available, so monthly averages lean on a shorter window than requested.`,
        actions: [
          { label: 'Got it', action: 'accept_coverage_limitation', variant: 'secondary' },
        ],
      };
    }

    case 'high_unknown_activity': {
      return {
        title: 'Some activity couldn’t be classified',
        body: 'A noticeable share of outgoing money didn’t match any known pattern. It’s excluded from category totals but still counted.',
        actions: [
          { label: 'Understood', action: 'accept_coverage_limitation', variant: 'secondary' },
        ],
      };
    }

    case 'unconfirmed_recurring_stream': {
      const name = asString(evidence.displayName);
      const monthly = asNumber(evidence.monthlyAmount);
      const landing = formatLandingDay(asNumber(evidence.anchorDayOfMonth));
      // What confirming commits the plan to, from the same numbers the
      // engine will reserve — never a figure the card made up.
      const consequence = formatConfirmConsequence({
        amountClass: asAmountClass(evidence.amountClass),
        planningAmount: asNumber(evidence.planningAmount),
        amountRange: asAmountRange(evidence.amountRange),
      });

      return {
        title: `Is ${name ?? 'this charge'} a recurring bill?`,
        body: `It looks like it might repeat${
          monthly ? ` (about ${formatMoney(monthly)}/month${landing ? `, ${landing}` : ''})` : ''
        }, but the pattern isn’t clear enough to be sure.${consequence ? ` ${consequence}` : ''}`,
        actions: [
          { label: 'Yes, it recurs', action: 'confirm_stream', variant: 'secondary' },
          { label: 'No, it doesn’t', action: 'dismiss_stream', variant: 'secondary' },
        ],
      };
    }

    default:
      return {
        title: 'Needs a look',
        body: 'This item needs your confirmation.',
        actions: [
          { label: 'Accept', action: 'accept_coverage_limitation', variant: 'secondary' },
        ],
      };
  }
}

export function ReviewItemCard({ item, busy, onAction, onConnectAccount }: ReviewItemCardProps) {
  const theme = useTheme();
  const { title, body, actions } = describe(item);
  const isOpen = item.status === 'open';

  return (
    <ThemedView
      accessibilityLabel={`Review item: ${title}`}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.titleRow}>
        <ThemedText type="smallBold" style={styles.titleText}>
          {title}
        </ThemedText>
        {item.required && isOpen ? (
          <ThemedView style={styles.requiredBadge}>
            <ThemedText type="small" style={styles.requiredText}>
              Required
            </ThemedText>
          </ThemedView>
        ) : null}
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        {body}
      </ThemedText>

      {isOpen ? (
        <ThemedView style={styles.actions}>
          {actions
            .filter((spec) => spec.connects || item.allowedActions.includes(spec.action ?? ''))
            .map((spec) => (
              <ActionButton
                key={spec.label}
                label={spec.label}
                variant={spec.variant ?? 'secondary'}
                busy={busy}
                onPress={() => {
                  if (spec.connects) {
                    onConnectAccount();
                  } else if (spec.action) {
                    onAction(spec.action);
                  }
                }}
              />
            ))}
        </ThemedView>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          ✓ {item.status === 'accepted' ? 'Accepted' : 'Resolved'}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  titleText: {
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#e5a13d33',
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
  },
  requiredText: {
    color: '#b97a1e',
  },
  actions: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
});

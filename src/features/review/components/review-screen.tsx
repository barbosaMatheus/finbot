/* eslint-disable react-hooks/set-state-in-effect -- async loaders invoked from effects set state after awaits; standard fetch-in-effect pattern */
/**
 * The aggregate-first financial review (APP-008) with corrections and
 * final confirmation (APP-010). Facts and coverage come from the snapshot;
 * only actionable exceptions ask for input; confirm stays disabled until
 * every required item is resolved. Stale-snapshot conflicts refetch and
 * re-render rather than erroring at the user.
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import {
  confirmReview,
  correctReviewItem,
  getFinancialReview,
  type CorrectionAction,
  type FinancialReview,
} from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';
import { isApiErrorCode, ApiError } from '@/lib/api-client';
import { useTheme } from '@/hooks/use-theme';

import { formatCadence, formatMoney } from '../format';
import { ReviewItemCard } from './review-item-card';

const BAND_COLORS: Record<string, string> = {
  complete: '#2f9e63',
  partial: '#b97a1e',
  insufficient: '#e5484d',
};

const BAND_LABELS: Record<string, string> = {
  complete: 'Full picture',
  partial: 'Partial picture',
  insufficient: 'Not enough data yet',
};

export function ReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { status, refresh } = useOnboardingStatus();

  const [review, setReview] = useState<FinancialReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const loadReview = useCallback(async () => {
    try {
      const next = await getFinancialReview();
      setReview(next);
      setLoadError(null);
    } catch (err) {
      if (isApiErrorCode(err, 'ANALYSIS_NOT_REVIEWABLE')) {
        // The run moved back to a working state; let the guard reroute.
        await refresh();
        return;
      }

      setLoadError(err instanceof Error ? err.message : 'Could not load your review');
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    void loadReview();
  }, [loadReview]);

  // When a recompute finishes (phase flips back to review_ready), pull the
  // fresh snapshot.
  const phase = status?.phase;

  useEffect(() => {
    if (phase === 'review_ready') {
      void loadReview();
    }
  }, [phase, loadReview]);

  const isRecomputing = phase === 'recomputing';

  const handleAction = useCallback(
    async (itemId: string, action: CorrectionAction, value?: Record<string, unknown>) => {
      if (!review) {
        return;
      }

      setBusyItemId(itemId);
      setActionError(null);

      try {
        await correctReviewItem(itemId, {
          action,
          snapshotVersion: review.snapshotVersion,
          ...(value ? { value } : {}),
        });

        await loadReview();
        await refresh();
      } catch (err) {
        if (
          isApiErrorCode(err, 'REVIEW_VERSION_STALE') ||
          isApiErrorCode(err, 'RECOMPUTE_IN_PROGRESS')
        ) {
          await loadReview();
          await refresh();
          return;
        }

        setActionError(err instanceof ApiError ? err.message : 'That change did not apply');
      } finally {
        setBusyItemId(null);
      }
    },
    [review, loadReview, refresh],
  );

  const handleConfirm = useCallback(async () => {
    if (!review) {
      return;
    }

    setIsConfirming(true);
    setActionError(null);

    try {
      await confirmReview(review.snapshotVersion);
      // The status flip to complete routes into the main app.
      await refresh();
    } catch (err) {
      if (isApiErrorCode(err, 'REVIEW_VERSION_STALE')) {
        await loadReview();
        return;
      }

      if (isApiErrorCode(err, 'REVIEW_ITEMS_UNRESOLVED')) {
        setActionError('A few required items above still need an answer.');
        await loadReview();
        return;
      }

      setActionError(err instanceof Error ? err.message : 'Could not confirm the review');
    } finally {
      setIsConfirming(false);
    }
  }, [review, refresh, loadReview]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.text} />
      </ThemedView>
    );
  }

  if (loadError || !review) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary" style={styles.centeredText}>
          {loadError ?? 'Your review is not available yet.'}
        </ThemedText>
        <ActionButton label="Try again" variant="secondary" onPress={() => void loadReview()} />
      </ThemedView>
    );
  }

  const requiredOpen = review.reviewItems.filter(
    (item) => item.required && item.status === 'open',
  );
  const canConfirm = requiredOpen.length === 0 && !isRecomputing;

  const facts = [
    { label: 'Income / month', value: review.facts.monthlyIncomeEstimate },
    { label: 'Spending / month', value: review.facts.averageMonthlyEconomicSpend },
    { label: 'Cash obligations / month', value: review.facts.averageMonthlyCashObligations },
    ...(review.facts.declaredObligationsMonthly > 0
      ? [{ label: 'Includes bills you told us about', value: review.facts.declaredObligationsMonthly }]
      : []),
    { label: 'Available to spend', value: review.facts.availableToSpend },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Your financial review
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Built from {review.period.oldestObservedDate ?? 'your'} –{' '}
          {review.period.throughDate} of account history. Confirm it to finish
          setting up FinBot.
        </ThemedText>
      </ThemedView>

      {isRecomputing ? (
        <ThemedView style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
          <ActivityIndicator color={theme.text} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.bannerText}>
            Applying your corrections — the numbers will refresh in a moment.
          </ThemedText>
        </ThemedView>
      ) : null}

      {/* Coverage: named band + reasons, never a fake percentage. */}
      <ThemedView
        accessibilityLabel={`Coverage: ${BAND_LABELS[review.coverage.band]}`}
        style={[styles.coverage, { borderColor: BAND_COLORS[review.coverage.band] }]}>
        <ThemedText type="smallBold" style={{ color: BAND_COLORS[review.coverage.band] }}>
          {BAND_LABELS[review.coverage.band] ?? review.coverage.band}
        </ThemedText>
        {review.coverage.reasons.map((reason) => (
          <ThemedText key={reason.code} type="small" themeColor="textSecondary">
            • {reason.message}
          </ThemedText>
        ))}
      </ThemedView>

      {/* Aggregates first. */}
      <ThemedView style={styles.factsGrid}>
        {facts.map((fact) => (
          <ThemedView
            key={fact.label}
            accessibilityLabel={`${fact.label}: ${formatMoney(fact.value)}`}
            style={[styles.factCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.factValue}>
              {formatMoney(fact.value)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {fact.label}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Only actionable exceptions ask for input. */}
      {review.reviewItems.length > 0 ? (
        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Needs your attention</ThemedText>
          {review.reviewItems.map((item) => (
            <ReviewItemCard
              key={item.id}
              item={item}
              busy={busyItemId === item.id}
              onAction={(action) => void handleAction(item.id, action)}
              onConnectAccount={() => router.push('/(connect-bank)' as never)}
            />
          ))}
        </ThemedView>
      ) : null}

      {review.recurringStreams.length > 0 ? (
        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Recurring bills & subscriptions</ThemedText>
          {review.recurringStreams.map((stream) => (
            <ThemedView key={stream.streamKey} style={styles.listRow}>
              <ThemedView style={styles.listRowText}>
                <ThemedText type="small">{stream.displayName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatCadence(stream.cadence)}
                  {stream.confidence !== 'high' ? ' · unconfirmed' : ''}
                </ThemedText>
              </ThemedView>
              <ThemedText type="smallBold">{formatMoney(stream.monthlyAmount)}/mo</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}

      {review.incomeStreams.length > 0 ? (
        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Income</ThemedText>
          {review.incomeStreams.map((stream) => (
            <ThemedView key={stream.streamKey} style={styles.listRow}>
              <ThemedView style={styles.listRowText}>
                <ThemedText type="small">{stream.displayName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatCadence(stream.cadence)}
                </ThemedText>
              </ThemedView>
              <ThemedText type="smallBold">{formatMoney(stream.monthlyAmount)}/mo</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}

      {review.categoryTotals.length > 0 ? (
        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Where your money goes</ThemedText>
          {review.categoryTotals.map((category) => (
            <ThemedView key={category.bucket} style={styles.listRow}>
              <ThemedView style={styles.listRowText}>
                <ThemedText type="small">{category.bucket}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {Math.round(category.share * 100)}% of spending
                </ThemedText>
              </ThemedView>
              <ThemedText type="smallBold">
                {formatMoney(category.monthlyAverage)}/mo
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}

      {actionError ? (
        <ThemedText type="small" style={styles.error}>
          {actionError}
        </ThemedText>
      ) : null}

      <ThemedView style={styles.confirmBlock}>
        {!canConfirm && requiredOpen.length > 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centeredText}>
            {requiredOpen.length} required item{requiredOpen.length === 1 ? '' : 's'} above
            still need{requiredOpen.length === 1 ? 's' : ''} an answer.
          </ThemedText>
        ) : null}

        <ActionButton
          label="Everything looks right"
          onPress={() => void handleConfirm()}
          disabled={!canConfirm}
          busy={isConfirming}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  centeredText: {
    textAlign: 'center',
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {},
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  bannerText: {
    flex: 1,
  },
  coverage: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  factCard: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  factValue: {
    fontSize: 22,
    lineHeight: 28,
  },
  section: {
    gap: Spacing.two,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  listRowText: {
    flex: 1,
    gap: 2,
  },
  error: {
    color: '#e5484d',
    textAlign: 'center',
  },
  confirmBlock: {
    gap: Spacing.two,
  },
});

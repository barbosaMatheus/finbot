import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { formatPeriod, freeCashLine, targetTitle } from '../format';
import { useAnchor } from '../hooks/use-anchor';

/** Home's view of the current plan: the three targets and a way into the anchor. */
export function PlanSummaryCard() {
  const theme = useTheme();
  const router = useRouter();
  const { anchor, isLoading, loadError, reload } = useAnchor();

  const open = () => router.push('/gameplan/anchor' as never);

  let body: React.ReactNode;

  if (isLoading) {
    body = <ActivityIndicator color={theme.text} />;
  } else if (loadError || !anchor) {
    body = (
      <ThemedText type="small" themeColor="textSecondary">
        {loadError ?? 'Your plan is not available yet.'}
      </ThemedText>
    );
  } else if (anchor.status === 'no_period') {
    body = (
      <ThemedText type="small" themeColor="textSecondary">
        Your first plan opens once your review is confirmed.
      </ThemedText>
    );
  } else if (anchor.status === 'building' || !anchor.plan || !anchor.period) {
    body = (
      <ThemedText type="small" themeColor="textSecondary">
        Building your plan…
      </ThemedText>
    );
  } else {
    body = (
      <>
        <ThemedText type="small" themeColor="textSecondary">
          {formatPeriod(anchor.period.start, anchor.period.end)}
          {anchor.period.status === 'planned' ? ' · waiting for you' : ''}
        </ThemedText>
        {anchor.plan.targets.map((target, index) => (
          <ThemedText key={target.id} type="small">
            {index + 1}. {targetTitle(target.definition)}
          </ThemedText>
        ))}
        <ThemedText type="small" themeColor="textSecondary">
          {freeCashLine(anchor.plan.live?.freeCash ?? anchor.plan.freeCash.freeCash, anchor.plan.freeCash.tight)}
        </ThemedText>
      </>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open your plan"
      onPress={anchor && anchor.status !== 'no_period' ? open : () => void reload()}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">This period</ThemedText>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {anchor && anchor.status === 'ready' ? 'Open →' : ''}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.body}>{body}</ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  body: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
});

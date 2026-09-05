/**
 * The restricted waiting state (APP-007). Shows honest, concrete
 * milestones — never an invented completion percentage. Routing away
 * happens automatically when the polled status changes phase.
 */

import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/action-button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/use-auth';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';
import { EnablePushRow } from '@/features/push/components/enable-push-row';
import { useTheme } from '@/hooks/use-theme';

export function WaitingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const { status, error } = useOnboardingStatus();

  const analysis = status?.analysis ?? null;
  const isClassifying = status?.phase === 'classifying';

  const milestones: string[] = [];

  if (analysis) {
    const { institutions } = analysis;
    milestones.push(
      `${institutions.total} institution${institutions.total === 1 ? '' : 's'} connected`,
    );

    if (institutions.ready > 0) {
      milestones.push(`${institutions.ready} with full history ready`);
    }

    if (institutions.limited > 0) {
      milestones.push(`${institutions.limited} with limited history`);
    }

    if (institutions.pending > 0) {
      milestones.push(
        `Waiting for transaction history from ${institutions.pending} institution${
          institutions.pending === 1 ? '' : 's'
        }`,
      );
    }

    if (institutions.failed > 0) {
      milestones.push(`${institutions.failed} could not be synced yet`);
    }
  }

  if (isClassifying) {
    milestones.push('Analyzing your transactions');
  }

  return (
    <ThemedView style={styles.screen}>
      <ThemedView style={styles.body}>
        <ActivityIndicator size="large" color={theme.text} />

        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {isClassifying ? 'Analyzing your finances' : 'Getting your history'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {isClassifying
              ? 'FinBot is classifying your transactions and building your financial review.'
              : 'Your bank is sending FinBot up to two years of transaction history. This can take several minutes — feel free to close the app.'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.milestones}>
          {milestones.map((milestone) => (
            <ThemedView key={milestone} style={styles.milestoneRow}>
              <ThemedView
                style={[styles.bullet, { backgroundColor: theme.backgroundSelected }]}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {milestone}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <EnablePushRow />

        {error ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Reconnecting…
          </ThemedText>
        ) : null}
      </ThemedView>

      <ThemedView style={styles.actions}>
        <ActionButton
          label="Manage connections"
          variant="secondary"
          onPress={() => router.push('/(connect-bank)' as never)}
        />
        <ActionButton label="Log out" variant="secondary" onPress={() => void logout()} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing.five,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  milestones: {
    gap: Spacing.two,
    alignSelf: 'center',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    gap: Spacing.two,
  },
});

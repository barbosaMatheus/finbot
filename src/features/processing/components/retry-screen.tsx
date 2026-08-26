/**
 * The failed-retryable state (APP-007): a specific failure, a retry, a
 * path to reconnect the institution, and a way out. No dead ends.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { retryAnalysis } from '@/api/client';
import { useAuth } from '@/features/auth/use-auth';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';
import { useTheme } from '@/hooks/use-theme';

export function RetryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const { status, refresh } = useOnboardingStatus();

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const failedCount = status?.analysis?.institutions.failed ?? 0;

  async function handleRetry() {
    setIsRetrying(true);
    setRetryError(null);

    try {
      await retryAnalysis();
      await refresh();
    } catch (err) {
      setRetryError(
        err instanceof Error ? err.message : 'The retry could not be started.',
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <ThemedView style={styles.body}>
        <ThemedView
          style={[styles.heroIcon, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView
            name={{
              ios: 'exclamationmark.triangle.fill',
              android: 'warning',
              web: 'warning',
            }}
            size={36}
            tintColor="#e5a13d"
          />
        </ThemedView>

        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            The analysis hit a snag
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {failedCount > 0
              ? `${failedCount} institution${failedCount === 1 ? '' : 's'} could not be synced. You can retry, or reconnect the institution if your bank asked you to sign in again.`
              : 'Something went wrong while analyzing your accounts. Retrying usually resolves it.'}
          </ThemedText>
        </ThemedView>

        {retryError ? (
          <ThemedText type="small" style={styles.error}>
            {retryError}
          </ThemedText>
        ) : null}
      </ThemedView>

      <ThemedView style={styles.actions}>
        <ActionButton label="Retry analysis" onPress={() => void handleRetry()} busy={isRetrying} />
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
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
  error: {
    color: '#e5484d',
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.two,
  },
});

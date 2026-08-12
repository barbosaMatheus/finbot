import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useConnectBank } from '@/features/connect-bank/hooks/use-connect-bank';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_BLUE = '#1877F2';
const ERROR_RED = '#e5484d';

const TRUST_POINTS = [
  {
    icon: { ios: 'lock.fill' as const, android: 'lock', web: 'lock' },
    title: 'Bank-level security',
    description: 'Your credentials are encrypted and never shared with FinBot.',
  },
  {
    icon: { ios: 'eye.slash.fill' as const, android: 'visibility_off', web: 'visibility_off' },
    title: 'Read-only access',
    description: 'We can view balances and transactions, but never move money.',
  },
  {
    icon: { ios: 'checkmark.shield.fill' as const, android: 'verified_user', web: 'verified_user' },
    title: 'Powered by Plaid',
    description: 'Connect through Plaid, the trusted standard used by leading finance apps.',
  },
] as const;

export function ConnectBankScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { status, connection, error, connect } = useConnectBank();

  const isConnected = status === 'connected';
  const isBusy = status === 'linking' || status === 'checking';
  const institutionName = connection?.institutionName;

  function handleContinue() {
    if (!isConnected) {
      return;
    }

    router.replace('/(app)');
  }

  return (
    <ThemedView style={styles.screen}>
      <ThemedView style={styles.body}>
        <ThemedView
          style={[styles.heroIcon, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView
            name={{
              ios: 'building.columns.fill',
              android: 'account_balance',
              web: 'account_balance',
            }}
            size={40}
            tintColor={PRIMARY_BLUE}
          />
        </ThemedView>

        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {isConnected ? 'Bank connected' : 'Connect your bank'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {isConnected
              ? `${institutionName ?? 'Your account'} is linked. Continue to start using FinBot.`
              : 'Link your account so FinBot can track spending, balances, and help you stay on budget.'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.trustList}>
          {TRUST_POINTS.map((point) => (
            <ThemedView key={point.title} style={styles.trustRow}>
              <ThemedView
                style={[styles.trustIcon, { backgroundColor: theme.backgroundElement }]}>
                <SymbolView name={point.icon} size={18} tintColor={theme.text} />
              </ThemedView>
              <ThemedView style={styles.trustCopy}>
                <ThemedText type="smallBold">{point.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {point.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.actions}>
        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Connect bank"
          accessibilityState={{ busy: isBusy, disabled: isConnected || isBusy }}
          disabled={isConnected || isBusy}
          onPress={connect}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: isConnected ? theme.backgroundElement : PRIMARY_BLUE,
              opacity: isBusy ? 0.7 : pressed && !isConnected ? 0.7 : 1,
            },
          ]}>
          {status === 'linking' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText
              type="smallBold"
              style={{ color: isConnected ? theme.text : '#ffffff' }}>
              {isConnected ? 'Connected' : status === 'error' ? 'Try again' : 'Connect bank'}
            </ThemedText>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{ disabled: !isConnected }}
          disabled={!isConnected}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: theme.backgroundSelected,
              opacity: !isConnected ? 0.45 : pressed ? 0.7 : 1,
            },
          ]}>
          <ThemedText type="smallBold" themeColor={!isConnected ? 'textSecondary' : 'text'}>
            Continue
          </ThemedText>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
          Secured by Plaid. You can disconnect anytime in settings.
        </ThemedText>
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
  trustList: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  trustRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  actions: {
    gap: Spacing.two,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    minHeight: 48,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    minHeight: 48,
  },
  footnote: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  error: {
    color: ERROR_RED,
    textAlign: 'center',
  },
});

/**
 * The multi-institution linking hub (APP-005). Comes BEFORE the numeric
 * finance questions: connect checking and every spending card so the
 * analysis can derive what the wizard would otherwise have to ask.
 */

import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useLinkingHub } from '@/features/connect-bank/hooks/use-linking-hub';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';
import { useTheme } from '@/hooks/use-theme';
import type { PlaidConnection } from '@/api/client';

const ERROR_RED = '#e5484d';

function healthLabel(connection: PlaidConnection): {
  label: string;
  color: string;
  needsAttention: boolean;
} {
  switch (connection.health?.syncStatus) {
    case 'complete':
      return { label: 'Ready', color: '#2f9e63', needsAttention: false };
    case 'failed':
      return { label: 'Needs attention', color: ERROR_RED, needsAttention: true };
    case 'syncing':
      return { label: 'Syncing…', color: '#b97a1e', needsAttention: false };
    default:
      return { label: 'Starting…', color: '#b97a1e', needsAttention: false };
  }
}

export function ConnectBankScreen() {
  const theme = useTheme();
  const { status } = useOnboardingStatus();
  const {
    connections,
    isLoading,
    busy,
    error,
    notice,
    addInstitution,
    updateConnection,
    removeConnection,
    declareDone,
  } = useLinkingHub();

  const hasConnections = connections.length > 0;
  const alreadyDeclared = status?.gates.linkingDeclaredComplete ?? false;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {hasConnections ? 'Your connected accounts' : 'Connect your accounts'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Connect your checking account and every card you spend with. FinBot
            reads up to two years of history to work out your income, bills, and
            spending — so you won&apos;t have to guess at numbers later.
          </ThemedText>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator color={theme.text} style={styles.loading} />
        ) : (
          <ThemedView style={styles.connectionList}>
            {connections.map((connection) => {
              const health = healthLabel(connection);
              const isBusyHere =
                (busy?.kind === 'update' || busy?.kind === 'disconnect') &&
                busy.connectionId === connection.id;

              return (
                <ThemedView
                  key={connection.id}
                  accessibilityLabel={`Connection: ${connection.institutionName ?? 'institution'}, ${health.label}`}
                  style={[styles.connectionCard, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedView style={styles.connectionHeader}>
                    <ThemedText type="smallBold" style={styles.connectionName}>
                      {connection.institutionName ?? 'Institution'}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: health.color }}>
                      {health.label}
                    </ThemedText>
                  </ThemedView>

                  {connection.accounts.map((account) => (
                    <ThemedText
                      key={account.accountId}
                      type="small"
                      themeColor="textSecondary">
                      {account.name}
                      {account.mask ? ` ····${account.mask}` : ''}
                    </ThemedText>
                  ))}

                  <ThemedView style={styles.connectionActions}>
                    {health.needsAttention ? (
                      <ActionButton
                        label="Reconnect"
                        variant="secondary"
                        busy={isBusyHere && busy?.kind === 'update'}
                        onPress={() => updateConnection(connection)}
                      />
                    ) : null}
                    <ActionButton
                      label="Disconnect"
                      variant="danger"
                      busy={isBusyHere && busy?.kind === 'disconnect'}
                      onPress={() => removeConnection(connection)}
                    />
                  </ThemedView>
                </ThemedView>
              );
            })}
          </ThemedView>
        )}

        {notice ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.notice}>
            {notice}
          </ThemedText>
        ) : null}

        {!hasConnections && !isLoading ? (
          <ThemedView style={styles.trustRow}>
            <SymbolView
              name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
              size={16}
              tintColor={theme.text}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.trustText}>
              Bank-level security via Plaid. Read-only — FinBot can never move
              money. Disconnect anytime.
            </ThemedText>
          </ThemedView>
        ) : null}
      </ScrollView>

      <ThemedView style={styles.actions}>
        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <ActionButton
          label={hasConnections ? 'Add another institution' : 'Connect a bank'}
          variant={hasConnections ? 'secondary' : 'primary'}
          busy={busy?.kind === 'add'}
          onPress={addInstitution}
        />

        {hasConnections ? (
          <ActionButton
            label={alreadyDeclared ? 'Done' : "I've added all my accounts"}
            busy={busy?.kind === 'declare'}
            onPress={declareDone}
          />
        ) : null}

        <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
          {hasConnections
            ? 'Cards you spend with matter most — an unconnected card means FinBot can’t see what you bought.'
            : 'Secured by Plaid, the standard used by leading finance apps.'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: Spacing.three,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {},
  loading: {
    marginTop: Spacing.four,
  },
  connectionList: {
    gap: Spacing.three,
  },
  connectionCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  connectionName: {
    flex: 1,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  trustText: {
    flex: 1,
  },
  notice: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.two,
  },
  error: {
    color: ERROR_RED,
    textAlign: 'center',
  },
  footnote: {
    textAlign: 'center',
  },
});

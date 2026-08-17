import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenu } from '@/components/account-menu';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BAR_HEIGHT = 56;

export type AppHeaderProps = {
  email?: string | null;
  onAccount: () => void;
  onLogout: () => void;
};

/**
 * App chrome, not an auth feature: it takes the identity and the actions as
 * props so the shared layer never has to import from `features/auth`. The
 * `(app)` layout wires it to the session.
 */
export function AppHeader({ email, onAccount, onLogout }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleSelect(action: () => void) {
    setIsMenuOpen(false);
    action();
  }

  return (
    <>
      <ThemedView
        style={[
          styles.header,
          { paddingTop: insets.top, borderBottomColor: theme.backgroundSelected },
        ]}>
        <ThemedView style={styles.bar}>
          <ThemedText style={styles.brand}>FinBot</ThemedText>

          <Pressable
            accessibilityLabel="Account menu"
            accessibilityRole="button"
            aria-expanded={isMenuOpen}
            onPress={() => setIsMenuOpen(true)}
            style={({ pressed }) => [styles.avatarButton, { opacity: pressed ? 0.7 : 1 }]}>
            <UserAvatar email={email} />
          </Pressable>
        </ThemedView>
      </ThemedView>

      <AccountMenu
        onAccount={() => handleSelect(onAccount)}
        onClose={() => setIsMenuOpen(false)}
        onLogout={() => handleSelect(onLogout)}
        top={insets.top + BAR_HEIGHT - Spacing.one}
        visible={isMenuOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  brand: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  avatarButton: {
    borderRadius: 999,
  },
});

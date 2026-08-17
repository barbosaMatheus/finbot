import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MENU_WIDTH = 208;

/**
 * Rendered in a transparent Modal rather than absolutely inside the header, so
 * the panel is never clipped by the header's bounds and the backdrop can catch
 * a tap anywhere on screen to dismiss.
 */
export type AccountMenuProps = {
  visible: boolean;
  /** Distance from the top of the screen, measured just under the header bar. */
  top: number;
  onClose: () => void;
  onAccount: () => void;
  onLogout: () => void;
};

export function AccountMenu({
  visible,
  top,
  onClose,
  onAccount,
  onLogout,
}: AccountMenuProps) {
  const theme = useTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <Pressable
        accessibilityLabel="Close account menu"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}>
        <ThemedView
          style={[
            styles.menu,
            {
              top,
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
          ]}>
          <Pressable
            accessibilityLabel="Account"
            accessibilityRole="menuitem"
            onPress={onAccount}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}>
            <SymbolView
              name={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
              size={20}
              tintColor={theme.text}
            />
            <ThemedText type="small">Account</ThemedText>
          </Pressable>

          <ThemedView
            style={[styles.divider, { backgroundColor: theme.backgroundSelected }]}
          />

          <Pressable
            accessibilityLabel="Log out"
            accessibilityRole="menuitem"
            onPress={onLogout}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}>
            <SymbolView
              name={{
                ios: 'rectangle.portrait.and.arrow.right',
                android: 'logout',
                web: 'logout',
              }}
              size={20}
              tintColor={theme.text}
            />
            <ThemedText type="small">Log out</ThemedText>
          </Pressable>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: Spacing.three,
    width: MENU_WIDTH,
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.one,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.three,
  },
});

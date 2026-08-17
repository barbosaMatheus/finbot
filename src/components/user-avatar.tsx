import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export type UserAvatarProps = {
  email?: string | null;
  size?: number;
};

/**
 * Initials avatar. There is no profile image upload yet, so the first letter of
 * the email stands in for one.
 */
export function UserAvatar({ email, size = 36 }: UserAvatarProps) {
  const theme = useTheme();
  const initial = email?.trim().charAt(0).toUpperCase() || '?';
  const fontSize = Math.round(size * 0.42);

  return (
    <ThemedView
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.backgroundSelected,
        },
      ]}>
      <ThemedText style={[styles.initial, { fontSize, lineHeight: fontSize + 2 }]}>
        {initial}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: 700,
  },
});

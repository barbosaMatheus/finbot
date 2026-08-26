import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_BLUE = '#1877F2';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  busy?: boolean;
};

/** The app's standard filled/outlined button, matching the linking screen. */
export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
}: ActionButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? { backgroundColor: PRIMARY_BLUE }
          : {
              borderWidth: 1,
              borderColor: isDanger ? '#e5484d' : theme.backgroundSelected,
            },
        { opacity: disabled ? 0.45 : busy || pressed ? 0.7 : 1 },
      ]}>
      {busy ? (
        <ActivityIndicator color={isPrimary ? '#ffffff' : theme.text} />
      ) : (
        <ThemedText
          type="smallBold"
          style={{
            color: isPrimary ? '#ffffff' : isDanger ? '#e5484d' : theme.text,
          }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
  },
});

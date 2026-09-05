import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SELECTED_GREEN = '#1B7F4E';
const SELECTED_GREEN_BG = '#E6F6EE';

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** A small tappable option: ballpark amounts, weekdays, times of day. */
export function Chip({ label, selected = false, disabled = false, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? SELECTED_GREEN_BG : theme.backgroundElement,
          borderColor: selected ? SELECTED_GREEN : theme.backgroundSelected,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}>
      <ThemedText type="smallBold" style={selected ? { color: SELECTED_GREEN } : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    minHeight: 36,
    justifyContent: 'center',
  },
});

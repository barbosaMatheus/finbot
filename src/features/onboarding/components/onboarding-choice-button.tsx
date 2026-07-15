import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SELECTED_GREEN = '#1B7F4E';
const SELECTED_GREEN_BG = '#E6F6EE';

type OnboardingChoiceButtonProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
};

export function OnboardingChoiceButton({
  label,
  description,
  selected,
  onPress,
}: OnboardingChoiceButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? SELECTED_GREEN_BG : theme.backgroundElement,
          borderColor: selected ? SELECTED_GREEN : theme.backgroundSelected,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <ThemedView style={styles.content}>
        <ThemedText
          type="smallBold"
          style={selected ? styles.selectedLabel : undefined}>
          {label}
        </ThemedText>
        {description ? (
          <ThemedText type="small" style={styles.description} themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
  },
  content: {
    gap: 2,
    backgroundColor: 'transparent',
  },
  selectedLabel: {
    color: SELECTED_GREEN,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});

import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import type { SelectOption } from '@/features/onboarding/constants/options';

type OnboardingChoiceGridProps<T> = {
  options: SelectOption<T>[];
  isSelected: (value: T) => boolean;
  onSelect: (value: T) => void;
  /** Two columns suit short chip-like labels; one column suits sentences. */
  columns?: 1 | 2;
};

/** A stack or two-column grid of choice buttons; selection logic stays with the caller. */
export function OnboardingChoiceGrid<T extends string | boolean>({
  options,
  isSelected,
  onSelect,
  columns = 1,
}: OnboardingChoiceGridProps<T>) {
  return (
    <ThemedView style={columns === 2 ? styles.grid : styles.stack}>
      {options.map((option) => (
        <ThemedView
          key={String(option.value)}
          style={columns === 2 ? styles.half : styles.full}>
          <OnboardingChoiceButton
            description={option.description}
            label={option.label}
            selected={isSelected(option.value)}
            onPress={() => onSelect(option.value)}
          />
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.one,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  full: {
    alignSelf: 'stretch',
  },
  half: {
    flexBasis: '48%',
    flexGrow: 1,
  },
});

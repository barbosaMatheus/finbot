import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/onboarding-choice-grid';
import { INCOME_PATTERN_OPTIONS } from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

/**
 * The one income question. The amount is derived from the connected
 * accounts and confirmed on the review; what the bank cannot tell us is
 * whether the user expects that pattern to continue.
 */
export function IncomeStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="incomePattern"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Is your income about the same every month?</ThemedText>
            <OnboardingChoiceGrid
              isSelected={(option) => option === value}
              onSelect={onChange}
              options={INCOME_PATTERN_OPTIONS}
            />
            {error?.message ? (
              <ThemedText type="small" style={styles.error}>
                {error.message}
              </ThemedText>
            ) : null}
          </ThemedView>
        )}
      />

      <ThemedText type="small" themeColor="textSecondary">
        We won’t ask how much. Your connected accounts already show that, and you’ll get to
        confirm it in a moment.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.one,
  },
  error: {
    color: '#e5484d',
  },
});

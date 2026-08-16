import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

export function SavingsAndDebtStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="savingsAndEmergencyFunds"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="decimal-pad"
            label="Savings & emergency funds"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 5000"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="totalDebt"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="decimal-pad"
            label="Total debt"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 12000"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="factorInDebtInterest"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Should we factor in debt interest?</ThemedText>
            <OnboardingChoiceButton
              label="Yes"
              selected={value === true}
              onPress={() => onChange(true)}
            />
            <OnboardingChoiceButton
              label="No"
              selected={value === false}
              onPress={() => onChange(false)}
            />
            {error?.message ? (
              <ThemedText type="small" style={styles.error}>
                {error.message}
              </ThemedText>
            ) : null}
          </ThemedView>
        )}
      />
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

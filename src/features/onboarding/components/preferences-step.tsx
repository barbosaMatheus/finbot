import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import { RISK_COMFORT_OPTIONS } from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

export function PreferencesStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="riskComfort"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Investment risk comfort</ThemedText>
            {RISK_COMFORT_OPTIONS.map((option) => (
              <OnboardingChoiceButton
                key={option.value}
                label={option.label}
                selected={value === option.value}
                onPress={() => onChange(option.value)}
              />
            ))}
            {error?.message ? (
              <ThemedText type="small" style={styles.error}>
                {error.message}
              </ThemedText>
            ) : null}
          </ThemedView>
        )}
      />

      <Controller
        control={control}
        name="additionalContext"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            label="Anything else we should know? (optional)"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Optional notes about your situation, goals, or concerns..."
            style={styles.textarea}
            textAlignVertical="top"
            value={value}
          />
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
  textarea: {
    minHeight: 140,
  },
  error: {
    color: '#e5484d',
  },
});

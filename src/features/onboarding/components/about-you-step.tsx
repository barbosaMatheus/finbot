import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DateOfBirthPicker } from '@/features/onboarding/components/date-of-birth-picker';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import { MARITAL_STATUS_OPTIONS } from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

export function AboutYouStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            autoCapitalize="words"
            autoComplete="name"
            error={error?.message}
            label="Full name"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. Jane Doe"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DateOfBirthPicker error={error?.message} onChange={onChange} value={value} />
        )}
      />

      <Controller
        control={control}
        name="maritalStatus"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Marital status</ThemedText>
            {MARITAL_STATUS_OPTIONS.map((option) => (
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
        name="dependentsCount"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="number-pad"
            label="Dependents who rely on your income"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 0"
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
  error: {
    color: '#e5484d',
  },
});

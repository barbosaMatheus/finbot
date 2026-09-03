import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/onboarding-choice-grid';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import {
  DEPENDENTS_OPTIONS,
  SHARED_ACCOUNTS_OPTIONS,
} from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

export function AboutYouStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            autoCapitalize="words"
            autoComplete="given-name"
            error={error?.message}
            label="What should I call you?"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Your first name"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="dependentsCount"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">
              How many people depend on your income, besides you?
            </ThemedText>
            <OnboardingChoiceGrid
              columns={2}
              isSelected={(option) => option === value}
              onSelect={onChange}
              options={DEPENDENTS_OPTIONS}
            />
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
        name="sharedAccounts"
        render={({ field: { onChange, value } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">
              Does anyone else spend from the accounts you connected?
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              A joint account looks like one person to us. Only you know otherwise.
            </ThemedText>
            <OnboardingChoiceGrid
              isSelected={(option) => option === value}
              onSelect={onChange}
              options={SHARED_ACCOUNTS_OPTIONS}
            />
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

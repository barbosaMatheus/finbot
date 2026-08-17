import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import { SUBSCRIPTION_OPTIONS } from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';
import type { SubscriptionService } from '@/features/onboarding/types/onboarding';

export function MonthlyCostsStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  function toggleSubscription(
    current: SubscriptionService[],
    value: SubscriptionService,
  ): SubscriptionService[] {
    if (value === 'none') {
      return ['none'];
    }

    const withoutNone = current.filter((item) => item !== 'none');
    const isSelected = withoutNone.includes(value);

    return isSelected
      ? withoutNone.filter((item) => item !== value)
      : [...withoutNone, value];
  }

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="monthlyHousingCosts"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="decimal-pad"
            label="Monthly housing costs (Approximate)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 1800"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="monthlyFoodSpend"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="decimal-pad"
            label="Monthly food & grocery spend (Approximate)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 600"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="monthlyTransportationCosts"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="decimal-pad"
            label="Monthly transportation costs (Approximate)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 350"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="subscriptions"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Entertainment & subscriptions (Approximate)</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Select the services you pay for. Choose None of these if none apply.
            </ThemedText>
            {SUBSCRIPTION_OPTIONS.map((option) => (
              <OnboardingChoiceButton
                key={option.value}
                label={option.label}
                selected={value.includes(option.value)}
                onPress={() => onChange(toggleSubscription(value, option.value))}
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

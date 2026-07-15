import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import {
  ADDITIONAL_MONEY_POOL_OPTIONS,
  FINANCIAL_GOAL_OPTIONS,
  FIXED_MONEY_POOLS,
  REQUIRED_ADDITIONAL_POOL_COUNT,
  REQUIRED_GOAL_COUNT,
} from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';
import type { FinancialGoal, MoneyPoolOption } from '@/features/onboarding/types/onboarding';

export function GoalsAndPoolsStep() {
  const { control } = useFormContext<OnboardingFormValues>();

  function toggleGoal(current: FinancialGoal[], value: FinancialGoal): FinancialGoal[] {
    const isSelected = current.includes(value);

    if (isSelected) {
      return current.filter((goal) => goal !== value);
    }

    if (current.length >= REQUIRED_GOAL_COUNT) {
      return current;
    }

    return [...current, value];
  }

  function togglePool(current: MoneyPoolOption[], value: MoneyPoolOption): MoneyPoolOption[] {
    const isSelected = current.includes(value);

    if (isSelected) {
      return current.filter((pool) => pool !== value);
    }

    if (current.length >= REQUIRED_ADDITIONAL_POOL_COUNT) {
      return current;
    }

    return [...current, value];
  }

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="financialGoals"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Main financial goals</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Selected {value.length} of {REQUIRED_GOAL_COUNT}
            </ThemedText>
            {FINANCIAL_GOAL_OPTIONS.map((option) => (
              <OnboardingChoiceButton
                key={option.value}
                description={option.description}
                label={option.label}
                selected={value.includes(option.value)}
                onPress={() => onChange(toggleGoal(value, option.value))}
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
        name="additionalMoneyPools"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Money pools</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Always included: {FIXED_MONEY_POOLS.join(', ')}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Selected {value.length} of {REQUIRED_ADDITIONAL_POOL_COUNT} additional pools
            </ThemedText>
            {ADDITIONAL_MONEY_POOL_OPTIONS.map((option) => (
              <OnboardingChoiceButton
                key={option.value}
                description={option.description}
                label={option.label}
                selected={value.includes(option.value)}
                onPress={() => onChange(togglePool(value, option.value))}
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

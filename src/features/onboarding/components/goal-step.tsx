import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/onboarding-choice-grid';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import {
  MAX_SECONDARY_GOALS,
  PRIMARY_GOAL_OPTIONS,
  SECONDARY_GOAL_OPTIONS,
} from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';
import type { SecondaryGoal } from '@/features/onboarding/types/onboarding';

/**
 * One main goal, never an exact count. "I'm not sure" is a real option:
 * forcing a choice produces a goal the person does not hold, which then
 * drives a plan they will not follow.
 */
export function GoalStep() {
  const { control, setValue } = useFormContext<OnboardingFormValues>();
  const primaryGoal = useWatch({ control, name: 'primaryGoal' });

  const secondaryOptions = SECONDARY_GOAL_OPTIONS.filter(
    (option) => option.value !== primaryGoal,
  );

  function toggleSecondary(current: SecondaryGoal[], value: SecondaryGoal): SecondaryGoal[] {
    if (current.includes(value)) {
      return current.filter((goal) => goal !== value);
    }

    if (current.length >= MAX_SECONDARY_GOALS) {
      return current;
    }

    return [...current, value];
  }

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="primaryGoal"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">What’s the main thing you want to fix?</ThemedText>
            <OnboardingChoiceGrid
              isSelected={(option) => option === value}
              onSelect={(option) => {
                onChange(option);
                // A goal cannot be both main and secondary.
                setValue(
                  'secondaryGoals',
                  (control._formValues.secondaryGoals as SecondaryGoal[]).filter(
                    (goal) => goal !== option,
                  ),
                  { shouldValidate: true },
                );
              }}
              options={PRIMARY_GOAL_OPTIONS}
            />
            {error?.message ? (
              <ThemedText type="small" style={styles.error}>
                {error.message}
              </ThemedText>
            ) : null}
          </ThemedView>
        )}
      />

      {primaryGoal === 'save_for_specific' ? (
        <ThemedView style={styles.section}>
          <Controller
            control={control}
            name="goalDescription"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <OnboardingField
                error={error?.message}
                label="What for?"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. A used car, a trip home, a security deposit"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="goalTargetAmount"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <OnboardingField
                error={error?.message}
                keyboardType="decimal-pad"
                label="Roughly how much? (optional)"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. 3000"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="goalTargetMonth"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <OnboardingField
                autoCapitalize="none"
                error={error?.message}
                label="By when? (optional)"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="YYYY-MM, e.g. 2027-03"
                value={value}
              />
            )}
          />
        </ThemedView>
      ) : null}

      {primaryGoal !== null && primaryGoal !== 'not_sure' ? (
        <Controller
          control={control}
          name="secondaryGoals"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <ThemedView style={styles.section}>
              <ThemedText type="smallBold">Anything else on your list?</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Optional — up to {MAX_SECONDARY_GOALS} more.
              </ThemedText>
              <OnboardingChoiceGrid
                isSelected={(option) => value.includes(option)}
                onSelect={(option) => onChange(toggleSecondary(value, option))}
                options={secondaryOptions}
              />
              {error?.message ? (
                <ThemedText type="small" style={styles.error}>
                  {error.message}
                </ThemedText>
              ) : null}
            </ThemedView>
          )}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  error: {
    color: '#e5484d',
  },
});

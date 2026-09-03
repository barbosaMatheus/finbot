import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/onboarding-choice-grid';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import {
  COACHING_PACE_OPTIONS,
  CONTEXT_EXAMPLES,
} from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

type CoachingStepProps = {
  formError?: string | null;
};

/**
 * Pace replaces the old investment-risk question and does real work: it
 * scales how aggressive the weekly targets are. The free text is prompted
 * with concrete examples so it does not read as a blank essay box.
 */
export function CoachingStep({ formError }: CoachingStepProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="coachingPace"
        render={({ field: { onChange, value } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">How hard should I push?</ThemedText>
            <OnboardingChoiceGrid
              isSelected={(option) => option === value}
              onSelect={onChange}
              options={COACHING_PACE_OPTIONS}
            />
          </ThemedView>
        )}
      />

      <Controller
        control={control}
        name="additionalContext"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <OnboardingField
              error={error?.message}
              label="Is there anything about your situation I should keep in mind? (optional)"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Anything at all — you can add to this later, too."
              style={styles.textarea}
              textAlignVertical="top"
              value={value}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {CONTEXT_EXAMPLES}
            </ThemedText>
          </ThemedView>
        )}
      />

      {formError ? (
        <ThemedText type="small" style={styles.error}>
          {formError}
        </ThemedText>
      ) : null}
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

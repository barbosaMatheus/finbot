import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingChoiceButton } from '@/features/onboarding/components/onboarding-choice-button';
import { OnboardingChoiceGrid } from '@/features/onboarding/components/onboarding-choice-grid';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import {
  MAX_DECLARED_OBLIGATIONS,
  OBLIGATION_CADENCE_OPTIONS,
  OBLIGATION_KIND_OPTIONS,
  UPCOMING_EVENT_OPTIONS,
} from '@/features/onboarding/constants/options';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';
import type { UpcomingEvent } from '@/features/onboarding/types/onboarding';
import { useTheme } from '@/hooks/use-theme';

const ERROR_RED = '#e5484d';

type ObligationRowProps = {
  index: number;
  onRemove: () => void;
};

function ObligationRow({ index, onRemove }: ObligationRowProps) {
  const theme = useTheme();
  const { control } = useFormContext<OnboardingFormValues>();
  const kind = useWatch({ control, name: `declaredObligations.${index}.kind` });

  return (
    <ThemedView style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.rowHeader}>
        <ThemedText type="smallBold">Bill or debt {index + 1}</ThemedText>
        <Pressable accessibilityRole="button" onPress={onRemove}>
          <ThemedText type="small" style={styles.remove}>
            Remove
          </ThemedText>
        </Pressable>
      </ThemedView>

      <Controller
        control={control}
        name={`declaredObligations.${index}.kind`}
        render={({ field: { onChange, value } }) => (
          <OnboardingChoiceGrid
            columns={2}
            isSelected={(option) => option === value}
            onSelect={onChange}
            options={OBLIGATION_KIND_OPTIONS}
          />
        )}
      />

      {kind === 'other' ? (
        <Controller
          control={control}
          name={`declaredObligations.${index}.label`}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <OnboardingField
              error={error?.message}
              label="What is it?"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="e.g. Storage unit, paid in cash"
              value={value}
            />
          )}
        />
      ) : null}

      <Controller
        control={control}
        name={`declaredObligations.${index}.amount`}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            error={error?.message}
            keyboardType="decimal-pad"
            label="How much?"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g. 600"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name={`declaredObligations.${index}.cadence`}
        render={({ field: { onChange, value } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">How often?</ThemedText>
            <OnboardingChoiceGrid
              columns={2}
              isSelected={(option) => option === value}
              onSelect={onChange}
              options={OBLIGATION_CADENCE_OPTIONS}
            />
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

/**
 * The two questions that most often make every other number wrong:
 * obligations Plaid cannot see, and known events that break plans in week
 * three. Both are optional; an empty answer is an answer.
 */
export function CantSeeStep() {
  const theme = useTheme();
  const { control } = useFormContext<OnboardingFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'declaredObligations' });

  function toggleEvent(current: UpcomingEvent[], value: UpcomingEvent): UpcomingEvent[] {
    return current.includes(value)
      ? current.filter((event) => event !== value)
      : [...current, value];
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="smallBold">
          Any bills or debts we wouldn’t see in the accounts you connected?
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Things paid in cash, or from an account you didn’t connect — rent to a family member,
          a medical payment plan, money you owe a friend. Optional.
        </ThemedText>

        {fields.map((field, index) => (
          <ObligationRow key={field.id} index={index} onRemove={() => remove(index)} />
        ))}

        {fields.length < MAX_DECLARED_OBLIGATIONS ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              append({ kind: 'rent_to_person', label: '', amount: '', cadence: 'monthly' })
            }
            style={({ pressed }) => [
              styles.addButton,
              { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold">
              {fields.length === 0 ? 'Add one' : 'Add another'}
            </ThemedText>
          </Pressable>
        ) : null}

        {fields.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Nothing else? Just continue.
          </ThemedText>
        ) : null}
      </ThemedView>

      <Controller
        control={control}
        name="upcomingEvents"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Anything big coming up in the next six months?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Pick any that apply. Optional.
            </ThemedText>
            <OnboardingChoiceGrid
              columns={2}
              isSelected={(option) => value.includes(option)}
              onSelect={(option) => onChange(toggleEvent(value, option))}
              options={UPCOMING_EVENT_OPTIONS}
            />
            <OnboardingChoiceButton
              label="Nothing I know of"
              selected={value.length === 0}
              onPress={() => onChange([])}
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
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  remove: {
    color: ERROR_RED,
  },
  addButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
  },
  error: {
    color: ERROR_RED,
  },
});

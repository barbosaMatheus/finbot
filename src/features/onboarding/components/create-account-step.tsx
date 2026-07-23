import { Link } from 'expo-router';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OnboardingField } from '@/features/onboarding/components/onboarding-field';
import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

type CreateAccountStepProps = {
  formError?: string | null;
};

export function CreateAccountStep({ formError }: CreateAccountStepProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            autoCapitalize="none"
            autoComplete="email"
            error={error?.message}
            keyboardType="email-address"
            label="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            autoCapitalize="none"
            autoComplete="new-password"
            error={error?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="At least 8 characters"
            secureTextEntry
            textContentType="newPassword"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <OnboardingField
            autoCapitalize="none"
            autoComplete="new-password"
            error={error?.message}
            label="Confirm password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Re-enter your password"
            secureTextEntry
            textContentType="newPassword"
            value={value}
          />
        )}
      />

      {formError ? (
        <ThemedText type="small" style={styles.formError}>
          {formError}
        </ThemedText>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
        Already have an account?{' '}
        <Link href="/(auth)/login">
          <ThemedText type="linkPrimary">Sign in</ThemedText>
        </Link>
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  formError: {
    color: '#e5484d',
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});

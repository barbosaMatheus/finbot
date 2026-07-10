import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/auth/auth-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/use-auth';
import {
  hasAuthFormErrors,
  validateAuthCredentials,
} from '@/features/auth/validation';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SignupScreen() {
  const theme = useTheme();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateAuthCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors = validateAuthCredentials(email, password);
    setErrors(nextErrors);

    if (hasAuthFormErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password });
    } catch {
      setErrors({ form: 'Unable to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <ThemedText type="subtitle" style={styles.title}>
            Create account
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Sign up to get started with FinBot.
          </ThemedText>

          <ThemedView style={styles.fields}>
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
            />
          </ThemedView>

          {errors.form ? (
            <ThemedText type="small" style={styles.formError}>
              {errors.form}
            </ThemedText>
          ) : null}

          <Pressable
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.backgroundSelected, opacity: pressed || isSubmitting ? 0.7 : 1 },
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <ThemedText type="smallBold">Create account</ThemedText>
            )}
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
            Already have an account?{' '}
            <Link href="/(auth)/login">
              <ThemedText type="linkPrimary">Sign in</ThemedText>
            </Link>
          </ThemedText>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  form: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'left',
  },
  fields: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  formError: {
    color: '#e5484d',
  },
});

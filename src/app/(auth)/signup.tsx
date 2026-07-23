import { Redirect } from 'expo-router';

/** Signup now starts onboarding at the create-account step. */
export default function SignupScreen() {
  return <Redirect href="/(onboarding)" />;
}

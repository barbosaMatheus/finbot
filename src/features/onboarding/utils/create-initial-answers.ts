import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

/**
 * Defaults are real answers where the design gives one ("just me",
 * "balanced"), so those steps never block; choice fields with no sensible
 * default start null and the step schema asks for them.
 */
export function createInitialAnswers(): OnboardingFormValues {
  return {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    dependentsCount: '0',
    sharedAccounts: false,
    incomePattern: null,
    declaredObligations: [],
    upcomingEvents: [],
    upcomingEventNote: '',
    primaryGoal: null,
    goalDescription: '',
    goalTargetAmount: '',
    goalTargetMonth: '',
    secondaryGoals: [],
    coachingPace: 'balanced',
    additionalContext: '',
  };
}

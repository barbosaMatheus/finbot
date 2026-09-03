import type { OnboardingStepId } from '@/features/onboarding/types/onboarding';

export type OnboardingStepConfig = {
  id: OnboardingStepId;
  title: string;
  description: string;
};

export const CREATE_ACCOUNT_STEP: OnboardingStepConfig = {
  id: 'createAccount',
  title: 'Create your account',
  description: 'Set an email and password so you can sign back in anytime.',
};

/**
 * The five profile screens. Everything the bank connection can answer has
 * already been answered by the time the user gets here; these ask the rest.
 */
export const ONBOARDING_PROFILE_STEPS: OnboardingStepConfig[] = [
  {
    id: 'aboutYou',
    title: 'A little about you',
    description: 'Just enough to know who we are talking to.',
  },
  {
    id: 'income',
    title: 'Your income',
    description: 'We can see what came in. Only you know what to expect next.',
  },
  {
    id: 'cantSee',
    title: 'What we can’t see',
    description:
      'Money that never touches the accounts you connected — paid in cash, or from somewhere else.',
  },
  {
    id: 'goal',
    title: 'What do you want to change?',
    description: 'One main thing. You can change it later.',
  },
  {
    id: 'coaching',
    title: 'How should I coach you?',
    description: 'Set the pace, and tell us anything else worth knowing.',
  },
];

/** Full signup wizard, including account creation. */
export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  CREATE_ACCOUNT_STEP,
  ...ONBOARDING_PROFILE_STEPS,
];

export function getOnboardingSteps(includeCreateAccount: boolean): OnboardingStepConfig[] {
  return includeCreateAccount ? ONBOARDING_STEPS : ONBOARDING_PROFILE_STEPS;
}

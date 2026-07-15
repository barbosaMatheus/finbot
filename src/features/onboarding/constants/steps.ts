import type { OnboardingStepId } from '@/features/onboarding/types/onboarding';

export type OnboardingStepConfig = {
  id: OnboardingStepId;
  title: string;
  description: string;
};

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'aboutYou',
    title: 'About you',
    description: 'Tell us a bit about yourself and your household.',
  },
  {
    id: 'workAndIncome',
    title: 'Work & income',
    description: 'Help us understand how money comes in each month.',
  },
  {
    id: 'monthlyCosts',
    title: 'Monthly costs',
    description: 'Estimate your regular spending so we can map your budget.',
  },
  {
    id: 'savingsAndDebt',
    title: 'Savings & debt',
    description: 'These are strong signals of financial resilience.',
  },
  {
    id: 'goalsAndPools',
    title: 'Goals & money pools',
    description: 'Choose what to focus on and how to divide your money.',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'A few final details to tailor your guidance.',
  },
];

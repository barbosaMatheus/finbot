import { z } from 'zod';

import {
  coachingPaceSchema,
  dependentsChoiceSchema,
  incomePatternSchema,
  obligationCadenceSchema,
  obligationKindSchema,
  primaryGoalSchema,
  secondaryGoalSchema,
  upcomingEventSchema,
  type DeclaredObligationFormValue,
  type OnboardingAnswers,
  type OnboardingFormValues,
  type OnboardingStepId,
} from '@/features/onboarding/schemas/onboarding';

export type {
  DeclaredObligationFormValue,
  OnboardingAnswers,
  OnboardingFormValues,
  OnboardingStepId,
};

export type IncomePattern = z.infer<typeof incomePatternSchema>;
export type ObligationKind = z.infer<typeof obligationKindSchema>;
export type ObligationCadence = z.infer<typeof obligationCadenceSchema>;
export type UpcomingEvent = z.infer<typeof upcomingEventSchema>;
export type PrimaryGoal = z.infer<typeof primaryGoalSchema>;
export type SecondaryGoal = z.infer<typeof secondaryGoalSchema>;
export type CoachingPace = z.infer<typeof coachingPaceSchema>;
export type DependentsChoice = z.infer<typeof dependentsChoiceSchema>;

export type OnboardingFieldKey = keyof OnboardingFormValues;

export type OnboardingFieldErrors = Partial<Record<OnboardingFieldKey, string>>;

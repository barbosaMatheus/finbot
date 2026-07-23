import { z } from 'zod';

import {
  employmentStatusSchema,
  financialGoalSchema,
  maritalStatusSchema,
  moneyPoolOptionSchema,
  onboardingAnswersSchema,
  riskComfortSchema,
  subscriptionServiceSchema,
  type OnboardingAnswers,
  type OnboardingFormValues,
  type OnboardingStepId,
} from '@/features/onboarding/schemas/onboarding';

export type { OnboardingAnswers, OnboardingFormValues, OnboardingStepId };

export type MaritalStatus = z.infer<typeof maritalStatusSchema>;
export type EmploymentStatus = z.infer<typeof employmentStatusSchema>;
export type SubscriptionService = z.infer<typeof subscriptionServiceSchema>;
export type FinancialGoal = z.infer<typeof financialGoalSchema>;
export type MoneyPoolOption = z.infer<typeof moneyPoolOptionSchema>;
export type RiskComfort = z.infer<typeof riskComfortSchema>;

export type OnboardingFieldKey = keyof OnboardingFormValues;

export type OnboardingFieldErrors = Partial<Record<OnboardingFieldKey, string>>;

import { z } from 'zod';

import {
  REQUIRED_ADDITIONAL_POOL_COUNT,
  REQUIRED_GOAL_COUNT,
} from '@/features/onboarding/constants/options';
import { parseDateOfBirth } from '@/features/onboarding/utils/date-of-birth';

export type OnboardingStepId =
  | 'createAccount'
  | 'aboutYou'
  | 'workAndIncome'
  | 'monthlyCosts'
  | 'savingsAndDebt'
  | 'goalsAndPools'
  | 'preferences';

export const maritalStatusSchema = z.enum([
  'single',
  'married',
  'domestic_partnership',
  'divorced',
  'widowed',
  'prefer_not_to_say',
]);

export const employmentStatusSchema = z.enum([
  'full_time',
  'part_time',
  'self_employed',
  'unemployed',
  'retired',
  'student',
]);

export const subscriptionServiceSchema = z.enum([
  'netflix',
  'disney_hulu',
  'amazon_prime',
  'paramount',
  'apple',
  'xbox',
  'playstation',
  'nintendo',
  'none',
]);

export const financialGoalSchema = z.enum([
  'emergency_fund',
  'pay_off_debt',
  'save_for_retirement',
  'save_for_home',
  'invest_more',
  'reduce_spending',
]);

export const moneyPoolOptionSchema = z.enum([
  'vacation',
  'miscellaneous',
  'emergency',
  'savings',
  'investing',
]);

export const riskComfortSchema = z.enum(['conservative', 'moderate', 'aggressive']);

const nonNegativeAmountSchema = z
  .string()
  .trim()
  .min(1, 'Enter an amount.')
  .refine((value) => {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) && parsed >= 0;
  }, 'Enter a valid non-negative amount.');

const dateOfBirthSchema = z
  .string()
  .trim()
  .min(1, 'Select your date of birth.')
  .refine((value) => {
    const date = parseDateOfBirth(value);
    return date !== null && date.getTime() <= Date.now();
  }, 'Select a valid date of birth.');

export const createAccountFieldsSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
});

export const createAccountSchema = createAccountFieldsSchema.refine(
  (value) => value.password === value.confirmPassword,
  {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  },
);

export const aboutYouSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your full name.'),
  dateOfBirth: dateOfBirthSchema,
  maritalStatus: maritalStatusSchema.nullable().refine((value) => value !== null, {
    message: 'Select your marital status.',
  }),
  dependentsCount: z
    .string()
    .trim()
    .min(1, 'Enter how many dependents rely on your income.')
    .refine((value) => {
      const parsed = Number(value.replace(/,/g, ''));
      return Number.isFinite(parsed) && parsed >= 0 && Number.isInteger(parsed);
    }, 'Enter a valid number of dependents.'),
});

export const workAndIncomeSchema = z.object({
  employmentStatus: employmentStatusSchema.nullable().refine((value) => value !== null, {
    message: 'Select your employment status.',
  }),
  monthlyTakeHomeIncome: nonNegativeAmountSchema,
});

export const monthlyCostsSchema = z.object({
  monthlyHousingCosts: nonNegativeAmountSchema,
  monthlyFoodSpend: nonNegativeAmountSchema,
  monthlyTransportationCosts: nonNegativeAmountSchema,
  subscriptions: z
    .array(subscriptionServiceSchema)
    .min(1, 'Select at least one option (or None of these).'),
});

export const savingsAndDebtSchema = z.object({
  savingsAndEmergencyFunds: nonNegativeAmountSchema,
  totalDebt: nonNegativeAmountSchema,
  factorInDebtInterest: z.boolean().nullable().refine((value) => value !== null, {
    message: 'Choose whether we should factor in debt interest.',
  }),
});

export const goalsAndPoolsSchema = z.object({
  financialGoals: z
    .array(financialGoalSchema)
    .length(REQUIRED_GOAL_COUNT, `Pick exactly ${REQUIRED_GOAL_COUNT} financial goals.`),
  additionalMoneyPools: z
    .array(moneyPoolOptionSchema)
    .length(
      REQUIRED_ADDITIONAL_POOL_COUNT,
      `Pick exactly ${REQUIRED_ADDITIONAL_POOL_COUNT} additional money pools.`,
    ),
});

export const preferencesSchema = z.object({
  riskComfort: riskComfortSchema.nullable().refine((value) => value !== null, {
    message: 'Select your investment risk comfort level.',
  }),
  additionalContext: z.string(),
});

/** Profile answers persisted after onboarding (excludes credentials). */
export const onboardingAnswersSchema = aboutYouSchema
  .extend(workAndIncomeSchema.shape)
  .extend(monthlyCostsSchema.shape)
  .extend(savingsAndDebtSchema.shape)
  .extend(goalsAndPoolsSchema.shape)
  .extend(preferencesSchema.shape);

/** Full wizard form including the create-account step. */
export const onboardingFormSchema = createAccountFieldsSchema
  .extend(onboardingAnswersSchema.shape)
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

/** Form state (allows null for unanswered choice fields). */
export type OnboardingFormValues = z.input<typeof onboardingFormSchema>;

/** Parsed/submitted onboarding payload (no passwords). */
export type OnboardingAnswers = z.output<typeof onboardingAnswersSchema>;

export const ONBOARDING_STEP_FIELDS: Record<
  OnboardingStepId,
  readonly (keyof OnboardingFormValues)[]
> = {
  createAccount: ['email', 'password', 'confirmPassword'],
  aboutYou: ['fullName', 'dateOfBirth', 'maritalStatus', 'dependentsCount'],
  workAndIncome: ['employmentStatus', 'monthlyTakeHomeIncome'],
  monthlyCosts: [
    'monthlyHousingCosts',
    'monthlyFoodSpend',
    'monthlyTransportationCosts',
    'subscriptions',
  ],
  savingsAndDebt: ['savingsAndEmergencyFunds', 'totalDebt', 'factorInDebtInterest'],
  goalsAndPools: ['financialGoals', 'additionalMoneyPools'],
  preferences: ['riskComfort', 'additionalContext'],
};

export const ONBOARDING_STEP_SCHEMAS = {
  createAccount: createAccountSchema,
  aboutYou: aboutYouSchema,
  workAndIncome: workAndIncomeSchema,
  monthlyCosts: monthlyCostsSchema,
  savingsAndDebt: savingsAndDebtSchema,
  goalsAndPools: goalsAndPoolsSchema,
  preferences: preferencesSchema,
} as const;

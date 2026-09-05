import { z } from 'zod';

/**
 * Manual profile v2 (see the venture note onboarding-questions-v2.md).
 *
 * The wizard asks only what the bank connection cannot answer. Every money
 * figure the old wizard collected is derived by the API's facts engine and
 * confirmed on the review, so the only dollar inputs here are for money that
 * is invisible to Plaid by definition (off-book bills, a savings target).
 *
 * Form values keep amounts as strings (what a TextInput holds); the payload
 * mapper in utils/manual-payload.ts turns them into the API shape.
 */

export type OnboardingStepId =
  | 'createAccount'
  | 'aboutYou'
  | 'income'
  | 'cantSee'
  | 'goal'
  | 'coaching';

export const incomePatternSchema = z.enum(['steady', 'varies', 'unpredictable', 'none']);

export const obligationKindSchema = z.enum([
  'rent_to_person',
  'family_loan',
  'medical_plan',
  'child_support',
  'owe_friend',
  'other',
]);

export const obligationCadenceSchema = z.enum(['monthly', 'weekly', 'one_time']);

export const upcomingEventSchema = z.enum([
  'moving',
  'wedding',
  'new_baby',
  'car',
  'tuition',
  'big_trip',
  'medical',
  'other',
]);

export const primaryGoalSchema = z.enum([
  'stop_overspending',
  'pay_down_debt',
  'build_cushion',
  'save_for_specific',
  'understand_spending',
  'not_sure',
]);

export const secondaryGoalSchema = z.enum([
  'stop_overspending',
  'pay_down_debt',
  'build_cushion',
  'save_for_specific',
  'understand_spending',
]);

export const coachingPaceSchema = z.enum(['ease_in', 'balanced', 'push']);

/** '3' means "3 or more". */
export const dependentsChoiceSchema = z.enum(['0', '1', '2', '3']);

export function parseAmountText(value: string): number {
  return Number(value.replace(/,/g, '').trim());
}

function isValidAmountText(value: string): boolean {
  const parsed = parseAmountText(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

const amountTextSchema = z
  .string()
  .trim()
  .min(1, 'Enter an amount.')
  .refine(isValidAmountText, 'Enter a valid amount.');

const optionalAmountTextSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || isValidAmountText(value), 'Enter a valid amount.');

const optionalMonthTextSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d{4}-(0[1-9]|1[0-2])$/.test(value),
    'Use the form YYYY-MM, like 2027-03.',
  );

export const declaredObligationFormSchema = z.object({
  kind: obligationKindSchema,
  label: z.string().trim().max(80, 'Keep it under 80 characters.'),
  amount: amountTextSchema,
  cadence: obligationCadenceSchema,
});

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
  firstName: z
    .string()
    .trim()
    .min(1, 'Tell us what to call you.')
    .max(60, 'Keep it under 60 characters.'),
  dependentsCount: dependentsChoiceSchema,
  sharedAccounts: z.boolean(),
});

export const incomeSchema = z.object({
  incomePattern: incomePatternSchema.nullable().refine((value) => value !== null, {
    message: 'Pick the one that fits best.',
  }),
});

export const cantSeeSchema = z.object({
  declaredObligations: z.array(declaredObligationFormSchema).max(20),
  upcomingEvents: z.array(upcomingEventSchema).max(8),
  /** Free text for "Something else"; only sent when 'other' is selected. */
  upcomingEventNote: z.string().trim().max(120, 'Keep it under 120 characters.'),
});

type GoalShape = {
  primaryGoal: z.infer<typeof primaryGoalSchema> | null;
  goalDescription: string;
  secondaryGoals: z.infer<typeof secondaryGoalSchema>[];
};

/** Shared by the step schema and the full form schema so both agree. */
function refineGoal(value: GoalShape, ctx: z.RefinementCtx): void {
  if (value.primaryGoal === 'save_for_specific' && value.goalDescription.trim().length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['goalDescription'],
      message: 'What are you saving for?',
    });
  }

  if (
    value.primaryGoal !== null &&
    value.primaryGoal !== 'not_sure' &&
    value.secondaryGoals.includes(value.primaryGoal)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['secondaryGoals'],
      message: 'That one is already your main goal.',
    });
  }
}

const goalFieldsSchema = z.object({
  primaryGoal: primaryGoalSchema.nullable().refine((value) => value !== null, {
    message: 'Pick one — "not sure" counts.',
  }),
  goalDescription: z.string().trim().max(120, 'Keep it under 120 characters.'),
  goalTargetAmount: optionalAmountTextSchema,
  goalTargetMonth: optionalMonthTextSchema,
  secondaryGoals: z.array(secondaryGoalSchema).max(2, 'Up to two more.'),
});

export const goalSchema = goalFieldsSchema.superRefine(refineGoal);

export const coachingSchema = z.object({
  coachingPace: coachingPaceSchema,
  additionalContext: z.string().max(2000, 'Keep it under 2000 characters.'),
});

/** Profile answers persisted after onboarding (excludes credentials). */
export const onboardingAnswersSchema = aboutYouSchema
  .extend(incomeSchema.shape)
  .extend(cantSeeSchema.shape)
  .extend(goalFieldsSchema.shape)
  .extend(coachingSchema.shape)
  .superRefine(refineGoal);

/** Full wizard form including the create-account step. */
export const onboardingFormSchema = createAccountFieldsSchema
  .extend(aboutYouSchema.shape)
  .extend(incomeSchema.shape)
  .extend(cantSeeSchema.shape)
  .extend(goalFieldsSchema.shape)
  .extend(coachingSchema.shape)
  .superRefine(refineGoal)
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

/** Form state (allows null for unanswered choice fields). */
export type OnboardingFormValues = z.input<typeof onboardingFormSchema>;

/** Parsed/submitted onboarding answers, still in form shape (no passwords). */
export type OnboardingAnswers = z.output<typeof onboardingAnswersSchema>;

export type DeclaredObligationFormValue = z.input<typeof declaredObligationFormSchema>;

export const ONBOARDING_STEP_FIELDS: Record<
  OnboardingStepId,
  readonly (keyof OnboardingFormValues)[]
> = {
  createAccount: ['email', 'password', 'confirmPassword'],
  aboutYou: ['firstName', 'dependentsCount', 'sharedAccounts'],
  income: ['incomePattern'],
  cantSee: ['declaredObligations', 'upcomingEvents', 'upcomingEventNote'],
  goal: [
    'primaryGoal',
    'goalDescription',
    'goalTargetAmount',
    'goalTargetMonth',
    'secondaryGoals',
  ],
  coaching: ['coachingPace', 'additionalContext'],
};

export const ONBOARDING_STEP_SCHEMAS = {
  createAccount: createAccountSchema,
  aboutYou: aboutYouSchema,
  income: incomeSchema,
  cantSee: cantSeeSchema,
  goal: goalSchema,
  coaching: coachingSchema,
} as const;

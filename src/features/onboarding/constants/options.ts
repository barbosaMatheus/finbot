import type {
  CoachingPace,
  DependentsChoice,
  IncomePattern,
  ObligationCadence,
  ObligationKind,
  PrimaryGoal,
  SecondaryGoal,
  UpcomingEvent,
} from '@/features/onboarding/types/onboarding';

export type SelectOption<T> = {
  value: T;
  label: string;
  description?: string;
};

/**
 * Every label is plain language. No budgeting vocabulary: this audience has
 * never budgeted, or tried and drifted, and the wizard must not assume
 * either.
 */

export const DEPENDENTS_OPTIONS: SelectOption<DependentsChoice>[] = [
  { value: '0', label: 'Just me' },
  { value: '1', label: 'One other person' },
  { value: '2', label: 'Two other people' },
  { value: '3', label: 'Three or more' },
];

export const SHARED_ACCOUNTS_OPTIONS: SelectOption<boolean>[] = [
  { value: false, label: 'Just me' },
  {
    value: true,
    label: 'Yes — a partner or family member uses them too',
    description: 'We’ll keep in mind that not every purchase is yours.',
  },
];

export const INCOME_PATTERN_OPTIONS: SelectOption<IncomePattern>[] = [
  { value: 'steady', label: 'Yes, it’s steady' },
  { value: 'varies', label: 'It varies — some months are better than others' },
  { value: 'unpredictable', label: 'It’s unpredictable' },
  { value: 'none', label: 'I don’t have regular income right now' },
];

export const OBLIGATION_KIND_OPTIONS: SelectOption<ObligationKind>[] = [
  { value: 'rent_to_person', label: 'Rent to a person' },
  { value: 'family_loan', label: 'Family loan' },
  { value: 'medical_plan', label: 'Medical payment plan' },
  { value: 'child_support', label: 'Child support' },
  { value: 'owe_friend', label: 'Owe a friend' },
  { value: 'other', label: 'Something else' },
];

export const OBLIGATION_CADENCE_OPTIONS: SelectOption<ObligationCadence>[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'one_time', label: 'One-time' },
];

export const UPCOMING_EVENT_OPTIONS: SelectOption<UpcomingEvent>[] = [
  { value: 'moving', label: 'Moving' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'new_baby', label: 'New baby' },
  { value: 'car', label: 'Car repair or replacement' },
  { value: 'tuition', label: 'Tuition' },
  { value: 'big_trip', label: 'Big trip' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Something else' },
];

export const PRIMARY_GOAL_OPTIONS: SelectOption<PrimaryGoal>[] = [
  { value: 'stop_overspending', label: 'Stop spending more than I make' },
  { value: 'pay_down_debt', label: 'Pay down what I owe' },
  { value: 'build_cushion', label: 'Build up a cushion so surprises don’t wreck me' },
  { value: 'save_for_specific', label: 'Save for something specific' },
  { value: 'understand_spending', label: 'Just help me understand where my money goes' },
  {
    value: 'not_sure',
    label: 'I’m not sure — help me figure it out',
    description: 'An honest answer. We’ll start by showing you what we see.',
  },
];

/** The same choices minus "not sure", which only makes sense as the main goal. */
export const SECONDARY_GOAL_OPTIONS: SelectOption<SecondaryGoal>[] = PRIMARY_GOAL_OPTIONS.filter(
  (option): option is SelectOption<SecondaryGoal> => option.value !== 'not_sure',
);

export const COACHING_PACE_OPTIONS: SelectOption<CoachingPace>[] = [
  {
    value: 'ease_in',
    label: 'Ease me in',
    description: 'Small changes I’m confident I can hit.',
  },
  { value: 'balanced', label: 'Balanced' },
  {
    value: 'push',
    label: 'Push me',
    description: 'I want this to move fast.',
  },
];

export const CONTEXT_EXAMPLES =
  'For example: “I send money to my parents every month.” “My hours just got cut.” ' +
  '“I’m saving for a ring but my partner uses this account.” “I have a dog with ongoing vet bills.”';

export const MAX_SECONDARY_GOALS = 2;
export const MAX_DECLARED_OBLIGATIONS = 20;

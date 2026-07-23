import type {
  EmploymentStatus,
  FinancialGoal,
  MaritalStatus,
  MoneyPoolOption,
  RiskComfort,
  SubscriptionService,
} from '@/features/onboarding/types/onboarding';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export const MARITAL_STATUS_OPTIONS: SelectOption<MaritalStatus>[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'domestic_partnership', label: 'Domestic partnership' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const EMPLOYMENT_STATUS_OPTIONS: SelectOption<EmploymentStatus>[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
];

export const SUBSCRIPTION_OPTIONS: SelectOption<SubscriptionService>[] = [
  { value: 'netflix', label: 'Netflix' },
  { value: 'disney_hulu', label: 'Disney / Hulu' },
  { value: 'amazon_prime', label: 'Amazon Prime' },
  { value: 'paramount', label: 'Paramount+' },
  { value: 'apple', label: 'Apple' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'nintendo', label: 'Nintendo' },
  { value: 'none', label: 'None of these' },
];

export const FINANCIAL_GOAL_OPTIONS: SelectOption<FinancialGoal>[] = [
  { value: 'emergency_fund', label: 'Build emergency fund' },
  { value: 'pay_off_debt', label: 'Pay off debt' },
  { value: 'save_for_retirement', label: 'Save for retirement' },
  { value: 'save_for_home', label: 'Save for a home' },
  {
    value: 'invest_more',
    label: 'Invest more',
    description: 'Increase money available for investing (not investment advice).',
  },
  { value: 'reduce_spending', label: 'Reduce spending' },
];

export const FIXED_MONEY_POOLS = ['Bills', 'Groceries', 'Other cycled costs'] as const;

export const ADDITIONAL_MONEY_POOL_OPTIONS: SelectOption<MoneyPoolOption>[] = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'miscellaneous', label: 'Miscellaneous', description: 'Hobbies, gifts, and similar.' },
  {
    value: 'emergency',
    label: 'Emergency',
    description: 'Capped pool for out-of-cycle costs.',
  },
  { value: 'savings', label: 'Savings' },
  { value: 'investing', label: 'Investing' },
];

export const RISK_COMFORT_OPTIONS: SelectOption<RiskComfort>[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' },
];

export const REQUIRED_GOAL_COUNT = 3;
export const REQUIRED_ADDITIONAL_POOL_COUNT = 3;

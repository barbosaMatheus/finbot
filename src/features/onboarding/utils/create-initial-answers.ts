import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding';

export function createInitialAnswers(): OnboardingFormValues {
  return {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    maritalStatus: null,
    dependentsCount: '',
    employmentStatus: null,
    monthlyTakeHomeIncome: '',
    monthlyHousingCosts: '',
    monthlyFoodSpend: '',
    monthlyTransportationCosts: '',
    savingsAndEmergencyFunds: '',
    totalDebt: '',
    factorInDebtInterest: null,
    subscriptions: [],
    financialGoals: [],
    additionalMoneyPools: [],
    riskComfort: null,
    additionalContext: '',
  };
}

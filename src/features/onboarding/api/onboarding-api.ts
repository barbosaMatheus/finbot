import { apiFetch } from '@/lib/api-client';
import type { OnboardingAnswers } from '@/features/onboarding/schemas/onboarding';

export type SubmitOnboardingResponse = {
  userInfo: {
    id: string;
    userId: string;
    fullName: string;
  };
  additionalContextEmbedding: {
    documentId: string;
    context: string;
  } | null;
};

export async function submitOnboarding(
  answers: OnboardingAnswers,
): Promise<SubmitOnboardingResponse> {
  return apiFetch<SubmitOnboardingResponse>('/onboarding', {
    method: 'PUT',
    json: {
      fullName: answers.fullName,
      dateOfBirth: answers.dateOfBirth,
      maritalStatus: answers.maritalStatus,
      dependentsCount: answers.dependentsCount,
      employmentStatus: answers.employmentStatus,
      monthlyTakeHomeIncome: answers.monthlyTakeHomeIncome,
      monthlyHousingCosts: answers.monthlyHousingCosts,
      monthlyFoodSpend: answers.monthlyFoodSpend,
      monthlyTransportationCosts: answers.monthlyTransportationCosts,
      subscriptions: answers.subscriptions,
      savingsAndEmergencyFunds: answers.savingsAndEmergencyFunds,
      totalDebt: answers.totalDebt,
      factorInDebtInterest: answers.factorInDebtInterest,
      financialGoals: answers.financialGoals,
      additionalMoneyPools: answers.additionalMoneyPools,
      riskComfort: answers.riskComfort,
      additionalContext: answers.additionalContext,
    },
  });
}

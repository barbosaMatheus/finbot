import { getManualOnboarding, type SavedManualOnboarding } from '@/api/client';
import type { OnboardingAnswers } from '@/features/onboarding/schemas/onboarding';
import { apiFetch } from '@/lib/api-client';

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

/**
 * Save the manual (non-derivable) answers. Completes the manual gate only
 * (APP-006): the app unlocks after the financial review is confirmed,
 * never here. Routing reacts to the refreshed /onboarding/status.
 */
export async function submitOnboarding(
  answers: OnboardingAnswers,
): Promise<SubmitOnboardingResponse> {
  return apiFetch<SubmitOnboardingResponse>('/onboarding/manual', {
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

/** Previously saved answers for resume, or null. */
export async function fetchSavedOnboarding(): Promise<SavedManualOnboarding> {
  const { saved } = await getManualOnboarding();
  return saved;
}

import type { ManualOnboardingPayload, SavedManualOnboarding } from '@/api/client';
import {
  parseAmountText,
  type OnboardingAnswers,
  type OnboardingFormValues,
} from '@/features/onboarding/schemas/onboarding';

/**
 * Form ⇄ API mapping for the manual profile. The form keeps amounts as text
 * and flattens the savings target into three fields; the API wants numbers
 * and a nullable `goalDetail` object. Both directions live here so resume
 * and submit can never drift apart.
 */

export function toManualPayload(answers: OnboardingAnswers): ManualOnboardingPayload {
  const saving = answers.primaryGoal === 'save_for_specific';
  const targetAmount = answers.goalTargetAmount.trim();
  const targetMonth = answers.goalTargetMonth.trim();

  return {
    firstName: answers.firstName.trim(),
    dependentsCount: Number(answers.dependentsCount),
    sharedAccounts: answers.sharedAccounts,
    incomePattern: answers.incomePattern,
    declaredObligations: answers.declaredObligations.map((obligation) => ({
      kind: obligation.kind,
      label: obligation.label.trim() ? obligation.label.trim() : null,
      amount: parseAmountText(obligation.amount),
      cadence: obligation.cadence,
    })),
    upcomingEvents: answers.upcomingEvents,
    primaryGoal: answers.primaryGoal,
    secondaryGoals: answers.secondaryGoals,
    goalDetail: saving
      ? {
          description: answers.goalDescription.trim(),
          targetAmount: targetAmount ? parseAmountText(targetAmount) : null,
          targetMonth: targetMonth ? targetMonth : null,
        }
      : null,
    coachingPace: answers.coachingPace,
    additionalContext: answers.additionalContext.trim(),
  };
}

type SavedPayload = NonNullable<SavedManualOnboarding>['payload'];

function amountToText(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

/** Previously saved answers, in the shape the form holds. */
export function fromManualPayload(payload: SavedPayload): Partial<OnboardingFormValues> {
  const dependents = Math.min(Math.max(payload.dependentsCount, 0), 3);

  return {
    firstName: payload.firstName,
    dependentsCount: String(dependents) as OnboardingFormValues['dependentsCount'],
    sharedAccounts: payload.sharedAccounts,
    incomePattern: payload.incomePattern,
    declaredObligations: payload.declaredObligations.map((obligation) => ({
      kind: obligation.kind,
      label: obligation.label ?? '',
      amount: amountToText(obligation.amount),
      cadence: obligation.cadence,
    })),
    upcomingEvents: payload.upcomingEvents,
    primaryGoal: payload.primaryGoal,
    goalDescription: payload.goalDetail?.description ?? '',
    goalTargetAmount: amountToText(payload.goalDetail?.targetAmount),
    goalTargetMonth: payload.goalDetail?.targetMonth ?? '',
    secondaryGoals: payload.secondaryGoals,
    coachingPace: payload.coachingPace,
    additionalContext: payload.additionalContext,
  };
}

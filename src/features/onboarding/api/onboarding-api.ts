import {
  getManualOnboarding,
  type ManualOnboardingPayload,
  type SavedManualOnboarding,
} from '@/api/client';
import { apiFetch } from '@/lib/api-client';

export type SubmitOnboardingResponse = {
  userInfo: {
    id: string;
    userId: string;
    firstName: string;
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
  payload: ManualOnboardingPayload,
): Promise<SubmitOnboardingResponse> {
  return apiFetch<SubmitOnboardingResponse>('/onboarding/manual', {
    method: 'PUT',
    json: payload,
  });
}

/** Previously saved answers for resume, or null. */
export async function fetchSavedOnboarding(): Promise<SavedManualOnboarding> {
  const { saved } = await getManualOnboarding();
  return saved;
}

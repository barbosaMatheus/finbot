/**
 * Typed API client (APP-002).
 *
 * Every request/response type is extracted from the generated OpenAPI types
 * (src/api/types.gen.ts — regenerate with `npm run generate:api`). No
 * handwritten DTOs: if the server contract changes, regeneration makes the
 * compiler point at every affected call site.
 */

import { apiFetch } from '@/lib/api-client';

import type { operations } from './types.gen';

type JsonResponse<
  Op extends { responses: Record<number | string, unknown> },
  Status extends keyof Op['responses'],
> = Op['responses'][Status] extends {
  content: { 'application/json': infer Body };
}
  ? Body
  : never;

type JsonBody<Op> = Op extends {
  requestBody?: { content: { 'application/json': infer Body } } | undefined;
}
  ? Body
  : never;

// ---------------------------------------------------------------------------
// Domain types, straight from the contract
// ---------------------------------------------------------------------------

export type AuthUser = JsonResponse<operations['loginWeb'], 200>['user'];
export type NativeAuthResponse = JsonResponse<operations['loginNative'], 200>;
export type Credentials = JsonBody<operations['loginWeb']>;

export type OnboardingStatus = JsonResponse<operations['getOnboardingStatus'], 200>;
export type OnboardingPhase = OnboardingStatus['phase'];
export type OnboardingGates = OnboardingStatus['gates'];
export type AnalysisSummary = NonNullable<OnboardingStatus['analysis']>;

export type ManualOnboardingPayload = JsonBody<operations['saveManualOnboarding']>;
export type SavedManualOnboarding = JsonResponse<
  operations['getManualOnboarding'],
  200
>['saved'];

export type FinancialReview = JsonResponse<operations['getFinancialReview'], 200>;
export type ReviewItem = FinancialReview['reviewItems'][number];
export type ReviewCoverage = FinancialReview['coverage'];
export type RecurringStream = FinancialReview['recurringStreams'][number];
export type IncomeStream = FinancialReview['incomeStreams'][number];
export type CategoryTotal = FinancialReview['categoryTotals'][number];

export type CorrectionRequest = JsonBody<operations['correctReviewItem']>;
export type CorrectionAction = CorrectionRequest['action'];
export type CorrectionResult = JsonResponse<operations['correctReviewItem'], 200>;
export type ConfirmResult = JsonResponse<operations['confirmReview'], 200>;
export type RetryResult = JsonResponse<operations['retryAnalysis'], 202>;

export type LinkTokenResult = JsonResponse<operations['createLinkToken'], 200>;
export type LinkTokenRequest = JsonBody<operations['createLinkToken']>;
export type PlaidConnection = JsonResponse<
  operations['listConnections'],
  200
>['connections'][number];
export type ConnectionHealth = NonNullable<PlaidConnection['health']>;
export type HostedLinkCompletion = JsonResponse<operations['completeHostedLink'], 200>;

export type PushTokenRegistration = JsonBody<operations['registerPushToken']>;
export type RegisteredPushToken = JsonResponse<
  operations['registerPushToken'],
  201
>['token'];

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getOnboardingStatus(): Promise<OnboardingStatus> {
  return apiFetch<OnboardingStatus>('/onboarding/status');
}

export function declareLinkingComplete(): Promise<OnboardingStatus> {
  return apiFetch<OnboardingStatus>('/onboarding/linking-complete', {
    method: 'POST',
  });
}

export function getManualOnboarding(): Promise<{ saved: SavedManualOnboarding }> {
  return apiFetch<{ saved: SavedManualOnboarding }>('/onboarding/manual');
}

export function saveManualOnboarding(payload: ManualOnboardingPayload): Promise<unknown> {
  return apiFetch<unknown>('/onboarding/manual', { method: 'PUT', json: payload });
}

export function getFinancialReview(): Promise<FinancialReview> {
  return apiFetch<FinancialReview>('/onboarding/financial-review');
}

export function correctReviewItem(
  itemId: string,
  body: CorrectionRequest,
): Promise<CorrectionResult> {
  return apiFetch<CorrectionResult>(
    `/onboarding/financial-review/items/${encodeURIComponent(itemId)}`,
    { method: 'PATCH', json: body },
  );
}

export function recomputeReview(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>('/onboarding/financial-review/recompute', {
    method: 'POST',
  });
}

export function confirmReview(snapshotVersion: number): Promise<ConfirmResult> {
  return apiFetch<ConfirmResult>('/onboarding/financial-review/confirm', {
    method: 'POST',
    json: { snapshotVersion },
  });
}

export function retryAnalysis(): Promise<RetryResult> {
  return apiFetch<RetryResult>('/onboarding/retry', { method: 'POST' });
}

export function createLinkToken(request: LinkTokenRequest = {}): Promise<LinkTokenResult> {
  return apiFetch<LinkTokenResult>('/plaid/link-token', {
    method: 'POST',
    json: request,
  });
}

export async function exchangePublicToken(publicToken: string): Promise<PlaidConnection> {
  const { connection } = await apiFetch<{ connection: PlaidConnection }>(
    '/plaid/exchange-public-token',
    { method: 'POST', json: { publicToken } },
  );

  return connection;
}

export function completeHostedLink(linkToken: string): Promise<HostedLinkCompletion> {
  return apiFetch<HostedLinkCompletion>('/plaid/hosted-link/complete', {
    method: 'POST',
    json: { linkToken },
  });
}

export async function listConnections(): Promise<PlaidConnection[]> {
  const { connections } = await apiFetch<{ connections: PlaidConnection[] }>(
    '/plaid/connections',
  );

  return connections;
}

export function disconnectConnection(
  connectionId: string,
): Promise<{ recomputeQueued: boolean }> {
  return apiFetch<{ recomputeQueued: boolean }>(
    `/plaid/connections/${encodeURIComponent(connectionId)}`,
    { method: 'DELETE' },
  );
}

export async function registerPushToken(
  registration: PushTokenRegistration,
): Promise<RegisteredPushToken> {
  const { token } = await apiFetch<{ token: RegisteredPushToken }>(
    '/notifications/push-tokens',
    { method: 'POST', json: registration },
  );

  return token;
}

export function revokePushToken(tokenId: string): Promise<void> {
  return apiFetch<void>(`/notifications/push-tokens/${encodeURIComponent(tokenId)}`, {
    method: 'DELETE',
  });
}

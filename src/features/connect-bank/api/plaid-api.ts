import type {
  HostedLinkCompletion,
  LinkTokenResult,
  PlaidConnection,
} from '@/features/connect-bank/types/connect-bank';
import { apiFetch } from '@/lib/api-client';

/** Step 1: a short-lived token that authorizes one Link session. */
export async function createLinkToken(): Promise<LinkTokenResult> {
  return apiFetch<LinkTokenResult>('/plaid/link-token', { method: 'POST' });
}

/** Step 3: hand the public token back so the server can store the Item. */
export async function exchangePublicToken(
  publicToken: string,
): Promise<PlaidConnection> {
  const { connection } = await apiFetch<{ connection: PlaidConnection }>(
    '/plaid/exchange-public-token',
    { method: 'POST', json: { publicToken } },
  );

  return connection;
}

/** Web only: poll until the Plaid-hosted browser session reports a result. */
export async function completeHostedLink(
  linkToken: string,
): Promise<HostedLinkCompletion> {
  return apiFetch<HostedLinkCompletion>('/plaid/hosted-link/complete', {
    method: 'POST',
    json: { linkToken },
  });
}

export async function fetchConnections(): Promise<PlaidConnection[]> {
  const { connections } = await apiFetch<{ connections: PlaidConnection[] }>(
    '/plaid/connections',
  );

  return connections;
}

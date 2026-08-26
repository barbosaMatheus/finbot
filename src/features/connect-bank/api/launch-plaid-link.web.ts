import { completeHostedLink } from '@/features/connect-bank/api/plaid-api';
import type {
  LinkTokenResult,
  PlaidConnection,
} from '@/features/connect-bank/types/connect-bank';

/**
 * Web fallback. Plaid Link is a native module with no web implementation, so
 * the browser uses Plaid's Hosted Link instead: open the hosted URL in a new
 * tab and poll the API until Plaid reports the session finished.
 *
 * Hosted Link cannot call back into this page, so polling is the only way to
 * learn the outcome. Resolves `null` if the user never completes it.
 */

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function launchPlaidLink(
  linkTokenResult: LinkTokenResult,
): Promise<PlaidConnection | null> {
  const { hostedLinkUrl, linkToken } = linkTokenResult;

  if (!hostedLinkUrl) {
    throw new Error(
      'Plaid Hosted Link is unavailable. Use the iOS or Android build to connect a bank.',
    );
  }

  const hostedWindow = window.open(hostedLinkUrl, '_blank', 'noopener,noreferrer');

  if (!hostedWindow) {
    throw new Error('Allow pop-ups for this site, then try connecting again.');
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);

    const result = await completeHostedLink(linkToken);

    if (result.status === 'connected') {
      hostedWindow.close();
      return result.connection;
    }

    // The user closed the tab without finishing.
    if (hostedWindow.closed) {
      return null;
    }
  }

  return null;
}

/**
 * Update-mode Hosted Link on web: open the hosted session and wait for the
 * tab to close. Hosted Link cannot call back into this page for update
 * sessions, so tab-closed is the best completion signal available.
 */
export async function launchPlaidLinkSession(
  linkTokenResult: LinkTokenResult,
): Promise<'completed' | 'exited'> {
  const { hostedLinkUrl } = linkTokenResult;

  if (!hostedLinkUrl) {
    throw new Error('Plaid Hosted Link is unavailable for this session.');
  }

  const hostedWindow = window.open(hostedLinkUrl, '_blank', 'noopener,noreferrer');

  if (!hostedWindow) {
    throw new Error('Allow pop-ups for this site, then try again.');
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);

    if (hostedWindow.closed) {
      return 'completed';
    }
  }

  return 'exited';
}

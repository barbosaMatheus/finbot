import { createPlaidLinkSession } from 'react-native-plaid-link-sdk';

import { exchangePublicToken } from '@/features/connect-bank/api/plaid-api';
import type {
  LinkTokenResult,
  PlaidConnection,
} from '@/features/connect-bank/types/connect-bank';

/**
 * Native Link (iOS / Android). Plaid's SDK is a native module, so this path
 * requires a development build — `npx expo run:ios` / `run:android`. It does not
 * exist in Expo Go, and the web build resolves `launch-plaid-link.web.ts` instead.
 *
 * Resolves with the saved connection, or `null` if the user backed out.
 */
export async function launchPlaidLink(
  linkTokenResult: LinkTokenResult,
): Promise<PlaidConnection | null> {
  const publicToken = await new Promise<string | null>((resolve, reject) => {
    createPlaidLinkSession({
      token: linkTokenResult.linkToken,
      onSuccess: (success) => resolve(success.publicToken),
      onExit: (exit) => {
        // A user-initiated exit has no error attached; anything else is real.
        if (exit.error?.errorMessage) {
          reject(new Error(exit.error.errorMessage));
          return;
        }

        resolve(null);
      },
      onEvent: () => {
        // Required by the SDK. Analytics hook — nothing to do yet.
      },
    })
      .then((session) => session.open())
      .catch(reject);
  });

  if (!publicToken) {
    return null;
  }

  return exchangePublicToken(publicToken);
}

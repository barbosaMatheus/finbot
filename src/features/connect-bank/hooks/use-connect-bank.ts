import { useCallback, useEffect, useRef, useState } from 'react';

import { launchPlaidLink } from '@/features/connect-bank/api/launch-plaid-link';
import {
  createLinkToken,
  fetchConnections,
} from '@/features/connect-bank/api/plaid-api';
import type {
  ConnectBankStatus,
  PlaidConnection,
  UsePlaidLinkResult,
} from '@/features/connect-bank/types/connect-bank';

/**
 * Owns the whole bank-connection state machine. The one platform-dependent
 * step — actually presenting Plaid Link — lives in `launch-plaid-link.ts`
 * (native SDK) and `launch-plaid-link.web.ts` (Hosted Link in a browser tab),
 * which Metro resolves per platform.
 */
export function useConnectBank(): UsePlaidLinkResult {
  const [status, setStatus] = useState<ConnectBankStatus>('checking');
  const [connection, setConnection] = useState<PlaidConnection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Don't flash the CTA at someone who already linked an account.
  useEffect(() => {
    let cancelled = false;

    fetchConnections()
      .then((connections) => {
        if (cancelled) {
          return;
        }

        const existing = connections[0];

        setConnection(existing ?? null);
        setStatus(existing ? 'connected' : 'idle');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('idle');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(() => {
    setError(null);
    setStatus('linking');

    void (async () => {
      try {
        const linkTokenResult = await createLinkToken();
        const result = await launchPlaidLink(linkTokenResult);

        if (!isMounted.current) {
          return;
        }

        if (!result) {
          // User backed out of Link. Not an error — just let them retry.
          setStatus('idle');
          return;
        }

        setConnection(result);
        setStatus('connected');
      } catch (err) {
        if (!isMounted.current) {
          return;
        }

        setError(
          err instanceof Error ? err.message : 'Could not connect your bank.',
        );
        setStatus('error');
      }
    })();
  }, []);

  return { status, connection, error, connect };
}

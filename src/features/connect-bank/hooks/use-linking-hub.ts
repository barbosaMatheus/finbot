/* eslint-disable react-hooks/set-state-in-effect -- async loaders invoked from effects set state after awaits; standard fetch-in-effect pattern */
/**
 * Multi-institution linking hub state (APP-005).
 *
 * Lists every connection with sync health, adds institutions (duplicate
 * links surface as a notice, not a new card), runs update-mode sessions
 * for broken connections, disconnects, and lets the user declare linking
 * complete — which is what starts the analysis run server-side.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createLinkToken,
  declareLinkingComplete,
  disconnectConnection,
  listConnections,
  retryAnalysis,
  type PlaidConnection,
} from '@/api/client';
import {
  launchPlaidLink,
  launchPlaidLinkSession,
} from '@/features/connect-bank/api/launch-plaid-link';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';

export type LinkingBusy =
  | { kind: 'add' }
  | { kind: 'update'; connectionId: string }
  | { kind: 'disconnect'; connectionId: string }
  | { kind: 'declare' }
  | null;

export type UseLinkingHubResult = {
  connections: PlaidConnection[];
  isLoading: boolean;
  busy: LinkingBusy;
  error: string | null;
  notice: string | null;
  addInstitution: () => void;
  updateConnection: (connection: PlaidConnection) => void;
  removeConnection: (connection: PlaidConnection) => void;
  declareDone: () => void;
  reload: () => Promise<void>;
};

export function useLinkingHub(): UseLinkingHubResult {
  const { refresh } = useOnboardingStatus();

  const [connections, setConnections] = useState<PlaidConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<LinkingBusy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      const next = await listConnections();

      if (isMounted.current) {
        setConnections(next.filter((connection) => connection.status === 'active'));
      }
    } catch {
      // Keep whatever we had; the screen shows its own error affordances.
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addInstitution = useCallback(() => {
    setBusy({ kind: 'add' });
    setError(null);
    setNotice(null);

    void (async () => {
      try {
        const token = await createLinkToken({});
        const connection = await launchPlaidLink(token);

        if (!isMounted.current) {
          return;
        }

        if (connection?.duplicate) {
          setNotice(
            `${connection.institutionName ?? 'That institution'} is already connected.`,
          );
        }

        await reload();
      } catch (err) {
        if (isMounted.current) {
          setError(
            err instanceof Error ? err.message : 'Could not connect that institution.',
          );
        }
      } finally {
        if (isMounted.current) {
          setBusy(null);
        }
      }
    })();
  }, [reload]);

  const updateConnection = useCallback(
    (connection: PlaidConnection) => {
      setBusy({ kind: 'update', connectionId: connection.id });
      setError(null);
      setNotice(null);

      void (async () => {
        try {
          const token = await createLinkToken({ mode: 'update', itemId: connection.id });
          const outcome = await launchPlaidLinkSession(token);

          if (outcome === 'completed') {
            // Re-sync whatever was failed; harmless when nothing was.
            await retryAnalysis().catch(() => null);
          }

          await reload();
          await refresh();
        } catch (err) {
          if (isMounted.current) {
            setError(
              err instanceof Error ? err.message : 'Could not update that connection.',
            );
          }
        } finally {
          if (isMounted.current) {
            setBusy(null);
          }
        }
      })();
    },
    [reload, refresh],
  );

  const removeConnection = useCallback(
    (connection: PlaidConnection) => {
      setBusy({ kind: 'disconnect', connectionId: connection.id });
      setError(null);
      setNotice(null);

      void (async () => {
        try {
          await disconnectConnection(connection.id);
          await reload();
          await refresh();
        } catch (err) {
          if (isMounted.current) {
            setError(
              err instanceof Error ? err.message : 'Could not disconnect that institution.',
            );
          }
        } finally {
          if (isMounted.current) {
            setBusy(null);
          }
        }
      })();
    },
    [reload, refresh],
  );

  const declareDone = useCallback(() => {
    setBusy({ kind: 'declare' });
    setError(null);

    void (async () => {
      try {
        await declareLinkingComplete();
        // The fresh status routes the user onward via the root guard.
        await refresh();
      } catch (err) {
        if (isMounted.current) {
          setError(
            err instanceof Error ? err.message : 'Could not continue. Try again.',
          );
        }
      } finally {
        if (isMounted.current) {
          setBusy(null);
        }
      }
    })();
  }, [refresh]);

  return {
    connections,
    isLoading,
    busy,
    error,
    notice,
    addInstitution,
    updateConnection,
    removeConnection,
    declareDone,
    reload,
  };
}

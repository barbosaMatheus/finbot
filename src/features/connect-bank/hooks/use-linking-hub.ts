/* eslint-disable react-hooks/set-state-in-effect -- async loaders invoked from effects set state after awaits; standard fetch-in-effect pattern */
/**
 * Multi-institution linking hub state (APP-005).
 *
 * Lists every connection with sync health, adds institutions (duplicate
 * links surface as a notice, not a new card), runs update-mode sessions
 * for broken connections, disconnects, and lets the user declare linking
 * complete — which is what starts the analysis run server-side.
 */

import { useRouter } from 'expo-router';
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
import { routeForPhase } from '@/features/onboarding-status/routing';

/**
 * Sync health is written by the worker after link time, so the list we load
 * right after connecting says "Starting…" and would say so forever without a
 * re-read. Poll (3s → 10s) while any connection is still pending or syncing.
 */
const SYNC_POLL_MS = 3_000;
const SYNC_POLL_MAX_MS = 10_000;

function isSyncInFlight(connection: PlaidConnection): boolean {
  const syncStatus = connection.health?.syncStatus;

  return syncStatus !== 'complete' && syncStatus !== 'failed';
}

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
  const router = useRouter();

  const [connections, setConnections] = useState<PlaidConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<LinkingBusy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncPollTick, setSyncPollTick] = useState(0);

  const isMounted = useRef(true);
  const syncPollDelayRef = useRef(SYNC_POLL_MS);

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

  // Re-read sync health while any connection is still starting or syncing.
  // The tick re-arms the timer even when a reload fails or returns the same
  // statuses, so one transient error does not end the chain.
  useEffect(() => {
    if (!connections.some(isSyncInFlight)) {
      syncPollDelayRef.current = SYNC_POLL_MS;
      return;
    }

    const timer = setTimeout(async () => {
      await reload();
      syncPollDelayRef.current = Math.min(
        syncPollDelayRef.current * 1.5,
        SYNC_POLL_MAX_MS,
      );

      if (isMounted.current) {
        setSyncPollTick((tick) => tick + 1);
      }
    }, syncPollDelayRef.current);

    return () => clearTimeout(timer);
  }, [connections, reload, syncPollTick]);

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
        const next = await refresh();

        // The root guard never bounces anyone off this screen — it stays
        // reachable in every restricted phase for managing connections — so
        // leaving it after declaring is this action's job, routed from the
        // fresh server phase exactly as the guard would elsewhere.
        if (next && next.phase !== 'financial_linking' && isMounted.current) {
          router.replace(routeForPhase(next.phase).path as never);
        }
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
  }, [refresh, router]);

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

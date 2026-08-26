/**
 * Server-driven onboarding state (APP-003).
 *
 * GET /onboarding/status is the single routing authority: this provider
 * fetches it when a session exists, polls with backoff while the server is
 * working (waiting/classifying/recomputing), refreshes when the app
 * returns to the foreground, and re-fetches on demand after any action
 * that can move a gate. Screens never derive the phase themselves.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { getOnboardingStatus, type OnboardingStatus } from '@/api/client';
import { useAuth } from '@/features/auth/use-auth';

/** Phases during which the server is working and the client should poll. */
const POLLING_PHASES = new Set([
  'waiting_for_history',
  'classifying',
  'recomputing',
]);

const INITIAL_POLL_MS = 3_000;
const MAX_POLL_MS = 10_000;

type OnboardingStatusContextValue = {
  status: OnboardingStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<OnboardingStatus | null>;
};

const OnboardingStatusContext = createContext<OnboardingStatusContextValue | null>(null);

export function OnboardingStatusProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollDelayRef = useRef(INITIAL_POLL_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async (): Promise<OnboardingStatus | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const next = await getOnboardingStatus();
      setStatus(next);
      setError(null);
      return next;
    } catch (err) {
      // Transient API failures retain the last known state; routing keeps
      // the user where they are instead of bouncing them around.
      setError(err instanceof Error ? err.message : 'Could not load status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load + reset on login/logout.
  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    void refresh();
  }, [isAuthenticated, refresh]);

  // Poll with backoff while the server is working.
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isAuthenticated || !status || !POLLING_PHASES.has(status.phase)) {
      pollDelayRef.current = INITIAL_POLL_MS;
      return;
    }

    const tick = () => {
      timerRef.current = setTimeout(async () => {
        const next = await refresh();
        pollDelayRef.current = Math.min(pollDelayRef.current * 1.5, MAX_POLL_MS);

        if (next && POLLING_PHASES.has(next.phase)) {
          tick();
        }
      }, pollDelayRef.current);
    };

    tick();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, refresh, status]);

  // Cold-start and foreground refresh: state may have moved while away.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, refresh]);

  const value = useMemo<OnboardingStatusContextValue>(
    () => ({ status, isLoading, error, refresh }),
    [status, isLoading, error, refresh],
  );

  return (
    <OnboardingStatusContext.Provider value={value}>
      {children}
    </OnboardingStatusContext.Provider>
  );
}

export function useOnboardingStatus(): OnboardingStatusContextValue {
  const context = useContext(OnboardingStatusContext);

  if (!context) {
    throw new Error(
      'useOnboardingStatus must be used within an OnboardingStatusProvider',
    );
  }

  return context;
}

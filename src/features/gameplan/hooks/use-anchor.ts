/* eslint-disable react-hooks/set-state-in-effect -- async loaders invoked from effects set state after awaits; standard fetch-in-effect pattern */
/**
 * The anchor's data and its bounded actions. One read gives the screen
 * everything; each action re-reads afterwards so the screen never guesses
 * at server state. While the plan is still being built the hook polls.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  acknowledgeAnchor,
  addReflection,
  applyHeadsUp,
  completeAwareness,
  getAnchor,
  parseHeadsUp,
  swapAnchorTarget,
  type Anchor,
  type HeadsUpParseResult,
  type HeadsUpRequest,
  type HeadsUpResult,
  type ReflectionRequest,
  type ReflectionResult,
} from '@/api/client';
import { ApiError } from '@/lib/api-client';

const BUILDING_POLL_MS = 5000;
const BUILDING_POLL_LIMIT = 36;

export function useAnchor() {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const polls = useRef(0);

  const reload = useCallback(async () => {
    try {
      const next = await getAnchor();
      setAnchor(next);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your plan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // A period whose plan is still being built: poll briefly, then stop.
  const status = anchor?.status;

  useEffect(() => {
    if (status !== 'building' || polls.current >= BUILDING_POLL_LIMIT) {
      return;
    }

    const timer = setTimeout(() => {
      polls.current += 1;
      void reload();
    }, BUILDING_POLL_MS);

    return () => clearTimeout(timer);
  }, [status, anchor, reload]);

  const run = useCallback(
    async <T,>(key: string, action: () => Promise<T>): Promise<T | null> => {
      setBusy(key);
      setActionError(null);

      try {
        const result = await action();
        await reload();
        return result;
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : 'That did not go through');
        return null;
      } finally {
        setBusy(null);
      }
    },
    [reload],
  );

  const acknowledge = useCallback(() => run('got-it', acknowledgeAnchor), [run]);

  const swap = useCallback(
    (outId: string, inId: string) => run('swap', () => swapAnchorTarget({ outId, inId })),
    [run],
  );

  const parse = useCallback(
    async (text: string): Promise<HeadsUpParseResult | null> => {
      setBusy('parse');
      setActionError(null);

      try {
        return await parseHeadsUp(text);
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : 'That did not go through');
        return null;
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  const apply = useCallback(
    (body: HeadsUpRequest): Promise<HeadsUpResult | null> => run('heads-up', () => applyHeadsUp(body)),
    [run],
  );

  const reflect = useCallback(
    (body: ReflectionRequest): Promise<ReflectionResult | null> =>
      run('reflection', () => addReflection(body)),
    [run],
  );

  const markAwarenessDone = useCallback(() => run('awareness', completeAwareness), [run]);

  return {
    anchor,
    isLoading,
    loadError,
    actionError,
    busy,
    reload,
    acknowledge,
    swap,
    parse,
    apply,
    reflect,
    markAwarenessDone,
  };
}

export type AnchorController = ReturnType<typeof useAnchor>;

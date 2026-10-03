import { useEffect, useState } from 'react';

import { PROCESSING_STATUS_PHRASES } from '@/features/chat/constants/status-phrases';

const MIN_INTERVAL_MS = 6_000;
const MAX_INTERVAL_MS = 12_000;

function randomIntervalMs(): number {
  return MIN_INTERVAL_MS + Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS + 1));
}

/**
 * While `active`, cycles through the processing status phrases, advancing to
 * the next phrase after a randomized 6–12s interval. Advances only from the
 * timer callback so the effect never synchronously sets state.
 */
export function useProcessingStatus(active: boolean): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    let timeoutRef: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      timeoutRef = setTimeout(() => {
        setIndex((current) => (current + 1) % PROCESSING_STATUS_PHRASES.length);
        scheduleNext();
      }, randomIntervalMs());
    };

    scheduleNext();

    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [active]);

  return PROCESSING_STATUS_PHRASES[index % PROCESSING_STATUS_PHRASES.length];
}
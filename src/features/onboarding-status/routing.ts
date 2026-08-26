/**
 * The phase → route matrix (APP-003), mirroring the API handoff's
 * normative table. One function, unit-testable, no component state.
 */

import type { OnboardingPhase } from '@/api/client';

export type RouteDecision = {
  /** Expo Router path the user should be on for this phase. */
  path: string;
  /** Top-level route group of that path, for cheap "already there" checks. */
  group: string;
};

export function routeForPhase(phase: OnboardingPhase): RouteDecision {
  switch (phase) {
    case 'financial_linking':
      return { path: '/(connect-bank)', group: '(connect-bank)' };
    case 'manual_profile_in_progress':
      return { path: '/(onboarding)', group: '(onboarding)' };
    case 'waiting_for_history':
    case 'classifying':
      return { path: '/(processing)/waiting', group: '(processing)' };
    case 'review_ready':
    case 'recomputing':
      return { path: '/(processing)/review', group: '(processing)' };
    case 'failed_retryable':
      return { path: '/(processing)/retry', group: '(processing)' };
    case 'complete':
      return { path: '/(app)', group: '(app)' };
  }
}

/** Screens inside (processing) that each phase expects. */
export function processingScreenForPhase(phase: OnboardingPhase): string | null {
  switch (phase) {
    case 'waiting_for_history':
    case 'classifying':
      return 'waiting';
    case 'review_ready':
    case 'recomputing':
      return 'review';
    case 'failed_retryable':
      return 'retry';
    default:
      return null;
  }
}

/**
 * Whether the current location already satisfies the phase, so the guard
 * never issues a redirect it does not need (no loops).
 */
export function isLocationValidForPhase(
  segments: readonly string[],
  phase: OnboardingPhase,
): boolean {
  const decision = routeForPhase(phase);
  const [group, screen] = segments;

  // Account/settings surfaces stay reachable in every restricted phase.
  if (group === 'account') {
    return true;
  }

  // Managing connections is always allowed while restricted (the design's
  // manage_connections action), except once complete.
  if (group === '(connect-bank)' && phase !== 'complete') {
    return true;
  }

  if (group !== decision.group) {
    return false;
  }

  if (decision.group === '(processing)') {
    return screen === processingScreenForPhase(phase);
  }

  return true;
}

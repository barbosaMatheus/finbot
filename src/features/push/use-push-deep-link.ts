/**
 * Notification tap handling (APP-009). A push is only a wake-up: on tap —
 * foreground, background, or cold start — refetch the onboarding status
 * and let the route guard place the user, so a push that arrives after
 * state moved on can never route somewhere stale. The tap's data (its
 * `url`) is handed to the caller, which may route inside the allowed
 * group — the anchor for gameplan pushes, chat for a nudge.
 */

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { pushSupported } from './push-registration';

export type PushTapData = {
  type?: string;
  url?: string;
};

function dataOf(response: Notifications.NotificationResponse): PushTapData {
  const raw = response.notification.request.content.data as Record<string, unknown> | null | undefined;
  return {
    type: typeof raw?.type === 'string' ? raw.type : undefined,
    url: typeof raw?.url === 'string' ? raw.url : undefined,
  };
}

/** The in-app path a push deep link maps to, or null when it only wakes the app. */
export function pathForPushUrl(url: string | undefined): string | null {
  switch (url) {
    case 'finbot://gameplan/anchor':
      return '/gameplan/anchor';
    case 'finbot://chat':
      return '/(app)/chat';
    default:
      return null;
  }
}

export function usePushDeepLink(onWake: (data: PushTapData) => void): void {
  useEffect(() => {
    if (!pushSupported) {
      return;
    }

    // Cold start: the tap that launched the app.
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        onWake(dataOf(response));
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      onWake(dataOf(response));
    });

    return () => subscription.remove();
  }, [onWake]);
}

/**
 * Notification tap handling (APP-009). A push is only a wake-up: on tap —
 * foreground, background, or cold start — refetch the onboarding status
 * and let the route guard place the user, so a push that arrives after
 * state moved on can never route somewhere stale.
 */

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { pushSupported } from './push-registration';

export function usePushDeepLink(onWake: () => void): void {
  useEffect(() => {
    if (!pushSupported) {
      return;
    }

    // Cold start: the tap that launched the app.
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        onWake();
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      onWake();
    });

    return () => subscription.remove();
  }, [onWake]);
}

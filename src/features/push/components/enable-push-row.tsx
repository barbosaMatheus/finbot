/**
 * Inline prompt on the waiting screen (APP-009): offer to notify the user
 * when the delayed review becomes ready. Renders nothing on web or once
 * this device is registered.
 */

import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  enablePushNotifications,
  isPushRegistered,
  pushSupported,
} from '@/features/push/push-registration';

export function EnablePushRow() {
  const [state, setState] = useState<
    'hidden' | 'offer' | 'busy' | 'registered' | 'denied'
  >('hidden');

  useEffect(() => {
    if (!pushSupported) {
      return;
    }

    let cancelled = false;

    void isPushRegistered().then((registered) => {
      if (!cancelled) {
        setState(registered ? 'registered' : 'offer');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'hidden') {
    return null;
  }

  if (state === 'registered') {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        We&apos;ll notify you when your review is ready.
      </ThemedText>
    );
  }

  if (state === 'denied') {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Notifications are off — you can enable them in system settings.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.row}>
      <ActionButton
        label="Notify me when it's ready"
        variant="secondary"
        busy={state === 'busy'}
        onPress={() => {
          setState('busy');
          void enablePushNotifications().then((result) => {
            setState(
              result.status === 'registered'
                ? 'registered'
                : result.status === 'denied'
                  ? 'denied'
                  : 'offer',
            );
          });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: Spacing.two,
  },
  note: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});

/**
 * Inline prompt to register this device for push (APP-009). Born on the
 * waiting screen, where it offers to say when the delayed review is ready;
 * the account screen shows it too, with its own copy, because a review that
 * finishes before the profile questions do skips the waiting screen — and
 * with it the only place a user could turn notifications on. Renders
 * nothing on web; a short note once this device is registered.
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

type EnablePushRowProps = {
  /** The offer's button label. */
  label?: string;
  /** Shown once this device is registered. */
  registeredCopy?: string;
};

export function EnablePushRow({
  label = "Notify me when it's ready",
  registeredCopy = "We'll notify you when your review is ready.",
}: EnablePushRowProps = {}) {
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
        {registeredCopy}
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
        label={label}
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

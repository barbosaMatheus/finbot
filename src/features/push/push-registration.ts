/**
 * Expo push registration lifecycle (APP-009).
 *
 * Native only — web has no push and falls back to polling. The registered
 * token's server id is remembered so logout can revoke it. Push is purely
 * a wake-up: handlers refetch /onboarding/status and let the route guard
 * decide where to go.
 */

import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { registerPushToken, revokePushToken } from '@/api/client';

const PUSH_TOKEN_ID_KEY = 'finbot.pushTokenId';

export const pushSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export type PushRegistrationResult =
  | { status: 'registered' }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'error'; message: string };

function getProjectId(): string | undefined {
  const easProjectId = (
    Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined
  )?.eas?.projectId;

  return easProjectId ?? Constants.easConfig?.projectId ?? undefined;
}

/** Ask for permission (if needed) and register this device's token. */
export async function enablePushNotifications(): Promise<PushRegistrationResult> {
  if (!pushSupported) {
    return { status: 'unsupported' };
  }

  try {
    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;

    if (!granted && existing.canAskAgain) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.granted;
    }

    if (!granted) {
      return { status: 'denied' };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'FinBot',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = getProjectId();
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    const registered = await registerPushToken({
      token: token.data,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });

    await SecureStore.setItemAsync(PUSH_TOKEN_ID_KEY, registered.id);

    return { status: 'registered' };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Could not enable notifications',
    };
  }
}

export async function isPushRegistered(): Promise<boolean> {
  if (!pushSupported) {
    return false;
  }

  return (await SecureStore.getItemAsync(PUSH_TOKEN_ID_KEY)) !== null;
}

/** Revoke this device's token server-side (logout). Best effort. */
export async function revokePushRegistration(): Promise<void> {
  if (!pushSupported) {
    return;
  }

  try {
    const tokenId = await SecureStore.getItemAsync(PUSH_TOKEN_ID_KEY);

    if (tokenId) {
      await revokePushToken(tokenId).catch(() => {});
      await SecureStore.deleteItemAsync(PUSH_TOKEN_ID_KEY);
    }
  } catch {
    // Never block logout on push cleanup.
  }
}

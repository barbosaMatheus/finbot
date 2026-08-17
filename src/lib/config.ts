import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

/**
 * Resolution order:
 *   1. EXPO_PUBLIC_API_BASE_URL — inlined at bundle time, so Docker Compose and
 *      physical devices can point at a LAN IP without editing app.json.
 *   2. app.json -> expo.extra.apiBaseUrl
 *   3. localhost, which only works in a desktop browser or an iOS simulator.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  return extra?.apiBaseUrl ?? DEFAULT_API_BASE_URL;
}

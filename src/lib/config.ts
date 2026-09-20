import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const DEFAULT_CHAT_MAX_CHARS = 128;

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

/**
 * Maximum number of characters a user can send in a single chat message.
 *
 * Expo inlines EXPO_PUBLIC_* at bundle time; Docker Compose maps the top-level
 * CHAT_MAX_CHARS variable onto EXPO_PUBLIC_CHAT_MAX_CHARS (see
 * docker-compose.yml). Falls back to 128.
 */
export function getChatMaxChars(): number {
  const fromEnv = process.env.EXPO_PUBLIC_CHAT_MAX_CHARS?.trim();
  const parsed = fromEnv ? Number.parseInt(fromEnv, 10) : Number.NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_CHAT_MAX_CHARS;
}

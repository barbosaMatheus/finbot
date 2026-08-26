/**
 * Native session token storage (APP-004).
 *
 * Web never touches this — its session lives in HttpOnly cookies the
 * browser sends automatically. Native stores the Bearer pair in Expo
 * SecureStore (Keychain/Keystore), never AsyncStorage.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'finbot.accessToken';
const REFRESH_TOKEN_KEY = 'finbot.refreshToken';

export const usesNativeAuth = Platform.OS !== 'web';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export async function saveTokens(tokens: TokenPair): Promise<void> {
  if (!usesNativeAuth) {
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function loadTokens(): Promise<TokenPair | null> {
  if (!usesNativeAuth) {
    return null;
  }

  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
  if (!usesNativeAuth) {
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Platform-aware auth transport (APP-004).
 *
 * Web uses the cookie flow — HttpOnly cookies ride on `credentials:
 * 'include'` and the body carries only the user. Native uses the explicit
 * `/auth/native/*` flow: rotating token pairs stored in SecureStore, with
 * the access token sent as `Authorization: Bearer` on every request.
 * Nothing here relies on accidental cookie behavior in native fetch.
 */

import type { NativeAuthResponse } from '@/api/client';
import { apiFetch, setAccessTokenHeader } from '@/lib/api-client';
import {
  clearTokens,
  loadTokens,
  saveTokens,
  usesNativeAuth,
} from '@/lib/token-store';

import type { AuthResponse, LoginCredentials, RegisterCredentials } from './types';

async function adoptNativeSession(result: NativeAuthResponse): Promise<AuthResponse> {
  await saveTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  setAccessTokenHeader(result.accessToken);

  return { user: result.user };
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  if (usesNativeAuth) {
    const result = await apiFetch<NativeAuthResponse>('/auth/native/register', {
      method: 'POST',
      json: credentials,
    });

    return adoptNativeSession(result);
  }

  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    json: credentials,
  });
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (usesNativeAuth) {
    const result = await apiFetch<NativeAuthResponse>('/auth/native/login', {
      method: 'POST',
      json: credentials,
    });

    return adoptNativeSession(result);
  }

  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    json: credentials,
  });
}

/**
 * Rotate the session. Native refresh tokens are single use: the newly
 * returned pair always replaces the stored one.
 */
export async function refreshSession(): Promise<AuthResponse> {
  if (usesNativeAuth) {
    const stored = await loadTokens();

    if (!stored) {
      throw new Error('No stored session');
    }

    const result = await apiFetch<NativeAuthResponse>('/auth/native/refresh', {
      method: 'POST',
      json: { refreshToken: stored.refreshToken },
    });

    return adoptNativeSession(result);
  }

  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });
}

export async function logout(): Promise<void> {
  if (usesNativeAuth) {
    const stored = await loadTokens();

    try {
      if (stored) {
        await apiFetch<void>('/auth/native/logout', {
          method: 'POST',
          json: { refreshToken: stored.refreshToken },
        });
      }
    } finally {
      setAccessTokenHeader(null);
      await clearTokens();
    }

    return;
  }

  await apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

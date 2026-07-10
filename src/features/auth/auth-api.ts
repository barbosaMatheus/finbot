import { apiFetch } from '@/lib/api-client';

import type { AuthResponse, LoginCredentials, RegisterCredentials } from './types';

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    json: credentials,
  });
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    json: credentials,
  });
}

export async function refreshSession(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

import type { AuthUser } from '@/api/client';

/** The authenticated user, from the generated contract types. */
export type User = AuthUser;

export type AuthSession = {
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials;

export type AuthResponse = {
  user: User;
};

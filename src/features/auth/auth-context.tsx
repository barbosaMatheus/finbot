import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { LoginCredentials, RegisterCredentials, User } from './types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    // TODO: swap mock for auth-api.ts login()
    setUser({
      id: 'mock-user-id',
      email: credentials.email.trim().toLowerCase(),
    });
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    // TODO: swap mock for auth-api.ts register()
    setUser({
      id: 'mock-user-id',
      email: credentials.email.trim().toLowerCase(),
    });
  }, []);

  const logout = useCallback(async () => {
    // TODO: swap mock for auth-api.ts logout()
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    // TODO: swap mock for auth-api.ts refreshSession()
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshSession,
    }),
    [isLoading, login, logout, refreshSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

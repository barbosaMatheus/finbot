import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '@/features/auth/auth-context';
import { useAuth } from '@/features/auth/use-auth';
import {
  OnboardingStatusProvider,
  useOnboardingStatus,
} from '@/features/onboarding-status/onboarding-status-context';
import {
  isLocationValidForPhase,
  routeForPhase,
} from '@/features/onboarding-status/routing';
import { pathForPushUrl, usePushDeepLink, type PushTapData } from '@/features/push/use-push-deep-link';

function RootLayoutNav() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { status, isLoading: statusLoading, refresh } = useOnboardingStatus();
  const segments = useSegments();
  const router = useRouter();
  const pendingPushPath = useRef<string | null>(null);

  // Push taps refetch status; the guard below routes from the fresh phase.
  // A gameplan push also names a screen — the anchor, or chat for a nudge —
  // which is opened once the phase confirms the user is past onboarding.
  const onPushWake = useCallback(
    (data: PushTapData) => {
      pendingPushPath.current = pathForPushUrl(data.url);
      void refresh();
    },
    [refresh],
  );

  usePushDeepLink(onPushWake);

  useEffect(() => {
    const target = pendingPushPath.current;
    if (!target || !isAuthenticated || statusLoading || status?.phase !== 'complete') {
      return;
    }

    pendingPushPath.current = null;
    router.push(target as never);
  }, [isAuthenticated, router, status, statusLoading]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    // Allow unauthenticated access to onboarding so Sign up can start with
    // the create-account step before the user has a session.
    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    // Authenticated: every route decision comes from the server phase
    // (APP-003). Wait for the first status rather than guessing.
    if (statusLoading || !status) {
      return;
    }

    if (!isLocationValidForPhase(segments, status.phase)) {
      router.replace(routeForPhase(status.phase).path as never);
    }
  }, [authLoading, isAuthenticated, router, segments, status, statusLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <OnboardingStatusProvider>
          <RootLayoutNav />
        </OnboardingStatusProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

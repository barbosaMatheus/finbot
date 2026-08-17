import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppHeader } from '@/components/app-header';
import AppTabs from '@/components/app-tabs';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/use-auth';

export default function AppLayout() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // No redirect needed here: clearing the session flips `isAuthenticated`, and
  // the gate in src/app/_layout.tsx sends the user back to login.
  function handleLogout() {
    void logout();
  }

  return (
    <ThemedView style={styles.container}>
      <AnimatedSplashOverlay />
      <AppHeader
        email={user?.email}
        onAccount={() => router.push('/account')}
        onLogout={handleLogout}
      />
      <ThemedView style={styles.tabs}>
        <AppTabs />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flex: 1,
  },
});

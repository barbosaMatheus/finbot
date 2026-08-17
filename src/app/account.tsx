import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function AccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, logout } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.back, { opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Back
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.identity}>
            <UserAvatar email={user?.email} size={72} />
            <ThemedView style={styles.identityCopy}>
              <ThemedText type="smallBold">Signed in as</ThemedText>
              <ThemedText themeColor="textSecondary">{user?.email ?? 'Unknown'}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.spacer} />

          <Pressable
            accessibilityLabel="Log out"
            accessibilityRole="button"
            onPress={() => void logout()}
            style={({ pressed }) => [
              styles.logout,
              { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold">Log out</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flex: 1,
    gap: Spacing.five,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    minHeight: 32,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  identityCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  spacer: {
    flex: 1,
  },
  logout: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    minHeight: 48,
  },
});

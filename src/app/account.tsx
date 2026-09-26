import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/use-auth';
import { EnablePushRow } from '@/features/push/components/enable-push-row';
import { pushSupported } from '@/features/push/push-registration';
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

          <Pressable
            accessibilityLabel="Plan settings"
            accessibilityRole="button"
            onPress={() => router.push('/gameplan/settings' as never)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold">When your plan arrives</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Payday or a day you pick, and the time of day.
            </ThemedText>
          </Pressable>

          {pushSupported ? (
            <ThemedView style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">Notifications</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Your plan, your grade and the occasional heads-up, on this phone.
              </ThemedText>
              <EnablePushRow label="Turn on notifications" registeredCopy="On for this phone." />
            </ThemedView>
          ) : null}

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
  row: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
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

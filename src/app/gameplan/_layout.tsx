import { Stack } from 'expo-router';

/** The anchor and its settings: reachable from home, the account menu, and push deep links. */
export default function GameplanLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

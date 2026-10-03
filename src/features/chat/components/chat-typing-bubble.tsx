import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChatTypingBubbleProps = {
  status: string;
};

/**
 * Assistant-side indicator shown while the model generates a response.
 * Pairs a spinner with the current processing status phrase so the user can
 * tell the assistant is working rather than idle.
 */
export function ChatTypingBubble({ status }: ChatTypingBubbleProps) {
  const theme = useTheme();

  return (
    <ThemedView
      accessibilityLabel={`FinBot is working: ${status}`}
      accessibilityLiveRegion="polite"
      style={[styles.bubble, { backgroundColor: theme.backgroundElement }]}>
      <ActivityIndicator color={theme.text} size="small" />
      <ThemedText type="small" themeColor="textSecondary">
        {status}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    maxWidth: '82%',
    borderRadius: Spacing.three,
    borderBottomLeftRadius: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
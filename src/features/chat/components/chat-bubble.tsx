import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/features/chat/types/chat';
import { useTheme } from '@/hooks/use-theme';

type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <ThemedView
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        {
          backgroundColor: isUser ? theme.backgroundSelected : theme.backgroundElement,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
        },
      ]}>
      <ThemedText>{message.content}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '82%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  userBubble: {
    borderBottomRightRadius: Spacing.one,
  },
  assistantBubble: {
    borderBottomLeftRadius: Spacing.one,
  },
});

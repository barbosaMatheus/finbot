import { FlatList, StyleSheet } from 'react-native';

import { ChatBubble } from '@/features/chat/components/chat-bubble';
import type { ChatMessage } from '@/features/chat/types/chat';
import { Spacing } from '@/constants/theme';

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatBubble message={item} />}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});

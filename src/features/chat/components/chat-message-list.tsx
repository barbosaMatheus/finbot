import { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { ChatTypingBubble } from '@/features/chat/components/chat-typing-bubble';
import type { ChatMessage } from '@/features/chat/types/chat';

type ChatMessageListProps = {
  messages: ChatMessage[];
  /** While true, an assistant "working" bubble is appended after the messages. */
  isReplying?: boolean;
  /** Current processing status phrase to show in the working bubble. */
  status?: string;
};

export function ChatMessageList({
  messages,
  isReplying = false,
  status = '',
}: ChatMessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  return (
    <FlatList
      ref={listRef}
      contentContainerStyle={styles.content}
      data={messages}
      keyExtractor={(item) => item.id}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ListFooterComponent={isReplying ? <ChatTypingBubble status={status} /> : null}
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
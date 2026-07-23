import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { useChat } from '@/features/chat/hooks/use-chat';
import { useTheme } from '@/hooks/use-theme';

export function ChatWindow() {
  const theme = useTheme();
  const { messages, draft, isReplying, setDraft, sendMessage } = useChat();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ThemedView style={[styles.header, { borderBottomColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold">FinBot Chat</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Preview mode
          </ThemedText>
        </ThemedView>

        <ChatMessageList messages={messages} />
        <ChatComposer
          disabled={isReplying}
          onChangeText={setDraft}
          onSend={sendMessage}
          value={draft}
        />
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
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.half,
  },
});

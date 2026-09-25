import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/use-auth';
import { ChatComposer } from '@/features/chat/components/chat-composer';
import { ChatMessageList } from '@/features/chat/components/chat-message-list';
import { useChat } from '@/features/chat/hooks/use-chat';
import { useProcessingStatus } from '@/features/chat/hooks/use-processing-status';
import { useTheme } from '@/hooks/use-theme';
import { getChatMaxChars } from '@/lib/config';

type ChatWindowProps = {
  /** One line of context the route composes in — the current plan, when there is one. */
  contextLine?: string | null;
};

export function ChatWindow({ contextLine }: ChatWindowProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { messages, draft, isReplying, setDraft, sendMessage } = useChat({
    userId: user?.id ?? '',
  });
  const status = useProcessingStatus(isReplying);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ThemedView style={[styles.header, { borderBottomColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold">FinBot Chat</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {contextLine ?? 'Live assistant'}
          </ThemedText>
        </ThemedView>

        <ChatMessageList isReplying={isReplying} messages={messages} status={status} />
        <ChatComposer
          disabled={isReplying}
          maxLength={getChatMaxChars()}
          onChangeText={setDraft}
          onSend={() => void sendMessage()}
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

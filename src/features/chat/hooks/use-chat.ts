import { useCallback, useState } from 'react';

import { chatPrompt } from '@/api/client';
import { INITIAL_CHAT_MESSAGES } from '@/features/chat/constants/initial-messages';
import type { ChatMessage } from '@/features/chat/types/chat';
import { getChatMaxChars } from '@/lib/config';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type UseChatOptions = {
  /** The authenticated user the model answers from. */
  userId: string;
};

export function useChat({ userId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [draft, setDraft] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const sendMessage = useCallback(async () => {
    const content = draft.trim().slice(0, getChatMaxChars());

    if (!content || isReplying || !userId) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setIsReplying(true);

    try {
      const { response } = await chatPrompt({
        userId,
        userPromptText: content,
      });

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: response,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content:
            'Sorry, I could not get a response just now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  }, [draft, isReplying, userId]);

  return {
    messages,
    draft,
    isReplying,
    setDraft,
    sendMessage,
  };
}

import { useCallback, useState } from 'react';

import {
  DUMMY_ASSISTANT_REPLIES,
  INITIAL_CHAT_MESSAGES,
} from '@/features/chat/constants/dummy-replies';
import type { ChatMessage } from '@/features/chat/types/chat';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [draft, setDraft] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const sendMessage = useCallback(() => {
    const content = draft.trim();

    if (!content || isReplying) {
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

    const reply =
      DUMMY_ASSISTANT_REPLIES[Math.floor(Math.random() * DUMMY_ASSISTANT_REPLIES.length)];

    // Simulate a short assistant latency for the dummy chat.
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        },
      ]);
      setIsReplying(false);
    }, 600);
  }, [draft, isReplying]);

  return {
    messages,
    draft,
    isReplying,
    setDraft,
    sendMessage,
  };
}

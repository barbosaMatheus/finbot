import type { ChatMessage } from '@/features/chat/types/chat';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi, I'm FinBot. Ask me anything about your budget, goals, or spending — I'll answer using your financial context.",
  },
];
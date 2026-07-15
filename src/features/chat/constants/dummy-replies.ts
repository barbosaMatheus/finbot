import type { ChatMessage } from '@/features/chat/types/chat';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi, I'm FinBot. Ask me anything about your budget, goals, or spending — this is a preview chat for now.",
  },
];

export const DUMMY_ASSISTANT_REPLIES = [
  "Thanks for sharing that. Once RAG is connected, I'll answer using your financial context.",
  "Got it. For now this is a dummy reply — your real assistant will use your onboarding and account data.",
  "I'm listening. Soon I'll pull from your documents and money pools to give tailored guidance.",
] as const;

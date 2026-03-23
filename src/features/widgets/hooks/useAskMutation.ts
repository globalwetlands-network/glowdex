import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import type { Message } from './useChatMessages';

const MAX_HISTORY_MESSAGES = 4;

interface Options {
  selectedCellId: number | null | undefined;
  conversationMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

/**
 * Hook to manage the AI question mutation and handle user input.
 * Sends a windowed conversation history to the backend for context-aware responses.
 */
export function useAskMutation({
  selectedCellId,
  conversationMessages,
  setMessages,
}: Options) {
  const askMutation = useMutation({
    mutationFn: (question: string) => {
      if (!selectedCellId) {
        return Promise.reject(new Error('No cell selected'));
      }

      const [initialMessage, ...rest] = conversationMessages;

      const trimmedHistory = [
        initialMessage,
        ...rest.slice(-(MAX_HISTORY_MESSAGES - 1)),
        { role: 'user' as const, content: question },
      ];

      return fetchInsight({
        gridCellId: selectedCellId,
        messages: trimmedHistory.map(({ role, content }) => ({
          role,
          content,
        })),
      });
    },

    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${crypto.randomUUID()}`,
          role: 'assistant',
          content: data.text,
        },
      ]);
    },

    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${crypto.randomUUID()}`,
          role: 'assistant',
          content:
            'Sorry, I encountered an error fetching the context. Please try again.',
        },
      ]);
    },
  });

  const handleAsk = useCallback(
    (question: string) => {
      if (askMutation.isPending) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${crypto.randomUUID()}`,
          role: 'user',
          content: question,
        },
      ]);

      askMutation.mutate(question);
    },
    [askMutation, setMessages],
  );

  return { askMutation, handleAsk };
}

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import type { Message } from './useChatMessages';

const MAX_HISTORY_MESSAGES = 10;

interface Options {
  selectedCellId: number | null | undefined;
  conversationMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

/**
 * Hook to manage the AI question mutation and handle user input.
 * Sends a trimmed conversation history (max MAX_HISTORY_MESSAGES
 * messages) to stay within the backend validation limit.
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

      // Trim conversation to stay within backend ArrayMaxSize limit.
      // Structure: [initialAiResponse, ...recentHistory, newQuestion]
      // If MAX_HISTORY_MESSAGES changes in insight.constants.ts,
      // update this value to match.
      const HISTORY_SLOTS = MAX_HISTORY_MESSAGES - 2; // reserve slots for initial + new question

      const [initialMessage, ...rest] = conversationMessages;

      const trimmedHistory = [
        ...(initialMessage ? [initialMessage] : []),
        ...rest.slice(-HISTORY_SLOTS),
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

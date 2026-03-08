import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import type { Message } from './useChatMessages';

const MAX_HISTORY_MESSAGES = 4;

interface UseAskMutationOptions {
  selectedCellId: number | null | undefined;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useAskMutation({
  selectedCellId,
  messages,
  setMessages,
}: UseAskMutationOptions) {
  const askMutation = useMutation({
    mutationFn: (question: string) => {
      if (!selectedCellId) {
        return Promise.reject(new Error('No cell selected'));
      }

      const history = messages.map(({ role, content }) => ({ role, content }));
      const allMessages = [...history, { role: 'user' as const, content: question }];
      const trimmed = allMessages.slice(-MAX_HISTORY_MESSAGES);

      return fetchInsight({
        gridCellId: selectedCellId,
        messages: trimmed,
      });
    },

    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: data.text,
        },
      ]);
    },

    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error fetching the context. Please try again.',
        },
      ]);
    },
  });

  const handleAsk = useCallback(
    (question: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
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
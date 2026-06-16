import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import { useAIAnalytics } from '@/features/analytics';
import type { Message } from './useChatMessages';
import type { LocalSiteContext } from '@/api/types';

const MAX_HISTORY_MESSAGES = 10;

interface Options {
  selectedCellId: number | null | undefined;
  conversationMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  localSiteContext?: LocalSiteContext | null;
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
  localSiteContext,
}: Options) {
  const {
    captureFollowupAsked,
    captureResponseReceived,
    captureErrorOccurred,
  } = useAIAnalytics({ selectedCellId, localSiteContext });

  const askMutation = useMutation({
    mutationFn: (question: string) => {
      if (!selectedCellId) {
        return Promise.reject(new Error('No cell selected'));
      }

      // Trim conversation to stay within backend ArrayMaxSize limit.
      // Structure: [initialAiResponse, ...recentHistory, newQuestion]
      // If the backend ArrayMaxSize limit changes in glowdex-api,
      // update MAX_HISTORY_MESSAGES here to match.
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
        localSiteContext: localSiteContext ?? undefined,
      });
    },

    onSuccess: (data) => {
      // conversationMessages in this closure is the value from the last render
      // before the question was submitted — Math.ceil gives the correct turn number
      const turn = Math.ceil(conversationMessages.length / 2);
      captureResponseReceived(data.text, turn);
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
      captureErrorOccurred('followup');
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

      // conversationMessages is the value from the last render — includes the
      // initial AI message and all previous Q/A pairs but not the new question.
      // Math.ceil gives the correct 1-based turn number.
      const turn = Math.ceil(conversationMessages.length / 2);
      captureFollowupAsked(question, turn);

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
    [askMutation, setMessages, conversationMessages, captureFollowupAsked],
  );

  return { askMutation, handleAsk };
}

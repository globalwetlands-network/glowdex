import { useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { LocalSiteContext } from '@/api/types';

interface UseAIAnalyticsOptions {
  selectedCellId: number | null | undefined;
  localSiteContext?: LocalSiteContext | null;
  cellHasMangrove?: boolean;
}

/**
 * Hook to capture analytics events for the AI Analysis Assistant.
 * Covers initial insight loading, follow-up questions, responses, and errors.
 */
export function useAIAnalytics({
  selectedCellId,
  localSiteContext,
  cellHasMangrove,
}: UseAIAnalyticsOptions) {
  const posthog = usePostHog();

  const captureInsightLoaded = useCallback(
    (insightText: string) => {
      if (!selectedCellId) return;
      try {
        posthog?.capture('ai_insight_loaded', {
          cell_id: String(selectedCellId),
          has_local_context: !!localSiteContext,
          site_name: localSiteContext?.siteName ?? null,
          has_mangrove: cellHasMangrove ?? false,
          insight_length: insightText.length,
        });
      } catch (error) {
        console.error('Failed to capture ai_insight_loaded event:', error);
      }
    },
    [selectedCellId, localSiteContext, cellHasMangrove, posthog],
  );

  const captureFollowupAsked = useCallback(
    (question: string, conversationTurn: number) => {
      if (!selectedCellId) return;
      try {
        posthog?.capture('ai_followup_asked', {
          cell_id: String(selectedCellId),
          question_length: question.length,
          conversation_turn: conversationTurn,
          has_local_context: !!localSiteContext,
        });
      } catch (error) {
        console.error('Failed to capture ai_followup_asked event:', error);
      }
    },
    [selectedCellId, localSiteContext, posthog],
  );

  const captureResponseReceived = useCallback(
    (responseText: string, conversationTurn: number) => {
      if (!selectedCellId) return;
      try {
        posthog?.capture('ai_response_received', {
          cell_id: String(selectedCellId),
          response_length: responseText.length,
          conversation_turn: conversationTurn,
        });
      } catch (error) {
        console.error('Failed to capture ai_response_received event:', error);
      }
    },
    [selectedCellId, posthog],
  );

  const captureErrorOccurred = useCallback(
    (errorType: 'initial_insight' | 'followup') => {
      if (!selectedCellId) return;
      try {
        posthog?.capture('ai_error_occurred', {
          cell_id: String(selectedCellId),
          error_type: errorType,
          has_local_context: !!localSiteContext,
        });
      } catch (error) {
        console.error('Failed to capture ai_error_occurred event:', error);
      }
    },
    [selectedCellId, localSiteContext, posthog],
  );

  return {
    captureInsightLoaded,
    captureFollowupAsked,
    captureResponseReceived,
    captureErrorOccurred,
  };
}

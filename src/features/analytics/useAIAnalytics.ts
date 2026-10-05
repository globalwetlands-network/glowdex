import { useCallback, useMemo } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { InsightMode, LocalSiteContext } from '@/api/types';

export type QuestionCategory =
  | 'methodology'
  | 'indicators'
  | 'typologies'
  | 'pressures'
  | 'about_app'
  | 'other';

// Priority order: typologies → methodology → indicators → pressures → about_app → other.
// Typologies is checked first so bare "cluster" (a cell assignment question) resolves
// correctly before methodology can claim it via "clustering" (the statistical method).
/** Classifies a follow-up question into a MBCAM topic category for analytics. */
export function classifyQuestion(question: string): QuestionCategory {
  const q = question.toLowerCase();

  if (
    /\b(typolog(y|ies)|cluster assignment|typology comparison|mangrove type|habitat type|site type|(my|what|which) cluster)\b/.test(
      q,
    ) ||
    /\bcluster\b/.test(q)
  )
    return 'typologies';

  if (
    /\b(lvm|latent variable|bayesian|clustering|k-medoid|residuals?|statistical|method(ology)?|model(ing)?|algorithm|pca|multivariate)\b/.test(
      q,
    )
  )
    return 'methodology';

  if (
    /\b(fish density|invertebrate|agb|above.?ground biomass|soc|soil organic carbon|species threat|fragment rate|loss rate|biomass|carbon stock)\b/.test(
      q,
    )
  )
    return 'indicators';

  if (
    /\b(pressures?|climate|land use|marine|cumulative impact|threat|deforestation|erosion|pollution|sea level|storm|human impact)\b/.test(
      q,
    )
  )
    return 'pressures';

  if (
    /\b(mbcam|this (app|tool|platform|dashboard)|how (does|do) (this|the) (app|tool|site)|what is this|how to use|feature|dashboard)\b/.test(
      q,
    )
  )
    return 'about_app';

  return 'other';
}

const QUESTION_MAX_LENGTH = 500;

interface UseAIAnalyticsOptions {
  /** Workflow mode (GLO-207). Defaults to global. */
  mode?: InsightMode;
  selectedCellId: number | null | undefined;
  /** Selected monitoring site — the AI subject in local mode. */
  selectedSiteId?: string | null;
  localSiteContext?: LocalSiteContext | null;
  cellHasMangrove?: boolean;
}

/**
 * Hook to capture analytics events for the AI Analysis Assistant.
 * Covers initial insight loading, follow-up questions, responses, and errors.
 *
 * Every event carries `mode` plus the subject of that mode: `cell_id` in
 * global mode, `site_id` in local mode (the other is null). Events are
 * skipped when the current mode has no subject.
 */
export function useAIAnalytics({
  mode = 'global',
  selectedCellId,
  selectedSiteId,
  localSiteContext,
  cellHasMangrove,
}: UseAIAnalyticsOptions) {
  const posthog = usePostHog();

  const baseProps = useMemo(() => {
    const cellId =
      mode === 'global' && selectedCellId ? String(selectedCellId) : null;
    const siteId = mode === 'local' ? (selectedSiteId ?? null) : null;
    if (!cellId && !siteId) return null;
    return { mode, cell_id: cellId, site_id: siteId };
  }, [mode, selectedCellId, selectedSiteId]);

  const captureInsightLoaded = useCallback(
    (insightText: string) => {
      if (!baseProps) return;
      try {
        posthog?.capture('ai_insight_loaded', {
          ...baseProps,
          has_local_context: !!localSiteContext,
          site_name: localSiteContext?.siteName ?? null,
          // Not applicable in Local mode (no grid cell) — null rather than a
          // false that would read as "cell has no mangroves".
          has_mangrove: mode === 'local' ? null : (cellHasMangrove ?? false),
          insight_length: insightText.length,
        });
      } catch (error) {
        console.error('Failed to capture ai_insight_loaded event:', error);
      }
    },
    [baseProps, mode, localSiteContext, cellHasMangrove, posthog],
  );

  const captureFollowupAsked = useCallback(
    (question: string, conversationTurn: number) => {
      if (!baseProps) return;
      try {
        const isTruncated = question.length > QUESTION_MAX_LENGTH;

        if (isTruncated) {
          posthog?.capture('ai_question_truncated', {
            ...baseProps,
            question_length: question.length,
          });
        }

        posthog?.capture('ai_followup_asked', {
          ...baseProps,
          question_text: question.slice(0, QUESTION_MAX_LENGTH),
          question_length: question.length,
          question_category: classifyQuestion(question),
          conversation_turn: conversationTurn,
          has_local_context: !!localSiteContext,
        });
      } catch (error) {
        console.error('Failed to capture ai_followup_asked event:', error);
      }
    },
    [baseProps, localSiteContext, posthog],
  );

  const captureResponseReceived = useCallback(
    (responseText: string, conversationTurn: number) => {
      if (!baseProps) return;
      try {
        posthog?.capture('ai_response_received', {
          ...baseProps,
          response_length: responseText.length,
          conversation_turn: conversationTurn,
        });
      } catch (error) {
        console.error('Failed to capture ai_response_received event:', error);
      }
    },
    [baseProps, posthog],
  );

  const captureErrorOccurred = useCallback(
    (errorType: 'initial_insight' | 'followup') => {
      if (!baseProps) return;
      try {
        posthog?.capture('ai_error_occurred', {
          ...baseProps,
          error_type: errorType,
          has_local_context: !!localSiteContext,
        });
      } catch (error) {
        console.error('Failed to capture ai_error_occurred event:', error);
      }
    },
    [baseProps, localSiteContext, posthog],
  );

  const captureRateLimitHit = useCallback(() => {
    if (!baseProps) return;
    try {
      posthog?.capture('ai_rate_limit_hit', baseProps);
    } catch (error) {
      console.error('Failed to capture ai_rate_limit_hit event:', error);
    }
  }, [baseProps, posthog]);

  const captureOutboundLinkClicked = useCallback(
    (url: string, context: string) => {
      if (!baseProps) return;
      try {
        posthog?.capture('outbound_link_clicked', {
          url,
          context,
          ...baseProps,
        });
      } catch (error) {
        console.error('Failed to capture outbound_link_clicked event:', error);
      }
    },
    [baseProps, posthog],
  );

  return {
    captureInsightLoaded,
    captureFollowupAsked,
    captureResponseReceived,
    captureErrorOccurred,
    captureRateLimitHit,
    captureOutboundLinkClicked,
  };
}

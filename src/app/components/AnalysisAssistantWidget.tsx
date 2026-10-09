import { useEffect, type ReactNode } from 'react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { fetchInsight, insightSubject } from '@/api';
import { ChatInterface } from '@/features/widgets/components/ChatInterface';
import type {
  InsightMode,
  InsightResponse,
  LocalSiteContext,
} from '@/api/types';
import { useAIAnalytics } from '@/features/analytics';
import { useBackendVersion } from '@/api/hooks/useBackendVersion';
import { CrabIcon } from '@/components/icons/CrabIcon';

interface AnalysisAssistantWidgetProps {
  /**
   * Workflow mode (GLO-207). Global interprets the selected cell; local
   * interprets the selected site's field data. Defaults to global.
   */
  mode?: InsightMode;
  selectedCellId?: number | null;
  /** Selected monitoring site — the AI subject in local mode. */
  selectedSiteId?: string | null;
  localSiteContext?: LocalSiteContext | null;
  /**
   * True when a monitoring site is selected but partner
   * data (needed for the full institution name) has not
   * yet loaded. Delays the AI query to prevent a double
   * fetch — first without local context, then with it.
   * Only true for ~1s on first session load.
   * Defaults to false — safe for callers that do not
   * pass local site context.
   */
  isLocalContextPending?: boolean;
  hasMangrove?: boolean;
  /**
   * True when the frontend and backend dataset versions disagree (see
   * useDatasetSkew). Suppresses insight calls and shows a "catching up" state
   * so the assistant never answers from a stale backend context.
   */
  dataSkewed?: boolean;
  /**
   * Renders this insight instead of fetching one — no backend calls at all.
   * For static showcases (e.g. the landing page's worked example).
   */
  staticInsight?: InsightResponse;
  /**
   * Shows suggestions and the follow-up input but disables them, with
   * `readOnlyHint` underneath. Pairs with `staticInsight`.
   */
  readOnly?: boolean;
  readOnlyHint?: ReactNode;
  /** Forces suggested questions on regardless of the feature flag. */
  showSuggestions?: boolean;
  /** Phrases to highlight in the assistant's messages. */
  highlights?: string[];
}

export function AnalysisAssistantWidget({
  mode = 'global',
  selectedCellId,
  selectedSiteId,
  localSiteContext,
  isLocalContextPending,
  hasMangrove,
  dataSkewed = false,
  staticInsight,
  readOnly,
  readOnlyHint,
  showSuggestions,
  highlights,
}: AnalysisAssistantWidgetProps) {
  const isLocal = mode === 'local';
  const cellId = isLocal ? null : (selectedCellId ?? null);
  const siteId = isLocal ? (selectedSiteId ?? null) : null;
  const isStatic = staticInsight !== undefined;
  const subject = insightSubject(mode, cellId, localSiteContext);

  const { captureInsightLoaded, captureErrorOccurred } = useAIAnalytics({
    mode,
    selectedCellId: cellId,
    selectedSiteId: siteId,
    localSiteContext,
    cellHasMangrove: hasMangrove,
  });

  // Backend dataset version keys the insight cache so it is version-aware:
  // an insight generated from a pre-skew backend context lives under a
  // different cache entry than a post-skew one. Without this, a resolved
  // dataset-skew transition could re-serve a stale initialInsight.
  const { data: backendMeta } = useBackendVersion({ enabled: !isStatic });
  const datasetVersion = backendMeta?.dataset_version ?? null;

  const {
    data: initialInsight,
    isLoading: isInsightLoading,
    error: initialError,
  } = useQuery({
    // Keyed per mode so a cached global answer is never served in local
    // mode (or vice versa). Local answers are keyed on the whole site
    // context the request sends (partner name, conditions, year), so a
    // corrected partner name or refreshed field data fetches a new answer
    // instead of reusing one built from the old data.
    queryKey: [
      'insight',
      {
        datasetVersion,
        mode,
        gridCellId: cellId,
        siteId,
        localSiteContext: isLocal ? (localSiteContext ?? null) : null,
      },
    ],
    // Skipped until the mode's subject exists (a cell, or the site's field
    // data).
    queryFn: subject ? () => fetchInsight(subject) : skipToken,
    // Never fetches for a static showcase (`staticInsight`).
    // Global: suppressed during version skew so we never answer from a
    // backend context that disagrees with the map.
    // Local: waits for partners data so the AI gets the full institution
    // name rather than an id slug.
    enabled: !isStatic && (isLocal ? !isLocalContextPending : !dataSkewed),
  });

  useEffect(() => {
    if (initialInsight?.text) {
      captureInsightLoaded(initialInsight.text);
    }
  }, [initialInsight, captureInsightLoaded]);

  useEffect(() => {
    if (initialError) {
      captureErrorOccurred('initial_insight');
    }
  }, [initialError, captureErrorOccurred]);

  // Version skew: the map may show data the backend context doesn't yet know
  // about. Degrade to a non-blocking notice rather than risk a stale answer.
  // NOTE: copy is placeholder pending product sign-off (GLO-177).
  // Skew concerns the global grid dataset only; local field data is
  // unaffected, so local mode never shows this notice.
  if (!isLocal && dataSkewed) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center text-gray-500">
        <CrabIcon size={24} className="text-[#0F6E56] mb-2" />
        <p className="text-sm font-medium text-gray-700">
          Catching up — data just updated
        </p>
        <p className="text-xs text-gray-400 mt-1">
          The assistant is briefly unavailable while it syncs to the latest
          dataset. The map stays fully usable in the meantime.
        </p>
      </div>
    );
  }

  // A selected site waiting on partner data (for the full institution name)
  // is still loading, not "nothing selected".
  const isAwaitingLocalContext = isLocal && !!siteId && !!isLocalContextPending;

  if ((isInsightLoading || isAwaitingLocalContext) && !initialInsight) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <style>{`
          @keyframes crab-bob {
            0%   { transform: translateY(0px); }
            100% { transform: translateY(-3px); }
          }
          @keyframes crab-scuttle {
            0%   { transform: translateX(-3px); }
            100% { transform: translateX(3px); }
          }
          .crab-bob     { animation: crab-bob     0.4s ease-in-out infinite alternate; }
          .crab-scuttle { animation: crab-scuttle 0.8s ease-in-out infinite alternate; }
        `}</style>
        <div className="crab-bob mb-2">
          <div className="crab-scuttle">
            <CrabIcon size={24} className="text-[#0F6E56]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      key={`${mode}-${cellId ?? 'none'}-${siteId ?? 'none'}`}
      mode={mode}
      selectedCellId={cellId}
      selectedSiteId={siteId}
      initialInsight={staticInsight ?? initialInsight}
      initialError={isStatic ? null : initialError}
      localSiteContext={localSiteContext}
      readOnly={readOnly}
      readOnlyHint={readOnlyHint}
      showSuggestions={showSuggestions}
      highlights={highlights}
    />
  );
}

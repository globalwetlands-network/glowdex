import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import { ChatInterface } from '@/features/widgets/components/ChatInterface';
import type { LocalSiteContext } from '@/api/types';
import { useAIAnalytics } from '@/features/analytics';
import { CrabIcon } from '@/components/icons/CrabIcon';

interface AnalysisAssistantWidgetProps {
  selectedCellId?: number | null;
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
}

export function AnalysisAssistantWidget({
  selectedCellId,
  localSiteContext,
  isLocalContextPending,
  hasMangrove,
  dataSkewed = false,
}: AnalysisAssistantWidgetProps) {
  const { captureInsightLoaded, captureErrorOccurred } = useAIAnalytics({
    selectedCellId,
    localSiteContext,
    cellHasMangrove: hasMangrove,
  });

  const {
    data: initialInsight,
    isLoading: isInsightLoading,
    error: initialError,
  } = useQuery({
    queryKey: [
      'insight',
      {
        gridCellId: selectedCellId,
        localSiteContext: localSiteContext ? localSiteContext.siteName : null,
      },
    ],
    queryFn: () =>
      fetchInsight({
        gridCellId: selectedCellId!,
        localSiteContext: localSiteContext ?? undefined,
      }),
    // Only blocks the query when a monitoring site is
    // selected and partners data is still loading —
    // plain cell selections (no site) are unaffected.
    // Also suppressed during version skew so we never answer
    // from a backend context that disagrees with the map.
    enabled: !!selectedCellId && !isLocalContextPending && !dataSkewed,
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
  if (dataSkewed) {
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

  if (isInsightLoading && !initialInsight) {
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
      key={`${selectedCellId ?? 'empty'}-${localSiteContext?.siteName ?? 'no-site'}`}
      selectedCellId={selectedCellId}
      initialInsight={initialInsight}
      initialError={initialError}
      localSiteContext={localSiteContext}
    />
  );
}

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import { ChatInterface } from '@/features/widgets/components/ChatInterface';
import type { LocalSiteContext } from '@/api/types';
import { useAIAnalytics } from '@/features/analytics';

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
}

export function AnalysisAssistantWidget({
  selectedCellId,
  localSiteContext,
  isLocalContextPending,
  hasMangrove,
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
    enabled: !!selectedCellId && !isLocalContextPending,
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

  if (isInsightLoading && !initialInsight) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="animate-pulse">Loading assistant...</span>
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

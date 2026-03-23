import { useQuery } from '@tanstack/react-query';
import { fetchInsight } from '@/api';
import { ChatInterface } from '@/features/widgets/components/ChatInterface';

interface AnalysisAssistantWidgetProps {
  selectedCellId?: number | null;
}

export function AnalysisAssistantWidget({
  selectedCellId,
}: AnalysisAssistantWidgetProps) {
  const {
    data: initialInsight,
    isLoading: isInsightLoading,
    error: initialError,
  } = useQuery({
    queryKey: ['insight', { gridCellId: selectedCellId }],
    queryFn: () => fetchInsight({ gridCellId: selectedCellId! }),
    enabled: !!selectedCellId,
  });

  if (isInsightLoading && !initialInsight) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="animate-pulse">Loading assistant...</span>
      </div>
    );
  }

  return (
    <ChatInterface
      key={selectedCellId ?? 'empty'}
      selectedCellId={selectedCellId}
      initialText={initialInsight?.text}
      initialError={initialError}
    />
  );
}

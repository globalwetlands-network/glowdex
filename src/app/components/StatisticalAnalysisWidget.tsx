import { AlertTriangle } from 'lucide-react';
import type { FilterState } from '@/features/widgets/types/filter.types';
import type { EnrichedGridCell } from '../types/app.types';
import type { DistributionsByDimension } from '@/features/widgets/types/indicator.types';

import { GroupedViolinPlot } from '@/features/widgets/components/ViolinPlot';
import { QuantileSlider } from './QuantileSlider';
import type { AIStatisticalIndicatorSummary } from '@/api';

interface StatisticalAnalysisWidgetProps {
  selectedCell: EnrichedGridCell | null;
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
  distributions: DistributionsByDimension;
  statisticalSummaries?: AIStatisticalIndicatorSummary[];
  isLoading: boolean;
}

export function StatisticalAnalysisWidget({
  selectedCell,
  filterState,
  onFilterChange,
  distributions,
  statisticalSummaries,
  isLoading,
}: StatisticalAnalysisWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        <div className="h-4 bg-gray-100 rounded-md animate-pulse w-3/4" />
        <div className="space-y-2">
          <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />
          <div className="flex justify-between space-x-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/4" />
          </div>
        </div>
        <div className="h-24 bg-gray-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const handleQuantileChange = (quantile: number) => {
    onFilterChange({ ...filterState, quantile });
  };

  return (
    <div className="space-y-6 pt-1">
      {selectedCell && !selectedCell.mangroves ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-amber-50/50 border border-amber-100 rounded-lg">
          <div className="bg-amber-100 p-2 rounded-full mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            No mangrove habitat recorded
          </p>
          <p className="text-xs text-gray-500 max-w-[220px]">
            Statistical comparisons are only available for mangrove locations.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <QuantileSlider
              value={filterState.quantile}
              onChange={handleQuantileChange}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Distributions By Indicator
            </h3>
            <GroupedViolinPlot
              distributions={distributions}
              isLoading={isLoading}
              selectedCellId={selectedCell?.id ?? null}
              statisticalSummaries={statisticalSummaries}
            />
          </div>

          {selectedCell && (
            <div className="text-xs text-gray-400 italic pt-2 border-t border-gray-50">
              Analyzing data for cell: {selectedCell.id}
            </div>
          )}
        </>
      )}
    </div>
  );
}

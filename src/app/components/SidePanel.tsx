import { Layers, X } from 'lucide-react';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { FilterState } from '@/features/widgets/types/filter.types';
import type { EnrichedGridCell } from '../types/app.types';
import type { DistributionsByDimension } from '@/features/widgets/types/indicator.types';

import { FilterControls } from '@/features/widgets/components/FilterControls';
import { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
import { GroupedViolinPlot } from '@/features/widgets/components/ViolinPlot';
import { QuantileSlider } from './QuantileSlider';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
  selectedCell: EnrichedGridCell | null;
  onClearSelection: () => void;
  typologies: TypologyMap;
  distributions: DistributionsByDimension;
  isLoading: boolean;
  visibleCellCount: number;
}

/**
 * Side panel containing filters, selection info, and analysis widgets
 * Responsive: slides up from bottom on mobile, fixed sidebar on desktop
 */
export function SidePanel({
  isOpen,
  onClose,
  filterState,
  onFilterChange,
  selectedCell,
  onClearSelection,
  typologies,
  distributions,
  isLoading,
  visibleCellCount,
}: SidePanelProps) {
  const handleQuantileChange = (quantile: number) => {
    onFilterChange({ ...filterState, quantile });
  };

  return (
    <div
      className={`
        bg-white shadow-xl z-20 flex flex-col
        md:w-96 md:h-full md:border-r md:border-gray-200 md:relative md:order-1
        w-full fixed bottom-0 max-h-[60vh] md:max-h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        md:translate-y-0
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-md">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">GLOWdex</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Analysis Panel
            </p>
          </div>
        </div>
        {/* Close button for mobile only */}
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-gray-600"
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Section: Filters */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Filters
          </h2>
          <FilterControls filterState={filterState} onFilterChange={onFilterChange} />
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Selected Cell */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Selection
            </h2>
            {selectedCell && (
              <button
                onClick={onClearSelection}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>
          <SelectionPanel
            selectedCell={selectedCell}
            typologies={typologies}
            currentScale={filterState.typologyScale}
          />
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Quantile Slider */}
        <QuantileSlider value={filterState.quantile} onChange={handleQuantileChange} />

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Analysis */}
        <div className="space-y-3 pb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Distributions
          </h2>
          {isLoading ? (
            <div className="h-32 bg-gray-50 rounded animate-pulse" />
          ) : (
            <GroupedViolinPlot distributions={distributions} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400 shrink-0">
        {visibleCellCount.toLocaleString()} Grid Cells Visible
      </div>
    </div>
  );
}

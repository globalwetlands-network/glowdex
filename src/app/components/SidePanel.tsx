import { useState } from 'react';
import { Layers, ChevronDown, ChevronRight, Filter } from 'lucide-react';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { FilterState } from '@/features/widgets/types/filter.types';
import type { EnrichedGridCell } from '../types/app.types';
import type { DistributionsByDimension } from '@/features/widgets/types/indicator.types';

import { FilterControls } from '@/features/widgets/components/FilterControls';
import { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
import { GroupedViolinPlot } from '@/features/widgets/components/ViolinPlot';
import { QuantileSlider } from './QuantileSlider';
import { ChatInterface } from '@/features/widgets/components/ChatInterface';

interface SidePanelProps {
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
 * Responsive: Full-screen on mobile (via tabs), fixed sidebar on desktop
 */
export function SidePanel({
  filterState,
  onFilterChange,
  selectedCell,
  onClearSelection,
  typologies,
  distributions,
  isLoading,
  visibleCellCount,
}: SidePanelProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleQuantileChange = (quantile: number) => {
    onFilterChange({ ...filterState, quantile });
  };

  return (
    <div className="bg-white shadow-xl flex flex-col w-full h-full md:border-r md:border-gray-200">
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

        {/* Section: Contextual Chat */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            AI Assistant
          </h2>
          <ChatInterface selectedCellId={selectedCell?.id} />
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Filters (Collapsible) */}
        <div className="space-y-3">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center justify-between w-full focus:outline-none group"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                Global Filters
              </h2>
            </div>
            {isFiltersOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            )}
          </button>

          {isFiltersOpen && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
              <FilterControls filterState={filterState} onFilterChange={onFilterChange} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Statistical Analysis */}
        <div className="space-y-6 pb-8">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Statistical Analysis
            </h2>
            <QuantileSlider value={filterState.quantile} onChange={handleQuantileChange} />
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Distributions By Indicator
            </h3>
            {isLoading ? (
              <div className="h-32 bg-gray-50 rounded animate-pulse" />
            ) : (
              <GroupedViolinPlot distributions={distributions} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400 shrink-0">
        {visibleCellCount.toLocaleString()} Grid Cells Visible
      </div>
    </div>
  );
}

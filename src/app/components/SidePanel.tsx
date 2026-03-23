import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchInsight, fetchStatistics } from '@/api';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  MapPin,
  Bot,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';

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
  const [isSelectionOpen, setIsSelectionOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);

  const {
    data: initialInsight,
    isLoading: isInsightLoading,
    error: initialError,
  } = useQuery({
    queryKey: ['insight', { gridCellId: selectedCell?.id }],
    queryFn: () => fetchInsight({ gridCellId: selectedCell!.id }),
    enabled: !!selectedCell?.id,
  });

  const { data: statsData } = useQuery({
    queryKey: ['statistics', selectedCell?.id],
    queryFn: () => fetchStatistics(selectedCell!.id),
    enabled: !!selectedCell?.id,
    staleTime: Infinity,
  });

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
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              GLOWdex
            </h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Mangrove Ecosystem Analysis
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Section: Selected Cell */}
        <div className="space-y-3">
          <button
            onClick={() => setIsSelectionOpen(!isSelectionOpen)}
            className="flex items-center justify-between w-full focus:outline-none group"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                Selection
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {selectedCell && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSelection();
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 py-0.5 rounded hover:bg-blue-50"
                >
                  Clear
                </span>
              )}
              {isSelectionOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </div>
          </button>

          {isSelectionOpen && (
            <div className="pt-1 animate-in fade-in slide-in-from-top-1">
              <SelectionPanel
                selectedCell={selectedCell}
                typologies={typologies}
                currentScale={filterState.typologyScale}
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Contextual Chat */}
        <div className="space-y-3">
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="flex items-center justify-between w-full focus:outline-none group"
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                Analysis Assistant
              </h2>
            </div>
            {isAssistantOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            )}
          </button>

          {isAssistantOpen && (
            <div className="pt-1 animate-in fade-in slide-in-from-top-1">
              {isInsightLoading && !initialInsight ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <span className="animate-pulse">Loading assistant...</span>
                </div>
              ) : (
                <ChatInterface
                  key={selectedCell?.id ?? 'empty'}
                  selectedCellId={selectedCell?.id}
                  initialText={initialInsight?.text}
                  initialError={initialError}
                />
              )}
            </div>
          )}
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
              <FilterControls
                filterState={filterState}
                onFilterChange={onFilterChange}
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Statistical Analysis */}
        <div className="space-y-6 pb-8">
          <button
            onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
            className="flex items-center justify-between w-full focus:outline-none group"
          >
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                Statistical Analysis
              </h2>
            </div>
            {isAnalysisOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            )}
          </button>

          {isAnalysisOpen && (
            <div className="space-y-6 pt-1 animate-in fade-in slide-in-from-top-1">
              {selectedCell && !selectedCell.mangroves ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-amber-50/50 border border-amber-100 rounded-lg">
                  <div className="bg-amber-100 p-2 rounded-full mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    No mangrove habitat recorded
                  </p>
                  <p className="text-xs text-gray-500 max-w-[220px]">
                    Statistical comparisons are only available for mangrove
                    locations.
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
                    {isLoading ? (
                      <div className="h-32 bg-gray-50 rounded animate-pulse" />
                    ) : (
                      <GroupedViolinPlot
                        distributions={distributions}
                        isLoading={isLoading}
                        selectedCellId={selectedCell?.id ?? null}
                        statisticalSummaries={statsData?.statistics?.summaries}
                        onAskAI={undefined} // TODO: implement this feature after demo
                      />
                    )}
                  </div>
                </>
              )}
            </div>
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

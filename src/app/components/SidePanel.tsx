import { Layers, Filter, MapPin, Bot, BarChart2, Bird } from 'lucide-react';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { FilterState } from '@/features/widgets/types/filter.types';
import type { EnrichedGridCell } from '../types/app.types';
import type { DistributionsByDimension } from '@/features/widgets/types/indicator.types';
import type { SpeciesDistribution } from '@/data/speciesSpotlight';
import type { ObservationPoint } from '@/api/species';

import { FilterControls } from '@/features/widgets/components/FilterControls';
import { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
import { CollapsibleSection } from './CollapsibleSection';
import { AnalysisAssistantWidget } from './AnalysisAssistantWidget';
import { StatisticalAnalysisWidget } from './StatisticalAnalysisWidget';
import { SpeciesSpotlightWidget } from '@/components/widgets/SpeciesSpotlight';
import type { AIStatisticalIndicatorSummary } from '@/api';

interface SidePanelProps {
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
  selectedCell: EnrichedGridCell | null;
  onClearSelection: () => void;
  typologies: TypologyMap;
  distributions: DistributionsByDimension;
  statisticalSummaries?: AIStatisticalIndicatorSummary[];
  isLoading: boolean;
  visibleCellCount: number;
  onSpeciesLayerToggle: (
    distribution: SpeciesDistribution,
    enabled: boolean,
    observations: ObservationPoint[],
  ) => void;
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
  statisticalSummaries,
  isLoading,
  visibleCellCount,
  onSpeciesLayerToggle,
}: SidePanelProps) {
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
        <div>
          {/* Section: Species Spotlight */}
          <div className="pb-8">
            <CollapsibleSection
              title="Species Spotlight"
              icon={Bird}
              defaultOpen={true}
            >
              <SpeciesSpotlightWidget
                onSpeciesLayerToggle={onSpeciesLayerToggle}
              />
            </CollapsibleSection>
          </div>

          <CollapsibleSection
            title="Selection"
            icon={MapPin}
            defaultOpen={true}
            headerAction={
              selectedCell && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSelection();
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 py-0.5 rounded hover:bg-blue-50"
                >
                  Clear
                </span>
              )
            }
          >
            <SelectionPanel
              selectedCell={selectedCell}
              typologies={typologies}
              currentScale={filterState.typologyScale}
            />
          </CollapsibleSection>
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Contextual Chat */}
        <div>
          <CollapsibleSection
            title="Analysis Assistant"
            icon={Bot}
            defaultOpen={true}
          >
            <AnalysisAssistantWidget selectedCellId={selectedCell?.id} />
          </CollapsibleSection>
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Filters */}
        <div>
          <CollapsibleSection
            title="Global Filters"
            icon={Filter}
            defaultOpen={false}
            childrenClassName="pt-2 block animate-in fade-in slide-in-from-top-1"
          >
            <FilterControls
              filterState={filterState}
              onFilterChange={onFilterChange}
            />
          </CollapsibleSection>
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section: Statistical Analysis */}
        <div>
          <CollapsibleSection
            title="Statistical Analysis"
            icon={BarChart2}
            defaultOpen={true}
          >
            <StatisticalAnalysisWidget
              selectedCell={selectedCell}
              filterState={filterState}
              onFilterChange={onFilterChange}
              distributions={distributions}
              statisticalSummaries={statisticalSummaries}
              isLoading={isLoading}
            />
          </CollapsibleSection>
        </div>

        <div className="border-t border-gray-100 my-4" />
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400 shrink-0">
        {visibleCellCount.toLocaleString()} Grid Cells Visible
      </div>
    </div>
  );
}

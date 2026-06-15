import { Filter, MapPin, Bot, BarChart2, Leaf } from 'lucide-react';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { FilterState } from '@/features/widgets/types/filter.types';
import type { EnrichedGridCell } from '../types/app.types';
import type { DistributionsByDimension } from '@/features/widgets/types/indicator.types';
import type { ObservationPoint } from '@/api/species';
import type { LocalSite } from '@/data/types/local-wetlands.types';

import { FilterControls } from '@/features/widgets/components/FilterControls';
import { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
import { CollapsibleSection } from './CollapsibleSection';
import { AnalysisAssistantWidget } from './AnalysisAssistantWidget';
import { GlobalWetlandsAnalysisWidget } from './GlobalWetlandsAnalysisWidget';
import { LocalWetlandsAnalysisWidget } from '@/components/widgets/LocalData';
import { BiodiversityPanel } from './BiodiversityPanel';
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
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
  onPartnerLayerToggle: (enabled: boolean) => void;
  partnerLayerEnabled: boolean;
  onMangroveLayerToggle: (enabled: boolean) => void;
  mangroveLayerEnabled: boolean;
  onSpeciesSelect?: (center: { lng: number; lat: number }) => void;
  activeTab: 'analysis' | 'biodiversity';
  onTabChange: (tab: 'analysis' | 'biodiversity') => void;
  clickedPartnerId: string | null;
  localSites: LocalSite[];
  selectedSiteId: string | null;
  onSiteSelect: (siteId: string) => void;
  localSiteLayerEnabled: boolean;
  onLocalSiteLayerToggle: (enabled: boolean) => void;
  onViewLocalData: (siteId: string) => void;
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
  onPartnerLayerToggle,
  partnerLayerEnabled,
  onMangroveLayerToggle,
  mangroveLayerEnabled,
  onSpeciesSelect,
  activeTab,
  onTabChange,
  clickedPartnerId,
  localSites,
  selectedSiteId,
  onSiteSelect,
  localSiteLayerEnabled,
  onLocalSiteLayerToggle,
  onViewLocalData,
}: SidePanelProps) {
  return (
    <div className="bg-white shadow-xl flex flex-col w-full h-full md:border-r md:border-gray-200">
      {/* Tab Strip */}
      <div className="hidden md:flex border-b border-gray-200 shrink-0">
        <button
          onClick={() => onTabChange('biodiversity')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
            activeTab === 'biodiversity'
              ? 'text-[#0f6e56] border-b-2 border-[#0f6e56] font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Leaf size={16} />
          Biodiversity
        </button>
        <button
          onClick={() => onTabChange('analysis')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
            activeTab === 'analysis'
              ? 'text-[#0f6e56] border-b-2 border-[#0f6e56] font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 size={16} />
          Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div
        className={
          activeTab === 'analysis'
            ? 'flex-1 overflow-y-auto p-4 space-y-4'
            : 'hidden'
        }
      >
        {/* Location + Assistant cards — only shown when a cell is selected */}
        {selectedCell && (
          <div className="space-y-4">
            {/* Location card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="p-4">
                <CollapsibleSection
                  title="Location"
                  icon={MapPin}
                  defaultOpen={true}
                >
                  <button
                    onClick={onClearSelection}
                    className="text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors mb-3"
                  >
                    Clear selection
                  </button>
                  <SelectionPanel
                    selectedCell={selectedCell}
                    typologies={typologies}
                    currentScale={filterState.typologyScale}
                  />
                </CollapsibleSection>
              </div>
            </div>

            {/* Assistant card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="p-4">
                <CollapsibleSection
                  title="Assistant"
                  icon={Bot}
                  defaultOpen={true}
                >
                  <AnalysisAssistantWidget
                    selectedCellId={
                      activeTab === 'analysis' ? selectedCell?.id : null
                    }
                  />
                </CollapsibleSection>
              </div>
            </div>
          </div>
        )}

        {/* Filters + Global Wetlands Analysis — only shown when a cell is selected */}
        {selectedCell && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
            <div className="p-4">
              <CollapsibleSection
                title="Filters"
                icon={Filter}
                defaultOpen={true}
                childrenClassName="pt-2 block animate-in fade-in slide-in-from-top-1"
              >
                <FilterControls
                  filterState={filterState}
                  onFilterChange={onFilterChange}
                />
              </CollapsibleSection>
            </div>
          </div>
        )}

        {selectedCell && (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="p-4">
              <CollapsibleSection
                title="Global Wetlands Analysis"
                icon={BarChart2}
                defaultOpen={true}
              >
                <GlobalWetlandsAnalysisWidget
                  selectedCell={selectedCell}
                  distributions={distributions}
                  statisticalSummaries={statisticalSummaries}
                  isLoading={isLoading}
                />
              </CollapsibleSection>
            </div>
          </div>
        )}

        {/* Local Wetlands Analysis card — always visible */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="p-4">
            <LocalWetlandsAnalysisWidget
              localSites={localSites}
              selectedCell={selectedCell}
              selectedSiteId={selectedSiteId}
              onSiteSelect={onSiteSelect}
              localSiteLayerEnabled={localSiteLayerEnabled}
              onLocalSiteLayerToggle={onLocalSiteLayerToggle}
            />
          </div>
        </div>
      </div>

      <div
        className={
          activeTab === 'biodiversity' ? 'flex-1 overflow-y-auto' : 'hidden'
        }
      >
        <BiodiversityPanel
          selectedCell={selectedCell}
          onSpeciesLayerToggle={onSpeciesLayerToggle}
          onPartnerLayerToggle={onPartnerLayerToggle}
          partnerLayerEnabled={partnerLayerEnabled}
          onMangroveLayerToggle={onMangroveLayerToggle}
          mangroveLayerEnabled={mangroveLayerEnabled}
          localSiteLayerEnabled={localSiteLayerEnabled}
          onLocalSiteLayerToggle={onLocalSiteLayerToggle}
          onSpeciesSelect={onSpeciesSelect}
          clickedPartnerId={clickedPartnerId}
          localSites={localSites}
          onViewLocalData={onViewLocalData}
        />
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400 shrink-0">
        {visibleCellCount.toLocaleString()} Grid Cells Visible
      </div>
    </div>
  );
}

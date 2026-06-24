import { Info } from 'lucide-react';
import { SelectTilePrompt } from './SelectTilePrompt';
import {
  MangroveExtentIcon,
  MonitoringLocationIcon,
} from '@/components/icons/MapMarkers';
import { TILE_COLOUR } from '@/constants/map-colours';
import { useState } from 'react';
import { usePostHog } from 'posthog-js/react';

import type { ObservationPoint } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { TypologyMap } from '@/data/types/cluster.types';
import { useScrollToSignal } from '@/app/hooks/useScrollToSignal';
import { SpeciesSpotlightWidget } from '@/components/widgets/SpeciesSpotlight';
import { PartnerWidget } from '@/components/widgets/Partner';
import { usePartners } from '@/api/hooks/usePartners';

interface BiodiversityPanelProps {
  selectedCell: EnrichedGridCell | null;
  onSpeciesLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
  onPartnerLayerToggle: (enabled: boolean) => void;
  partnerLayerEnabled: boolean;
  onMangroveLayerToggle: (enabled: boolean) => void;
  mangroveLayerEnabled: boolean;
  localSiteLayerEnabled: boolean;
  onLocalSiteLayerToggle: (enabled: boolean) => void;
  onSpeciesSelect?: (center: { lng: number; lat: number }) => void;
  clickedPartnerId: string | null;
  localSites: LocalSite[];
  onViewLocalData: (siteId: string) => void;
  scrollToPartnerSignal?: number;
  suppressAutoFlyTo?: boolean;
  typologies: TypologyMap;
  currentScale: 'scale5' | 'scale18';
  onNavigateToAnalysis: () => void;
}

export function BiodiversityPanel({
  selectedCell,
  onSpeciesLayerToggle,
  onPartnerLayerToggle,
  partnerLayerEnabled,
  onMangroveLayerToggle,
  mangroveLayerEnabled,
  localSiteLayerEnabled,
  onLocalSiteLayerToggle,
  onSpeciesSelect,
  clickedPartnerId,
  localSites,
  onViewLocalData,
  scrollToPartnerSignal,
  suppressAutoFlyTo,
  typologies,
  currentScale,
  onNavigateToAnalysis,
}: BiodiversityPanelProps) {
  const posthog = usePostHog();
  const partnerRef = useScrollToSignal(scrollToPartnerSignal);
  const { data: partnersData } = usePartners();
  const [mangroveInfoOpen, setMangroveInfoOpen] = useState(false);
  const [localSiteInfoOpen, setLocalSiteInfoOpen] = useState(false);
  // usePartners() is also called in PartnerWidget and PartnerLayer.
  // TanStack Query deduplicates requests — no additional network
  // call is made.

  return (
    <div className="p-4 space-y-4">
      {!selectedCell && <SelectTilePrompt tileColor={TILE_COLOUR} />}

      {/* Species Spotlight container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SpeciesSpotlightWidget
          onSpeciesLayerToggle={onSpeciesLayerToggle}
          selectedCell={selectedCell}
          partners={partnersData?.partners ?? []}
          onSpeciesSelect={onSpeciesSelect}
          clickedPartnerId={clickedPartnerId}
          suppressAutoFlyTo={suppressAutoFlyTo}
        />
      </div>

      {/* Partner container */}
      <div
        ref={partnerRef}
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <PartnerWidget
          selectedCell={selectedCell}
          onPartnerLayerToggle={onPartnerLayerToggle}
          partnerLayerEnabled={partnerLayerEnabled}
          clickedPartnerId={clickedPartnerId}
          localSites={localSites}
          onViewLocalData={onViewLocalData}
          typologies={typologies}
          currentScale={currentScale}
          onNavigateToAnalysis={onNavigateToAnalysis}
        />
      </div>

      {/* Local Monitoring Sites container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Local Monitoring Locations
            </h3>
            <button
              type="button"
              aria-expanded={localSiteInfoOpen}
              aria-controls="local-site-info"
              onClick={() => setLocalSiteInfoOpen((prev) => !prev)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                localSiteInfoOpen
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle monitoring locations information"
              title="Monitoring locations information"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          {localSiteInfoOpen && (
            <p
              id="local-site-info"
              className="text-xs text-gray-500 leading-relaxed"
            >
              Shows verified field monitoring locations submitted by partner
              organisations. Each pin represents an active or historical
              sampling site where biodiversity and habitat data has been
              collected on the ground.
            </p>
          )}
          <div className="rounded-lg border border-[#1d9e75]/30 bg-[#1d9e75]/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MonitoringLocationIcon size={12} />
              <span className="text-xs text-gray-600 leading-snug">
                Show monitoring locations on map
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={localSiteLayerEnabled}
              onClick={() => {
                const next = !localSiteLayerEnabled;
                try {
                  posthog?.capture('local_site_layer_toggled', {
                    enabled: next,
                    source: 'biodiversity_panel',
                  });
                } catch (error) {
                  console.error(
                    'Failed to capture local_site_layer_toggled event:',
                    error,
                  );
                }
                onLocalSiteLayerToggle(next);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                localSiteLayerEnabled ? 'bg-[#1d9e75]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localSiteLayerEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mangrove Habitat Extent container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mangrove Habitat Extent
            </h3>
            <button
              type="button"
              aria-expanded={mangroveInfoOpen}
              aria-controls="mangrove-info"
              onClick={() => setMangroveInfoOpen((prev) => !prev)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                mangroveInfoOpen
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle mangrove layer information"
              title="Mangrove layer information"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="rounded-lg border border-[#1d9e75]/30 bg-[#1d9e75]/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MangroveExtentIcon size={14} />
              <span className="text-xs text-gray-600 leading-snug">
                Show mangrove habitat extent
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={mangroveLayerEnabled}
              onClick={() => {
                onMangroveLayerToggle(!mangroveLayerEnabled);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                mangroveLayerEnabled ? 'bg-[#1d9e75]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  mangroveLayerEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {mangroveInfoOpen && (
            <p
              id="mangrove-info"
              className="text-xs text-gray-500 leading-relaxed"
            >
              Shows the spatial extent of mangrove habitat from the Global
              Mangrove Watch dataset, providing a visual reference for where
              mangroves occur within each tile. MBCAM uses this layer to
              contextualise modelled indicators against observed habitat
              distribution.
            </p>
          )}
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Global Mangrove Watch v4 · CC-BY 4.0 ·{' '}
            <a
              href="https://globalmangrovewatch.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
            >
              globalmangrovewatch.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

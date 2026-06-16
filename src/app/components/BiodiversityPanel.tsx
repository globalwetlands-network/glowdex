import { MapPin } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

import type { ObservationPoint } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { LocalSite } from '@/data/types/local-wetlands.types';
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
}: BiodiversityPanelProps) {
  const posthog = usePostHog();
  const { data: partnersData } = usePartners();
  // usePartners() is also called in PartnerWidget and PartnerLayer.
  // TanStack Query deduplicates requests — no additional network
  // call is made.

  return (
    <div className="p-4 space-y-4">
      {/* Partner container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <PartnerWidget
          selectedCell={selectedCell}
          onPartnerLayerToggle={onPartnerLayerToggle}
          partnerLayerEnabled={partnerLayerEnabled}
          clickedPartnerId={clickedPartnerId}
          localSites={localSites}
          onViewLocalData={onViewLocalData}
        />
      </div>

      {/* Local Monitoring Sites container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Local Monitoring Sites
          </h3>
          <div className="rounded-lg border border-[#1d9e75]/30 bg-[#1d9e75]/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1d9e75] shrink-0" />
              <span className="text-xs text-gray-600 leading-snug">
                Show monitoring sites on map
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
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Mangrove Habitat Extent
          </h3>
          <div className="rounded-lg border border-[#1d9e75]/30 bg-[#1d9e75]/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1d9e75] shrink-0" />
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

      {/* Species Spotlight container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SpeciesSpotlightWidget
          onSpeciesLayerToggle={onSpeciesLayerToggle}
          selectedCell={selectedCell}
          partners={partnersData?.partners ?? []}
          onSpeciesSelect={onSpeciesSelect}
        />
      </div>
    </div>
  );
}

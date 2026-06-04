import type { ObservationPoint } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import { SpeciesSpotlightWidget } from '@/components/widgets/SpeciesSpotlight';
import { HubPartnerWidget } from '@/components/widgets/HubPartner';
import { useHubs } from '@/api/hooks/useHubs';

interface BiodiversityPanelProps {
  selectedCell: EnrichedGridCell | null;
  onSpeciesLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
  onHubLayerToggle: (enabled: boolean) => void;
}

export function BiodiversityPanel({
  selectedCell,
  onSpeciesLayerToggle,
  onHubLayerToggle,
}: BiodiversityPanelProps) {
  const { data: hubsData } = useHubs();
  // useHubs() is also called in HubPartnerWidget and HubLayer.
  // TanStack Query deduplicates requests — no additional network
  // call is made.

  return (
    <div className="p-4 space-y-4">
      {/* Hub Partner container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <HubPartnerWidget
          selectedCell={selectedCell}
          onHubLayerToggle={onHubLayerToggle}
        />
      </div>

      {/* Species Spotlight container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SpeciesSpotlightWidget
          onSpeciesLayerToggle={onSpeciesLayerToggle}
          selectedCell={selectedCell}
          hubs={hubsData?.hubs ?? []}
        />
      </div>
    </div>
  );
}

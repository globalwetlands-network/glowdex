import type { ObservationPoint } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import { SpeciesSpotlightWidget } from '@/components/widgets/SpeciesSpotlight';
import { HubPartnerWidget } from '@/components/widgets/HubPartner';

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
  return (
    <div className="p-4 space-y-4">
      {/* Species Spotlight container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SpeciesSpotlightWidget onSpeciesLayerToggle={onSpeciesLayerToggle} />
      </div>

      {/* Hub Partner container */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <HubPartnerWidget
          selectedCell={selectedCell}
          onHubLayerToggle={onHubLayerToggle}
        />
      </div>
    </div>
  );
}

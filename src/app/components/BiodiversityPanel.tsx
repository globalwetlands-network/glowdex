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
    <div className="p-4 space-y-6">
      <SpeciesSpotlightWidget onSpeciesLayerToggle={onSpeciesLayerToggle} />
      <HubPartnerWidget
        selectedCell={selectedCell}
        onHubLayerToggle={onHubLayerToggle}
      />
    </div>
  );
}

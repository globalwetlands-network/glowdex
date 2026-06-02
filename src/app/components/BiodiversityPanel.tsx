import type { ObservationPoint } from '@/api/species';
import { SpeciesSpotlightWidget } from '@/components/widgets/SpeciesSpotlight';

interface BiodiversityPanelProps {
  onSpeciesLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
}

export function BiodiversityPanel({
  onSpeciesLayerToggle,
}: BiodiversityPanelProps) {
  return (
    <div className="p-4">
      <SpeciesSpotlightWidget onSpeciesLayerToggle={onSpeciesLayerToggle} />
    </div>
  );
}

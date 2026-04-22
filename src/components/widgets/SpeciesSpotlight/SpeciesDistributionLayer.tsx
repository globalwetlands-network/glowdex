import { Source, Layer } from 'react-map-gl';
import type { SpeciesDistribution } from '@/data/speciesSpotlight';

interface SpeciesDistributionLayerProps {
  distribution: SpeciesDistribution;
  enabled: boolean;
}

export function SpeciesDistributionLayer({
  distribution,
  enabled,
}: SpeciesDistributionLayerProps) {
  if (!enabled) {
    return null;
  }

  return (
    <Source
      id={distribution.layerId + '-source'}
      type="geojson"
      data={distribution.data}
    >
      <Layer
        id={distribution.layerId}
        type="fill"
        paint={{
          'fill-color': distribution.fillColor,
          'fill-opacity': distribution.fillOpacity,
        }}
      />
      <Layer
        id={distribution.layerId + '-outline'}
        type="line"
        paint={{
          'line-color': distribution.strokeColor,
          'line-width': 1.5,
          'line-opacity': 0.7,
        }}
      />
    </Source>
  );
}

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { ObservationPoint } from '@/api/species';
import type { FeatureCollection, Point } from 'geojson';

interface SpeciesDistributionLayerProps {
  observations: ObservationPoint[];
  enabled: boolean;
  speciesId: string;
}

/**
 * Renders GBIF observation points as circle markers on the map.
 */
export function SpeciesDistributionLayer({
  observations,
  enabled,
  speciesId,
}: SpeciesDistributionLayerProps) {
  const geojsonData = useMemo<FeatureCollection<Point>>(() => {
    return {
      type: 'FeatureCollection',
      features: observations.map((obs) => ({
        type: 'Feature' as const,
        properties: {
          date: obs.date,
          datasetName: obs.datasetName,
          occurrenceId: obs.occurrenceId,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [obs.lng, obs.lat],
        },
      })),
    };
  }, [observations]);

  if (!enabled) {
    return null;
  }

  return (
    <Source
      id={`species-${speciesId}-source`}
      type="geojson"
      data={geojsonData}
    >
      <Layer
        id={`species-${speciesId}-pins`}
        type="circle"
        paint={{
          'circle-radius': 6,
          'circle-color': '#00827F',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        }}
      />
    </Source>
  );
}

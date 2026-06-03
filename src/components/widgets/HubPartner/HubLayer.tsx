import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { FeatureCollection, Point } from 'geojson';
import { useHubs } from '@/api/hooks/useHubs';
import { findNearestHub } from '@/utils/geo';
import type { EnrichedGridCell } from '@/app/types/app.types';

interface HubLayerProps {
  enabled: boolean;
  selectedCell: EnrichedGridCell | null;
}

export function HubLayer({ enabled, selectedCell }: HubLayerProps) {
  const { data: hubsData } = useHubs();

  const nearestHubId = useMemo(() => {
    if (!selectedCell?.centerCoords || !hubsData?.hubs.length) return null;

    const nearest = findNearestHub(
      selectedCell.centerCoords.latitude,
      selectedCell.centerCoords.longitude,
      hubsData.hubs,
    );

    return nearest?.hub.id ?? null;
  }, [selectedCell, hubsData]);

  const geojsonData = useMemo<FeatureCollection<Point>>(() => {
    if (!hubsData?.hubs) {
      return { type: 'FeatureCollection', features: [] };
    }

    return {
      type: 'FeatureCollection',
      features: hubsData.hubs.map((hub) => ({
        type: 'Feature' as const,
        properties: {
          id: hub.id,
          institution: hub.institution,
          city: hub.city,
          country: hub.country,
          isNearest: hub.id === nearestHubId,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: hub.coordinates,
        },
      })),
    };
  }, [hubsData, nearestHubId]);

  if (!enabled) {
    return null;
  }

  return (
    <Source id="hub-locations-source" type="geojson" data={geojsonData}>
      <Layer
        id="hub-locations"
        type="circle"
        paint={{
          'circle-radius': ['case', ['==', ['get', 'isNearest'], true], 8, 5],
          'circle-color': '#ffffff',
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'isNearest'], true],
            3,
            2,
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'isNearest'], true],
            '#0a5c47',
            '#1d9e75',
          ],
          'circle-opacity': 1,
        }}
      />
    </Source>
  );
}

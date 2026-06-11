import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { FeatureCollection, Point } from 'geojson';
import { usePartners } from '@/api/hooks/usePartners';
import { findNearestPartner } from '@/utils/geo';
import type { EnrichedGridCell } from '@/app/types/app.types';

interface PartnerLayerProps {
  enabled: boolean;
  selectedCell: EnrichedGridCell | null;
}

export function PartnerLayer({ enabled, selectedCell }: PartnerLayerProps) {
  const { data: partnersData } = usePartners();

  const nearestPartnerId = useMemo(() => {
    if (!selectedCell?.centerCoords || !partnersData?.hubs.length) return null;

    const nearest = findNearestPartner(
      selectedCell.centerCoords.latitude,
      selectedCell.centerCoords.longitude,
      partnersData.hubs,
    );

    return nearest?.partner.id ?? null;
  }, [selectedCell, partnersData]);

  const geojsonData = useMemo<FeatureCollection<Point>>(() => {
    if (!partnersData?.hubs) {
      return { type: 'FeatureCollection', features: [] };
    }

    return {
      type: 'FeatureCollection',
      features: partnersData.hubs.map((partner) => ({
        type: 'Feature' as const,
        properties: {
          id: partner.id,
          institution: partner.institution,
          city: partner.city,
          country: partner.country,
          isNearest: partner.id === nearestPartnerId,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: partner.coordinates,
        },
      })),
    };
  }, [partnersData, nearestPartnerId]);

  if (!enabled) {
    return null;
  }

  return (
    <Source id="partner-locations-source" type="geojson" data={geojsonData}>
      <Layer
        id="partner-locations"
        type="circle"
        paint={{
          'circle-radius': ['case', ['==', ['get', 'isNearest'], true], 10, 7],
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
      <Layer
        id="partner-locations-inner"
        type="circle"
        paint={{
          'circle-radius': [
            'case',
            ['==', ['get', 'isNearest'], true],
            4.5,
            3.5,
          ],
          'circle-color': '#3b82f6',
          'circle-opacity': 1,
          'circle-stroke-width': 0,
        }}
      />
    </Source>
  );
}

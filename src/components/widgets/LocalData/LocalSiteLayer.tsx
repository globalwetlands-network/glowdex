/**
 * LocalSiteLayer
 *
 * Renders monitoring site pins on the map for all local
 * wetlands sites in the dataset.
 *
 * Visual treatment is a solid blue circle, smaller than
 * partner organisation dots, clearly differentiating
 * field data collection sites from partner locations.
 *
 * Clicking a site pin fires onSiteClick(siteId) which
 * triggers handleSiteSelect in App.tsx — auto-selecting
 * the nearest grid cell and loading local data in the
 * Analysis tab. Same interaction pattern as partner dots.
 *
 * Data comes from DataContext (localSites) — no API
 * call needed. Source is always mounted; the Layer uses
 * Mapbox layout visibility to show/hide without triggering
 * a GeoJSON re-upload on every toggle. When disabled, an
 * empty feature collection is emitted to avoid the .map()
 * cost while keeping the source mounted.
 */

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { LocalSite } from '@/data/types/local-wetlands.types';

interface LocalSiteLayerProps {
  enabled: boolean;
  localSites: LocalSite[];
  hoveredSiteId: string | null;
  selectedSiteId: string | null;
}

export function LocalSiteLayer({
  enabled,
  localSites,
  hoveredSiteId,
  selectedSiteId,
}: LocalSiteLayerProps) {
  const geojsonData = useMemo<FeatureCollection<Point>>(() => {
    if (!enabled) {
      return { type: 'FeatureCollection', features: [] };
    }
    return {
      type: 'FeatureCollection',
      features: localSites.map((site) => ({
        type: 'Feature' as const,
        properties: {
          id: site.id,
          name: site.name,
          country: site.country,
          isSelected: site.id === selectedSiteId,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: site.coordinates,
        },
      })),
    };
  }, [enabled, localSites, selectedSiteId]);

  return (
    <Source id="local-sites-source" type="geojson" data={geojsonData}>
      <Layer
        id="local-sites"
        type="circle"
        layout={{
          visibility: enabled ? 'visible' : 'none',
        }}
        paint={{
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], hoveredSiteId ?? ''],
            ['case', ['==', ['get', 'isSelected'], true], 9, 7],
            ['case', ['==', ['get', 'isSelected'], true], 7, 5],
          ],
          'circle-color': '#3b82f6',
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'isSelected'], true],
            2,
            1.5,
          ],
          'circle-stroke-color': '#1d4ed8',
          'circle-opacity': 0.9,
          'circle-radius-transition': { duration: 150, delay: 0 },
        }}
      />
    </Source>
  );
}

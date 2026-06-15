/**
 * LocalSiteLayer
 *
 * Renders monitoring site pins on the map for all local
 * wetlands sites in the dataset.
 *
 * Visual treatment is the inverse of PartnerLayer —
 * blue outer circle with teal stroke and white inner dot —
 * clearly differentiating field data collection sites
 * from partner organisation locations while keeping
 * the two marker types visually related.
 *
 * Clicking a site pin fires onSiteClick(siteId) which
 * triggers handleSiteSelect in App.tsx — auto-selecting
 * the nearest grid cell and loading local data in the
 * Analysis tab. Same interaction pattern as partner dots.
 *
 * Data comes from DataContext (localSites) — no API
 * call needed. Layer is always mounted when enabled;
 * hidden via early return when disabled.
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
  const geojsonData = useMemo<FeatureCollection<Point>>(
    () => ({
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
    }),
    [localSites, selectedSiteId],
  );

  if (!enabled) return null;

  return (
    <Source id="local-sites-source" type="geojson" data={geojsonData}>
      {/* Outer circle — blue fill, teal stroke */}
      <Layer
        id="local-sites"
        type="circle"
        paint={{
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], hoveredSiteId ?? ''],
            ['case', ['==', ['get', 'isSelected'], true], 13, 10],
            ['case', ['==', ['get', 'isSelected'], true], 10, 7],
          ],
          'circle-color': '#3b82f6',
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'isSelected'], true],
            3,
            2,
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'isSelected'], true],
            '#0a5c47',
            '#1d9e75',
          ],
          'circle-opacity': 1,
          'circle-radius-transition': { duration: 150, delay: 0 },
        }}
      />
      {/* Inner dot — white */}
      <Layer
        id="local-sites-inner"
        type="circle"
        paint={{
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], hoveredSiteId ?? ''],
            ['case', ['==', ['get', 'isSelected'], true], 6, 5],
            ['case', ['==', ['get', 'isSelected'], true], 4.5, 3.5],
          ],
          'circle-color': '#ffffff',
          'circle-opacity': 1,
          'circle-stroke-width': 0,
          'circle-radius-transition': { duration: 150, delay: 0 },
        }}
      />
    </Source>
  );
}

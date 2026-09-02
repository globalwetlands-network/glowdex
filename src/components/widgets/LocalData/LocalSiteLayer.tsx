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
 * Two circle layers switch by zoom to avoid coincident /
 * near-coincident markers reading as one pin:
 *   - `local-sites` (below LOCAL_SITE_POINT_ZOOM): one pin per
 *     site at its representative coordinate.
 *   - `local-site-points` (at/above the threshold): one pin per
 *     coordinate point, exposing the precise per-condition
 *     positions. Points separate further as the user zooms in.
 * Only one layer is visible at any zoom, so there is no
 * double-render. Both features carry `id = site.id`, so clicking
 * either always selects the parent site (interaction, panel and
 * chart stay site-level).
 *
 * Clicking a site pin fires onSiteClick(siteId) which
 * triggers handleSiteSelect in App.tsx — auto-selecting
 * the nearest grid cell and loading local data in the
 * Analysis tab. Same interaction pattern as partner dots.
 *
 * Data comes from DataContext (localSites) — no API
 * call needed. Sources are always mounted; the Layers use
 * Mapbox layout visibility to show/hide without triggering
 * a GeoJSON re-upload on every toggle. When disabled, empty
 * feature collections are emitted to avoid the .map() cost
 * while keeping the sources mounted.
 */

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { CircleLayerSpecification } from 'mapbox-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import { LOCAL_SITE_POINT_ZOOM } from '@/data/constants/localWetlands.constants';

interface LocalSiteLayerProps {
  enabled: boolean;
  localSites: LocalSite[];
  hoveredSiteId: string | null;
  selectedSiteId: string | null;
}

const EMPTY: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [],
};

export function LocalSiteLayer({
  enabled,
  localSites,
  hoveredSiteId,
  selectedSiteId,
}: LocalSiteLayerProps) {
  // One feature per site at the representative coordinate (low zoom).
  const siteData = useMemo<FeatureCollection<Point>>(() => {
    if (!enabled) return EMPTY;
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
        geometry: { type: 'Point' as const, coordinates: site.coordinates },
      })),
    };
  }, [enabled, localSites, selectedSiteId]);

  // One feature per coordinate point (high zoom). Parent site id is
  // preserved so clicking any point selects the whole site.
  const pointData = useMemo<FeatureCollection<Point>>(() => {
    if (!enabled) return EMPTY;
    return {
      type: 'FeatureCollection',
      features: localSites.flatMap((site) =>
        site.points.map((pt) => ({
          type: 'Feature' as const,
          properties: {
            id: site.id,
            name: site.name,
            country: site.country,
            condition: pt.condition,
            isSelected: site.id === selectedSiteId,
          },
          geometry: { type: 'Point' as const, coordinates: pt.coordinates },
        })),
      ),
    };
  }, [enabled, localSites, selectedSiteId]);

  // Shared paint — identical treatment for both layers.
  const paint: CircleLayerSpecification['paint'] = {
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
  };

  return (
    <>
      <Source id="local-sites-source" type="geojson" data={siteData}>
        <Layer
          id="local-sites"
          type="circle"
          maxzoom={LOCAL_SITE_POINT_ZOOM}
          layout={{ visibility: enabled ? 'visible' : 'none' }}
          paint={paint}
        />
      </Source>
      <Source id="local-site-points-source" type="geojson" data={pointData}>
        <Layer
          id="local-site-points"
          type="circle"
          minzoom={LOCAL_SITE_POINT_ZOOM}
          layout={{ visibility: enabled ? 'visible' : 'none' }}
          paint={paint}
        />
      </Source>
    </>
  );
}

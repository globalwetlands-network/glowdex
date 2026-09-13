import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import { LocalSiteLayer } from './LocalSiteLayer';
import type { LocalSite } from '@/data/types/local-wetlands.types';

// Capture the GeoJSON each <Source> receives so we can assert on the
// features built by the layer without a real Mapbox context.
const captured: Record<string, FeatureCollection<Point>> = {};

vi.mock('react-map-gl', () => ({
  Source: (props: {
    id: string;
    data: FeatureCollection<Point>;
    children?: ReactNode;
  }) => {
    captured[props.id] = props.data;
    return props.children ?? null;
  },
  Layer: () => null,
}));

function makeSite(over: Partial<LocalSite> = {}): LocalSite {
  return {
    id: 'site-1',
    name: 'Site One',
    country: 'South Africa',
    coordinates: [31.0, -29.0],
    partnerId: 'uwc-za',
    availableYears: [],
    observations: [],
    points: [{ coordinates: [31.0, -29.0], condition: 'Reference' }],
    ...over,
  };
}

const sites: LocalSite[] = [
  makeSite({
    id: 'multi',
    points: [
      { coordinates: [31.0, -29.0], condition: 'Reference' },
      { coordinates: [31.1, -29.1], condition: 'Degraded' },
      { coordinates: [31.2, -29.2], condition: 'Rehabilitated' },
    ],
  }),
  makeSite({
    id: 'single',
    coordinates: [30.0, -28.0],
    points: [{ coordinates: [30.0, -28.0], condition: 'Reference' }],
  }),
];

afterEach(() => {
  cleanup();
  for (const key of Object.keys(captured)) delete captured[key];
});

describe('LocalSiteLayer', () => {
  it('renders one site feature per site and one point feature per coordinate', () => {
    render(
      <LocalSiteLayer
        enabled
        localSites={sites}
        hoveredSiteId={null}
        selectedSiteId={null}
      />,
    );

    // Site layer: one representative pin per site.
    expect(captured['local-sites-source'].features).toHaveLength(2);
    // Point layer: one pin per coordinate point (3 + 1).
    expect(captured['local-site-points-source'].features).toHaveLength(4);
  });

  it('tags every point feature with its parent site id', () => {
    render(
      <LocalSiteLayer
        enabled
        localSites={sites}
        hoveredSiteId={null}
        selectedSiteId={null}
      />,
    );

    const pointIds = captured['local-site-points-source'].features.map(
      (f) => f.properties?.id,
    );
    expect(pointIds).toEqual(['multi', 'multi', 'multi', 'single']);
  });

  it('emits empty feature collections when disabled', () => {
    render(
      <LocalSiteLayer
        enabled={false}
        localSites={sites}
        hoveredSiteId={null}
        selectedSiteId={null}
      />,
    );
    expect(captured['local-sites-source'].features).toHaveLength(0);
    expect(captured['local-site-points-source'].features).toHaveLength(0);
  });
});

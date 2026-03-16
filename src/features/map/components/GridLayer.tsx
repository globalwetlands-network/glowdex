import { useMemo } from 'react';
import type { FillLayerSpecification, LineLayerSpecification } from 'mapbox-gl';
import { Layer, Source } from 'react-map-gl';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { GridGeoJSON } from '@/data/types/geo.types';

interface GridLayerProps {
  geojson: GridGeoJSON;
  typologies: TypologyMap;
  hoveredCellId: number | null;
  selectedCellId: number | null;
  typologyScale?: 'scale5' | 'scale18';
}

type MapboxExpression = unknown[];

/**
 * Creates a Mapbox match expression for typology colors
 * Maps cluster IDs to their corresponding fill colors
 */
function createColorExpression(
  typologies: TypologyMap,
  typologyScale: 'scale5' | 'scale18',
): MapboxExpression {
  const scale = typologies[typologyScale];
  const matchExpression: MapboxExpression = ['match', ['get', 'cluster']];

  Object.values(scale).forEach((cluster) => {
    matchExpression.push(cluster.id);
    matchExpression.push(cluster.fillColor);
  });

  matchExpression.push('rgba(0,0,0,0)'); // Default transparent

  return matchExpression;
}

/**
 * Creates a Mapbox filter expression for highlighted cells
 * Highlights both hovered and selected cells
 */
function createHighlightFilter(
  hoveredCellId: number | null,
  selectedCellId: number | null,
): MapboxExpression {
  const ids: number[] = [];
  if (hoveredCellId) ids.push(hoveredCellId);
  if (selectedCellId) ids.push(selectedCellId);

  if (ids.length === 0) {
    return ['==', 'ID', -1]; // Match nothing
  }

  return ['in', 'ID', ...ids];
}

/**
 * Renders grid cells as colored polygons on the map
 * Supports typology-based coloring and hover/selection highlighting
 */
export function GridLayer({
  geojson,
  typologies,
  hoveredCellId,
  selectedCellId,
  typologyScale = 'scale5',
}: GridLayerProps) {
  const fillPaint: FillLayerSpecification['paint'] = useMemo(() => {
    const colorExpression = createColorExpression(typologies, typologyScale);

    return {
      'fill-color': [
        'case',
        ['==', ['get', 'isFiltered'], true],
        colorExpression,
        'rgba(0,0,0,0)',
      ],
      'fill-outline-color': 'rgba(0,0,0,0.1)',
    } as FillLayerSpecification['paint'];
  }, [typologies, typologyScale]);

  const highlightPaint: LineLayerSpecification['paint'] = {
    'line-color': '#000000',
    'line-width': 2,
  };

  const highlightFilter = useMemo(
    () =>
      createHighlightFilter(
        hoveredCellId,
        selectedCellId,
      ) as LineLayerSpecification['filter'],
    [hoveredCellId, selectedCellId],
  );

  return (
    <Source id="grid-source" type="geojson" data={geojson}>
      {/* Main colored fill layer */}
      <Layer
        id="grid-fill"
        type="fill"
        paint={fillPaint}
        beforeId="waterway-label"
      />

      {/* Hover/Selection outline */}
      <Layer
        id="grid-highlight"
        type="line"
        paint={highlightPaint}
        filter={highlightFilter}
      />
    </Source>
  );
}

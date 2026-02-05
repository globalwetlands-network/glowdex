import { Source, Layer } from 'react-map-gl';
import type { FillLayerSpecification, LineLayerSpecification } from 'mapbox-gl';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { TypologyMap } from '@/data/types/cluster.types';
import { useMemo } from 'react';

interface GridLayerProps {
  geojson: GridGeoJSON;
  typologies: TypologyMap;
  hoveredCellId: number | null;
  selectedCellId: number | null;
  typologyScale?: 'scale5' | 'scale18';
}

export function GridLayer({
  geojson,
  typologies,
  hoveredCellId,
  selectedCellId,
  typologyScale = 'scale5'
}: GridLayerProps) {

  // Memoize the color expression to avoid re-calculating on every render
  const fillPaint: FillLayerSpecification['paint'] = useMemo(() => {
    const scale = typologies[typologyScale];
    // Mapbox 'match' expression: ['match', input, label1, color1, label2, color2, ..., default]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchExpression: any[] = ['match', ['get', 'cluster']];

    Object.values(scale).forEach(cluster => {
      matchExpression.push(cluster.id);
      matchExpression.push(cluster.fillColor);
    });

    matchExpression.push('rgba(0,0,0,0)'); // Default transparent

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'fill-color': matchExpression as any, // Cast to any to bypass strict ExpressionSpecification match
      'fill-outline-color': 'rgba(0,0,0,0.1)', // Faint outline
    };
  }, [typologies, typologyScale]);

  // Highlight layer for hover/selection
  const highlightPaint: LineLayerSpecification['paint'] = {
    'line-color': '#000000',
    'line-width': 2,
  };

  const highlightFilter = useMemo(() => {
    const ids = [];
    if (hoveredCellId) ids.push(hoveredCellId);
    if (selectedCellId) ids.push(selectedCellId);

    // Explicitly cast filter arrays
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (ids.length === 0) return ['==', 'ID', -1] as any; // Match nothing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ['in', 'ID', ...ids] as any;
  }, [hoveredCellId, selectedCellId]);

  return (
    <Source id="grid-source" type="geojson" data={geojson}>
      {/* Main coloured fill layer */}
      <Layer
        id="grid-fill"
        type="fill"
        paint={fillPaint}
        beforeId="waterway-label" // Place below labels if possible
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

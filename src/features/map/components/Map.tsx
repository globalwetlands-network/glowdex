import { useMemo } from 'react';
import MapGL, { NavigationControl } from 'react-map-gl';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { RichGridCell } from '@/data/types/grid.types';

import { useMapInteraction } from '../hooks/useMapInteraction';
import { GridLayer } from './GridLayer';
import MapTooltip from './MapTooltip';

import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  gridCells: RichGridCell[];
  geojson: GridGeoJSON;
  typologies: TypologyMap;
  selectedCellId: number | null;
  onCellSelect: (id: number | null) => void;
  typologyScale?: 'scale5' | 'scale18';
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 115,
  latitude: -5,
  zoom: 3,
};

/**
 * Filters and enriches GeoJSON features with cluster information
 * Only includes features that exist in the filtered grid cells
 */
function enrichGeoJsonFeatures(
  geojson: GridGeoJSON,
  gridCells: RichGridCell[],
  typologyScale: 'scale5' | 'scale18'
): GridGeoJSON {
  if (!gridCells.length) {
    return { ...geojson, features: [] };
  }

  // Create lookup map for O(1) cell access
  const cellMap = new Map<number, RichGridCell>(
    gridCells.map(c => [c.id, c])
  );

  // Filter and enrich features with cluster data
  const enrichedFeatures = geojson.features.reduce((acc, feature) => {
    const id = feature.properties.ID;
    const cell = cellMap.get(id);

    if (cell) {
      const cluster = typologyScale === 'scale5' ? cell.cluster5 : cell.cluster18;
      acc.push({
        ...feature,
        properties: {
          ...feature.properties,
          cluster: cluster || 0
        }
      });
    }
    return acc;
  }, [] as typeof geojson.features);

  return { ...geojson, features: enrichedFeatures };
}

/**
 * Main map component displaying global wetlands grid cells
 * Supports hover interactions, cell selection, and typology visualization
 */
export function GridMap({
  gridCells,
  geojson,
  typologies,
  selectedCellId,
  typologyScale = 'scale5',
  onCellSelect,
}: MapProps) {
  const filteredGeoJson = useMemo(
    () => enrichGeoJsonFeatures(geojson, gridCells, typologyScale),
    [geojson, gridCells, typologyScale]
  );

  const { hoveredCellId, hoverInfo, onHover, onClick } = useMapInteraction({
    onCellSelect,
  });

  const hoveredCell = hoveredCellId
    ? gridCells.find(c => c.id === hoveredCellId)
    : undefined;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Mapbox token not configured. Please ensure a valid Mapbox access token is provided.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-200">
      <MapGL
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['grid-fill', 'grid-highlight']}
        onMouseMove={onHover}
        onClick={onClick}
      >
        <NavigationControl position="top-right" />

        <GridLayer
          geojson={filteredGeoJson}
          typologies={typologies}
          hoveredCellId={hoveredCellId}
          selectedCellId={selectedCellId}
          typologyScale={typologyScale}
        />

        {hoverInfo && hoveredCell && (
          <MapTooltip
            x={hoverInfo.x}
            y={hoverInfo.y}
            cell={hoveredCell}
            typologyScale={typologyScale}
          />
        )}
      </MapGL>
    </div>
  );
}

// Core
import { useMemo } from 'react';
import MapGL, { NavigationControl } from 'react-map-gl';

// Data Types
import type { RichGridCell } from '@/data/types/grid.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { TypologyMap } from '@/data/types/cluster.types';

// Components
import { GridLayer } from './GridLayer';
import MapTooltip from './MapTooltip';

// Hooks
import { useMapInteraction } from '../hooks/useMapInteraction';

// Styles
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  gridCells: RichGridCell[];
  geojson: GridGeoJSON;
  typologies: TypologyMap;
  selectedCellId: number | null;
  onCellSelect: (id: number | null) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Initial view state (centered largely on Indonesia / Australia region or global)
const INITIAL_VIEW_STATE = {
  longitude: 115,
  latitude: -5,
  zoom: 3,
};

export function GridMap({
  gridCells,
  geojson,
  typologies,
  selectedCellId,
  typologyScale = 'scale5',
  onCellSelect,
}: MapProps & {
  typologyScale?: 'scale5' | 'scale18';
}) {
  /* 
  Filter GeoJSON features to only those present in the filtered gridCells and
  Filter & Enrich GeoJSON Features
  */
  const filteredGeoJson = useMemo(() => {
    if (!gridCells.length) return { ...geojson, features: [] };

    // 1. Create a lookup map for grid cell data
    const cellMap = new Map<number, RichGridCell>(gridCells.map(c => [c.id, c]));

    // 2. Filter features that exist in our data AND enrich them with cluster info
    const enrichedFeatures = geojson.features.reduce((acc, feature) => {
      const id = feature.properties.ID;
      const cell = cellMap.get(id);

      if (cell) {
        acc.push({
          ...feature,
          properties: {
            ...feature.properties,
            cluster: (typologyScale === 'scale5' ? cell.cluster5 : cell.cluster18) || 0
          }
        });
      }
      return acc;
    }, [] as typeof geojson.features);

    return { ...geojson, features: enrichedFeatures };
  }, [geojson, gridCells, typologyScale]);

  const { hoveredCellId, hoverInfo, onHover, onClick } = useMapInteraction({
    onCellSelect,
  });

  // Find hovered cell data
  const hoveredCell = hoveredCellId
    ? gridCells.find((c) => c.id === hoveredCellId)
    : undefined;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Missing VITE_MAPBOX_TOKEN in .env.local
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

        {hoverInfo && (
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

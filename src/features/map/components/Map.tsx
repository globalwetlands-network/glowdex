import MapGL, { NavigationControl } from 'react-map-gl';
import { useMemo } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { TypologyMap } from '@/data/types/cluster.types';

import { GridLayer } from './GridLayer';
import MapTooltip from './MapTooltip';
import { useMapInteraction } from '../hooks/useMapInteraction';

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

export function Map({
  gridCells,
  geojson,
  typologies,
  selectedCellId,
  // hoveredCellId, // Derived internally from useMapInteraction now? Or passed down?
  // Actually App passes hoveredCellId, but useMapInteraction also returns it.
  // Let's rely on useMapInteraction internal state for hover to keep it responsive,
  // OR accept props if "lifted" state is required for other widgets.
  // Providing parity with legacy usually implies Map drives hover state.
  hoveredCellId: propHoveredCellId,
  typologyScale = 'scale5',
  onCellSelect,
}: MapProps & {
  hoveredCellId?: number | null;
  typologyScale?: 'scale5' | 'scale18';
}) {

  // Refined: Map component should just take 'onCellSelect' from parent (if passed in props, not shown in interface above yet)
  // But wait, the previous interface had `onCellSelect`.
  // Let's respect the interface defined in line 12.

  // Filter GeoJSON features to only those present in the filtered gridCells
  const filteredGeoJson = useMemo(() => {
    // Optimization: If gridCells length == total geojson features, avoid filtering?
    // But gridCells might be filtered by habitat.
    const validIds = new Set(gridCells.map(c => c.id));

    return {
      ...geojson,
      features: geojson.features.filter(f => {
        const id = f.properties.ID;
        return validIds.has(id);
      }).map(f => {
        // Enrich with cluster data for current scale
        const id = f.properties.ID;
        const cell = gridCells.find(c => c.id === id);
        return {
          ...f,
          properties: {
            ...f.properties,
            cluster: (typologyScale === 'scale5' ? cell?.cluster5 : cell?.cluster18) || 0
          }
        };
      })
    };
  }, [geojson, gridCells, typologyScale]);

  // Hook interaction
  // We need to pass the Click Handler up.
  // If MapProps includes `onCellSelect`, we pass it to the hook.
  // NOTE: I cannot see 'onCellSelect' in the function signature I am replacing, 
  // but I can see it in the file view at line 34.
  // I will use `arguments[0].onCellSelect`.

  const { hoveredCellId: internalHover, hoverInfo, onHover, onClick } = useMapInteraction({
    onCellSelect,
  });

  const effectiveHoverId = propHoveredCellId ?? internalHover;

  // Find hovered cell data
  const hoveredCell = effectiveHoverId
    ? gridCells.find((c) => c.id === effectiveHoverId)
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
          hoveredCellId={effectiveHoverId}
          selectedCellId={selectedCellId}
          typologyScale={typologyScale}
        />

        {hoverInfo && (
          <MapTooltip
            x={hoverInfo.x}
            y={hoverInfo.y}
            cell={hoveredCell}
          />
        )}
      </MapGL>
    </div>
  );
}

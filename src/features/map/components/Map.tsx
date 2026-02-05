import MapGL, { NavigationControl } from 'react-map-gl';
import type { RichGridCell } from '@/data/transforms/joinGridWithClusters';
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
  onCellSelect,
}: MapProps) {
  const { hoveredCellId, hoverInfo, onHover, onClick } = useMapInteraction({
    onCellSelect,
  });

  // Find the hovered cell data for the tooltip
  const hoveredCell = hoveredCellId
    ? gridCells.find((c) => c.id === hoveredCellId)
    : undefined;

  // IMPORTANT: The GeoJSON features need to have the 'cluster' property 
  // embedded for the coloring expression in GridLayer to work.
  // We can enrich the geojson here, or assume it's pre-processed.
  // Ideally, the joinGridWithClusters transform should have produced an 
  // enriched GeoJSON or we do it efficiently here.
  // 
  // For Glow7 parity, let's do a lightweight enrich on render (or useMemo).
  // Ideally this belongs in data layer, but visually joining 'cluster' to 'feature'
  // is often done just before mapping.

  // NOTE: Mutating the geojson inplace is risky if strict mode, but efficient.
  // Let's assume for now we construct a lookup and pass it to GridLayer? 
  // No, GridLayer uses a Mapbox expression 'match' on a property.
  // So the property MUST be in the feature.properties.

  // Let's create an enriched geojson object.
  const enrichedGeoJson: GridGeoJSON = {
    ...geojson,
    features: geojson.features.map(f => {
      const cellData = gridCells.find(c => c.id === f.properties.ID);
      return {
        ...f,
        properties: {
          ...f.properties,
          cluster: cellData?.cluster5 || 0, // Default to 0 if missing
        }
      };
    })
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Missing VITE_MAPBOX_TOKEN in .env.local
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
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
          geojson={enrichedGeoJson}
          typologies={typologies}
          hoveredCellId={hoveredCellId}
          selectedCellId={selectedCellId}
          typologyScale="scale5"
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

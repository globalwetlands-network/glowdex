import { useMemo, useRef, useState, useCallback } from 'react';
import MapGL, { NavigationControl } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import { SearchBox } from '@mapbox/search-js-react';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { TypologyMap } from '@/data/types/cluster.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { RichGridCell } from '@/data/types/grid.types';
import type { ObservationPoint } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';

import { useMapInteraction } from '../hooks/useMapInteraction';
import { GridLayer } from './GridLayer';
import { SpeciesDistributionLayer } from '@/components/widgets/SpeciesSpotlight/SpeciesDistributionLayer';
import { HubLayer } from '@/components/widgets/HubPartner';
import MapTooltip from './MapTooltip';

interface MapProps {
  allGridCells: RichGridCell[];
  filteredGridCells: RichGridCell[];
  geojson: GridGeoJSON;
  typologies: TypologyMap;
  selectedCellId: number | null;
  selectedCell: EnrichedGridCell | null;
  onCellSelect: (id: number | null) => void;
  typologyScale?: 'scale5' | 'scale18';
  activeObservations: ObservationPoint[];
  activeSpeciesId: string;
  speciesLayerEnabled: boolean;
  hubLayerEnabled: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 10,
  zoom: 2,
};

/**
 * Filters and enriches GeoJSON features with cluster information
 * Only includes features that exist in the filtered grid cells
 */
function enrichGeoJsonFeatures(
  geojson: GridGeoJSON,
  allGridCells: RichGridCell[],
  filteredGridCells: RichGridCell[],
  typologyScale: 'scale5' | 'scale18',
): GridGeoJSON {
  if (!allGridCells.length) {
    return { ...geojson, features: [] };
  }

  // Create lookup map for O(1) cell access
  const allCellMap = new Map<number, RichGridCell>(
    allGridCells.map((c) => [c.id, c]),
  );

  const filteredCellSet = new Set<number>(filteredGridCells.map((c) => c.id));

  // Filter and enrich features with cluster data
  const enrichedFeatures = geojson.features.reduce(
    (acc, feature) => {
      const id = feature.properties.ID;
      const cell = allCellMap.get(id);

      if (cell) {
        const cluster =
          typologyScale === 'scale5' ? cell.cluster5 : cell.cluster18;
        acc.push({
          ...feature,
          properties: {
            ...feature.properties,
            cluster: cluster || 0,
            isFiltered: filteredCellSet.has(id),
          },
        });
      }
      return acc;
    },
    [] as typeof geojson.features,
  );

  return { ...geojson, features: enrichedFeatures };
}

/**
 * Main map component displaying global wetlands grid cells
 * Supports hover interactions, cell selection, and typology visualization
 */
export function GridMap({
  allGridCells,
  filteredGridCells,
  geojson,
  typologies,
  selectedCellId,
  selectedCell,
  typologyScale = 'scale5',
  onCellSelect,
  activeObservations,
  activeSpeciesId,
  speciesLayerEnabled,
  hubLayerEnabled,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapInstance, setMapInstance] = useState<
    ReturnType<MapRef['getMap']> | undefined
  >(undefined);

  const filteredGeoJson = useMemo(
    () =>
      enrichGeoJsonFeatures(
        geojson,
        allGridCells,
        filteredGridCells,
        typologyScale,
      ),
    [geojson, allGridCells, filteredGridCells, typologyScale],
  );

  const { hoveredCellId, hoverInfo, onHover, onClick } = useMapInteraction({
    onCellSelect,
  });

  const hoveredCell = hoveredCellId
    ? allGridCells.find((c) => c.id === hoveredCellId)
    : undefined;

  const handleSearchClear = useCallback(() => {
    mapRef.current?.flyTo({
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      duration: 1000,
    });
    onCellSelect(null);
  }, [onCellSelect]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Mapbox token not configured. Please ensure a valid Mapbox access token
        is provided.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-200">
      {/* Location search overlay */}
      <div className="absolute top-3 left-3 z-10 w-[calc(100%-1.5rem)] sm:w-72">
        <SearchBox
          accessToken={MAPBOX_TOKEN}
          map={mapInstance}
          placeholder="Search a location..."
          onClear={handleSearchClear}
          theme={{
            variables: {
              colorBackground: '#ffffff',
              colorBackgroundHover: '#f0fdfa',
              borderRadius: '0.5rem',
              fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            },
          }}
        />
      </div>
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['grid-fill', 'grid-highlight']}
        onMouseMove={onHover}
        onClick={onClick}
        onLoad={() => setMapInstance(mapRef.current?.getMap())}
      >
        <NavigationControl position="top-right" />

        <GridLayer
          geojson={filteredGeoJson}
          typologies={typologies}
          hoveredCellId={hoveredCellId}
          selectedCellId={selectedCellId}
          typologyScale={typologyScale}
        />

        {activeObservations.length > 0 && (
          <SpeciesDistributionLayer
            observations={activeObservations}
            speciesId={activeSpeciesId}
            enabled={speciesLayerEnabled}
          />
        )}

        <HubLayer enabled={hubLayerEnabled} selectedCell={selectedCell} />

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

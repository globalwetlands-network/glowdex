import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import MapGL, { NavigationControl, Marker } from 'react-map-gl';
import type { MapRef, MapMouseEvent } from 'react-map-gl';
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
import { PartnerLayer } from '@/components/widgets/Partner';
import { MangroveExtentLayer } from '@/components/widgets/MangroveExtent';
import MapTooltip from './MapTooltip';
import { SearchMarkerIcon } from '@/components/map/markers';
import { MapLayerLegend } from './MapLayerLegend';

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
  activeSpeciesName: string;
  speciesLayerEnabled: boolean;
  partnerLayerEnabled: boolean;
  mangroveLayerEnabled: boolean;
  /**
   * Target coordinates for the map to fly to when the active
   * species changes in the Biodiversity tab. Null when no
   * fly is pending.
   */
  speciesFlyTarget: { lng: number; lat: number } | null;
  /**
   * Called immediately after flyTo is initiated to clear the
   * target and prevent re-firing on unrelated re-renders.
   */
  onSpeciesFlyComplete: () => void;
  onPartnerClick: (partnerId: string) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Zoom level for species region fly-to.
 * Wider than search zoom (5) since species ranges cover
 * large geographic areas.
 */
const SPECIES_FLY_ZOOM = 4;

/**
 * Default camera position on app load.
 * Centered roughly over the African/European coastline at zoom 2
 * to provide a global view that shows mangrove coverage across
 * all major regions without biasing toward any single area.
 */
const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 10,
  zoom: 2,
};

/**
 * Filters and enriches GeoJSON features with typology cluster data.
 *
 * Two separate cell collections are needed:
 * - `allGridCells` provides the cluster assignment for every cell,
 *   including those currently filtered out of the view.
 * - `filteredGridCells` determines which cells are visible given
 *   the current filter state (habitat, typology scale, etc.).
 *
 * A Map<id, cell> lookup is used for O(1) access when joining the
 * GeoJSON features to their cluster data, avoiding an O(n²) nested
 * loop over what can be thousands of features.
 *
 * Features with no matching cell in allGridCells are excluded from
 * the output entirely — this handles cells that exist in the GeoJSON
 * but were not returned by the data loader.
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
 * Main map component for the GLOWdex platform.
 *
 * Renders a Mapbox GL JS map with:
 * - A global grid of 100×100km coastal wetland cells, coloured by
 *   typology cluster, with hover and selection interactions.
 * - An optional species observation layer (GBIF point data) toggled
 *   from the Species Spotlight widget.
 * - An optional partner layer showing GLOWdex partner institution
 *   locations, toggled from the Partner widget.
 * - A location search overlay (Mapbox Search JS) with zoom-capped
 *   fly-to behaviour and a temporary search result marker.
 *
 * ─── Search behaviour ───────────────────────────────────────────
 * The SearchBox intentionally does NOT receive the `map` prop, even
 * though the Mapbox docs suggest it for map binding. Passing `map`
 * causes SearchBox to auto-fly to the result at its own zoom level
 * (typically zoom 12–15), which is too tight for 100×100km grid
 * cells. Camera control is handled entirely in onRetrieve instead.
 *
 * Suggestion ranking is kept context-aware by passing the current
 * map center as a `proximity` option, updated on every map move.
 *
 * ─── Layer rendering order ──────────────────────────────────────
 * 1. GridLayer — base typology grid (always rendered)
 * 2. SpeciesDistributionLayer — GBIF observations (conditional)
 * 3. PartnerLayer — partner markers (conditional)
 * 4. Search marker — teardrop SVG Marker (conditional)
 * 5. MapTooltip — hover tooltip (conditional)
 * 6. MapLayerLegend — bottom-left overlay (conditional)
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
  activeSpeciesName,
  speciesLayerEnabled,
  partnerLayerEnabled,
  mangroveLayerEnabled,
  speciesFlyTarget,
  onSpeciesFlyComplete,
  onPartnerClick,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  // Temporary marker shown at the search result location.
  // Set when a search result is retrieved, cleared when the search
  // is cleared or when the user selects a grid cell.
  const [searchMarker, setSearchMarker] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  // Tracks the current map center for SearchBox proximity biasing.
  // Passed as options.proximity to SearchBox so that suggestion ranking
  // is weighted toward the visible viewport. Updated on move end rather
  // than on every move frame — proximity biasing does not need per-frame
  // precision and updating on move end avoids continuous re-renders
  // during pan and zoom interactions.
  const [mapCenter, setMapCenter] = useState<{
    lng: number;
    lat: number;
  }>({
    lng: INITIAL_VIEW_STATE.longitude,
    lat: INITIAL_VIEW_STATE.latitude,
  });
  const [partnerHoverInfo, setPartnerHoverInfo] = useState<{
    x: number;
    y: number;
    id: string;
    institution: string;
    city: string;
    country: string;
  } | null>(null);
  const [speciesHoverInfo, setSpeciesHoverInfo] = useState<{
    x: number;
    y: number;
    speciesName: string;
    date: string;
    datasetName: string;
  } | null>(null);

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

  const handleCellSelect = useCallback(
    (id: number | null) => {
      if (id !== null) {
        setSearchMarker(null);
      }
      onCellSelect(id);
    },
    [onCellSelect],
  );

  const { hoveredCellId, hoverInfo, onHover, onClick } = useMapInteraction({
    onCellSelect: handleCellSelect,
  });

  const handleMapClick = useCallback(
    (evt: MapMouseEvent) => {
      const partnerFeature = evt.features?.find(
        (f) =>
          f.layer?.id === 'partner-locations' ||
          f.layer?.id === 'partner-locations-inner',
      );
      if (partnerFeature?.properties?.id) {
        onPartnerClick(partnerFeature.properties.id);
        return;
      }
      onClick(evt);
    },
    [onClick, onPartnerClick],
  );

  const hoveredCell = hoveredCellId
    ? allGridCells.find((c) => c.id === hoveredCellId)
    : undefined;

  /**
   * Flies the map to the species' primary region center when
   * a new species is selected in the Biodiversity tab.
   * useEffect is the correct pattern here — we are
   * synchronising React state (speciesFlyTarget) with an
   * external system (the Mapbox map instance), which is
   * exactly the use case React recommends effects for.
   */
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = partnerHoverInfo ? 'pointer' : '';
  }, [partnerHoverInfo]);

  useEffect(() => {
    if (!speciesFlyTarget) return;
    mapRef.current?.flyTo({
      center: [speciesFlyTarget.lng, speciesFlyTarget.lat],
      zoom: SPECIES_FLY_ZOOM,
      duration: 1200,
    });
    onSpeciesFlyComplete();
  }, [speciesFlyTarget, onSpeciesFlyComplete]);

  /**
   * Handles a confirmed search result from SearchBox.
   *
   * Extracts coordinates from the GeoJSON feature in the retrieve
   * response. The response shape is cast from `unknown` because
   * @mapbox/search-js-react types the onRetrieve callback as
   * SearchBoxRetrieveResponse — importing that type directly causes
   * issues with the bundler in some configurations, so we cast and
   * extract manually.
   *
   * Flies to the result at zoom 5 — chosen to show approximately
   * 3–5 grid cells (each 100×100km) around the searched location,
   * giving enough regional context without zooming to street level.
   */
  const handleSearchRetrieve = useCallback((result: unknown) => {
    const feature = (
      result as {
        features?: Array<{
          geometry?: { coordinates?: [number, number] };
        }>;
      }
    )?.features?.[0];

    const coords = feature?.geometry?.coordinates;
    if (!coords) return;

    mapRef.current?.flyTo({
      center: [coords[0], coords[1]],
      zoom: 5,
      duration: 1000,
    });

    setSearchMarker({ lng: coords[0], lat: coords[1] });
  }, []);

  /**
   * Resets the map to the initial global view when the search is cleared.
   * Also clears the cell selection and search marker so the app returns
   * to a clean default state.
   */
  const handleSearchClear = useCallback(() => {
    mapRef.current?.flyTo({
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      duration: 1000,
    });
    setSearchMarker(null);
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
          placeholder="Search a location..."
          onRetrieve={handleSearchRetrieve}
          onClear={handleSearchClear}
          options={{
            proximity: {
              lng: mapCenter.lng,
              lat: mapCenter.lat,
            },
          }}
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
      <MapLayerLegend
        partnerLayerEnabled={partnerLayerEnabled}
        speciesLayerEnabled={
          speciesLayerEnabled &&
          !!activeSpeciesId &&
          activeObservations.length > 0
        }
        mangroveLayerEnabled={mangroveLayerEnabled}
        searchMarkerVisible={searchMarker !== null}
        activeSpeciesName={activeSpeciesName}
      />
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[
          'grid-fill',
          'grid-highlight',
          'partner-locations',
          'partner-locations-inner',
          ...(speciesLayerEnabled && activeSpeciesId
            ? [`species-${activeSpeciesId}-pins`]
            : []),
        ]}
        onMouseMove={(evt) => {
          onHover({
            ...evt,
            features: evt.features?.filter(
              (f) =>
                f.layer?.id === 'grid-fill' || f.layer?.id === 'grid-highlight',
            ),
          } as MapMouseEvent);

          const speciesFeature = evt.features?.find(
            (f) => f.layer?.id === `species-${activeSpeciesId}-pins`,
          );

          const partnerFeature = evt.features?.find(
            (f) =>
              f.layer?.id === 'partner-locations' ||
              f.layer?.id === 'partner-locations-inner',
          );

          // Partner tooltip takes priority over species when overlapping
          if (partnerFeature) {
            setPartnerHoverInfo({
              x: evt.point.x,
              y: evt.point.y,
              id: partnerFeature.properties?.id ?? '',
              institution: partnerFeature.properties?.institution ?? '',
              city: partnerFeature.properties?.city ?? '',
              country: partnerFeature.properties?.country ?? '',
            });
            setSpeciesHoverInfo(null);
          } else if (speciesFeature) {
            setSpeciesHoverInfo({
              x: evt.point.x,
              y: evt.point.y,
              speciesName: activeSpeciesName,
              date: speciesFeature.properties?.date ?? '',
              datasetName: speciesFeature.properties?.datasetName ?? '',
            });
            setPartnerHoverInfo(null);
          } else {
            setPartnerHoverInfo(null);
            setSpeciesHoverInfo(null);
          }
        }}
        onClick={handleMapClick}
        onMoveEnd={(evt) =>
          setMapCenter({
            lng: evt.viewState.longitude,
            lat: evt.viewState.latitude,
          })
        }
      >
        <NavigationControl position="top-right" />

        <GridLayer
          geojson={filteredGeoJson}
          typologies={typologies}
          hoveredCellId={hoveredCellId}
          selectedCellId={selectedCellId}
          typologyScale={typologyScale}
        />

        <MangroveExtentLayer enabled={mangroveLayerEnabled} />

        {speciesLayerEnabled &&
          activeSpeciesId &&
          activeObservations.length > 0 && (
            <SpeciesDistributionLayer
              observations={activeObservations}
              speciesId={activeSpeciesId}
              enabled={speciesLayerEnabled}
            />
          )}

        {searchMarker && (
          <Marker
            longitude={searchMarker.lng}
            latitude={searchMarker.lat}
            anchor="bottom"
          >
            <SearchMarkerIcon size={24} />
          </Marker>
        )}

        <PartnerLayer
          enabled={partnerLayerEnabled}
          selectedCell={selectedCell}
          hoveredPartnerId={partnerHoverInfo?.id ?? null}
        />

        {partnerHoverInfo && (
          <div
            className="absolute z-10 p-2 bg-white rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] text-sm border border-gray-200"
            style={{ left: partnerHoverInfo.x, top: partnerHoverInfo.y }}
          >
            <div className="font-bold text-gray-900">
              {partnerHoverInfo.institution}
            </div>
            <div className="text-gray-600">
              {partnerHoverInfo.city}, {partnerHoverInfo.country}
            </div>
            <div className="text-xs text-[#0f6e56] mt-1">
              GLOWdex Partner Organisation
            </div>
          </div>
        )}

        {speciesHoverInfo && (
          <div
            className="absolute z-10 p-2 bg-white rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] text-sm border border-gray-200"
            style={{
              left: speciesHoverInfo.x,
              top: speciesHoverInfo.y,
            }}
          >
            <div className="font-bold text-gray-900">
              {speciesHoverInfo.speciesName}
            </div>
            {speciesHoverInfo.date && (
              <div className="text-gray-600">
                {new Date(speciesHoverInfo.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                })}
              </div>
            )}
            {speciesHoverInfo.datasetName && (
              <div
                className="text-xs text-gray-400 mt-1 max-w-[200px] truncate"
                title={speciesHoverInfo.datasetName}
              >
                {speciesHoverInfo.datasetName}
              </div>
            )}
            <div className="text-xs text-[#0f6e56] mt-1">GBIF Observation</div>
          </div>
        )}

        {hoverInfo && hoveredCell && !partnerHoverInfo && (
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

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import MapGL, { NavigationControl, Marker } from 'react-map-gl';
import type { MapRef, MapMouseEvent, MapTouchEvent } from 'react-map-gl';
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
import { LocalSiteLayer } from '@/components/widgets/LocalData';
import { MangroveExtentLayer } from '@/components/widgets/MangroveExtent';
import type { LocalSite } from '@/data/types/local-wetlands.types';
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
  localSites: LocalSite[];
  localSiteLayerEnabled: boolean;
  selectedSiteId: string | null;
  onSiteClick: (siteId: string) => void;
  siteFlyTarget: { lng: number; lat: number } | null;
  onSiteFlyComplete: () => void;
  partnerFlyTarget: { lng: number; lat: number } | null;
  onPartnerFlyComplete: () => void;
  onLocationSearched?: (coords: { lng: number; lat: number }) => void;
  onLocationSearchCleared?: () => void;
  resetViewSignal?: number;
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
 * Main map component for the MBCAM platform.
 *
 * Renders a Mapbox GL JS map with:
 * - A global grid of 100×100km coastal wetland cells, coloured by
 *   typology cluster, with hover and selection interactions.
 * - An optional species observation layer (GBIF point data) toggled
 *   from the Species Spotlight widget.
 * - An optional partner layer showing MBCAM partner institution
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
 * 2. MangroveExtentLayer — habitat raster (conditional)
 * 3. SpeciesDistributionLayer — GBIF observations (conditional)
 * 4. PartnerLayer — partner markers (conditional)
 * 5. LocalSiteLayer — monitoring site pins (conditional)
 * 6. Search marker — teardrop SVG Marker (conditional)
 * 7. MapTooltip — hover tooltip (conditional)
 * 8. MapLayerLegend — bottom-left overlay (conditional)
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
  localSites,
  localSiteLayerEnabled,
  selectedSiteId,
  onSiteClick,
  siteFlyTarget,
  onSiteFlyComplete,
  partnerFlyTarget,
  onPartnerFlyComplete,
  onLocationSearched,
  onLocationSearchCleared,
  resetViewSignal = 0,
}: MapProps) {
  const posthog = usePostHog();
  const mapRef = useRef<MapRef>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchedPartner = useRef<{
    id: string;
    institution: string;
    city: string;
    country: string;
  } | null>(null);
  const touchedSite = useRef<{
    id: string;
    name: string;
    country: string;
  } | null>(null);
  const touchedCell = useRef<RichGridCell | null>(null);
  const longPressActive = useRef<boolean>(false);
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
  const [siteHoverInfo, setSiteHoverInfo] = useState<{
    x: number;
    y: number;
    id: string;
    name: string;
    country: string;
  } | null>(null);
  const [longPressTileInfo, setLongPressTileInfo] = useState<{
    x: number;
    y: number;
    cell: RichGridCell;
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
      if (longPressActive.current) {
        longPressActive.current = false;
        return;
      }

      const siteFeature = evt.features?.find(
        (f) => f.layer?.id === 'local-sites',
      );

      if (siteFeature?.properties?.id) {
        onSiteClick(siteFeature.properties.id);
        return;
      }

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
    [onClick, onPartnerClick, onSiteClick],
  );

  const handleTouchStart = useCallback(
    (evt: MapTouchEvent) => {
      setPartnerHoverInfo(null);
      setSiteHoverInfo(null);
      setLongPressTileInfo(null);
      longPressActive.current = false;

      if (evt.originalEvent.touches.length !== 1) {
        touchedPartner.current = null;
        touchedSite.current = null;
        touchedCell.current = null;
        return;
      }

      touchStartTime.current = performance.now();
      touchStartPoint.current = { x: evt.point.x, y: evt.point.y };

      const siteFeatures =
        mapRef.current?.queryRenderedFeatures(evt.point, {
          layers: ['local-sites'],
        }) ?? [];

      const partnerFeatures =
        mapRef.current?.queryRenderedFeatures(evt.point, {
          layers: ['partner-locations', 'partner-locations-inner'],
        }) ?? [];

      const gridFeatures =
        mapRef.current?.queryRenderedFeatures(evt.point, {
          layers: ['grid-fill'],
        }) ?? [];

      const sp = siteFeatures[0]?.properties;
      if (sp?.id) {
        touchedSite.current = {
          id: sp.id,
          name: sp.name ?? '',
          country: sp.country ?? '',
        };
        touchedPartner.current = null;
        touchedCell.current = null;
        return;
      }

      const pp = partnerFeatures[0]?.properties;
      if (pp?.id) {
        touchedPartner.current = {
          id: pp.id,
          institution: pp.institution ?? '',
          city: pp.city ?? '',
          country: pp.country ?? '',
        };
        touchedSite.current = null;
        touchedCell.current = null;
        return;
      }

      const gp = gridFeatures[0]?.properties;
      if (gp?.ID) {
        touchedCell.current = allGridCells.find((c) => c.id === gp.ID) ?? null;
        touchedPartner.current = null;
        touchedSite.current = null;
        return;
      }

      touchedPartner.current = null;
      touchedSite.current = null;
      touchedCell.current = null;
    },
    [allGridCells],
  );

  const handleTouchEnd = useCallback(
    (evt: MapTouchEvent) => {
      const elapsed = performance.now() - touchStartTime.current;

      if (elapsed >= 500) {
        if (touchedSite.current) {
          longPressActive.current = true;
          setSiteHoverInfo({
            ...touchedSite.current,
            x: touchStartPoint.current.x,
            y: touchStartPoint.current.y,
          });
          try {
            posthog?.capture('site_long_press_shown', {
              site_id: touchedSite.current.id,
              site_name: touchedSite.current.name,
              site_country: touchedSite.current.country,
              is_mobile: true,
            });
          } catch (error) {
            console.error(
              'Failed to capture site_long_press_shown event:',
              error,
            );
          }
          evt.originalEvent.preventDefault();
        } else if (touchedPartner.current) {
          longPressActive.current = true;
          setPartnerHoverInfo({
            ...touchedPartner.current,
            x: touchStartPoint.current.x,
            y: touchStartPoint.current.y,
          });
          try {
            posthog?.capture('partner_long_press_shown', {
              partner_id: touchedPartner.current?.id ?? null,
              institution: touchedPartner.current?.institution ?? null,
              is_mobile: true,
            });
          } catch (error) {
            console.error(
              'Failed to capture partner_long_press_shown event:',
              error,
            );
          }
          evt.originalEvent.preventDefault();
        } else if (touchedCell.current) {
          longPressActive.current = true;
          setLongPressTileInfo({
            x: touchStartPoint.current.x,
            y: touchStartPoint.current.y,
            cell: touchedCell.current,
          });
          try {
            posthog?.capture('tile_long_press_shown', {
              cell_id: String(touchedCell.current.id),
              country: touchedCell.current.country,
              cluster5: touchedCell.current.cluster5,
              is_mobile: true,
            });
          } catch (error) {
            console.error(
              'Failed to capture tile_long_press_shown event:',
              error,
            );
          }
          evt.originalEvent.preventDefault();
        }
      }
    },
    [posthog],
  );

  const handleTouchCancel = useCallback(() => {
    touchedPartner.current = null;
    touchedSite.current = null;
    touchedCell.current = null;
    longPressActive.current = false;
  }, []);

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
    canvas.style.cursor =
      partnerHoverInfo || siteHoverInfo || hoveredCellId ? 'pointer' : '';
  }, [partnerHoverInfo, siteHoverInfo, hoveredCellId]);

  useEffect(() => {
    if (!resetViewSignal) return;
    mapRef.current?.flyTo({
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      duration: 1000,
    });
  }, [resetViewSignal]);

  useEffect(() => {
    if (!speciesFlyTarget) return;
    mapRef.current?.flyTo({
      center: [speciesFlyTarget.lng, speciesFlyTarget.lat],
      zoom: SPECIES_FLY_ZOOM,
      duration: 1200,
    });
    onSpeciesFlyComplete();
  }, [speciesFlyTarget, onSpeciesFlyComplete]);

  useEffect(() => {
    if (!siteFlyTarget) return;
    mapRef.current?.flyTo({
      center: [siteFlyTarget.lng, siteFlyTarget.lat],
      zoom: 8,
      duration: 1000,
    });
    onSiteFlyComplete();
  }, [siteFlyTarget, onSiteFlyComplete]);

  useEffect(() => {
    if (!partnerFlyTarget) return;
    mapRef.current?.flyTo({
      center: [partnerFlyTarget.lng, partnerFlyTarget.lat],
      zoom: Math.max(8, mapRef.current.getZoom()),
      duration: 1000,
    });
    onPartnerFlyComplete();
  }, [partnerFlyTarget, onPartnerFlyComplete]);

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
  const handleSearchRetrieve = useCallback(
    (result: unknown) => {
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
      onLocationSearched?.({ lng: coords[0], lat: coords[1] });
    },
    [onLocationSearched],
  );

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
    onLocationSearchCleared?.();
  }, [onCellSelect, onLocationSearchCleared]);

  const interactiveLayerIds = useMemo(
    () => [
      'grid-fill',
      'grid-highlight',
      ...(localSiteLayerEnabled ? ['local-sites'] : []),
      'partner-locations',
      'partner-locations-inner',
      ...(speciesLayerEnabled && activeSpeciesId
        ? [`species-${activeSpeciesId}-pins`]
        : []),
    ],
    [localSiteLayerEnabled, speciesLayerEnabled, activeSpeciesId],
  );

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
        localSiteLayerEnabled={localSiteLayerEnabled}
        localSitesCount={localSites.length}
        searchMarkerVisible={searchMarker !== null}
        activeSpeciesName={activeSpeciesName}
      />
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={interactiveLayerIds}
        onMouseMove={(evt) => {
          // Clear site hover immediately when layer is disabled —
          // prevents a stale tooltip reappearing if the layer is
          // toggled back on before the next mouse move.
          if (!localSiteLayerEnabled) {
            setSiteHoverInfo(null);
          }

          onHover({
            ...evt,
            features: evt.features?.filter(
              (f) =>
                f.layer?.id === 'grid-fill' || f.layer?.id === 'grid-highlight',
            ),
          } as MapMouseEvent);

          const siteFeature = evt.features?.find(
            (f) => f.layer?.id === 'local-sites',
          );

          const speciesFeature = evt.features?.find(
            (f) => f.layer?.id === `species-${activeSpeciesId}-pins`,
          );

          const partnerFeature = evt.features?.find(
            (f) =>
              f.layer?.id === 'partner-locations' ||
              f.layer?.id === 'partner-locations-inner',
          );

          // Site tooltip takes priority, then partner, then species
          if (siteFeature) {
            setSiteHoverInfo({
              x: evt.point.x,
              y: evt.point.y,
              id: siteFeature.properties?.id ?? '',
              name: siteFeature.properties?.name ?? '',
              country: siteFeature.properties?.country ?? '',
            });
            setPartnerHoverInfo(null);
            setSpeciesHoverInfo(null);
          } else if (partnerFeature) {
            setPartnerHoverInfo({
              x: evt.point.x,
              y: evt.point.y,
              id: partnerFeature.properties?.id ?? '',
              institution: partnerFeature.properties?.institution ?? '',
              city: partnerFeature.properties?.city ?? '',
              country: partnerFeature.properties?.country ?? '',
            });
            setSiteHoverInfo(null);
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
            setSiteHoverInfo(null);
          } else {
            setPartnerHoverInfo(null);
            setSpeciesHoverInfo(null);
            setSiteHoverInfo(null);
          }
        }}
        onClick={handleMapClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
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

        <LocalSiteLayer
          enabled={localSiteLayerEnabled}
          localSites={localSites}
          hoveredSiteId={siteHoverInfo?.id ?? null}
          selectedSiteId={selectedSiteId}
        />

        {siteHoverInfo && (
          <div
            className="absolute z-10 p-2 bg-white rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] text-sm border border-gray-200"
            style={{ left: siteHoverInfo.x, top: siteHoverInfo.y }}
          >
            <div className="font-bold text-gray-900">{siteHoverInfo.name}</div>
            <div className="text-gray-600">{siteHoverInfo.country}</div>
            <div className="text-xs text-[#0f6e56] mt-1">
              Local Monitoring Site
            </div>
          </div>
        )}

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
              MBCAM Partner Organisation
            </div>
          </div>
        )}

        {longPressTileInfo && !partnerHoverInfo && !siteHoverInfo && (
          <MapTooltip
            x={longPressTileInfo.x}
            y={longPressTileInfo.y}
            cell={longPressTileInfo.cell}
            typologyScale={typologyScale}
          />
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

        {hoverInfo && hoveredCell && !partnerHoverInfo && !siteHoverInfo && (
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

import { useState, useCallback, useMemo, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';

// Context
import { AppProviders } from '@/app/AppProviders';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/context/FilterContext';
import { useSelection } from '@/context/SelectionContext';

// Types
import type { ObservationPoint } from '@/api/species';
import type { LocalSiteContext } from '@/api/types';

// Data
import { aggregateByCondition } from '@/data/transforms/aggregateLocalObservations';

// Feature Hooks & Components
import {
  useFilterAnalytics,
  useSelectionAnalytics,
} from '@/features/analytics';
import { GridMap as Map } from '@/features/map/components/Map';
import { useFilteredGridCells } from '@/features/widgets/hooks/useFilteredGridCells';
import { useIndicatorDistributions } from '@/features/widgets/hooks/useIndicatorDistributions';
import { useGlobalStatistics } from '@/data/hooks/useGlobalStatistics';
import { usePartners } from '@/api/hooks/usePartners';
import { useSpeciesConfig } from '@/api/hooks/useSpeciesConfig';
import {
  calculateDistance,
  findCellContainingPoint,
  getFeatureCenterCoords,
} from '@/utils/geo';
import { MAX_SITE_ASSOCIATION_DISTANCE_KM } from '@/data/constants/localWetlands.constants';

// App Components
import { AppLayout } from './components/AppLayout';
import { WelcomeModal } from './components/WelcomeModal';
import { LoadingState } from './components/LoadingState';
import { SidePanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';

// App Hooks, Constants & Types
import { MOBILE_BREAKPOINT } from './constants/app.constants';
import { useSelectedCell } from './hooks/useSelectedCell';
import { useTypologyScale } from './hooks/useTypologyScale';
import type { MobileTab } from './types/app.types';

/**
 * Inner App component that consumes contexts
 * Handles derived state and layout orchestration
 */
function AppShell() {
  const posthog = usePostHog();
  const cellCountInSession = useRef(0);

  // Context consumption
  const {
    gridCells,
    geojson,
    typologies,
    indicators,
    localSites,
    isLoading,
    error,
  } = useData();
  const { filterState, setFilterState } = useFilter();
  const { selectedCellId, setSelectedCellId } = useSelection();

  // Local UI state (layout only)
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('map');
  const [panelActiveTab, setPanelActiveTab] = useState<
    'analysis' | 'biodiversity'
  >('biodiversity');
  const [scrollToLocalDataSignal, setScrollToLocalDataSignal] = useState(0);
  const [scrollToPartnerSignal, setScrollToPartnerSignal] = useState(0);
  const [scrollToTopSignal, setScrollToTopSignal] = useState(0);
  const [analysisTabVisited, setAnalysisTabVisited] = useState(false);

  // Species layer state
  const [speciesLayerState, setSpeciesLayerState] = useState<{
    speciesId: string;
    observations: ObservationPoint[];
    enabled: boolean;
  }>({
    speciesId: '',
    observations: [],
    enabled: false,
  });

  const handleSpeciesLayerToggle = useCallback(
    (speciesId: string, observations: ObservationPoint[], enabled: boolean) => {
      setSpeciesLayerState({
        speciesId: enabled ? speciesId : '',
        observations: enabled ? observations : [],
        enabled,
      });
    },
    [],
  );

  // Species names come from the backend registry (single source of truth)
  // via the shared, 24h-cached species config query.
  const { data: speciesConfigData } = useSpeciesConfig();
  const activeSpeciesName = useMemo(() => {
    if (!speciesLayerState.speciesId) return '';
    return (
      speciesConfigData?.species.find(
        (s) => s.id === speciesLayerState.speciesId,
      )?.commonName ?? ''
    );
  }, [speciesLayerState.speciesId, speciesConfigData]);

  const [speciesFlyTarget, setSpeciesFlyTarget] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  /**
   * Receives the target coordinates from SpeciesSpotlightWidget
   * when the active species changes. Passes them to Map via
   * props so the map can fly to the species' primary region.
   */
  const handleSpeciesSelect = useCallback(
    (center: { lng: number; lat: number }) => {
      setSpeciesFlyTarget(center);
    },
    [],
  );

  // Partner layer state
  const [partnerLayerEnabled, setPartnerLayerEnabled] = useState(true);

  const handlePartnerLayerToggle = useCallback(
    (enabled: boolean) => {
      setPartnerLayerEnabled(enabled);
      try {
        posthog?.capture('partner_layer_toggled', { enabled });
      } catch (error) {
        console.error('Failed to capture partner_layer_toggled event:', error);
      }
    },
    [posthog],
  );

  // Mangrove layer state — on by default so the habitat extent
  // overlay is visible when the map loads (user can toggle it off).
  const [mangroveLayerEnabled, setMangroveLayerEnabled] = useState(true);

  const handleMangroveLayerToggle = useCallback(
    (enabled: boolean) => {
      setMangroveLayerEnabled(enabled);
      try {
        posthog?.capture('mangrove_layer_toggled', { enabled });
      } catch (error) {
        console.error('Failed to capture mangrove_layer_toggled event:', error);
      }
    },
    [posthog],
  );

  const [localSiteLayerEnabled, setLocalSiteLayerEnabled] = useState(true);

  const handleLocalSiteLayerToggle = useCallback((enabled: boolean) => {
    setLocalSiteLayerEnabled(enabled);
  }, []);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [proximityAssociatedSiteId, setProximityAssociatedSiteId] = useState<
    string | null
  >(null);

  const [siteFlyTarget, setSiteFlyTarget] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [partnerFlyTarget, setPartnerFlyTarget] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [resetViewSignal, setResetViewSignal] = useState(0);

  // Clicked partner state
  const [clickedPartnerId, setClickedPartnerId] = useState<string | null>(null);
  const { data: partnersData, isLoading: isPartnersLoading } = usePartners();

  const handlePartnerClick = useCallback(
    (partnerId: string) => {
      setClickedPartnerId(partnerId);
      setPanelActiveTab('biodiversity');
      setScrollToPartnerSignal((c) => c + 1);
      const partner = partnersData?.partners.find((p) => p.id === partnerId);
      if (partner) {
        setPartnerFlyTarget({
          lng: partner.coordinates[0],
          lat: partner.coordinates[1],
        });
      }
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab('biodiversity');
      }
      try {
        posthog?.capture('partner_marker_clicked', { partner_id: partnerId });
        posthog?.capture('panel_tab_changed', {
          tab: 'biodiversity',
          trigger: 'partner_click',
          is_mobile: window.innerWidth < MOBILE_BREAKPOINT,
          had_cell_selected: selectedCellId !== null,
        });
      } catch (error) {
        console.error(
          'Failed to capture partner click analytics events:',
          error,
        );
      }
    },
    [posthog, selectedCellId, partnersData],
  );

  const handleSiteSelect = useCallback(
    (siteId: string) => {
      setSelectedSiteId(siteId);
      setPanelActiveTab('analysis');
      setScrollToLocalDataSignal(Date.now());
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab('analysis');
      }
      try {
        posthog?.capture('panel_tab_changed', {
          tab: 'analysis',
          trigger: 'site_select',
          is_mobile: window.innerWidth < MOBILE_BREAKPOINT,
          had_cell_selected: selectedCellId !== null,
        });
      } catch (error) {
        console.error('Failed to capture panel_tab_changed event:', error);
      }

      const site = localSites.find((s) => s.id === siteId);
      if (!site) return;

      setSiteFlyTarget({
        lng: site.coordinates[0],
        lat: site.coordinates[1],
      });

      // geojson is stable after initial load — set once
      // in useScientificData setState and never updated.
      // Safe to include in the dependency array without
      // risk of unnecessary re-creation.
      if (geojson) {
        // Use point-in-polygon against GeoJSON features
        // to find the containing cell — more reliable
        // than distance-based lookup since RichGridCell
        // has no centerCoords populated at App level.
        const cellId = findCellContainingPoint(
          site.coordinates[1], // latitude
          site.coordinates[0], // longitude
          geojson,
        );

        if (cellId !== null) {
          setSelectedCellId(cellId);
        } else {
          // Site coordinates don't fall within any grid
          // cell (e.g. coastal edge case). Local data
          // widget still shows correctly without a cell.
          console.warn(
            `handleSiteSelect: no grid cell found ` +
              `containing site "${siteId}" at ` +
              `[${site.coordinates[1]}, ` +
              `${site.coordinates[0]}]`,
          );
        }
      }
    },
    [localSites, geojson, setSelectedCellId, posthog, selectedCellId],
  );

  const handleSiteClickFromMap = useCallback(
    (siteId: string) => {
      const site = localSites.find((s) => s.id === siteId);
      try {
        posthog?.capture('local_site_selected', {
          site_id: siteId,
          site_name: site?.name ?? null,
          site_country: site?.country ?? null,
          partner_id: site?.partnerId ?? null,
          trigger_source: 'map_pin',
          had_cell_selected: selectedCellId !== null,
        });
      } catch (error) {
        console.error('Failed to capture local_site_selected event:', error);
      }
      handleSiteSelect(siteId);
    },
    [localSites, posthog, selectedCellId, handleSiteSelect],
  );

  // Custom hooks for derived Logic (Thin Provider pattern)
  const typologyScaleNumber = useTypologyScale(filterState.typologyScale);

  // Derived selection object
  const selectedCell = useSelectedCell(selectedCellId, gridCells, geojson);

  /**
   * Derives the local site context for the AI assistant
   * when a monitoring site is selected or proximity-associated.
   * Uses the most recent available year. Returns null when no
   * site is selected, no data is available, the site is
   * geographically distant from the selected cell, or all
   * conditions have zero samples (no field data collected).
   *
   * Partner institution name is resolved from the partners
   * API — the AI receives the full name rather than the
   * partner ID slug.
   */
  const localSiteContext = useMemo((): LocalSiteContext | null => {
    const effectiveSiteId = selectedSiteId ?? proximityAssociatedSiteId;
    if (!effectiveSiteId || !localSites.length) return null;

    const site = localSites.find((s) => s.id === effectiveSiteId);
    if (!site || !site.observations.length) return null;

    // Guard: only send local context when the site is
    // geographically relevant to the selected cell.
    // Use selectedCell.centerCoords when available,
    // fall back to the GeoJSON feature bbox center.
    // If neither is available, skip the guard — this
    // is a known limitation when geojson is not yet
    // loaded.
    let cellLat: number | null = null;
    let cellLng: number | null = null;

    if (selectedCell?.centerCoords) {
      cellLat = selectedCell.centerCoords.latitude;
      cellLng = selectedCell.centerCoords.longitude;
    } else if (geojson && selectedCellId) {
      const feature = geojson.features.find(
        (f) => f.properties.ID === selectedCellId,
      );
      if (feature) {
        const center = getFeatureCenterCoords(feature);
        cellLat = center.latitude;
        cellLng = center.longitude;
      }
    }

    if (cellLat !== null && cellLng !== null) {
      const distanceKm = calculateDistance(
        cellLat,
        cellLng,
        site.coordinates[1], // latitude
        site.coordinates[0], // longitude
      );
      if (distanceKm > MAX_SITE_ASSOCIATION_DISTANCE_KM) {
        return null;
      }
    }

    // availableYears is sorted ascending in
    // deriveLocalWetlands — .at(-1) safely returns
    // the most recent year.
    const year = site.availableYears.at(-1) ?? null;
    if (!year) return null;

    // Filter out conditions with no samples — zero samplesN indicates
    // no field data was collected for that condition in this year.
    const conditions = aggregateByCondition(site.observations, year).filter(
      (c) => c.samplesN > 0,
    );

    if (!conditions.length) return null;

    // Wait for partners data to load before sending
    // local context to the AI — prevents the AI
    // receiving a partner ID slug instead of the full
    // institution name. Once loaded the memo re-runs
    // with the correct name and the query updates.
    if (site.partnerId && !partnersData?.partners) {
      return null;
    }

    const partnerName = site.partnerId
      ? (partnersData?.partners.find((p) => p.id === site.partnerId)
          ?.institution ?? site.name)
      : site.name;

    return {
      siteName: site.name,
      country: site.country,
      partner: partnerName,
      year,
      conditions,
    };
  }, [
    selectedSiteId,
    proximityAssociatedSiteId,
    localSites,
    partnersData,
    selectedCell,
    selectedCellId,
    geojson,
  ]);

  /**
   * True only when the effective site has a partnerId that
   * requires partner data to resolve — sites with no partner
   * mapping are already complete without it.
   * False for plain cell selections with no associated site
   * so those queries are not delayed.
   */
  const pendingSiteId = selectedSiteId ?? proximityAssociatedSiteId;
  const pendingSite = pendingSiteId
    ? localSites.find((s) => s.id === pendingSiteId)
    : null;
  const isLocalContextPending = !!pendingSite?.partnerId && isPartnersLoading;

  // Analytics hooks
  useSelectionAnalytics(selectedCell);
  useFilterAnalytics(filterState);

  // 1. Filter grid cells based on UI controls
  const filteredGridCells = useFilteredGridCells(gridCells || [], filterState);

  // 1a. Fetch backend statistics for the selected cell (Single Source of Truth)
  const { data: cellStats } = useGlobalStatistics(selectedCellId);

  // 2. Calculate distributions for widgets based on filtered cells
  const distributions = useIndicatorDistributions(
    filteredGridCells,
    indicators,
    filterState,
    selectedCellId,
    filterState.quantile,
    typologyScaleNumber,
    cellStats?.statistics,
  );

  // Event handlers
  const handleCellSelect = useCallback(
    (id: number | null) => {
      setSelectedCellId(id);
      setClickedPartnerId(null);
      setSelectedSiteId(null);
      setProximityAssociatedSiteId(null);
      if (id !== null) {
        cellCountInSession.current += 1;
        setAnalysisTabVisited(false);
      }
      if (id !== null && window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab('biodiversity');
        setPanelActiveTab('biodiversity');
      }
    },
    [setSelectedCellId],
  );

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileActiveTab(tab);
    if (tab === 'biodiversity' || tab === 'analysis') {
      setPanelActiveTab(tab);
    }
    if (tab === 'analysis') {
      setAnalysisTabVisited(true);
      setScrollToTopSignal(Date.now());
    }
    try {
      posthog?.capture('panel_tab_changed', {
        tab,
        trigger: 'manual_click',
        is_mobile: true,
        had_cell_selected: selectedCellId !== null,
      });
    } catch (error) {
      console.error('Failed to capture panel_tab_changed event:', error);
    }
  };

  const handlePanelTabChange = useCallback(
    (tab: 'analysis' | 'biodiversity') => {
      setPanelActiveTab(tab);
      if (tab === 'analysis') {
        setAnalysisTabVisited(true);
        setScrollToTopSignal(Date.now());
      }
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab(tab);
      }
      try {
        posthog?.capture('panel_tab_changed', {
          tab,
          trigger: 'manual_click',
          is_mobile: window.innerWidth < MOBILE_BREAKPOINT,
          had_cell_selected: selectedCellId !== null,
        });
      } catch (error) {
        console.error('Failed to capture panel_tab_changed event:', error);
      }
    },
    [posthog, selectedCellId],
  );

  const handleClearSelection = useCallback(() => {
    try {
      posthog?.capture('cell_selection_cleared', {
        previous_cell_id:
          selectedCellId !== null ? String(selectedCellId) : null,
        previous_cell_country: selectedCell?.country ?? null,
        cell_count_in_session: cellCountInSession.current,
        active_tab: panelActiveTab,
        trigger: 'clear_button',
      });
    } catch (error) {
      console.error('Failed to capture cell_selection_cleared event:', error);
    }
    cellCountInSession.current = 0;
    setSelectedCellId(null);
    setClickedPartnerId(null);
    setSelectedSiteId(null);
    setProximityAssociatedSiteId(null);
  }, [
    setSelectedCellId,
    posthog,
    selectedCellId,
    selectedCell,
    panelActiveTab,
  ]);

  const handleReset = useCallback(() => {
    try {
      posthog?.capture('cell_selection_cleared', {
        previous_cell_id:
          selectedCellId !== null ? String(selectedCellId) : null,
        previous_cell_country: selectedCell?.country ?? null,
        cell_count_in_session: cellCountInSession.current,
        active_tab: panelActiveTab,
        trigger: 'logo_reset',
      });
    } catch (error) {
      console.error('Failed to capture cell_selection_cleared event:', error);
    }
    cellCountInSession.current = 0;
    setSelectedCellId(null);
    setClickedPartnerId(null);
    setSelectedSiteId(null);
    setProximityAssociatedSiteId(null);
    setMobileActiveTab('map');
    setPanelActiveTab('biodiversity');
    setSpeciesLayerState({ speciesId: '', observations: [], enabled: false });
    setSpeciesFlyTarget(null);
    setSiteFlyTarget(null);
    setResetViewSignal((s) => s + 1);
  }, [
    posthog,
    selectedCellId,
    selectedCell,
    panelActiveTab,
    setSelectedCellId,
  ]);

  const handleLocationSearched = useCallback(
    (coords: { lng: number; lat: number }) => {
      try {
        posthog?.capture('location_searched', { result_coordinates: coords });
      } catch (error) {
        console.error('Failed to capture location_searched event:', error);
      }
    },
    [posthog],
  );

  const handleLocationSearchCleared = useCallback(() => {
    try {
      posthog?.capture('location_search_cleared');
    } catch (error) {
      console.error('Failed to capture location_search_cleared event:', error);
    }
  }, [posthog]);

  // Render map area
  const mapArea = useMemo(
    () =>
      isLoading ? (
        <LoadingState />
      ) : (
        <Map
          allGridCells={gridCells || []}
          filteredGridCells={filteredGridCells}
          geojson={geojson!}
          typologies={typologies!}
          selectedCellId={selectedCellId}
          selectedCell={selectedCell}
          typologyScale={filterState.typologyScale}
          onCellSelect={handleCellSelect}
          activeObservations={speciesLayerState.observations}
          activeSpeciesId={speciesLayerState.speciesId}
          activeSpeciesName={activeSpeciesName}
          speciesLayerEnabled={speciesLayerState.enabled}
          partnerLayerEnabled={partnerLayerEnabled}
          mangroveLayerEnabled={mangroveLayerEnabled}
          speciesFlyTarget={speciesFlyTarget}
          onSpeciesFlyComplete={() => setSpeciesFlyTarget(null)}
          onPartnerClick={handlePartnerClick}
          localSites={localSites}
          localSiteLayerEnabled={localSiteLayerEnabled}
          selectedSiteId={selectedSiteId}
          onSiteClick={handleSiteClickFromMap}
          siteFlyTarget={siteFlyTarget}
          onSiteFlyComplete={() => setSiteFlyTarget(null)}
          partnerFlyTarget={partnerFlyTarget}
          onPartnerFlyComplete={() => setPartnerFlyTarget(null)}
          onLocationSearched={handleLocationSearched}
          onLocationSearchCleared={handleLocationSearchCleared}
          resetViewSignal={resetViewSignal}
        />
      ),
    [
      isLoading,
      gridCells,
      filteredGridCells,
      geojson,
      typologies,
      selectedCellId,
      selectedCell,
      filterState.typologyScale,
      handleCellSelect,
      speciesLayerState,
      activeSpeciesName,
      partnerLayerEnabled,
      mangroveLayerEnabled,
      speciesFlyTarget,
      handlePartnerClick,
      localSites,
      localSiteLayerEnabled,
      selectedSiteId,
      handleSiteClickFromMap,
      siteFlyTarget,
      partnerFlyTarget,
      handleLocationSearched,
      handleLocationSearchCleared,
      resetViewSignal,
    ],
  );

  const showAnalysisBadge = !!selectedCell && !analysisTabVisited;

  // Render side panel
  const sidePanel = useMemo(
    () => (
      <SidePanel
        filterState={filterState}
        onFilterChange={setFilterState}
        selectedCell={selectedCell}
        onClearSelection={handleClearSelection}
        typologies={typologies || { scale5: {}, scale18: {} }}
        distributions={distributions}
        statisticalSummaries={cellStats?.statistics?.summaries}
        isLoading={isLoading}
        visibleCellCount={filteredGridCells.filter((c) => c.mangroves).length}
        onSpeciesLayerToggle={handleSpeciesLayerToggle}
        onPartnerLayerToggle={handlePartnerLayerToggle}
        partnerLayerEnabled={partnerLayerEnabled}
        onMangroveLayerToggle={handleMangroveLayerToggle}
        mangroveLayerEnabled={mangroveLayerEnabled}
        onSpeciesSelect={handleSpeciesSelect}
        activeTab={panelActiveTab}
        onTabChange={handlePanelTabChange}
        clickedPartnerId={clickedPartnerId}
        localSites={localSites}
        selectedSiteId={selectedSiteId}
        onSiteSelect={handleSiteSelect}
        localSiteLayerEnabled={localSiteLayerEnabled}
        onLocalSiteLayerToggle={handleLocalSiteLayerToggle}
        // Intentionally aliases onSiteSelect — both trigger the same site
        // selection and tab switch. If these use cases ever diverge (e.g.
        // onViewLocalData should not fly-to the site), split the callback.
        onViewLocalData={handleSiteSelect}
        localSiteContext={localSiteContext}
        isLocalContextPending={isLocalContextPending}
        speciesConfig={speciesConfigData?.species ?? []}
        partners={partnersData?.partners ?? []}
        onSiteAssociated={setProximityAssociatedSiteId}
        scrollToLocalDataSignal={scrollToLocalDataSignal}
        scrollToPartnerSignal={scrollToPartnerSignal}
        scrollToTopSignal={scrollToTopSignal}
        showAnalysisBadge={showAnalysisBadge}
      />
    ),
    [
      filterState,
      setFilterState,
      selectedCell,
      handleClearSelection,
      typologies,
      distributions,
      cellStats,
      isLoading,
      filteredGridCells,
      handleSpeciesLayerToggle,
      handlePartnerLayerToggle,
      partnerLayerEnabled,
      handleMangroveLayerToggle,
      mangroveLayerEnabled,
      handleSpeciesSelect,
      panelActiveTab,
      handlePanelTabChange,
      clickedPartnerId,
      localSites,
      selectedSiteId,
      handleSiteSelect,
      localSiteLayerEnabled,
      handleLocalSiteLayerToggle,
      localSiteContext,
      isLocalContextPending,
      speciesConfigData,
      partnersData,
      scrollToLocalDataSignal,
      scrollToPartnerSignal,
      scrollToTopSignal,
      showAnalysisBadge,
    ],
  );

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-50 text-gray-500">
        <div className="text-center space-y-2">
          <p className="font-medium text-gray-700">
            Unable to load scientific data.
          </p>
          <p className="text-xs text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeModal />
      <AppLayout
        topBar={<TopBar onLogoClick={handleReset} />}
        mapArea={mapArea}
        sidePanel={sidePanel}
        mobileActiveTab={mobileActiveTab}
        onMobileTabChange={handleMobileTabChange}
        showAnalysisBadge={showAnalysisBadge}
      />
    </>
  );
}

/**
 * Main App Entry Point
 * Wraps the shell in providers
 */
function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}

export default App;

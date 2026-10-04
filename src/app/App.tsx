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
import { useDatasetSkew } from '@/data/hooks/useDatasetSkew';
import { usePartners } from '@/api/hooks/usePartners';
import { useSpeciesConfig } from '@/api/hooks/useSpeciesConfig';

// App Components
import { AppLayout } from './components/AppLayout';
import { WelcomeModal } from './components/WelcomeModal';
import { LoadingState } from './components/LoadingState';
import { DataUnavailable } from './components/DataUnavailable';
import { SidePanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';

// App Hooks, Constants & Types
import { MOBILE_BREAKPOINT } from './constants/app.constants';
import { useEntryMode } from './hooks/useEntryMode';
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
    localDataUpdated,
    isLoading,
    error,
    retry,
  } = useData();
  const { skewActive } = useDatasetSkew();
  const { filterState, setFilterState } = useFilter();

  // Workflow mode from `?mode=local|global` (GLO-207). Global is the default
  // and matches the app's behaviour before the split.
  const { entryMode, siteParam, enterLocalSite, replaceSiteParam } =
    useEntryMode();
  const isLocalMode = entryMode === 'local';

  // Local mode never has a selected grid cell: the stored selection is masked
  // here (the only reader of the selection context), so no global cell data
  // can reach the local view. Returning to Global restores the stored cell.
  const { selectedCellId: storedCellId, setSelectedCellId } = useSelection();
  const selectedCellId = isLocalMode ? null : storedCellId;

  // Local UI state (layout only). Both entry points open on the Analysis tab.
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('analysis');
  const [panelActiveTab, setPanelActiveTab] = useState<
    'analysis' | 'biodiversity'
  >('analysis');
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

  // Monitoring-location pins: on by default in Local mode, off in Global
  // (where they're an opt-in overlay). Local mode forces them on regardless.
  const [localSiteLayerEnabled, setLocalSiteLayerEnabled] = useState(
    () => entryMode === 'local',
  );
  const effectiveLocalSiteLayerEnabled = isLocalMode || localSiteLayerEnabled;

  const handleLocalSiteLayerToggle = useCallback((enabled: boolean) => {
    setLocalSiteLayerEnabled(enabled);
  }, []);

  // The selected monitoring site is the `?site=` param, in Local mode only.
  // Global mode never has a selected site — pins cross-link into Local.
  // Unknown ids resolve to no selection.
  const selectedSiteId =
    isLocalMode && siteParam && localSites.some((s) => s.id === siteParam)
      ? siteParam
      : null;

  const [siteFlyTarget, setSiteFlyTarget] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [partnerFlyTarget, setPartnerFlyTarget] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [resetViewSignal, setResetViewSignal] = useState(0);

  // Fly to the selected site whenever it changes, including on initial load
  // and after a cross-link (render-phase update, no effect needed).
  const [flownToSiteId, setFlownToSiteId] = useState<string | null>(null);
  if (selectedSiteId !== flownToSiteId) {
    setFlownToSiteId(selectedSiteId);
    const site = localSites.find((s) => s.id === selectedSiteId);
    if (site) {
      setSiteFlyTarget({ lng: site.coordinates[0], lat: site.coordinates[1] });
    }
  }

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

  /**
   * Selects a monitoring site in Local mode: flies to it, opens the Analysis
   * tab and keeps `?site=` in step. Deliberately never selects the grid cell
   * containing the site — that side effect used to pull global cell data into
   * the local view (GLO-207).
   */
  const handleSiteSelect = useCallback(
    (siteId: string) => {
      replaceSiteParam(siteId);
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
    },
    [localSites, posthog, selectedCellId, replaceSiteParam],
  );

  /**
   * Opens a site from Global mode by cross-linking to
   * `?mode=local&site=<id>`. The URL change alone selects the site (see
   * selectedSiteId) and masks the grid cell, so the transition never
   * carries global cell data into the local view.
   */
  const handleEnterLocalSite = useCallback(
    (siteId: string) => {
      enterLocalSite(siteId);
      setPanelActiveTab('analysis');
      setScrollToLocalDataSignal(Date.now());
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab('analysis');
      }
    },
    [enterLocalSite],
  );

  // Pin clicks and the Partner widget's "View local data" cross-link in
  // Global mode (the local widget no longer exists there), and select the
  // site directly in Local mode.
  const openSite = isLocalMode ? handleSiteSelect : handleEnterLocalSite;

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
          mode: entryMode,
        });
      } catch (error) {
        console.error('Failed to capture local_site_selected event:', error);
      }
      openSite(siteId);
    },
    [localSites, posthog, selectedCellId, openSite, entryMode],
  );

  // Custom hooks for derived Logic (Thin Provider pattern)
  const typologyScaleNumber = useTypologyScale(filterState.typologyScale);

  // Derived selection object
  const selectedCell = useSelectedCell(selectedCellId, gridCells, geojson);

  /**
   * Derives the local site context for the AI assistant from the selected
   * monitoring site. Local mode only — Global mode never sends local data,
   * so the two are never blended (GLO-207). Uses the most recent available
   * year. Returns null when no site is selected, no data is available, or
   * all conditions have zero samples (no field data collected).
   *
   * Partner institution name is resolved from the partners
   * API — the AI receives the full name rather than the
   * partner ID slug.
   */
  const localSiteContext = useMemo((): LocalSiteContext | null => {
    if (!isLocalMode || !selectedSiteId || !localSites.length) return null;

    const site = localSites.find((s) => s.id === selectedSiteId);
    if (!site || !site.observations.length) return null;

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
  }, [isLocalMode, selectedSiteId, localSites, partnersData]);

  /**
   * True only when the selected site has a partnerId that
   * requires partner data to resolve — sites with no partner
   * mapping are already complete without it.
   */
  const pendingSite =
    isLocalMode && selectedSiteId
      ? localSites.find((s) => s.id === selectedSiteId)
      : null;
  const isLocalContextPending = !!pendingSite?.partnerId && isPartnersLoading;

  // Analytics hooks
  useSelectionAnalytics(selectedCell);
  useFilterAnalytics(filterState);

  // 1. Filter grid cells based on UI controls
  const filteredGridCells = useFilteredGridCells(gridCells || [], filterState);

  // 1a. Fetch backend statistics for the selected cell (Single Source of Truth)
  // Suppress statistics during version skew — the backend context may disagree
  // with the map, so we hold rather than show stale numbers.
  const { data: cellStats } = useGlobalStatistics(
    skewActive ? null : selectedCellId,
  );

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
    if (isLocalMode) replaceSiteParam(null);
    setMobileActiveTab('map');
    setPanelActiveTab('analysis');
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
    isLocalMode,
    replaceSiteParam,
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

  // Render map area. Loading/error are handled by the top-level three-way
  // render below, so this only ever renders the map itself.
  const mapArea = useMemo(
    () => (
      <Map
        mode={entryMode}
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
        localSiteLayerEnabled={effectiveLocalSiteLayerEnabled}
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
      entryMode,
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
      effectiveLocalSiteLayerEnabled,
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
        mode={entryMode}
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
        localDataUpdated={localDataUpdated}
        selectedSiteId={selectedSiteId}
        onSiteSelect={handleSiteSelect}
        localSiteLayerEnabled={effectiveLocalSiteLayerEnabled}
        onLocalSiteLayerToggle={handleLocalSiteLayerToggle}
        // Global: cross-links to Local mode for the site (the local widget
        // isn't shown in Global). Local: selects the site and opens Analysis.
        onViewLocalData={openSite}
        localSiteContext={localSiteContext}
        isLocalContextPending={isLocalContextPending}
        speciesConfig={speciesConfigData?.species ?? []}
        partners={partnersData?.partners ?? []}
        scrollToLocalDataSignal={scrollToLocalDataSignal}
        scrollToPartnerSignal={scrollToPartnerSignal}
        scrollToTopSignal={scrollToTopSignal}
        showAnalysisBadge={showAnalysisBadge}
        dataSkewed={skewActive}
      />
    ),
    [
      entryMode,
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
      localDataUpdated,
      selectedSiteId,
      handleSiteSelect,
      openSite,
      effectiveLocalSiteLayerEnabled,
      handleLocalSiteLayerToggle,
      localSiteContext,
      isLocalContextPending,
      speciesConfigData,
      partnersData,
      scrollToLocalDataSignal,
      scrollToPartnerSignal,
      scrollToTopSignal,
      showAnalysisBadge,
      skewActive,
    ],
  );

  // Three-way top-level render: loading, error (never a blank map), else app.
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <DataUnavailable error={error} onRetry={retry} />;
  }

  return (
    <>
      <WelcomeModal mode={entryMode} />
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

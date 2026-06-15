import { useState, useCallback, useMemo } from 'react';

// Context
import { AppProviders } from '@/app/AppProviders';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/context/FilterContext';
import { useSelection } from '@/context/SelectionContext';

// Types
import type { ObservationPoint } from '@/api/species';
import type { LocalSiteContext } from '@/api/types';

// Data
import { SPECIES_SPOTLIGHT_DATA } from '@/data/speciesSpotlight';
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
import { calculateDistance } from '@/utils/geo';
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
import { findNearestGridCell } from '@/utils/geo';
import { useTypologyScale } from './hooks/useTypologyScale';
import type { MobileTab } from './types/app.types';

/**
 * Inner App component that consumes contexts
 * Handles derived state and layout orchestration
 */
function AppShell() {
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
  const [mobileActiveTab, setMobileActiveTab] =
    useState<MobileTab>('biodiversity');
  const [panelActiveTab, setPanelActiveTab] = useState<
    'analysis' | 'biodiversity'
  >('biodiversity');

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

  const activeSpeciesName = useMemo(() => {
    if (!speciesLayerState.speciesId) return '';
    return (
      SPECIES_SPOTLIGHT_DATA.find((s) => s.id === speciesLayerState.speciesId)
        ?.commonName ?? ''
    );
  }, [speciesLayerState.speciesId]);

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

  const handlePartnerLayerToggle = useCallback((enabled: boolean) => {
    setPartnerLayerEnabled(enabled);
  }, []);

  // Mangrove layer state
  const [mangroveLayerEnabled, setMangroveLayerEnabled] = useState(false);

  const handleMangroveLayerToggle = useCallback((enabled: boolean) => {
    setMangroveLayerEnabled(enabled);
  }, []);

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

  // Clicked partner state
  const [clickedPartnerId, setClickedPartnerId] = useState<string | null>(null);

  const handlePartnerClick = useCallback((partnerId: string) => {
    setClickedPartnerId(partnerId);
    setPanelActiveTab('biodiversity');
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setMobileActiveTab('biodiversity');
    }
  }, []);

  const handleSiteSelect = useCallback(
    (siteId: string) => {
      console.log('[handleSiteSelect] siteId', siteId);
      setSelectedSiteId(siteId);
      setPanelActiveTab('analysis');
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab('analysis');
      }
      const site = localSites.find((s) => s.id === siteId);
      console.log('[handleSiteSelect] site:', site);
      if (site) {
        setSiteFlyTarget({
          lng: site.coordinates[0],
          lat: site.coordinates[1],
        });
        if (gridCells?.length) {
          const nearest = findNearestGridCell(
            site.coordinates[1], // latitude
            site.coordinates[0], // longitude
            gridCells,
          );
          console.log(
            '[handleSiteSelect] nearest cell:',
            nearest?.cell.id,
            nearest?.distanceKm,
          );
          if (nearest) {
            setSelectedCellId(nearest.cell.id);
          }
        }
      }
    },
    [localSites, gridCells, setSelectedCellId],
  );

  const { data: partnersData, isLoading: isPartnersLoading } = usePartners();

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

    // Only send local context when the site is within
    // range of the selected cell — prevents sending
    // geographically irrelevant field data to the AI
    // (e.g. Philippines crab data for a South African
    // cell).
    if (selectedCell?.centerCoords) {
      const distanceKm = calculateDistance(
        selectedCell.centerCoords.latitude,
        selectedCell.centerCoords.longitude,
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
  ]);

  /**
   * True only when an effective site is selected and the partners
   * API hasn't resolved yet — prevents the AI query
   * firing without local context then re-firing with it.
   * False for plain cell selections with no associated
   * site so those queries are not delayed.
   */
  const isLocalContextPending =
    (!!selectedSiteId || !!proximityAssociatedSiteId) && isPartnersLoading;

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
      // Auto-switch to Analysis tab on mobile
      if (id && window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab('analysis');
        setPanelActiveTab('analysis');
      }
    },
    [setSelectedCellId],
  );

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileActiveTab(tab);
    // Sync panel tab state when switching mobile tabs
    if (tab === 'biodiversity' || tab === 'analysis') {
      setPanelActiveTab(tab);
    }
  };

  const handlePanelTabChange = useCallback(
    (tab: 'analysis' | 'biodiversity') => {
      setPanelActiveTab(tab);
      // On mobile, sync the bottom nav when panel tabs are switched
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setMobileActiveTab(tab);
      }
    },
    [],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedCellId(null);
    setClickedPartnerId(null);
    setSelectedSiteId(null);
    setProximityAssociatedSiteId(null);
  }, [setSelectedCellId]);

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
          onSiteClick={handleSiteSelect}
          siteFlyTarget={siteFlyTarget}
          onSiteFlyComplete={() => setSiteFlyTarget(null)}
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
      handleSiteSelect,
      siteFlyTarget,
    ],
  );

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
        visibleCellCount={filteredGridCells.length}
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
        onSiteAssociated={setProximityAssociatedSiteId}
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
      filteredGridCells.length,
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
        topBar={<TopBar />}
        mapArea={mapArea}
        sidePanel={sidePanel}
        mobileActiveTab={mobileActiveTab}
        onMobileTabChange={handleMobileTabChange}
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

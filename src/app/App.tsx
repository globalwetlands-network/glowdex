import { useState, useCallback, useMemo } from 'react';

// Context
import { AppProviders } from '@/app/AppProviders';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/context/FilterContext';
import { useSelection } from '@/context/SelectionContext';

// Types
import type { ObservationPoint } from '@/api/species';

// Data
import { SPECIES_SPOTLIGHT_DATA } from '@/data/speciesSpotlight';

// Feature Hooks & Components
import {
  useFilterAnalytics,
  useSelectionAnalytics,
} from '@/features/analytics';
import { GridMap as Map } from '@/features/map/components/Map';
import { useFilteredGridCells } from '@/features/widgets/hooks/useFilteredGridCells';
import { useIndicatorDistributions } from '@/features/widgets/hooks/useIndicatorDistributions';
import { useStatistics } from '@/data/hooks/useStatistics';

// App Components
import { AppLayout } from './components/AppLayout';
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
  // Context consumption
  const { gridCells, geojson, typologies, indicators, isLoading, error } =
    useData();
  const { filterState, setFilterState } = useFilter();
  const { selectedCellId, setSelectedCellId } = useSelection();

  // Local UI state (layout only)
  const [mobileActiveTab, setMobileActiveTab] =
    useState<MobileTab>('biodiversity');
  const [panelActiveTab, setPanelActiveTab] = useState<
    'analysis' | 'biodiversity'
  >('biodiversity');

  // Species layer state
  const [activeSpeciesId, setActiveSpeciesId] = useState('');
  const [speciesLayerEnabled, setSpeciesLayerEnabled] = useState(false);
  const [activeObservations, setActiveObservations] = useState<
    ObservationPoint[]
  >([]);

  const handleSpeciesLayerToggle = useCallback(
    (speciesId: string, observations: ObservationPoint[], enabled: boolean) => {
      setActiveSpeciesId(speciesId);
      setActiveObservations(observations);
      setSpeciesLayerEnabled(enabled);
    },
    [],
  );

  const activeSpeciesName = useMemo(() => {
    if (!activeSpeciesId) return '';
    return (
      SPECIES_SPOTLIGHT_DATA.find((s) => s.id === activeSpeciesId)
        ?.commonName ?? ''
    );
  }, [activeSpeciesId]);

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

  // Hub layer state
  const [hubLayerEnabled, setHubLayerEnabled] = useState(true);

  const handleHubLayerToggle = useCallback((enabled: boolean) => {
    setHubLayerEnabled(enabled);
  }, []);

  // Mangrove layer state
  const [mangroveLayerEnabled, setMangroveLayerEnabled] = useState(false);

  const handleMangroveLayerToggle = useCallback((enabled: boolean) => {
    setMangroveLayerEnabled(enabled);
  }, []);

  // Custom hooks for derived Logic (Thin Provider pattern)
  const typologyScaleNumber = useTypologyScale(filterState.typologyScale);

  // Derived selection object
  const selectedCell = useSelectedCell(selectedCellId, gridCells, geojson);

  // Analytics hooks
  useSelectionAnalytics(selectedCell);
  useFilterAnalytics(filterState);

  // 1. Filter grid cells based on UI controls
  const filteredGridCells = useFilteredGridCells(gridCells || [], filterState);

  // 1a. Fetch backend statistics for the selected cell (Single Source of Truth)
  const { data: cellStats } = useStatistics(selectedCellId);

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
          activeObservations={activeObservations}
          activeSpeciesId={activeSpeciesId}
          activeSpeciesName={activeSpeciesName}
          speciesLayerEnabled={speciesLayerEnabled}
          hubLayerEnabled={hubLayerEnabled}
          mangroveLayerEnabled={mangroveLayerEnabled}
          speciesFlyTarget={speciesFlyTarget}
          onSpeciesFlyComplete={() => setSpeciesFlyTarget(null)}
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
      activeObservations,
      activeSpeciesId,
      activeSpeciesName,
      speciesLayerEnabled,
      hubLayerEnabled,
      mangroveLayerEnabled,
      speciesFlyTarget,
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
        onHubLayerToggle={handleHubLayerToggle}
        hubLayerEnabled={hubLayerEnabled}
        onMangroveLayerToggle={handleMangroveLayerToggle}
        mangroveLayerEnabled={mangroveLayerEnabled}
        onSpeciesSelect={handleSpeciesSelect}
        activeTab={panelActiveTab}
        onTabChange={handlePanelTabChange}
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
      handleHubLayerToggle,
      hubLayerEnabled,
      handleMangroveLayerToggle,
      mangroveLayerEnabled,
      handleSpeciesSelect,
      panelActiveTab,
      handlePanelTabChange,
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
    <AppLayout
      topBar={<TopBar />}
      mapArea={mapArea}
      sidePanel={sidePanel}
      mobileActiveTab={mobileActiveTab}
      onMobileTabChange={handleMobileTabChange}
    />
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

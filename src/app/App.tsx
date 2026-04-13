import { useState, useCallback } from 'react';

// Context
import { AppProviders } from '@/app/AppProviders';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/context/FilterContext';
import { useSelection } from '@/context/SelectionContext';

// Types
import type { SpeciesDistribution } from '@/data/speciesSpotlight';
import type { ObservationPoint } from '@/api/species';

// Feature Hooks & Components
import {
  useFilterAnalytics,
  useSelectionAnalytics,
} from '@/features/analytics';
import { GridMap as Map } from '@/features/map/components/Map';
import { useFilteredGridCells } from '@/features/widgets/hooks/useFilteredGridCells';
import { useIndicatorDistributions } from '@/features/widgets/hooks/useIndicatorDistributions';
import { useGeolocationSelection } from '@/features/map/hooks/useGeolocationSelection';
import { useStatistics } from '@/data/hooks/useStatistics';

// App Components
import { AppLayout } from './components/AppLayout';
import { LoadingState } from './components/LoadingState';
import { SidePanel } from './components/SidePanel';

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
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('panel');

  // Species layer state
  const [activeSpeciesDistribution, setActiveSpeciesDistribution] =
    useState<SpeciesDistribution | null>(null);
  const [speciesLayerEnabled, setSpeciesLayerEnabled] = useState(false);
  const [activeObservations, setActiveObservations] = useState<
    ObservationPoint[]
  >([]);

  const handleSpeciesLayerToggle = useCallback(
    (
      distribution: SpeciesDistribution,
      enabled: boolean,
      observations: ObservationPoint[],
    ) => {
      setActiveSpeciesDistribution(distribution);
      setSpeciesLayerEnabled(enabled);
      setActiveObservations(observations);
    },
    [],
  );

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
  const handleCellSelect = (id: number | null) => {
    setSelectedCellId(id);
    // Auto-switch to Analysis tab on mobile
    if (id && window.innerWidth < MOBILE_BREAKPOINT) {
      setMobileActiveTab('panel');
    }
  };

  const handleClearSelection = () => {
    setSelectedCellId(null);
  };

  // Auto-select geolocation cell if nothing is selected yet
  useGeolocationSelection(
    gridCells || [],
    geojson,
    selectedCellId,
    handleCellSelect,
  );

  // Render map area
  const mapArea = isLoading ? (
    <LoadingState />
  ) : (
    <Map
      allGridCells={gridCells || []}
      filteredGridCells={filteredGridCells}
      geojson={geojson!}
      typologies={typologies!}
      selectedCellId={selectedCellId}
      typologyScale={filterState.typologyScale}
      onCellSelect={handleCellSelect}
      activeSpeciesDistribution={activeSpeciesDistribution}
      speciesLayerEnabled={speciesLayerEnabled}
      activeObservations={activeObservations}
    />
  );

  // Render side panel
  const sidePanel = (
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
    />
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
      mapArea={mapArea}
      sidePanel={sidePanel}
      mobileActiveTab={mobileActiveTab}
      onMobileTabChange={setMobileActiveTab}
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

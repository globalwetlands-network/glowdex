
import { useState } from 'react';

// Context
import { AppProviders } from '@/app/AppProviders';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/context/FilterContext';
import { useSelection } from '@/context/SelectionContext';

// Feature Hooks & Components
import { GridMap as Map } from '@/features/map/components/Map';
import { useFilteredGridCells } from '@/features/widgets/hooks/useFilteredGridCells';
import { useIndicatorDistributions } from '@/features/widgets/hooks/useIndicatorDistributions';

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
  const { gridCells, geojson, typologies, indicators, isLoading } = useData();
  const { filterState, setFilterState } = useFilter();
  const { selectedCellId, setSelectedCellId } = useSelection();

  // Local UI state (layout only)
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('panel');

  // Custom hooks for derived Logic (Thin Provider pattern)
  const typologyScaleNumber = useTypologyScale(filterState.typologyScale);

  // 1. Filter grid cells based on UI controls
  const filteredGridCells = useFilteredGridCells(gridCells || [], filterState);

  // 2. Calculate distributions for widgets based on filtered cells
  const distributions = useIndicatorDistributions(
    filteredGridCells,
    indicators,
    filterState,
    selectedCellId,
    filterState.quantile,
    typologyScaleNumber
  );

  // Derived selection object
  const selectedCell = useSelectedCell(selectedCellId, gridCells, geojson);

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

  // Render map area
  const mapArea = isLoading ? (
    <LoadingState />
  ) : (
    <Map
      gridCells={filteredGridCells}
      geojson={geojson!}
      typologies={typologies!}
      selectedCellId={selectedCellId}
      typologyScale={filterState.typologyScale}
      onCellSelect={handleCellSelect}
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
      isLoading={isLoading}
      visibleCellCount={filteredGridCells.length}
    />
  );

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

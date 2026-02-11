import { useState } from 'react';
import { GridMap as Map } from '@/features/map/components/Map';
import { useScientificData } from '@/data/hooks/useScientificData';
import { useIndicators } from '@/data/hooks/useIndicators';
import { useFilteredGridCells } from '@/features/widgets/hooks/useFilteredGridCells';
import { useIndicatorDistributions } from '@/features/widgets/hooks/useIndicatorDistributions';
import { INITIAL_FILTER_STATE, type FilterState } from '@/features/widgets/types/filter.types';

// App-specific hooks and components
import { useSelectedCell } from './hooks/useSelectedCell';
import { useMobilePanel } from './hooks/useMobilePanel';
import { useTypologyScale } from './hooks/useTypologyScale';
import { AppLayout } from './components/AppLayout';
import { SidePanel } from './components/SidePanel';
import { LoadingState } from './components/LoadingState';
import { MOBILE_BREAKPOINT } from './constants/app.constants';

/**
 * Main application component
 * Orchestrates data fetching, state management, and layout rendering
 */
function App() {
  // Data fetching
  const { gridCells, geojson, typologies, isLoading } = useScientificData();
  const { indicators } = useIndicators();

  // State management
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Custom hooks
  const mobilePanel = useMobilePanel();
  const selectedCell = useSelectedCell(selectedCellId, gridCells, geojson);
  const typologyScaleNumber = useTypologyScale(filterState.typologyScale);

  // Derived data
  const filteredGridCells = useFilteredGridCells(gridCells || [], filterState);
  const distributions = useIndicatorDistributions(
    filteredGridCells,
    indicators,
    filterState,
    selectedCellId,
    filterState.quantile,
    typologyScaleNumber
  );

  // Event handlers
  const handleCellSelect = (id: number | null) => {
    setSelectedCellId(id);
    // Auto-open panel on mobile when a cell is selected
    if (id && window.innerWidth < MOBILE_BREAKPOINT) {
      mobilePanel.open();
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
      isOpen={mobilePanel.isOpen}
      onClose={mobilePanel.close}
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
      isMobilePanelOpen={mobilePanel.isOpen}
      onToggleMobilePanel={mobilePanel.toggle}
    />
  );
}

export default App;

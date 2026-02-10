import { useState } from 'react';
import { GridMap as Map } from '@/features/map/components/Map';
import { useScientificData } from '@/data/hooks/useScientificData';
import { useIndicators } from '@/data/hooks/useIndicators';
import { getFeatureCenterCoords } from '@/utils/geoUtils';

// Widgets & Hooks
import { FilterControls } from '@/features/widgets/components/FilterControls';
import { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
import { GroupedViolinPlot } from '@/features/widgets/components/ViolinPlot';
import { useFilteredGridCells } from '@/features/widgets/hooks/useFilteredGridCells';
import { useIndicatorDistributions } from '@/features/widgets/hooks/useIndicatorDistributions';
import { INITIAL_FILTER_STATE, type FilterState } from '@/features/widgets/types/filter.types';

// Icons
import { Layers, Menu, X } from 'lucide-react';

function App() {
  const { gridCells, geojson, typologies, isLoading } = useScientificData();
  const { indicators } = useIndicators();

  // App State
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Derived Data
  const filteredGridCells = useFilteredGridCells(gridCells || [], filterState);
  const distributions = useIndicatorDistributions(
    filteredGridCells,
    indicators,
    filterState,
    selectedCellId,
    filterState.quantile
  );

  const selectedCell = selectedCellId && gridCells && geojson
    ? (() => {
      const cell = gridCells.find(c => c.id === selectedCellId);
      if (!cell) return null;

      // Find matching GeoJSON feature and calculate centerCoords (legacy approach)
      const feature = geojson.features.find(f => f.properties.ID === selectedCellId);
      if (feature) {
        const centerCoords = getFeatureCenterCoords(feature);
        return { ...cell, centerCoords };
      }
      return cell;
    })()
    : null;

  const currentTypologyScale = filterState.typologyScale;

  const handleCellSelect = (id: number | null) => {
    setSelectedCellId(id);
    if (id && window.innerWidth < 768) {
      setIsMobilePanelOpen(true); // Auto-open panel on mobile select
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">

      {/* 1. MAP AREA (Flex-1, fills remaining space) */}
      <div className="flex-1 relative order-1 md:order-2 h-1/2 md:h-full">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium text-sm">Loading GLOWdex...</p>
            </div>
          </div>
        ) : (
          <Map
            gridCells={filteredGridCells}
            geojson={geojson!}
            typologies={typologies!}
            selectedCellId={selectedCellId}
            typologyScale={currentTypologyScale}
            onCellSelect={handleCellSelect}
          />
        )}

        {/* Floating Mobile Header / Toggle */}
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <button
            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
            className="bg-white p-2 rounded-md shadow-md text-gray-700 hover:bg-gray-50"
          >
            {isMobilePanelOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 2. SIDE PANEL (Left on desktop, Bottom/Sheet on mobile) */}
      <div className={`
        bg-white shadow-xl z-20 flex flex-col
        md:w-96 md:h-full md:border-r md:border-gray-200 md:relative md:order-1
        ${/* Mobile styles: fixed bottom sheet or column below map */ ''}
        w-full fixed bottom-0 max-h-[60vh] md:max-h-full transition-transform duration-300 ease-in-out
        ${isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        md:translate-y-0
      `}>

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <Layers size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">GLOWdex</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Analysis Panel</p>
            </div>
          </div>
          {/* Close button for mobile only */}
          <button
            onClick={() => setIsMobilePanelOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">


          {/* Section: Filters */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</h2>
            <FilterControls
              filterState={filterState}
              onFilterChange={setFilterState}
            />
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Section: Selected Cell */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selection</h2>
              {selectedCellId && (
                <button
                  onClick={() => handleCellSelect(null)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <SelectionPanel
              selectedCell={selectedCell}
              typologies={typologies || { scale5: {}, scale18: {} }}
              currentScale={currentTypologyScale}
            />
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Section: Quantile Slider (New Parity Feature) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quantile for Typology Violin Plot:
                <span className="ml-1 text-gray-700 bg-gray-100 px-1 rounded">{filterState.quantile.toFixed(2)}</span>
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="0.5" // Usually quantiles like this go up to 0.5 (filtering from both ends), or 0->1?
                // Legacy: "Default quantile: 0.25". "Range 0-1, step 0.05".
                // If it filters [q, 1-q], then max q must be < 0.5 (otherwise range is inverted).
                // Let's assume max 0.45 or 0.5 (median).
                step="0.05"
                value={filterState.quantile}
                onChange={(e) => setFilterState(prev => ({ ...prev, quantile: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Section: Analysis */}
          <div className="space-y-3 pb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Distributions</h2>
            {isLoading ? (
              <div className="h-32 bg-gray-50 rounded animate-pulse" />
            ) : (
              <GroupedViolinPlot
                distributions={distributions}
                isLoading={isLoading}
              />
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400 shrink-0">
          {filteredGridCells.length.toLocaleString()} Grid Cells Visible
        </div>

      </div>
    </div>
  );
}

export default App;

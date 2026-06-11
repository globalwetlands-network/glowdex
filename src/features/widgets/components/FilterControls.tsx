import type { FilterState } from '../types/filter.types';

interface FilterControlsProps {
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
}

export function FilterControls({
  filterState,
  onFilterChange,
}: FilterControlsProps) {
  const setScale = (scale: 'scale5' | 'scale18') => {
    onFilterChange({
      ...filterState,
      typologyScale: scale,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-6">
      {/* Typology Scale Switch */}
      <div className="space-y-3">
        <label
          className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help"
          title="Switch between 5 broad typologies or 18 detailed classifications"
        >
          Typology Scale
        </label>
        <div className="flex bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setScale('scale5')}
            title="View 5 broad habitat typologies"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterState.typologyScale === 'scale5'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            5 Typologies
          </button>
          <button
            onClick={() => setScale('scale18')}
            title="View 18 detailed habitat typologies"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterState.typologyScale === 'scale18'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            18 Typologies
          </button>
        </div>
      </div>
    </div>
  );
}

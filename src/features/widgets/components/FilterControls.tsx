import { Sprout, Droplets, Waves } from 'lucide-react';
import type { FilterState } from '../types/filter.types';

interface FilterControlsProps {
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
}

export function FilterControls({ filterState, onFilterChange }: FilterControlsProps) {

  const toggleHabitat = (key: keyof FilterState['habitats']) => {
    onFilterChange({
      ...filterState,
      habitats: {
        ...filterState.habitats,
        [key]: !filterState.habitats[key],
      },
    });
  };

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
        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Typology Scale</label>
        <div className="flex bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setScale('scale5')}
            className={`flex-1 py-1 text-sm font-medium rounded-sm transition-all ${filterState.typologyScale === 'scale5' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            5 Typologies
          </button>
          <button
            onClick={() => setScale('scale18')}
            className={`flex-1 py-1 text-sm font-medium rounded-sm transition-all ${filterState.typologyScale === 'scale18' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            18 Typologies
          </button>
        </div>
      </div>

      {/* Habitat Toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Habitats</label>

        <button
          onClick={() => toggleHabitat('mangroves')}
          className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${filterState.habitats.mangroves ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
            }`}
        >
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4" />
            <span>Mangroves</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${filterState.habitats.mangroves ? 'bg-green-500' : 'bg-gray-300'}`} />
        </button>

        <button
          onClick={() => toggleHabitat('saltmarsh')}
          className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${filterState.habitats.saltmarsh ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-400'
            }`}
        >
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4" />
            <span>Saltmarsh</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${filterState.habitats.saltmarsh ? 'bg-orange-500' : 'bg-gray-300'}`} />
        </button>

        <button
          onClick={() => toggleHabitat('seagrass')}
          className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${filterState.habitats.seagrass ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'
            }`}
        >
          <div className="flex items-center space-x-2">
            <Waves className="w-4 h-4" />
            <span>Seagrass</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${filterState.habitats.seagrass ? 'bg-blue-500' : 'bg-gray-300'}`} />
        </button>
      </div>
    </div>
  );
}

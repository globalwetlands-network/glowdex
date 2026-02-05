import { useState } from 'react';
import { useScientificData } from '../data/hooks/useScientificData';
import { Map } from '../features/map/components/Map';

function App() {
  const { isLoading, gridCells, geojson, typologies } = useScientificData();
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);

  if (isLoading || !gridCells || !geojson || !typologies) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading Map Data...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <h1 className="text-xl font-bold text-gray-900">GLOWdex</h1>
        <div className="text-sm text-gray-500">
          {selectedCellId ? `Selected Cell: ${selectedCellId}` : 'Select a grid cell'}
        </div>
      </header>

      <main className="flex-1 relative">
        <Map
          gridCells={gridCells}
          geojson={geojson}
          typologies={typologies}
          selectedCellId={selectedCellId}
          onCellSelect={setSelectedCellId}
        />
      </main>
    </div>
  );
}

export default App


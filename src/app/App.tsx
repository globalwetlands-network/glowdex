import { useScientificData } from '../data/hooks/useScientificData';

function App() {
  const { isLoading, gridCells } = useScientificData();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">GLOWdex</h1>
        <p className="text-gray-600 mb-4">Frontend Rebuild • Glow5 Shell</p>
        <div className="text-sm font-mono bg-gray-100 p-4 rounded text-left inline-block">
          <p>Status: {isLoading ? 'Loading Data...' : 'Data Ready'}</p>
          {!isLoading && <p>Loaded {gridCells.length} cells</p>}
        </div>
      </div>
    </div>
  )
}

export default App

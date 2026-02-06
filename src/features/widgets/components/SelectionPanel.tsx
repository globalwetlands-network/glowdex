import type { RichGridCell } from '@/data/types/grid.types';
import type { TypologyMap } from '@/data/types/cluster.types';

interface SelectionPanelProps {
  selectedCell: RichGridCell | null;
  typologies: TypologyMap;
  currentScale: 'scale5' | 'scale18';
}

export function SelectionPanel({ selectedCell, typologies, currentScale }: SelectionPanelProps) {
  if (!selectedCell) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center h-32 flex flex-col justify-center items-center text-gray-400">
        <p>No cell selected</p>
        <p className="text-xs">Click a grid cell to view details</p>
      </div>
    );
  }

  const { id, country, cluster5, cluster18, mangroves, saltmarsh, seagrass } = selectedCell;
  const clusterId = (currentScale === 'scale5' ? cluster5 : cluster18) || 0;
  const clusterInfo = typologies[currentScale][clusterId];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
      {/* Header: ID + Country */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cell #{id}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{country || 'Unknown Country'}</p>
          </div>
          <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200">
            Typology {clusterId}
          </span>
        </div>
      </div>

      {/* Feature 1: Color */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Typology Color</p>
        <div className="flex items-center space-x-2">
          <div
            className="w-full h-6 rounded-md shadow-sm border border-gray-100"
            style={{ backgroundColor: clusterInfo?.color || '#ccc' }}
          />
        </div>
      </div>

      {/* Feature 2: Habitats */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Habitats Present</p>
        <div className="flex flex-wrap gap-2">
          {mangroves && (
            <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-medium">Mangroves</span>
          )}
          {saltmarsh && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-medium">Saltmarsh</span>
          )}
          {seagrass && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">Seagrass</span>
          )}
          {!mangroves && !saltmarsh && !seagrass && (
            <span className="text-gray-400 italic text-xs">None recorded</span>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const { id, cluster5, cluster18, mangroves, saltmarsh, seagrass } = selectedCell;
  const clusterId = (currentScale === 'scale5' ? cluster5 : cluster18) || 0;
  const clusterInfo = typologies[currentScale][clusterId];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Cell #{id}</h3>
        <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600">
          Typology {clusterId}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">Color ID</p>
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-sm shadow-sm"
            style={{ backgroundColor: clusterInfo?.color || '#ccc' }}
          />
          <span className="text-sm">{clusterInfo?.color || 'N/A'}</span>
        </div>
      </div>

      <div className="pt-2 border-t text-sm">
        <p className="font-medium text-gray-500 mb-2">Habitats Present</p>
        <div className="flex space-x-2">
          {mangroves && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Mangrove</span>
          )}
          {saltmarsh && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Saltmarsh</span>
          )}
          {seagrass && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Seagrass</span>
          )}
          {!mangroves && !saltmarsh && !seagrass && (
            <span className="text-gray-400 italic text-xs">None recorded</span>
          )}
        </div>
      </div>
    </div>
  );
}

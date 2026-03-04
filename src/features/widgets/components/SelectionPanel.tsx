import type { RichGridCell } from '@/data/types/grid.types';
import type { TypologyMap } from '@/data/types/cluster.types';
import { formatCoordinate } from '@/utils/coordinates';
import { MapPin } from 'lucide-react';

interface SelectionPanelProps {
  selectedCell: RichGridCell | null;
  typologies: TypologyMap;
  currentScale: 'scale5' | 'scale18';
}

export function SelectionPanel({ selectedCell, typologies, currentScale }: SelectionPanelProps) {
  if (!selectedCell) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100 text-center h-48 flex flex-col justify-center items-center text-gray-500">
        <div className="bg-white p-3 rounded-full mb-3 shadow-sm border border-gray-100 hover:scale-105 transition-transform">
          <MapPin className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No Location Selected</p>
        <p className="text-xs mt-2 opacity-80 max-w-[200px]">
          Click on a grid cell on the map to view detailed habitat and typology insights.
        </p>
      </div>
    );
  }

  const { id, country, cluster5, cluster18, mangroves, saltmarsh, seagrass, lat, lng } = selectedCell;
  const clusterId = (currentScale === 'scale5' ? cluster5 : cluster18) || 0;
  const clusterInfo = typologies[currentScale][clusterId];

  // Format coordinates
  // Use centerCoords if available (from GeoJSON bbox), otherwise fallback to lat/lng
  const centerCoords = (selectedCell as RichGridCell & { centerCoords?: { latitude: number; longitude: number } }).centerCoords;
  const coords = centerCoords || { latitude: lat || 0, longitude: lng || 0 };
  const coordinatesFormatted = formatCoordinate(coords);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
      {/* Country Name */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">{country || 'Unknown Country'}</h3>
      </div>

      {/* Coordinates */}
      <div>
        <p className="text-sm text-gray-600">{coordinatesFormatted}</p>
      </div>

      {/* ID + Typology Pills */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <span className="text-xs font-medium text-gray-500">ID</span>
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-900 text-xs font-semibold border border-gray-200">
            {id}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs font-medium text-gray-500">Typology</span>
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-900 text-xs font-semibold border border-gray-200">
            {clusterId}
          </span>
        </div>
      </div>

      {/* Feature 1: Color */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Typology Color</p>
        <div className="flex items-center space-x-2">
          <div
            className="w-full h-6 rounded-md shadow-sm border border-gray-100"
            style={{ backgroundColor: clusterInfo?.color || '#ccc' }}
          />
        </div>
      </div>

      {/* Feature 2: Habitats */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Habitats Present</p>
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

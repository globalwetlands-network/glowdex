import type { RichGridCell } from '@/data/types/grid.types';
import type { TypologyMap } from '@/data/types/cluster.types';
import { formatCoordinate } from '@/utils/coordinates';
import { Info, MapPin } from 'lucide-react';
import { TypologyLegend } from '@/components/TypologyLegend';

interface SelectionPanelProps {
  selectedCell: RichGridCell | null;
  typologies: TypologyMap;
  currentScale: 'scale5' | 'scale18';
}

export function SelectionPanel({
  selectedCell,
  typologies,
  currentScale,
}: SelectionPanelProps) {
  if (!selectedCell) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100 text-center h-48 flex flex-col justify-center items-center text-gray-500">
        <div className="bg-white p-3 rounded-full mb-3 shadow-sm border border-gray-100 hover:scale-105 transition-transform">
          <MapPin className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">
          No location selected
        </p>
        <p className="text-xs mt-2 opacity-80 max-w-[200px]">
          Click any cell on the map to explore the data.
        </p>
      </div>
    );
  }

  const { id, country, cluster5, cluster18, lat, lng } = selectedCell;
  const clusterId = (currentScale === 'scale5' ? cluster5 : cluster18) || 0;

  // Format coordinates
  // Use centerCoords if available (from GeoJSON bbox), otherwise fallback to lat/lng
  const centerCoords = (
    selectedCell as RichGridCell & {
      centerCoords?: { latitude: number; longitude: number };
    }
  ).centerCoords;
  const coords = centerCoords || { latitude: lat || 0, longitude: lng || 0 };
  const coordinatesFormatted = formatCoordinate(coords);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
      {/* Selected cell heading */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-1 group/cell-help relative">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Selected grid cell
          </p>
          <button
            type="button"
            aria-label="What is a grid cell"
            aria-describedby={`cell-help-tooltip-${id}`}
            className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded"
          >
            <Info className="w-3 h-3 text-gray-400 cursor-help shrink-0" />
          </button>
          <div
            id={`cell-help-tooltip-${id}`}
            role="tooltip"
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-56 p-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded shadow-lg opacity-0 group-hover/cell-help:opacity-100 group-focus-within/cell-help:opacity-100 pointer-events-none transition-opacity whitespace-normal"
          >
            This panel summarises available biodiversity, habitat and
            organisation information associated with the selected map cell.
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {country || 'Unknown Country'}
        </h3>
      </div>

      {/* Coordinates */}
      <div>
        <p className="text-sm text-gray-600">{coordinatesFormatted}</p>
      </div>

      {/* ID + Typology Pills */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <span className="text-xs font-medium text-gray-500">Cell ID</span>
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

      {/* Typology Legend */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Typology Guide
        </p>
        <TypologyLegend
          typologies={typologies}
          currentScale={currentScale}
          activeClusterId={clusterId}
        />
      </div>
    </div>
  );
}

import { memo } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';

interface MapTooltipProps {
  x: number;
  y: number;
  cell: RichGridCell | undefined;
  typologyScale: 'scale5' | 'scale18';
}

function MapTooltip({ x, y, cell, typologyScale = 'scale5' }: MapTooltipProps) {
  if (!cell) return null;

  const clusterId = typologyScale === 'scale5' ? cell.cluster5 : cell.cluster18;
  const label = typologyScale === 'scale5' ? 'Typology (5)' : 'Typology (18)';

  return (
    <div
      className="absolute z-10 p-2 bg-white rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] text-sm border border-gray-200"
      style={{ left: x, top: y }}
    >
      <div className="font-bold text-gray-900">Cell ID: {cell.id}</div>
      <div className="text-gray-600">{cell.country}</div>
      {clusterId !== undefined && (
        <div className="text-xs text-gray-500 mt-1">
          {label}:{' '}
          <span className="font-medium text-gray-700">{clusterId}</span>
        </div>
      )}
    </div>
  );
}

export default memo(MapTooltip);

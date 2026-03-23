import { useMemo } from 'react';

import type { RichGridCell } from '@/data/types/grid.types';
import type { GridGeoJSON } from '@/data/types/geo.types';

import type { EnrichedGridCell } from '../types/app.types';

import { getFeatureCenterCoords } from '@/utils/geoUtils';

/**
 * Retrieves and enriches the selected grid cell with center coordinates
 *
 * @param selectedCellId - ID of the currently selected cell
 * @param gridCells - Array of all grid cells
 * @param geojson - GeoJSON data for coordinate calculation
 * @returns Enriched cell with center coordinates, or null if not found
 */
export function useSelectedCell(
  selectedCellId: number | null,
  gridCells: RichGridCell[] | null,
  geojson: GridGeoJSON | null,
): EnrichedGridCell | null {
  return useMemo(() => {
    if (!selectedCellId || !gridCells || !geojson) {
      return null;
    }

    const cell = gridCells.find((c) => c.id === selectedCellId);
    if (!cell) {
      return null;
    }

    // Find matching GeoJSON feature and calculate centerCoords (legacy approach)
    const feature = geojson.features.find(
      (f) => f.properties.ID === selectedCellId,
    );
    if (!feature) {
      return cell as EnrichedGridCell;
    }

    const centerCoords = getFeatureCenterCoords(feature);
    return { ...cell, centerCoords };
  }, [selectedCellId, gridCells, geojson]);
}

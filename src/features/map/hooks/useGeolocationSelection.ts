import { useEffect, useRef } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import { getFeatureCenterCoords } from '@/utils/geoUtils';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

/**
 * Hook to automatically select the closest grid cell to the user's location on first load.
 */
export function useGeolocationSelection(
  gridCells: RichGridCell[],
  geojson: GridGeoJSON | null,
  selectedCellId: number | null,
  onSelect: (id: number) => void
) {
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    // Only run if we have cells and geojson, haven't attempted yet, and no cell is currently selected
    if (!gridCells.length || !geojson?.features?.length || hasAttemptedRef.current || selectedCellId !== null) {
      return;
    }

    hasAttemptedRef.current = true;

    if (!('geolocation' in navigator)) {
      // Fallback: select first cell if no geolocation support
      if (gridCells.length > 0) {
        onSelect(gridCells[0].id);
      }
      return;
    }

    // Build a map of cell IDs to their actual coordinates derived from GeoJSON
    const coordsMap = new Map<number, { latitude: number; longitude: number }>();
    for (const feature of geojson.features) {
      const id = feature.properties.ID;
      if (id !== undefined) {
        coordsMap.set(id, getFeatureCenterCoords(feature));
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        let closestCell: RichGridCell | null = null;
        let minDistance = Infinity;

        const userPoint = point([longitude, latitude]);

        for (const cell of gridCells) {
          const coords = coordsMap.get(cell.id);

          if (coords) {
            const cellPoint = point([coords.longitude, coords.latitude]);
            const dist = distance(userPoint, cellPoint, { units: 'kilometers' });
            if (dist < minDistance) {
              minDistance = dist;
              closestCell = cell;
            }
          }
        }

        if (closestCell) {
          onSelect(closestCell.id);
        } else if (gridCells.length > 0) {
          // Fallback if no valid coordinates found in cells
          onSelect(gridCells[0].id);
        }
      },
      (error) => {
        console.warn('Geolocation failed or denied, falling back to default selection:', error.message);
        if (gridCells.length > 0) {
          onSelect(gridCells[0].id);
        }
      },
      {
        timeout: 10000, // 10 seconds timeout
        maximumAge: 5 * 60 * 1000 // Accept a 5 min old location
      }
    );
  }, [gridCells, geojson, selectedCellId, onSelect]);
}

import distance from '@turf/distance';
import { point } from '@turf/helpers';
import type { RichGridCell } from '@/data/types/grid.types';

/**
 * Finds the nearest grid cell to a given coordinate within a distance threshold.
 *
 * @param lng - Longitude of the search location
 * @param lat - Latitude of the search location
 * @param cells - Array of grid cells to search through
 * @param thresholdKm - Maximum distance in kilometres to consider a match (default 500km)
 * @returns The ID of the nearest cell within the threshold, or null if none found
 */
export function findNearestCell(
  lng: number,
  lat: number,
  cells: RichGridCell[],
  thresholdKm = 500,
): number | null {
  const userPoint = point([lng, lat]);

  let closestId: number | null = null;
  let minDist = Infinity;

  for (const cell of cells) {
    if (cell.lat == null || cell.lng == null) continue;
    const cellPoint = point([cell.lng, cell.lat]);
    const dist = distance(userPoint, cellPoint, { units: 'kilometers' });
    if (dist < minDist) {
      minDist = dist;
      closestId = cell.id;
    }
  }

  return closestId !== null && minDist < thresholdKm ? closestId : null;
}

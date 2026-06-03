import distance from '@turf/distance';
import { point } from '@turf/helpers';

/**
 * Calculates geodesic distance between two points in kilometres.
 * Uses @turf/distance — already a project dependency.
 *
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const from = point([lng1, lat1]);
  const to = point([lng2, lat2]);
  return Math.round(distance(from, to, { units: 'kilometers' }));
}

/**
 * Finds the nearest hub to a given coordinate from an array of hubs.
 * Coordinates on each hub must be [longitude, latitude] (GeoJSON convention).
 *
 * Returns the nearest hub and its distance in km, or null if the
 * hubs array is empty.
 */
export function findNearestHub<T extends { coordinates: [number, number] }>(
  lat: number,
  lng: number,
  hubs: T[],
): { hub: T; distanceKm: number } | null {
  if (!hubs.length) return null;

  return hubs.reduce(
    (nearest, hub) => {
      const distanceKm = calculateDistance(
        lat,
        lng,
        hub.coordinates[1], // latitude
        hub.coordinates[0], // longitude
      );
      return distanceKm < nearest.distanceKm ? { hub, distanceKm } : nearest;
    },
    {
      hub: hubs[0],
      distanceKm: calculateDistance(
        lat,
        lng,
        hubs[0].coordinates[1],
        hubs[0].coordinates[0],
      ),
    },
  );
}

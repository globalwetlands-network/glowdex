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
 * Finds the nearest partner to a given coordinate from an array of partners.
 * Coordinates on each partner must be [longitude, latitude] (GeoJSON convention).
 *
 * Returns the nearest partner and its distance in km, or null if the
 * partners array is empty.
 */
export function findNearestPartner<T extends { coordinates: [number, number] }>(
  lat: number,
  lng: number,
  partners: T[],
): { partner: T; distanceKm: number } | null {
  if (!partners.length) return null;

  return partners.reduce(
    (nearest, partner) => {
      const distanceKm = calculateDistance(
        lat,
        lng,
        partner.coordinates[1], // latitude
        partner.coordinates[0], // longitude
      );
      return distanceKm < nearest.distanceKm
        ? { partner, distanceKm }
        : nearest;
    },
    {
      partner: partners[0],
      distanceKm: calculateDistance(
        lat,
        lng,
        partners[0].coordinates[1],
        partners[0].coordinates[0],
      ),
    },
  );
}

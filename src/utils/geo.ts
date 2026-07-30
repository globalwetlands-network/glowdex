import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import type { Feature } from 'geojson';
import type { GridGeoJSON } from '@/data/types/geo.types';

/**
 * A geographic coordinate as latitude/longitude.
 * Returned by getBboxCenter and getFeatureCenterCoords.
 */
export interface LatLng {
  latitude: number;
  longitude: number;
}

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

/**
 * Finds the nearest local monitoring site to a given
 * coordinate from an array of sites.
 * Coordinates on each site must be [longitude, latitude]
 * (GeoJSON convention).
 *
 * Returns the nearest site and its distance in km, or
 * null if the sites array is empty.
 */
export function findNearestSite<T extends { coordinates: [number, number] }>(
  lat: number,
  lng: number,
  sites: T[],
): { site: T; distanceKm: number } | null {
  if (!sites.length) return null;

  return sites.reduce(
    (nearest, site) => {
      const distanceKm = calculateDistance(
        lat,
        lng,
        site.coordinates[1], // latitude
        site.coordinates[0], // longitude
      );
      return distanceKm < nearest.distanceKm ? { site, distanceKm } : nearest;
    },
    {
      site: sites[0],
      distanceKm: calculateDistance(
        lat,
        lng,
        sites[0].coordinates[1],
        sites[0].coordinates[0],
      ),
    },
  );
}

/**
 * Finds the grid cell whose GeoJSON feature geometry
 * contains the given coordinates using point-in-polygon
 * testing.
 *
 * More accurate than distance-based nearest-cell lookup
 * for determining which cell a monitoring site belongs
 * to — avoids the issue of RichGridCell having no
 * centerCoords populated.
 *
 * Iterates all features — O(n) on grid size. Acceptable
 * for single site-selection events, not for hot paths.
 *
 * Returns null when no feature contains the point —
 * e.g. coordinates fall in open ocean or between cells.
 * Callers should handle null gracefully.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param geojson - The full grid GeoJSON
 * @returns Cell ID (number) or null
 */
export function findCellContainingPoint(
  lat: number,
  lng: number,
  geojson: GridGeoJSON,
): number | null {
  const pt = point([lng, lat]);

  for (const feature of geojson.features) {
    try {
      if (booleanPointInPolygon(pt, feature)) {
        const id = Number(feature.properties?.ID);
        if (Number.isFinite(id)) return id;
        console.warn(
          'findCellContainingPoint: matched feature ' + 'with non-numeric ID:',
          feature.properties?.ID,
        );
      }
    } catch (err) {
      // Skip malformed features rather than aborting
      console.warn(
        'findCellContainingPoint: skipping malformed ' +
          `feature ID=${feature.properties?.ID}:`,
        err,
      );
      continue;
    }
  }

  return null;
}

/**
 * Calculates the geographic center of a bounding box.
 *
 * @param minLng - Western boundary longitude
 * @param minLat - Southern boundary latitude
 * @param maxLng - Eastern boundary longitude
 * @param maxLat - Northern boundary latitude
 * @returns Centre point as latitude/longitude
 */
export function getBboxCenter({
  minLng,
  minLat,
  maxLng,
  maxLat,
}: {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}): LatLng {
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  return { latitude: centerLat, longitude: centerLng };
}

/**
 * Returns the geographic centre of a GeoJSON feature
 * derived from its bounding box.
 *
 * @param feature - GeoJSON Feature of any geometry type
 * @returns Centre point as latitude/longitude
 */
export function getFeatureCenterCoords(feature: Feature): LatLng {
  const [minLng, minLat, maxLng, maxLat] = bbox(feature);
  return getBboxCenter({ minLng, minLat, maxLng, maxLat });
}

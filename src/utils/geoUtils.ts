import bbox from '@turf/bbox';
import type { Feature } from 'geojson';

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
}): { latitude: number; longitude: number } {
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  return { latitude: centerLat, longitude: centerLng };
}

export function getFeatureCenterCoords(feature: Feature): {
  latitude: number;
  longitude: number;
} {
  const [minLng, minLat, maxLng, maxLat] = bbox(feature);
  return getBboxCenter({ minLng, minLat, maxLng, maxLat });
}

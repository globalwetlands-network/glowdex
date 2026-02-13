import { fetchAsset } from '@/utils/fetchUtils';
import type { GridGeoJSON } from '../types/geo.types';

/**
 * Loads grid cell geometries as GeoJSON FeatureCollection
 * 
 * Contains polygon geometries for each grid cell with properties:
 * - ID: Grid cell identifier
 * - Bounding box coordinates for center point calculation
 * 
 * @returns Promise resolving to GeoJSON FeatureCollection
 * 
 * @remarks Fetches data from /data/grid.geojson at runtime.
 */
export async function loadGridGeoJson(): Promise<GridGeoJSON> {
  const response = await fetchAsset('data/grid.geojson');
  if (!response.ok) {
    throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
  }
  return response.json();
}

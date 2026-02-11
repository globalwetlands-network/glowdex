import type { GridGeoJSON } from '../types/geo.types';
import rawData from '@/data/raw/grid.geojson?raw';

/**
 * Loads grid cell geometries as GeoJSON FeatureCollection
 * 
 * Contains polygon geometries for each grid cell with properties:
 * - ID: Grid cell identifier
 * - Bounding box coordinates for center point calculation
 * 
 * @returns Parsed GeoJSON FeatureCollection of grid cell polygons
 * 
 * @note Synchronous build-time import using Vite's ?raw syntax.
 *       GeoJSON is bundled at compile time for immediate availability.
 */
export function loadGridGeoJson(): GridGeoJSON {
  return JSON.parse(rawData) as GridGeoJSON;
}

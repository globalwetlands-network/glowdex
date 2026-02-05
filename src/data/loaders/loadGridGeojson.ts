import type { GridGeoJSON } from '../types/geo.types';
import rawData from '@/data/raw/grid.geojson?raw';

// NOTE: Synchronous build-time import.
export function loadGridGeoJson(): GridGeoJSON {
  return JSON.parse(rawData) as GridGeoJSON;
}

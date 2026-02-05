import type { GridGeoJSON } from '../types/geo.types';
import rawData from '../raw/grid.geojson?raw';

export function loadGridGeoJson(): GridGeoJSON {
  return JSON.parse(rawData) as GridGeoJSON;
}

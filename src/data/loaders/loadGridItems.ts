import rawData from '@/data/raw/grid-items.csv?raw';
import { parseCsv } from './csvParser';
import type { GridItem, GridItemRaw } from '../types/grid.types';

/**
 * Loads basic grid cell metadata from CSV
 * 
 * Transforms raw CSV data into structured grid items with:
 * - Unique cell ID
 * - Country/territory name
 * - ISO3 country code
 * 
 * @returns Array of grid cell metadata objects
 * 
 * @note Latitude/longitude coordinates are NOT included in this CSV.
 *       Center coordinates are calculated from GeoJSON geometries when needed.
 * 
 * @note Synchronous build-time import using Vite's ?raw syntax.
 *       This ensures deterministic data loading at compile time.
 *       Future versions may replace this with async API fetches.
 */
export function loadGridItems(): GridItem[] {
  const raw = parseCsv<GridItemRaw>(rawData);

  return raw.map(row => ({
    id: parseInt(row.ID, 10),
    country: row.TERRITORY1,
    iso3: row.ISO_TER1,
  }));
}

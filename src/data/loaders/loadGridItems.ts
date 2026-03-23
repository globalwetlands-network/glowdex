import { fetchAsset } from '@/utils/fetchUtils';
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
 * @returns Promise resolving to array of grid cell metadata objects
 *
 * @remarks Fetches data from /data/grid-items.csv at runtime.
 */
export async function loadGridItems(): Promise<GridItem[]> {
  const response = await fetchAsset('data/grid-items.csv');
  if (!response.ok) {
    throw new Error(`Failed to load grid items: ${response.statusText} `);
  }
  const text = await response.text();
  const raw = parseCsv<GridItemRaw>(text);

  return raw.map((row) => ({
    id: parseInt(row.ID, 10),
    country: row.TERRITORY1,
    iso3: row.ISO_TER1,
  }));
}

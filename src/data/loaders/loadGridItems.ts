import { datasetClient } from '@/data/store/datasetClient';
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
 * @remarks Loads `grid-items.csv` via datasetClient — from the canonical store
 * bundle when VITE_DATA_STORE_URL is set, else the same-origin /data/ copy.
 */
export async function loadGridItems(): Promise<GridItem[]> {
  const response = await datasetClient.fetchAsset('grid-items.csv');
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

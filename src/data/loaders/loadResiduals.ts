import { datasetClient } from '@/data/store/datasetClient';
import { parseCsv } from './csvParser';
import type { Residuals, ResidualsRaw } from '../types/grid.types';

/**
 * Loads indicator residual values for all grid cells
 *
 * Transforms CSV data where each row contains:
 * - ID: Grid cell identifier
 * - Multiple columns: One per indicator with residual values
 *
 * The transformation:
 * 1. Extracts the ID field
 * 2. Converts all other columns to numeric residual values
 * 3. Filters out empty/undefined values (sparse data)
 * 4. Returns a clean key-value map of indicator residuals
 *
 * @returns Promise resolving to array of residual objects
 *
 * @remarks Loads `grid-items-residuals.csv` via datasetClient — from the
 * canonical store bundle when VITE_DATA_STORE_URL is set, else the same-origin
 * /data/ copy.
 */
export async function loadResiduals(): Promise<Residuals[]> {
  const response = await datasetClient.fetchAsset('grid-items-residuals.csv');
  if (!response.ok) {
    throw new Error(`Failed to load residuals: ${response.statusText}`);
  }
  const text = await response.text();
  const raw = parseCsv<ResidualsRaw>(text);

  return raw.map((row) => {
    const { ID, ...rest } = row;

    // Transform all non-ID columns to numeric residual values
    const values: Record<string, number> = {};
    Object.entries(rest).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        values[key] = parseFloat(val as string);
      }
    });

    return {
      id: parseInt(ID, 10),
      values,
    };
  });
}

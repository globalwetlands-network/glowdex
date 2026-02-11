import rawData from '@/data/raw/grid-items-residuals.csv?raw';
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
 * @returns Array of residual objects, one per grid cell
 * 
 * @example
 * ```ts
 * const residuals = loadResiduals();
 * // Result: [{ id: 1, values: { 'pressure_mangrove_climate_rate': 0.42, ... } }]
 * ```
 * 
 * @remarks Synchronous build-time import using Vite's ?raw syntax.
 */
export function loadResiduals(): Residuals[] {
  const raw = parseCsv<ResidualsRaw>(rawData);

  return raw.map(row => {
    const { ID, ...rest } = row;

    // Transform all non-ID columns to numeric residual values
    const values: Record<string, number> = {};
    Object.entries(rest).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        values[key] = parseFloat(val);
      }
    });

    return {
      id: parseInt(ID, 10),
      values,
    };
  });
}

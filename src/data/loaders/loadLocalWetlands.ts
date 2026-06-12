/**
 * Loads local wetlands monitoring data from CSV.
 *
 * Follows the same pattern as loadAllClusters — fetchAsset
 * + parseCsv. Data lives in public/data/local-wetlands-crab-data.csv
 * and is served as a static asset.
 *
 * Post-conference: replace with GET /api/local/sites
 */

import { fetchAsset } from '@/utils/fetchUtils';
import { parseCsv } from './csvParser';
import type { LocalObservationRaw } from '../types/local-wetlands.types';

export async function loadLocalWetlands(): Promise<LocalObservationRaw[]> {
  const response = await fetchAsset('data/local-wetlands-crab-data.csv');
  if (!response.ok) {
    throw new Error(
      `Failed to load local wetlands data: ${response.statusText}`,
    );
  }
  const text = await response.text();
  return parseCsv<LocalObservationRaw>(text);
}

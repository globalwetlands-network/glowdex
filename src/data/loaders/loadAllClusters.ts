import { fetchAsset } from '@/utils/fetchUtils';
import { parseCsv } from './csvParser';
import type { ClusterRaw } from '../types/cluster.types';

/**
 * Loads all typology cluster definitions from CSV
 *
 * Reads cluster metadata including:
 * - Cluster IDs and names
 * - Fill and stroke colors for map visualization
 * - Typology scale associations (5 or 18 clusters)
 *
 * @returns Promise resolving to array of raw cluster definitions
 *
 * @remarks Fetches data from /data/all-clusters.csv at runtime.
 */
export async function loadAllClusters(): Promise<ClusterRaw[]> {
  const response = await fetchAsset('data/all-clusters.csv');
  if (!response.ok) {
    throw new Error(`Failed to load clusters: ${response.statusText}`);
  }
  const text = await response.text();
  return parseCsv<ClusterRaw>(text);
}

import { datasetClient } from '@/data/store/datasetClient';
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
 * @remarks Loads `all-clusters.csv` via datasetClient — from the canonical store
 * bundle when VITE_DATA_STORE_URL is set, else the same-origin /data/ copy.
 */
export async function loadAllClusters(): Promise<ClusterRaw[]> {
  const response = await datasetClient.fetchAsset('all-clusters.csv');
  if (!response.ok) {
    throw new Error(`Failed to load clusters: ${response.statusText}`);
  }
  const text = await response.text();
  return parseCsv<ClusterRaw>(text);
}

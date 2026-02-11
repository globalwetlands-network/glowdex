import rawData from '@/data/raw/all-clusters.csv?raw';
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
 * @returns Array of raw cluster definitions
 * 
 * @note Synchronous build-time import using Vite's ?raw syntax.
 *       Data is bundled at compile time for deterministic loading.
 */
export function loadAllClusters(): ClusterRaw[] {
  return parseCsv<ClusterRaw>(rawData);
}

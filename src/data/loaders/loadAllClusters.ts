import rawData from '@/data/raw/all-clusters.csv?raw';
import { parseCsv } from './csvParser';
import type { ClusterRaw } from '../types/cluster.types';

// NOTE: Synchronous build-time import. See loadGridItems.ts for details.
export function loadAllClusters(): ClusterRaw[] {
  return parseCsv<ClusterRaw>(rawData);
}

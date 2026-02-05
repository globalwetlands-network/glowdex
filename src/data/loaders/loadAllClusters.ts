import rawData from '../raw/all-clusters.csv?raw';
import { parseCsv } from './csvParser';
import type { ClusterRaw } from '../types/cluster.types';

export function loadAllClusters(): ClusterRaw[] {
  return parseCsv<ClusterRaw>(rawData);
}

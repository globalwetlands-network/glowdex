import type { ClusterRaw, Cluster, TypologyMap } from '../types/cluster.types';

export function deriveTypologies(rawClusters: ClusterRaw[]): TypologyMap {
  const scale5: Record<number, Cluster> = {};
  const scale18: Record<number, Cluster> = {};

  // We only need unique clusters, but the raw file has one row per GridItem.
  // So we iterate and build the map.

  rawClusters.forEach(row => {
    // scale 5
    if (row.cluster_5 && row.hex_5) {
      const id = parseInt(row.cluster_5, 10);
      if (!scale5[id]) {
        scale5[id] = {
          id,
          name: `Typology ${id}`, // Could be enhanced with names if available
          clusterNumber: id,
          color: row.hex_5,
          fillColor: `${row.hex_5}4D`, // ~30% opacity (4D is hex for 77/255)
        };
      }
    }

    // scale 18
    if (row.cluster_18 && row.hex_18) {
      const id = parseInt(row.cluster_18, 10);
      if (!scale18[id]) {
        scale18[id] = {
          id,
          name: `Typology ${id}`,
          clusterNumber: id,
          color: row.hex_18,
          fillColor: `${row.hex_18}4D`,
        };
      }
    }
  });

  return { scale5, scale18 };
}

import type { ClusterRaw, Cluster, TypologyMap } from '../types/cluster.types';

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
          fillColor: hexToRgba(row.hex_5, 0.3), // ~30% opacity
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
          fillColor: hexToRgba(row.hex_18, 0.3),
        };
      }
    }
  });

  return { scale5, scale18 };
}

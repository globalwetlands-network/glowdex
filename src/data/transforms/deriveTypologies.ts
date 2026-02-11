import type { ClusterRaw, Cluster, TypologyMap } from '../types/cluster.types';

/** Default fill opacity for typology clusters on the map */
const FILL_OPACITY = 0.3;

/**
 * Converts hexadecimal color to RGBA format
 * 
 * @param hex - Hexadecimal color string (e.g., '#FF5733')
 * @param alpha - Alpha/opacity value between 0 and 1
 * @returns RGBA color string (e.g., 'rgba(255, 87, 51, 0.3)')
 * 
 * @example
 * ```ts
 * hexToRgba('#FF5733', 0.3); // 'rgba(255, 87, 51, 0.3)'
 * ```
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Derives typology cluster definitions from raw cluster data
 * 
 * Transforms raw cluster CSV data into structured typology maps for both
 * 5-cluster and 18-cluster classification scales. Each cluster includes:
 * - Unique cluster ID and number
 * - Display name
 * - Hex color for borders/strokes
 * - RGBA fill color with transparency
 * 
 * @param rawClusters - Raw cluster data from CSV (one row per grid cell)
 * @returns Object containing scale5 and scale18 typology maps
 * 
 * @note The raw data contains duplicate cluster definitions (one per grid cell).
 *       This function deduplicates by building a map keyed by cluster ID.
 * 
 * @example
 * ```ts
 * const typologies = deriveTypologies(rawClusters);
 * const cluster = typologies.scale5[1]; // Get cluster 1 from 5-scale
 * ```
 */
export function deriveTypologies(rawClusters: ClusterRaw[]): TypologyMap {
  const scale5: Record<number, Cluster> = {};
  const scale18: Record<number, Cluster> = {};

  rawClusters.forEach(row => {
    // Process 5-cluster scale
    if (row.cluster_5 && row.hex_5) {
      const id = parseInt(row.cluster_5, 10);

      // Only create cluster definition once (deduplicate)
      if (!scale5[id]) {
        scale5[id] = {
          id,
          name: `Typology ${id}`,
          clusterNumber: id,
          color: row.hex_5,
          fillColor: hexToRgba(row.hex_5, FILL_OPACITY),
        };
      }
    }

    // Process 18-cluster scale
    if (row.cluster_18 && row.hex_18) {
      const id = parseInt(row.cluster_18, 10);

      // Only create cluster definition once (deduplicate)
      if (!scale18[id]) {
        scale18[id] = {
          id,
          name: `Typology ${id}`,
          clusterNumber: id,
          color: row.hex_18,
          fillColor: hexToRgba(row.hex_18, FILL_OPACITY),
        };
      }
    }
  });

  return { scale5, scale18 };
}

import type { GridItem, Residuals, RichGridCell } from '../types/grid.types';
import type { ClusterRaw } from '../types/cluster.types';

/**
 * Parses habitat presence flag from string to boolean
 * 
 * @param value - String value from CSV ('1' for present, other for absent)
 * @returns True if habitat is present, false otherwise
 */
function parseHabitatPresence(value: string | undefined): boolean {
  return value === '1';
}

/**
 * Safely parses cluster ID from string to number
 * 
 * @param value - String cluster ID from CSV
 * @returns Parsed cluster number, or undefined if invalid
 */
function parseClusterId(value: string | undefined): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}

/**
 * Joins grid cell metadata with cluster assignments and residual values
 * 
 * Combines data from three sources:
 * 1. Grid items: Basic cell metadata (ID, country, ISO code)
 * 2. Residuals: Indicator residual values per cell
 * 3. Raw clusters: Typology assignments and habitat presence flags
 * 
 * The result is a "rich" grid cell with all data needed for analysis and visualization.
 * 
 * @param gridItems - Basic grid cell metadata
 * @param residuals - Indicator residual values per cell
 * @param rawClusters - Cluster assignments (one row per grid cell)
 * @returns Array of enriched grid cells with all joined data
 * 
 * @note Assumptions:
 *       - Grid item IDs are unique
 *       - Raw clusters file contains exactly one row per grid item
 *       - Missing cluster info triggers a console warning
 * 
 * @example
 * ```ts
 * const richCells = joinGridData(gridItems, residuals, rawClusters);
 * const cell = richCells[0];
 * console.log(cell.cluster5, cell.mangroves, cell.residuals);
 * ```
 */
export function joinGridData(
  gridItems: GridItem[],
  residuals: Residuals[],
  rawClusters: ClusterRaw[]
): RichGridCell[] {
  // Build lookup maps for O(1) access during join
  const residualsMap = new Map<number, Record<string, number>>();
  residuals.forEach(r => residualsMap.set(r.id, r.values));

  const clusterMap = new Map<number, ClusterRaw>();
  rawClusters.forEach(c => clusterMap.set(parseInt(c.ID, 10), c));

  // Join all data sources by grid cell ID
  return gridItems.map(item => {
    const residualValues = residualsMap.get(item.id) || {};
    const clusterInfo = clusterMap.get(item.id);

    // Warn if cluster data is missing (data integrity check)
    if (!clusterInfo) {
      console.warn(`Missing cluster info for GridCell ID: ${item.id}`);
    }

    return {
      ...item,
      residuals: residualValues,
      cluster5: parseClusterId(clusterInfo?.cluster_5),
      cluster18: parseClusterId(clusterInfo?.cluster_18),
      mangroves: parseHabitatPresence(clusterInfo?.mang_presence),
      saltmarsh: parseHabitatPresence(clusterInfo?.salt_presence),
      seagrass: parseHabitatPresence(clusterInfo?.seag_presence),
    };
  });
}

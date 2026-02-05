import type { GridItem } from '../types/grid.types';
import type { Residuals } from '../types/grid.types';
import type { ClusterRaw } from '../types/cluster.types';

export interface RichGridCell extends GridItem {
  residuals?: Record<string, number>;
  cluster5?: number; // typology ID in scale 5
  cluster18?: number; // typology ID in scale 18
  mangroves: boolean;
  saltmarsh: boolean;
  seagrass: boolean;
}

export function joinGridData(
  gridItems: GridItem[],
  residuals: Residuals[],
  // rawClusters is needed because it links GridID -> ClusterID
  rawClusters: ClusterRaw[]
): RichGridCell[] {

  // Create quick lookup maps
  const residualsMap = new Map<number, Record<string, number>>();
  residuals.forEach(r => residualsMap.set(r.id, r.values));

  const clusterMap = new Map<number, ClusterRaw>();
  rawClusters.forEach(c => clusterMap.set(parseInt(c.ID, 10), c));

  return gridItems.map(item => {
    const res = residualsMap.get(item.id);
    const clusterInfo = clusterMap.get(item.id);

    return {
      ...item,
      residuals: res,
      cluster5: clusterInfo?.cluster_5 ? parseInt(clusterInfo.cluster_5, 10) : undefined,
      cluster18: clusterInfo?.cluster_18 ? parseInt(clusterInfo.cluster_18, 10) : undefined,
      mangroves: clusterInfo?.mang_presence === '1',
      saltmarsh: clusterInfo?.salt_presence === '1',
      seagrass: clusterInfo?.seag_presence === '1',
    };
  });
}

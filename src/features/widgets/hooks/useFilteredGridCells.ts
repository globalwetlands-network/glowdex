import { useMemo } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';
import type { FilterState } from '../types/filter.types';

export function useFilteredGridCells(
  gridCells: RichGridCell[],
  filterState: FilterState
): RichGridCell[] {
  return useMemo(() => {
    return gridCells.filter(cell => {
      // 1. Habitat Filtering (Union / OR logic - show if ANY selected habitat is present)
      // If a cell has NO recorded habitats, it is usually filtered out by the data layer assumption,
      // but here we filter based on user selection.

      const { mangroves, saltmarsh, seagrass } = filterState.habitats;

      // If user unchecks all, show nothing (or show all? usually show nothing).
      // Logic: Show cell if it has 'mang_presence=1' AND 'mangroves=true'
      // OR 'salt_presence=1' AND 'saltmarsh=true' ...

      const hasMangrove = cell.mangroves;
      const hasSaltmarsh = cell.saltmarsh;
      const hasSeagrass = cell.seagrass;

      // Strict visibility: Cell is visible if it contains at least one of the *selected* habitats.
      const matchesHabitat =
        (mangroves && hasMangrove) ||
        (saltmarsh && hasSaltmarsh) ||
        (seagrass && hasSeagrass);

      if (!matchesHabitat) return false;

      // 2. Quantile Filtering
      // Quantile filtering is applied at the Indicator Distribution level (useIndicatorDistributions),
      // not at the global Map/Grid Cell visibility level.
      // So we do not filter cells here based on filterState.quantile.

      return true;
    });
  }, [gridCells, filterState]);
}

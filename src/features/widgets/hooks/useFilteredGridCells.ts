import { useMemo } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';
import type { FilterState } from '../types/filter.types';

export function useFilteredGridCells(
  gridCells: RichGridCell[],
  filterState: FilterState
): RichGridCell[] {
  return useMemo(() => {
    return gridCells.filter(cell => {
      // Habitat Filtering 
      const { mangroves, saltmarsh, seagrass } = filterState.habitats;

      const hasMangrove = cell.mangroves;
      const hasSaltmarsh = cell.saltmarsh;
      const hasSeagrass = cell.seagrass;

      // Strict visibility: Cell is visible if it contains at least one of the *selected* habitats.
      const matchesHabitat =
        (mangroves && hasMangrove) ||
        (saltmarsh && hasSaltmarsh) ||
        (seagrass && hasSeagrass);

      if (!matchesHabitat) return false;

      return true;
    });
  }, [gridCells, filterState]);
}

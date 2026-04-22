import { useMemo } from 'react';

import type { RichGridCell } from '@/data/types/grid.types';

import type { FilterState } from '../types/filter.types';

/**
 * Checks if a cell matches the habitat filter criteria
 * Cell must contain at least one of the enabled habitats
 */
function matchesHabitatFilter(
  cell: RichGridCell,
  habitats: FilterState['habitats'],
): boolean {
  return (
    (habitats.mangroves && cell.mangroves) ||
    (habitats.saltmarsh && cell.saltmarsh) ||
    (habitats.seagrass && cell.seagrass)
  );
}

/**
 * Filters grid cells based on habitat presence
 * Only cells containing at least one enabled habitat are returned
 */
export function useFilteredGridCells(
  gridCells: RichGridCell[],
  filterState: FilterState,
): RichGridCell[] {
  return useMemo(() => {
    return gridCells.filter((cell) =>
      matchesHabitatFilter(cell, filterState.habitats),
    );
  }, [gridCells, filterState]);
}

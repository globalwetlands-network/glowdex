import { useMemo } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';
import type { FilterState } from '../types/filter.types';
import type {
  Indicator,
  DistributionsByDimension
} from '../types/indicator.types';

export function useIndicatorDistributions(
  gridCells: RichGridCell[],
  indicators: Indicator[],
  // filterState is conceptually used by the caller to filter gridCells first
  _filterState: FilterState,
  selectedCellId: number | null
): DistributionsByDimension {
  return useMemo(() => {
    if (!gridCells.length || !indicators.length) return {};

    // 1. Pre-calculate lookup for selected cell values
    const selectedCell = selectedCellId
      ? gridCells.find(c => c.id === selectedCellId)
      : null;

    const distributions: DistributionsByDimension = {};

    // 2. Iterate through all indicators
    indicators.forEach(indicator => {
      // 3. Filter values for this specific indicator
      // Logic: Only include values where the indicator is relevant to the habitat?
      // Legacy app likely filtered based on Habitat Presence AND Indicator relevance.
      // E.g. If indicator is 'mangrove_area', only include cells with mangroves?
      // Or just rely on the fact that if a cell has no mangroves, it likely has no mangrove_area value (or 0/null).
      // We rely on the value being present and numeric in 'residuals'.

      const values = gridCells
        .map(cell => cell.residuals[indicator.key])
        .filter(v => typeof v === 'number' && !isNaN(v));

      if (values.length === 0) return;

      // 4. Get selected value
      let selectedValue: number | undefined;
      if (selectedCell) {
        const val = selectedCell.residuals[indicator.key];
        if (typeof val === 'number' && !isNaN(val)) {
          selectedValue = val;
        }
      }

      // 5. Group by dimension
      if (!distributions[indicator.dimension]) {
        distributions[indicator.dimension] = [];
      }

      distributions[indicator.dimension].push({
        indicator,
        values,
        selectedValue
      });
    });

    return distributions;
  }, [gridCells, indicators, selectedCellId]); // filterState is implicitly applied to gridCells by upstream hook
}

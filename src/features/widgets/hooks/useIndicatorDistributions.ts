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

    // 2. Filter indicators based on selected cell's habitats (if a cell is selected)
    // Legacy parity: "Indicators irrelevant to the selected cell’s habitat are not rendered"
    const relevantIndicators = selectedCell
      ? indicators.filter(ind => {
        if (ind.habitat === 'all') return true;
        if (ind.habitat === 'mangroves' && selectedCell.mangroves) return true;
        if (ind.habitat === 'saltmarsh' && selectedCell.saltmarsh) return true;
        if (ind.habitat === 'seagrass' && selectedCell.seagrass) return true;
        return false;
      })
      : indicators;

    // 3. Iterate through filtered indicators
    relevantIndicators.forEach(indicator => {
      // 4. Filter values for this specific indicator
      // We process all cells to build the distribution context
      const values = gridCells
        .map(cell => cell.residuals[indicator.key])
        .filter(v => typeof v === 'number' && !isNaN(v));

      if (values.length === 0) return;

      // 5. Get selected value
      let selectedValue: number | undefined;
      if (selectedCell) {
        const val = selectedCell.residuals[indicator.key];
        // Only mark if value is valid
        if (typeof val === 'number' && !isNaN(val)) {
          selectedValue = val;
        }
      }

      // 6. Group by dimension
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

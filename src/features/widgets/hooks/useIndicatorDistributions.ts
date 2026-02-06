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
  selectedCellId: number | null,
  quantile: number
): DistributionsByDimension {
  return useMemo(() => {
    if (!gridCells.length || !indicators.length) return {};

    // 1. Pre-calculate lookup for selected cell values
    const selectedCell = selectedCellId
      ? gridCells.find(c => c.id === selectedCellId)
      : null;

    const distributions: DistributionsByDimension = {};

    // 2. Filter indicators based on selected cell's habitats (Strict Parity)
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
      // 4. Extract valid numeric values
      let values = gridCells
        .map(cell => cell.residuals[indicator.key])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));

      if (values.length === 0) return;

      // 5. Apply Quantile Filter (Legacy Parity: Keep middle range [q, 1-q])
      values.sort((a, b) => a - b);

      const lowerIndex = Math.floor(values.length * quantile);
      const upperIndex = Math.floor(values.length * (1 - quantile));

      if (values.length > 0) {
        values = values.slice(lowerIndex, upperIndex);
      }

      // 6. Final Data Presence Check
      if (values.length === 0) return;

      // 7. Get selected value
      let selectedValue: number | undefined;
      if (selectedCell) {
        const val = selectedCell.residuals[indicator.key];
        if (typeof val === 'number' && !isNaN(val)) {
          // We keep the selected value even if it falls outside the plotted distribution (legacy behavior).
          selectedValue = val;
        }
      }

      // 8. Group by dimension
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
  }, [gridCells, indicators, selectedCellId, quantile]);
}

import { useMemo } from 'react';
import { quantile } from 'd3-array';
import type { RichGridCell } from '@/data/types/grid.types';
import type { FilterState } from '../types/filter.types';
import type {
  Indicator,
  DistributionsByDimension
} from '../types/indicator.types';

export function useIndicatorDistributions(
  gridCells: RichGridCell[],
  indicators: Indicator[],
  filterState: FilterState,
  selectedCellId: number | null,
  quantileValue: number
): DistributionsByDimension {
  return useMemo(() => {
    if (!gridCells.length || !indicators.length) return {};

    const selectedCell = selectedCellId
      ? gridCells.find(c => c.id === selectedCellId)
      : null;

    // 1. Filter by habitat presence (legacy pattern)
    const habitatPresence = selectedCell ? {
      mangroves: selectedCell.mangroves === true,
      saltmarsh: selectedCell.saltmarsh === true,
      seagrass: selectedCell.seagrass === true,
    } : null;

    const habitatFilteredIndicators = indicators.filter(ind => {
      if (ind.habitat === 'all') return true;

      // Check UI filter (always required)
      const habitatEnabled = filterState.habitats[ind.habitat];
      if (!habitatEnabled) return false;

      // If a cell is selected, also check habitat presence in that cell
      if (habitatPresence) {
        return habitatPresence[ind.habitat] === true;
      }

      // No cell selected: just use UI filter
      return true;
    });

    // 2. Apply quantile significance test
    const significantIndicators = habitatFilteredIndicators.filter(indicator => {
      const values = gridCells
        .map(cell => cell.residuals[indicator.key])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));

      if (values.length === 0) return false;

      // Calculate quantile range
      const upper = quantile(values, 0.5 + quantileValue / 2);
      const lower = quantile(values, 0.5 - quantileValue / 2);

      if (upper === undefined || lower === undefined) return false;

      // Significance test: range must not cross zero
      const significanceFactor = Math.sign(lower) === Math.sign(upper) ? Math.sign(upper) : 0;
      return significanceFactor !== 0;
    });

    // 3. Build distributions for significant indicators
    const distributions: DistributionsByDimension = {};

    significantIndicators.forEach(indicator => {
      let values = gridCells
        .map(cell => cell.residuals[indicator.key])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));

      if (values.length === 0) return;

      // Apply quantile trimming to values (keep middle range)
      values.sort((a, b) => a - b);
      const lowerIndex = Math.floor(values.length * quantileValue);
      const upperIndex = Math.floor(values.length * (1 - quantileValue));
      values = values.slice(lowerIndex, upperIndex);

      if (values.length === 0) return;

      // Get selected value
      let selectedValue: number | undefined;
      if (selectedCell) {
        const val = selectedCell.residuals[indicator.key];
        if (typeof val === 'number' && !isNaN(val)) {
          selectedValue = val;
        }
      }

      // Group by dimension
      if (!distributions[indicator.dimension]) {
        distributions[indicator.dimension] = [];
      }

      distributions[indicator.dimension].push({
        indicator,
        values,
        selectedValue
      });
    });

    // 4. Sort dimensions alphabetically (legacy behavior)
    const sortedDistributions: DistributionsByDimension = {};
    Object.keys(distributions)
      .sort()
      .forEach(dim => {
        sortedDistributions[dim] = distributions[dim];
      });

    return sortedDistributions;
  }, [gridCells, indicators, filterState, selectedCellId, quantileValue]);
}

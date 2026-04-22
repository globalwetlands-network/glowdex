// Core
import { useMemo } from 'react';

// Types
import type { RichGridCell } from '@/data/types/grid.types';
import type { FilterState } from '../types/filter.types';
import type {
  Indicator,
  DistributionsByDimension,
} from '../types/indicator.types';
import type { AIStatisticalContextV1 } from '@/api/types';
import { Habitat } from '@/types/enums/habitat.enum';

// Utils
import { quantile } from 'd3-array';

// Config
import {
  LEGACY_CUMULATIVE_INDICATORS,
  DIMENSION_ORDER,
} from '../config/analysis.config';

/**
 * Filters grid cells to only those in the selected cell's typology cluster
 */
function getScopedGridCells(
  gridCells: RichGridCell[],
  selectedCell: RichGridCell | null,
  typologyScale: 5 | 18,
): RichGridCell[] {
  if (!selectedCell) return gridCells;

  const clusterKey = typologyScale === 5 ? 'cluster5' : 'cluster18';
  const clusterValue = selectedCell[clusterKey];

  if (clusterValue === undefined) return gridCells;

  return gridCells.filter((c) => c[clusterKey] === clusterValue);
}

/**
 * Extracts residual values for an indicator from grid cells
 */
function getIndicatorValues(
  gridCells: RichGridCell[],
  indicatorKey: string,
): number[] {
  return gridCells
    .map((cell) => cell.residuals[indicatorKey])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
}

/**
 * Tests if an indicator is statistically significant using quantile range
 * Significance = quantile range doesn't cross zero
 */
function isIndicatorSignificant(
  values: number[],
  quantileValue: number,
): boolean {
  if (values.length === 0) return false;

  const upper = quantile(values, 0.5 + quantileValue / 2);
  const lower = quantile(values, 0.5 - quantileValue / 2);

  if (upper === undefined || lower === undefined) return false;

  // Range must not cross zero
  return Math.sign(lower) === Math.sign(upper);
}

/**
 * Filters indicators by habitat presence and UI settings
 */
function filterByHabitat(
  indicators: Indicator[],
  filterState: FilterState,
  selectedCell: RichGridCell | null,
): Indicator[] {
  const habitatPresence = selectedCell
    ? {
        [Habitat.MANGROVES]: selectedCell[Habitat.MANGROVES] === true,
        [Habitat.SALTMARSH]: selectedCell[Habitat.SALTMARSH] === true,
        [Habitat.SEAGRASS]: selectedCell[Habitat.SEAGRASS] === true,
      }
    : null;

  return indicators.filter((ind) => {
    if (ind.habitat === 'all') return true;

    // Check UI filter (always required)
    const habitatEnabled = filterState.habitats[ind.habitat as Habitat];
    if (!habitatEnabled) return false;

    // If a cell is selected, also check habitat presence in that cell
    if (habitatPresence) {
      return habitatPresence[ind.habitat as Habitat] === true;
    }

    return true;
  });
}

/**
 * Restricts cumulative impact indicators to approved set
 */
function filterCumulativeImpacts(indicators: Indicator[]): Indicator[] {
  return indicators.filter((ind) => {
    if (ind.dimension === 'Cumulative Impacts') {
      return LEGACY_CUMULATIVE_INDICATORS.has(ind.key);
    }
    return true;
  });
}

/**
 * Filters indicators by quantile significance test
 */
function filterBySignificance(
  indicators: Indicator[],
  scopedGridCells: RichGridCell[],
  quantileValue: number,
): Indicator[] {
  return indicators.filter((indicator) => {
    const values = getIndicatorValues(scopedGridCells, indicator.key);
    return isIndicatorSignificant(values, quantileValue);
  });
}

/**
 * Builds distribution objects for each indicator
 */
function buildDistributions(
  indicators: Indicator[],
  scopedGridCells: RichGridCell[],
  selectedCell: RichGridCell | null,
  cellStats?: AIStatisticalContextV1,
): DistributionsByDimension {
  const distributions: DistributionsByDimension = {};

  // Build lookup for API stats if available
  const statsMap = new Map<
    string,
    { sampledDistribution: number[]; cellValue: number }
  >();
  if (cellStats) {
    cellStats.summaries.forEach((s) => {
      statsMap.set(s.key, {
        sampledDistribution: s.sampledDistribution,
        cellValue: s.cellValue,
      });
    });
  }

  indicators.forEach((indicator) => {
    // 1. Check if we have backend API stats for this indicator (Priority)
    const apiStats = statsMap.get(indicator.key);

    let values: number[];
    let selectedValue: number | undefined;

    if (apiStats) {
      values = apiStats.sampledDistribution;
      selectedValue = apiStats.cellValue;
    } else {
      // 2. Fallback to local residuals (e.g. when no cell is selected or for legacy indicators)
      values = getIndicatorValues(scopedGridCells, indicator.key);
      if (values.length === 0) return;

      if (selectedCell) {
        const val = selectedCell.residuals[indicator.key];
        if (typeof val === 'number' && !isNaN(val)) {
          selectedValue = val;
        }
      }
    }

    // Group by dimension
    if (!distributions[indicator.dimension]) {
      distributions[indicator.dimension] = [];
    }

    distributions[indicator.dimension].push({
      indicator,
      values,
      selectedValue,
    });
  });

  return distributions;
}

/**
 * Sorts distributions by predefined dimension order
 */
function sortDistributionsByDimension(
  distributions: DistributionsByDimension,
): DistributionsByDimension {
  const sorted: DistributionsByDimension = {};

  DIMENSION_ORDER.forEach((dim) => {
    if (distributions[dim]) {
      sorted[dim] = distributions[dim];
    }
  });

  return sorted;
}

/**
 * Hook to compute indicator distributions for violin plots
 * Filters indicators by habitat, cumulative impacts, and significance
 * Scopes distributions to selected cell's typology cluster
 */
export function useIndicatorDistributions(
  gridCells: RichGridCell[],
  indicators: Indicator[],
  filterState: FilterState,
  selectedCellId: number | null,
  quantileValue: number,
  typologyScale: 5 | 18 = 5,
  cellStats?: AIStatisticalContextV1,
): DistributionsByDimension {
  return useMemo(() => {
    if (!gridCells.length || !indicators.length) return {};

    const selectedCell = selectedCellId
      ? gridCells.find((c) => c.id === selectedCellId) || null
      : null;

    // Scope to typology cluster
    const scopedGridCells = getScopedGridCells(
      gridCells,
      selectedCell,
      typologyScale,
    );

    // Apply filters in sequence
    let filteredIndicators = filterByHabitat(
      indicators,
      filterState,
      selectedCell,
    );
    filteredIndicators = filterCumulativeImpacts(filteredIndicators);

    // Only apply significance test when cell is selected (and we use local fallback)
    // If we have API stats, we trust the backend's choice of indicators
    if (selectedCell && !cellStats) {
      filteredIndicators = filterBySignificance(
        filteredIndicators,
        scopedGridCells,
        quantileValue,
      );
    }

    // Build and sort distributions
    const distributions = buildDistributions(
      filteredIndicators,
      scopedGridCells,
      selectedCell,
      cellStats,
    );
    return sortDistributionsByDimension(distributions);
  }, [
    gridCells,
    indicators,
    filterState,
    selectedCellId,
    quantileValue,
    typologyScale,
    cellStats,
  ]);
}

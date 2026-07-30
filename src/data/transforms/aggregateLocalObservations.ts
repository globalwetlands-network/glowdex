/**
 * Aggregation utilities for local wetlands observation data.
 *
 * Shared between SiteConditionChart and any future charts
 * (e.g. species composition) to avoid duplicating
 * aggregation logic across UI components.
 *
 * Mirrors the aggregation logic in the R/Shiny reference
 * implementation: sum species densities per condition per
 * year, combine SE values using root sum of squares.
 */

import type {
  LocalObservation,
  SiteCondition,
} from '../types/local-wetlands.types';

export const CONDITIONS: SiteCondition[] = [
  'Reference',
  'Degraded',
  'Rehabilitated',
];

export interface AggregatedCondition {
  siteType: SiteCondition;
  totalDensity: number;
  combinedSE: number;
  samplesN: number;
}

/**
 * Aggregates observations for a single year across all
 * three site conditions.
 *
 * For each condition:
 * - Sums species densities (total abundance)
 * - Combines SE values using root sum of squares
 * - Takes samplesN from the first matching row
 *   (assumed consistent within a condition/year)
 *
 * Returns all three conditions even when no data exists
 * for a condition — zero density with zero SE. This
 * ensures the chart always renders three bars, consistent
 * with the reference implementation's scale_x_discrete
 * drop=FALSE behaviour.
 */
export function aggregateByCondition(
  observations: LocalObservation[],
  year: number,
): AggregatedCondition[] {
  return CONDITIONS.map((siteType) => {
    const rows = observations.filter(
      (o) => o.year === year && o.siteType === siteType,
    );

    const totalDensity = rows.reduce((sum, o) => sum + o.density, 0);
    const combinedSE = Math.sqrt(rows.reduce((sum, o) => sum + o.se ** 2, 0));
    const samplesN = rows[0]?.samplesN ?? 0;

    return { siteType, totalDensity, combinedSE, samplesN };
  });
}

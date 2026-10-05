/**
 * Shapes local wetlands observation data for display.
 *
 * Each observations row is one sampling point's measurement, so
 * rows are shown individually rather than summed: a site may carry
 * several points of the same condition (e.g. two Reference points),
 * and densities at separate points are not additive.
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

/**
 * One observation row for display. Field names match the backend's
 * LocalSiteConditionDto so entries can be sent to the AI unchanged;
 * `totalDensity` / `combinedSE` hold the row's own density and SE.
 */
export interface ConditionEntry {
  siteType: SiteCondition;
  /**
   * The plain condition name when the condition has one row in the
   * year, otherwise numbered in file order ("Reference 1",
   * "Reference 2"). Unique within the returned list.
   */
  label: string;
  totalDensity: number;
  combinedSE: number;
  samplesN: number;
}

/**
 * Returns one entry per observation row for a single year, ordered
 * Reference, Degraded, Rehabilitated and then by file order within a
 * condition. Conditions with no rows are omitted — callers that need
 * a slot per condition (the chart) add their own placeholders.
 */
export function observationEntries(
  observations: LocalObservation[],
  year: number,
): ConditionEntry[] {
  return CONDITIONS.flatMap((siteType) => {
    const rows = observations.filter(
      (o) => o.year === year && o.siteType === siteType,
    );
    return rows.map((o, i) => ({
      siteType,
      label: rows.length === 1 ? siteType : `${siteType} ${i + 1}`,
      totalDensity: o.density,
      combinedSE: o.se,
      samplesN: o.samplesN,
    }));
  });
}

export interface AggregatedCondition {
  siteType: SiteCondition;
  totalDensity: number;
  combinedSE: number;
  samplesN: number;
}

/**
 * Sums observations per condition for a single year (densities
 * summed, SE combined by root sum of squares, samplesN from the first
 * row), returning all three conditions with zeros where empty.
 *
 * Only LocalSiteTooltip still uses this. It predates sites carrying
 * several points per condition, so it sums separate points; remove it
 * once the tooltip moves to observationEntries.
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

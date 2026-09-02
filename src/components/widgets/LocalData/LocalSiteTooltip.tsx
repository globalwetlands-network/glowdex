/**
 * LocalSiteTooltip
 *
 * Hover tooltip contents for a local monitoring-site marker.
 * Rendered by the map's positioned wrapper (Map.tsx).
 *
 * Two modes, driven by `hoveredCondition`:
 *   - Point hover (zoomed in): one badge for the hovered point's
 *     condition.
 *   - Site hover (low zoom): a badge per distinct condition at the
 *     site, ordered by SITE_CONDITION_ORDER.
 *
 * Where analysed density data exists, each condition badge is
 * annotated with the crab density for the latest year (reusing the
 * chart's aggregateByCondition). Sites with no observations show a
 * "Data still to be analysed" line so empty sites still read clearly.
 */

import type { LocalSite } from '@/data/types/local-wetlands.types';
import { aggregateByCondition } from '@/data/transforms/aggregateLocalObservations';
import {
  SITE_CONDITION_COLORS,
  SITE_CONDITION_ORDER,
  SITE_CONDITION_FALLBACK_COLOR,
} from '@/data/constants/localWetlands.constants';

interface LocalSiteTooltipProps {
  /** Full site record (looked up by id); undefined if not found. */
  site: LocalSite | undefined;
  /** Fallback name/country when the site record is unavailable. */
  name: string;
  country: string;
  /**
   * The hovered point's condition (point layer), or null for the
   * low-zoom site layer where all conditions are shown.
   */
  hoveredCondition: string | null;
}

/** Distinct conditions at a site, ordered by SITE_CONDITION_ORDER (unknowns appended). */
function orderedConditions(site: LocalSite): string[] {
  const present = [...new Set(site.points.map((p) => p.condition))].filter(
    Boolean,
  );
  return present.sort((a, b) => {
    const ia = SITE_CONDITION_ORDER.indexOf(a);
    const ib = SITE_CONDITION_ORDER.indexOf(b);
    return (
      (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) -
      (ib === -1 ? Number.MAX_SAFE_INTEGER : ib)
    );
  });
}

export function LocalSiteTooltip({
  site,
  name,
  country,
  hoveredCondition,
}: LocalSiteTooltipProps) {
  // Density per condition for the latest year, keyed by condition.
  const latestYear = site?.availableYears.at(-1) ?? null;
  const densityByCondition = new Map<string, number>();
  if (site && latestYear !== null) {
    for (const agg of aggregateByCondition(site.observations, latestYear)) {
      if (agg.samplesN > 0) {
        densityByCondition.set(agg.siteType, agg.totalDensity);
      }
    }
  }

  const conditions = hoveredCondition
    ? [hoveredCondition]
    : site
      ? orderedConditions(site)
      : [];

  const noData = !!site && site.observations.length === 0;

  return (
    <>
      <div className="font-bold text-gray-900">{site?.name ?? name}</div>
      <div className="text-gray-600">{site?.country ?? country}</div>

      {conditions.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-1">
          {conditions.map((condition) => {
            const density = densityByCondition.get(condition);
            return (
              <div key={condition} className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{
                    backgroundColor:
                      SITE_CONDITION_COLORS[condition] ??
                      SITE_CONDITION_FALLBACK_COLOR,
                  }}
                >
                  {condition}
                </span>
                {density !== undefined && (
                  <span className="text-xs text-gray-600">
                    {density.toFixed(1)} ind/m²
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {noData && (
        <div className="mt-1 text-xs text-gray-500 italic">
          Data still to be analysed
        </div>
      )}

      <div className="mt-1 text-xs text-[#0f6e56]">Local Monitoring Site</div>
    </>
  );
}

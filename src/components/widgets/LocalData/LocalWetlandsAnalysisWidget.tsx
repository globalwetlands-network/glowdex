/**
 * LocalWetlandsAnalysisWidget
 *
 * Displays partner-collected local field data for the
 * monitoring site associated with the selected grid cell.
 *
 * Sits below GlobalWetlandsAnalysisWidget in the Analysis
 * tab. Only renders when a monitoring site falls within
 * the distance threshold of the selected cell.
 *
 * Data flow:
 * - Receives localSites from DataContext via SidePanel
 * - Finds the nearest site to the selected cell using
 *   findNearestSite with a distance threshold
 * - Shows site name, country, partner link, inactive year
 *   selector, crab density chart, and species composition
 *   trigger
 *
 * The partner link resolves the website URL from the site's
 * partnerId via the usePartners hook (TanStack Query —
 * deduplicated with PartnerWidget / PartnerLayer).
 */

import { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { EnrichedGridCell } from '@/app/types/app.types';
import { findNearestSite } from '@/utils/geo';
import { usePartners } from '@/api/hooks/usePartners';
import { SiteConditionChart } from './SiteConditionChart';
import { SpeciesCompositionTrigger } from './SpeciesCompositionTrigger';

/**
 * Maximum distance in km between a monitoring site and the
 * selected cell center for the site to be considered
 * associated with that cell.
 *
 * 100km × √2 ≈ 141km (grid cell diagonal) + 16km buffer
 * = 157km. Sites beyond this threshold are not shown,
 * preventing cross-cell associations.
 *
 * TODO: Pre-filter localSites by country or bounding box
 * before calling findNearestSite when the dataset grows
 * beyond a handful of sites — the current O(n) scan across
 * all sites globally is acceptable for small datasets.
 */
const MAX_SITE_ASSOCIATION_DISTANCE_KM = 157;

interface LocalWetlandsAnalysisWidgetProps {
  localSites: LocalSite[];
  selectedCell: EnrichedGridCell | null;
}

export function LocalWetlandsAnalysisWidget({
  localSites,
  selectedCell,
}: LocalWetlandsAnalysisWidgetProps) {
  const { data: partnersData } = usePartners();

  /**
   * selectedYear drives the active year when the time
   * slider is implemented. Currently null — activeYear
   * always defaults to the most recent available year.
   * The two-value pattern (selectedYear + activeYear) is
   * intentional scaffolding for the future time slider:
   * selectedYear holds the user's explicit choice,
   * activeYear resolves it against available data.
   */
  const [selectedYear] = useState<number | null>(null);

  const associatedSite = useMemo(() => {
    if (!selectedCell?.centerCoords || !localSites.length) {
      return null;
    }

    const result = findNearestSite(
      selectedCell.centerCoords.latitude,
      selectedCell.centerCoords.longitude,
      localSites,
    );

    if (!result || result.distanceKm > MAX_SITE_ASSOCIATION_DISTANCE_KM) {
      return null;
    }

    return result.site;
  }, [selectedCell, localSites]);

  const activeYear = useMemo(() => {
    if (!associatedSite) return null;
    if (selectedYear && associatedSite.availableYears.includes(selectedYear)) {
      return selectedYear;
    }
    return associatedSite.availableYears.at(-1) ?? null;
  }, [associatedSite, selectedYear]);

  const partner = useMemo(() => {
    if (!associatedSite?.partnerId || !partnersData?.partners) return null;
    return (
      partnersData.partners.find((p) => p.id === associatedSite.partnerId) ??
      null
    );
  }, [associatedSite, partnersData]);

  if (!associatedSite || !activeYear) return null;

  const yearIndex = associatedSite.availableYears.indexOf(activeYear);
  const yearProgress =
    yearIndex / Math.max(associatedSite.availableYears.length - 1, 1);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Local Wetlands Analysis
        </p>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {associatedSite.name}
            </p>
            <p className="text-xs text-gray-500">{associatedSite.country}</p>
          </div>
          {/* Only render https:// URLs — http:// links are
              silently dropped as a security precaution.
              Partner URLs from the API are expected to be
              https:// — if a link is missing, check the
              partner registry data. */}
          {partner?.websiteUrl?.startsWith('https://') && (
            <a
              href={partner.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors shrink-0"
            >
              <ExternalLink size={10} />
              {partner.institution}
            </a>
          )}
        </div>
      </div>

      {/* Inactive year slider — scaffolding for future time series feature */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 shrink-0">{activeYear}</span>
        <div
          className="flex-1 relative h-1.5 bg-gray-100 rounded-full cursor-not-allowed"
          title="Time series coming soon"
        >
          <div
            className="absolute w-3 h-3 rounded-full bg-gray-300 top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${yearProgress * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-300 shrink-0 italic">
          Time series coming soon
        </span>
      </div>

      {/* Crab density chart */}
      <SiteConditionChart
        observations={associatedSite.observations}
        year={activeYear}
      />

      {/* Species composition trigger — inactive */}
      <div className="border-t border-gray-100 pt-2">
        <SpeciesCompositionTrigger />
      </div>
    </div>
  );
}

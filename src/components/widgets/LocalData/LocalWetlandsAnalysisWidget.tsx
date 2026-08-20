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
 *
 * URL policy: only https:// partner URLs are rendered.
 * http:// URLs are silently dropped. This convention
 * is applied consistently across all components that
 * render partner website links.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { EnrichedGridCell } from '@/app/types/app.types';
import { findNearestSite } from '@/utils/geo';
import { MAX_SITE_ASSOCIATION_DISTANCE_KM } from '@/data/constants/localWetlands.constants';
import { usePartners } from '@/api/hooks/usePartners';
import { SiteConditionChart } from './SiteConditionChart';
import { SpeciesCompositionTrigger } from './SpeciesCompositionTrigger';

/**
 * TODO: Pre-filter localSites by country or bounding box
 * before calling findNearestSite when the dataset grows
 * beyond a handful of sites — the current O(n) scan across
 * all sites globally is acceptable for small datasets.
 */

interface LocalWetlandsAnalysisWidgetProps {
  localSites: LocalSite[];
  selectedCell: EnrichedGridCell | null;
  /**
   * Active site ID — single source of truth owned by
   * App.tsx. Set by map pin clicks and dropdown
   * interactions (via onSiteSelect). Cleared on cell
   * select or clear selection so the widget reverts to
   * proximity association.
   * null when no explicit selection has been made.
   */
  selectedSiteId: string | null;
  onSiteSelect: (siteId: string) => void;
  localSiteLayerEnabled: boolean;
  onLocalSiteLayerToggle: (enabled: boolean) => void;
  /**
   * Called when a site is automatically associated with
   * the selected cell via proximity. Allows App.tsx to
   * compute localSiteContext for the AI even when no
   * explicit site selection has been made.
   * Called with null when no site is in proximity range.
   */
  onSiteAssociated?: (siteId: string | null) => void;
}

/**
 * Section header with the "Local Wetlands Analysis" title and
 * the map-layer toggle. Shared across the render branches so the
 * toggle stays available whether or not the selected site has data.
 */
interface SectionHeaderProps {
  localSiteLayerEnabled: boolean;
  onToggle: () => void;
}

function SectionHeader({
  localSiteLayerEnabled,
  onToggle,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Local Wetlands Analysis
      </p>
      <button
        role="switch"
        aria-checked={localSiteLayerEnabled}
        onClick={onToggle}
        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          localSiteLayerEnabled ? 'bg-[#0f6e56]' : 'bg-gray-200'
        }`}
        aria-label={
          localSiteLayerEnabled
            ? 'Hide monitoring locations on map'
            : 'Show monitoring locations on map'
        }
        title={
          localSiteLayerEnabled
            ? 'Hide monitoring locations on map'
            : 'Show monitoring locations on map'
        }
      >
        <span
          className={`pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
            localSiteLayerEnabled ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Side-by-side Country + Monitoring location dropdowns. Shared by
 * the no-data and full-data branches so a user can always navigate
 * to another location regardless of whether the current one has
 * analysed data. Changing country auto-selects the first site in
 * that country immediately.
 */
interface LocationSelectorsProps {
  availableCountries: string[];
  activeSitesForSelector: LocalSite[];
  selectedCountry: string;
  selectedSiteValue: string;
  onCountryChange: (country: string) => void;
  onSiteSelect: (siteId: string) => void;
}

function LocationSelectors({
  availableCountries,
  activeSitesForSelector,
  selectedCountry,
  selectedSiteValue,
  onCountryChange,
  onSiteSelect,
}: LocationSelectorsProps) {
  return (
    <div className="flex gap-2">
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        aria-label="Country"
        className="flex-1 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
      >
        {availableCountries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <select
        value={selectedSiteValue}
        onChange={(e) => onSiteSelect(e.target.value)}
        aria-label="Monitoring location"
        className="flex-1 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
      >
        {activeSitesForSelector.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LocalWetlandsAnalysisWidget({
  localSites,
  selectedCell,
  selectedSiteId,
  onSiteSelect,
  localSiteLayerEnabled,
  onLocalSiteLayerToggle,
  onSiteAssociated,
}: LocalWetlandsAnalysisWidgetProps) {
  const posthog = usePostHog();
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

  // associatedSiteResult must be defined before activeSitesForSelector.
  // Returns the site and distanceKm when proximity-associated so the
  // analytics event can include the distance; distanceKm is null for
  // explicit (non-proximity) selections.
  const associatedSiteResult = useMemo(() => {
    // External selection (map pin click or dropdown)
    // takes priority — fully controlled by App.tsx
    // via selectedSiteId prop.
    if (selectedSiteId) {
      const site = localSites.find((s) => s.id === selectedSiteId) ?? null;
      return site ? { site, distanceKm: null, isProximity: false } : null;
    }

    // Fall back to proximity association when no
    // explicit selection has been made.
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

    return {
      site: result.site,
      distanceKm: result.distanceKm,
      isProximity: true,
    };
  }, [selectedCell, localSites, selectedSiteId]);

  const associatedSite = associatedSiteResult?.site ?? null;

  const availableCountries = useMemo(() => {
    return [...new Set(localSites.map((s) => s.country))].sort();
  }, [localSites]);

  const activeSitesForSelector = useMemo(() => {
    const country = associatedSite?.country ?? null;
    if (!country) return [];
    return localSites.filter((s) => s.country === country);
  }, [localSites, associatedSite]);

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

  const handleSiteSelect = useCallback(
    (siteId: string) => {
      if (!siteId) return;
      const site = localSites.find((s) => s.id === siteId);
      try {
        posthog?.capture('local_site_selected', {
          site_id: siteId,
          site_name: site?.name ?? null,
          site_country: site?.country ?? null,
          partner_id: site?.partnerId ?? null,
          trigger_source: 'site_dropdown',
          had_cell_selected: !!selectedCell,
        });
      } catch (error) {
        console.error('Failed to capture local_site_selected event:', error);
      }
      onSiteSelect(siteId);
    },
    [localSites, onSiteSelect, posthog, selectedCell],
  );

  const handleLayerToggle = useCallback(() => {
    const next = !localSiteLayerEnabled;
    try {
      posthog?.capture('local_site_layer_toggled', {
        enabled: next,
        source: 'local_data_widget',
      });
    } catch (error) {
      console.error('Failed to capture local_site_layer_toggled event:', error);
    }
    onLocalSiteLayerToggle(next);
  }, [localSiteLayerEnabled, onLocalSiteLayerToggle, posthog]);

  const handleCountryChange = useCallback(
    (country: string) => {
      if (!country) return;
      const firstSite = localSites.find((s) => s.country === country);
      if (firstSite) {
        try {
          posthog?.capture('local_site_selected', {
            site_id: firstSite.id,
            site_name: firstSite.name,
            site_country: firstSite.country,
            partner_id: firstSite.partnerId ?? null,
            trigger_source: 'country_dropdown',
            had_cell_selected: !!selectedCell,
          });
        } catch (error) {
          console.error('Failed to capture local_site_selected event:', error);
        }
        onSiteSelect(firstSite.id);
      } else {
        console.warn(`No sites found for country "${country}"`);
      }
    },
    [localSites, onSiteSelect, posthog, selectedCell],
  );

  useEffect(() => {
    if (!onSiteAssociated) return;
    // Only fire for proximity associations —
    // explicit selections are already handled by
    // handleSiteSelect → onSiteSelect in App.tsx.
    if (!selectedSiteId) {
      onSiteAssociated(associatedSite?.id ?? null);
    }
  }, [associatedSite, selectedSiteId, onSiteAssociated]);

  useEffect(() => {
    if (!associatedSiteResult?.isProximity || !associatedSite) return;
    try {
      posthog?.capture('local_site_proximity_associated', {
        site_id: associatedSite.id,
        site_name: associatedSite.name,
        site_country: associatedSite.country,
        partner_id: associatedSite.partnerId ?? null,
        distance_km: associatedSiteResult.distanceKm,
        cell_id:
          selectedCell?.id !== undefined ? String(selectedCell.id) : null,
      });
    } catch (error) {
      console.error(
        'Failed to capture local_site_proximity_associated event:',
        error,
      );
    }
  }, [associatedSiteResult, associatedSite, selectedCell, posthog]);

  if (!associatedSite) {
    return (
      <div className="space-y-3">
        <SectionHeader
          localSiteLayerEnabled={localSiteLayerEnabled}
          onToggle={handleLayerToggle}
        />
        <p className="text-xs text-gray-500">
          Select a monitoring location to view local field data.
        </p>

        {/* Country selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Country</label>
          <select
            value=""
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full text-xs rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
          >
            <option value="">Select country...</option>
            {availableCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Site selector — shown once a site is selected (country is known) */}
        {associatedSite && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">
              Monitoring location
            </label>
            <select
              value={selectedSiteId ?? ''}
              onChange={(e) => handleSiteSelect(e.target.value)}
              className="w-full text-xs rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
            >
              <option value="">Select location...</option>
              {activeSitesForSelector.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  if (!activeYear) {
    return (
      <div className="space-y-3">
        <SectionHeader
          localSiteLayerEnabled={localSiteLayerEnabled}
          onToggle={handleLayerToggle}
        />

        {/* Site selectors — kept visible for no-data sites so the
            user can always navigate to another location. */}
        <LocationSelectors
          availableCountries={availableCountries}
          activeSitesForSelector={activeSitesForSelector}
          selectedCountry={associatedSite.country}
          selectedSiteValue={selectedSiteId ?? associatedSite.id}
          onCountryChange={handleCountryChange}
          onSiteSelect={handleSiteSelect}
        />

        {/* Site name + partner link */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {associatedSite.name}
            </p>
            <p className="text-xs text-gray-500">{associatedSite.country}</p>
          </div>
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
        <p className="text-xs text-gray-500 italic">
          Data still to be analysed
        </p>
      </div>
    );
  }

  const yearIndex = associatedSite.availableYears.indexOf(activeYear);
  const yearProgress =
    yearIndex / Math.max(associatedSite.availableYears.length - 1, 1);

  return (
    <div className="space-y-3">
      <SectionHeader
        localSiteLayerEnabled={localSiteLayerEnabled}
        onToggle={handleLayerToggle}
      />

      {/* Site selectors — changing country auto-selects
          the first site in that country immediately. */}
      <LocationSelectors
        availableCountries={availableCountries}
        activeSitesForSelector={activeSitesForSelector}
        selectedCountry={associatedSite.country}
        selectedSiteValue={selectedSiteId ?? associatedSite.id}
        onCountryChange={handleCountryChange}
        onSiteSelect={handleSiteSelect}
      />

      {/* Site name + partner link */}
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

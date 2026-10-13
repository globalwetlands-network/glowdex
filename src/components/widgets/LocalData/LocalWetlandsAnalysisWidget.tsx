/**
 * LocalWetlandsAnalysisWidget
 *
 * Displays partner-collected local field data for the
 * selected monitoring site. Renders in Local mode's Analysis
 * tab (GLO-207) and in the landing page's read-only showcase.
 *
 * Data flow:
 * - Receives localSites from DataContext via SidePanel
 * - Shows the explicitly selected site (`selectedSiteId`,
 *   from a pin click or the dropdowns). There is no
 *   proximity fallback: a grid cell never picks a site.
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

import { useState, useMemo, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import { usePartners } from '@/api/hooks/usePartners';
import { SiteConditionChart } from './SiteConditionChart';
import { SpeciesCompositionTrigger } from './SpeciesCompositionTrigger';

/**
 * Formats an ISO date (YYYY-MM-DD) as "Mon YYYY" for the
 * "last refreshed" caption. Parsed manually to avoid timezone
 * shifts from Date parsing of date-only strings.
 */
function formatUpdated(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-\d{2}/.exec(iso);
  if (!match) return null;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : null;
}

interface LocalWetlandsAnalysisWidgetProps {
  localSites: LocalSite[];
  /** ISO date local data was last refreshed, or null if unavailable. */
  localDataUpdated: string | null;
  /**
   * Active site ID — single source of truth owned by
   * App.tsx (the `?site=` param). Set by map pin clicks and
   * dropdown interactions (via onSiteSelect). null when no
   * site has been selected.
   */
  selectedSiteId: string | null;
  onSiteSelect: (siteId: string) => void;
  localSiteLayerEnabled: boolean;
  onLocalSiteLayerToggle: (enabled: boolean) => void;
  /**
   * Hides the map-layer switch. Local mode (GLO-207) forces the
   * monitoring-location pins on, so there is nothing to toggle.
   */
  hideLayerToggle?: boolean;
  /**
   * Static showcase (landing page): hides the map-layer toggle and
   * disables the location selectors, so nothing looks interactive and
   * no interaction analytics are captured.
   */
  readOnly?: boolean;
}

/**
 * Section header with the "Local Wetlands Analysis" title and
 * the map-layer toggle. Shared across the render branches so the
 * toggle stays available whether or not the selected site has data.
 */
interface SectionHeaderProps {
  localSiteLayerEnabled: boolean;
  /** Omit to hide the map-layer toggle. */
  onToggle?: () => void;
  /** "Mon YYYY" caption, or null to hide the last-refreshed line. */
  updatedLabel: string | null;
  hideLayerToggle?: boolean;
}

function SectionHeader({
  localSiteLayerEnabled,
  onToggle,
  updatedLabel,
  hideLayerToggle = false,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Local Wetlands Analysis
        </p>
        {updatedLabel && (
          <p className="text-[10px] text-gray-400">Updated {updatedLabel}</p>
        )}
      </div>
      {onToggle && !hideLayerToggle && (
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
      )}
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
  disabled?: boolean;
}

function LocationSelectors({
  availableCountries,
  activeSitesForSelector,
  selectedCountry,
  selectedSiteValue,
  onCountryChange,
  onSiteSelect,
  disabled = false,
}: LocationSelectorsProps) {
  return (
    <div className="flex gap-2">
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        disabled={disabled}
        aria-label="Country"
        className="flex-1 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer disabled:cursor-default"
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
        disabled={disabled}
        aria-label="Monitoring location"
        className="flex-1 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer disabled:cursor-default"
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
  localDataUpdated,
  selectedSiteId,
  onSiteSelect,
  localSiteLayerEnabled,
  onLocalSiteLayerToggle,
  hideLayerToggle = false,
  readOnly = false,
}: LocalWetlandsAnalysisWidgetProps) {
  const posthog = usePostHog();
  const { data: partnersData } = usePartners();

  const updatedLabel = localDataUpdated
    ? formatUpdated(localDataUpdated)
    : null;

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

  // Must be defined before activeSitesForSelector.
  const selectedSite = useMemo(
    () =>
      selectedSiteId
        ? (localSites.find((s) => s.id === selectedSiteId) ?? null)
        : null,
    [localSites, selectedSiteId],
  );

  const availableCountries = useMemo(() => {
    return [...new Set(localSites.map((s) => s.country))].sort();
  }, [localSites]);

  const activeSitesForSelector = useMemo(() => {
    const country = selectedSite?.country ?? null;
    if (!country) return [];
    return localSites.filter((s) => s.country === country);
  }, [localSites, selectedSite]);

  const activeYear = useMemo(() => {
    if (!selectedSite) return null;
    if (selectedYear && selectedSite.availableYears.includes(selectedYear)) {
      return selectedYear;
    }
    return selectedSite.availableYears.at(-1) ?? null;
  }, [selectedSite, selectedYear]);

  const partner = useMemo(() => {
    if (!selectedSite?.partnerId || !partnersData?.partners) return null;
    return (
      partnersData.partners.find((p) => p.id === selectedSite.partnerId) ?? null
    );
  }, [selectedSite, partnersData]);

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
          mode: 'local',
        });
      } catch (error) {
        console.error('Failed to capture local_site_selected event:', error);
      }
      onSiteSelect(siteId);
    },
    [localSites, onSiteSelect, posthog],
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
            mode: 'local',
          });
        } catch (error) {
          console.error('Failed to capture local_site_selected event:', error);
        }
        onSiteSelect(firstSite.id);
      } else {
        console.warn(`No sites found for country "${country}"`);
      }
    },
    [localSites, onSiteSelect, posthog],
  );

  if (!selectedSite) {
    return (
      <div className="space-y-3">
        <SectionHeader
          localSiteLayerEnabled={localSiteLayerEnabled}
          onToggle={readOnly ? undefined : handleLayerToggle}
          updatedLabel={updatedLabel}
          hideLayerToggle={hideLayerToggle}
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
            disabled={readOnly}
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
        {selectedSite && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">
              Monitoring location
            </label>
            <select
              value={selectedSiteId ?? ''}
              onChange={(e) => handleSiteSelect(e.target.value)}
              disabled={readOnly}
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
          onToggle={readOnly ? undefined : handleLayerToggle}
          updatedLabel={updatedLabel}
          hideLayerToggle={hideLayerToggle}
        />

        {/* Site selectors — kept visible for no-data sites so the
            user can always navigate to another location. */}
        <LocationSelectors
          availableCountries={availableCountries}
          activeSitesForSelector={activeSitesForSelector}
          selectedCountry={selectedSite.country}
          selectedSiteValue={selectedSiteId ?? selectedSite.id}
          onCountryChange={handleCountryChange}
          onSiteSelect={handleSiteSelect}
          disabled={readOnly}
        />

        {/* Site name + partner link */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {selectedSite.name}
            </p>
            <p className="text-xs text-gray-500">{selectedSite.country}</p>
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

  const yearIndex = selectedSite.availableYears.indexOf(activeYear);
  const yearProgress =
    yearIndex / Math.max(selectedSite.availableYears.length - 1, 1);

  return (
    <div className="space-y-3">
      <SectionHeader
        localSiteLayerEnabled={localSiteLayerEnabled}
        onToggle={readOnly ? undefined : handleLayerToggle}
        updatedLabel={updatedLabel}
        hideLayerToggle={hideLayerToggle}
      />

      {/* Site selectors — changing country auto-selects
          the first site in that country immediately. */}
      <LocationSelectors
        availableCountries={availableCountries}
        activeSitesForSelector={activeSitesForSelector}
        selectedCountry={selectedSite.country}
        selectedSiteValue={selectedSiteId ?? selectedSite.id}
        onCountryChange={handleCountryChange}
        onSiteSelect={handleSiteSelect}
        disabled={readOnly}
      />

      {/* Site name + partner link */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {selectedSite.name}
          </p>
          <p className="text-xs text-gray-500">{selectedSite.country}</p>
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
        observations={selectedSite.observations}
        year={activeYear}
      />

      {/* Species composition trigger — inactive */}
      <div className="border-t border-gray-100 pt-2">
        <SpeciesCompositionTrigger />
      </div>
    </div>
  );
}

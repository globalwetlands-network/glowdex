import { useMemo, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import { useDemoPlots } from '@/features/analytics';
import { continentOf } from '../config/continents';
import type { CrabMetric, CrabView } from '../demoPlots/manifest';
import {
  comparedLabel,
  countryOptions,
  hasResults,
  sitesWithResults,
  type ViewSelection,
} from '../utils/siteAvailability';
import { DataTabs } from './DataTabs';
import { EmptyState } from './EmptyState';
import { LocationSelector } from './LocationSelector';
import { NoResultsCard, PanelSkeleton } from './PanelStates';
import { ViewContent } from './ViewContent';

interface LocalAnimalPanelProps {
  localSites: LocalSite[];
  /** The `?site=` param (validated by App), or null. */
  selectedSiteId: string | null;
  onSiteSelect: (siteId: string) => void;
  /** Clears `?site=` when the user picks a different continent or country. */
  onSiteClear: () => void;
}

const DEFAULT_CRAB = { metric: 'density', view: 'by-site' } as const satisfies {
  metric: CrabMetric;
  view: CrabView;
};

/**
 * Local mode's Analysis panel (GLO-221, design "99 local animal panel"):
 * Continent → Country → Location selector, location heading, Crabs/Wildlife
 * tabs and the selected view. Demo plots appear only when `useDemoPlots()`
 * is on; while it resolves, a skeleton shows instead of the normal view.
 */
export function LocalAnimalPanel(props: LocalAnimalPanelProps) {
  const demo = useDemoPlots();
  return (
    <div className="@container flex flex-col gap-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-500">
        Local animal data
      </p>
      {demo === 'loading' ? (
        <PanelSkeleton />
      ) : (
        <PanelBody {...props} demoOn={demo === 'on'} />
      )}
    </div>
  );
}

interface PanelBodyProps extends LocalAnimalPanelProps {
  demoOn: boolean;
}

function PanelBody({
  localSites,
  selectedSiteId,
  onSiteSelect,
  onSiteClear,
  demoOn,
}: PanelBodyProps) {
  const posthog = usePostHog();
  const selectedSite = selectedSiteId
    ? (localSites.find((s) => s.id === selectedSiteId) ?? null)
    : null;

  const [continent, setContinent] = useState(
    selectedSite ? continentOf(selectedSite.country) : '',
  );
  const [country, setCountry] = useState(selectedSite?.country ?? '');
  const [selection, setSelection] = useState<ViewSelection>({
    tab: 'crabs',
    ...DEFAULT_CRAB,
  });
  const [crabState, setCrabState] = useState<{
    metric: CrabMetric;
    view: CrabView;
  }>(DEFAULT_CRAB);

  // Follow the selected site (pin clicks, "Open", back/forward): show its
  // continent and country, and start each location on Crabs · Density.
  const [syncedSiteId, setSyncedSiteId] = useState(selectedSiteId);
  if (selectedSiteId !== syncedSiteId) {
    setSyncedSiteId(selectedSiteId);
    if (selectedSite) {
      setContinent(continentOf(selectedSite.country));
      setCountry(selectedSite.country);
      setSelection({ tab: 'crabs', ...DEFAULT_CRAB });
      setCrabState(DEFAULT_CRAB);
    }
  }

  const countries = useMemo(
    () => countryOptions(localSites, demoOn),
    [localSites, demoOn],
  );
  const continents = useMemo(
    () => [...new Set(countries.map((c) => c.continent))].sort(),
    [countries],
  );
  const locations = useMemo(
    () =>
      localSites
        .filter((s) => s.country === country)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((site) => ({ site, hasResults: hasResults(site, demoOn) })),
    [localSites, country, demoOn],
  );
  const available = useMemo(
    () => sitesWithResults(localSites, demoOn),
    [localSites, demoOn],
  );
  const countriesWithResults = countries
    .filter((c) => c.hasResults)
    .map((c) => c.country);
  const dataToCome = countries
    .filter((c) => !c.hasResults)
    .map((c) => c.country);

  /** Selects a site and records how it was chosen. */
  function selectSite(siteId: string, trigger: string): void {
    const site = localSites.find((s) => s.id === siteId);
    try {
      posthog?.capture('local_site_selected', {
        site_id: siteId,
        site_name: site?.name ?? null,
        site_country: site?.country ?? null,
        partner_id: site?.partnerId ?? null,
        trigger_source: trigger,
        mode: 'local',
      });
    } catch (error) {
      console.error('Failed to capture local_site_selected event:', error);
    }
    onSiteSelect(siteId);
  }

  function handleContinentChange(next: string): void {
    setContinent(next);
    setCountry('');
    if (selectedSite) onSiteClear();
  }

  function handleCountryChange(next: string): void {
    setCountry(next);
    const withResults = localSites.filter(
      (s) => s.country === next && hasResults(s, demoOn),
    );
    // One location with results: open it straight away.
    if (withResults.length === 1) {
      selectSite(withResults[0].id, 'country_dropdown');
    } else if (selectedSite) {
      onSiteClear();
    }
  }

  function handleSelectionChange(next: ViewSelection): void {
    setSelection(next);
    if (next.tab === 'crabs') {
      setCrabState({ metric: next.metric, view: next.view });
    }
  }

  const continentHasResults = countries.some(
    (c) => c.continent === continent && c.hasResults,
  );
  const compared = selectedSite ? comparedLabel(selectedSite) : null;

  return (
    <div className="flex flex-col gap-4">
      <LocationSelector
        continents={continents}
        countries={countries}
        locations={locations}
        continent={continent}
        country={country}
        siteId={selectedSite?.id ?? ''}
        onContinentChange={handleContinentChange}
        onCountryChange={handleCountryChange}
        onLocationChange={(id) => selectSite(id, 'site_dropdown')}
      />

      {selectedSite ? (
        <>
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">
              {selectedSite.name}
            </h2>
            <p className="text-[12px] text-gray-500">
              {[
                selectedSite.country,
                continentOf(selectedSite.country),
                compared,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <DataTabs
            site={selectedSite}
            demoOn={demoOn}
            selection={selection}
            crabState={crabState}
            onChange={handleSelectionChange}
          />
          <ViewContent
            site={selectedSite}
            selection={selection}
            demoOn={demoOn}
          />
        </>
      ) : continent && !continentHasResults ? (
        <NoResultsCard
          continent={continent}
          countriesWithResults={countriesWithResults}
        />
      ) : (
        <EmptyState
          available={available}
          dataToCome={dataToCome}
          onOpen={(id) => selectSite(id, 'results_list')}
        />
      )}
    </div>
  );
}

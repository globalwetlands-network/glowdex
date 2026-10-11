import type { LocalSite } from '@/data/types/local-wetlands.types';
import { continentOf } from '../config/continents';
import { PLOT_SUPERSEDES_NATIVE_METRICS } from '../config/panelConfig';
import {
  findCrabPlot,
  findWildlifePlot,
  getPlotsForSite,
  type CrabMetric,
  type CrabView,
  type DemoPlot,
} from '../demoPlots/manifest';

/** The year the native chart shows: the site's most recent year with data. */
export function latestYear(site: LocalSite): number | null {
  return site.availableYears.at(-1) ?? null;
}

/** True when the CSV has density rows for the site (native chart possible). */
export function hasNativeDensity(site: LocalSite): boolean {
  return site.observations.length > 0 && latestYear(site) !== null;
}

/** True when the panel has anything to show for the site. */
export function hasResults(site: LocalSite, demoOn: boolean): boolean {
  return (
    hasNativeDensity(site) || (demoOn && getPlotsForSite(site.id).length > 0)
  );
}

/**
 * True when the site's rows are one per site type (e.g. Degraded /
 * Reference / Rehabilitated), so views read "by site type". False when a
 * type repeats (Australia's Reference 1 and Reference 2 are separate sites).
 */
export function comparesSiteTypes(site: LocalSite): boolean {
  const year = latestYear(site);
  const rows = site.observations.filter((o) => o.year === year);
  return new Set(rows.map((o) => o.siteType)).size === rows.length;
}

/** "3 sites compared" / "3 site types compared", or null without rows. */
export function comparedLabel(site: LocalSite): string | null {
  const year = latestYear(site);
  const count = site.observations.filter((o) => o.year === year).length;
  if (!count) return null;
  const noun = comparesSiteTypes(site)
    ? count === 1
      ? 'site type'
      : 'site types'
    : count === 1
      ? 'site'
      : 'sites';
  return `${count} ${noun} compared`;
}

export interface ResolvedView {
  /** Preview plot to show, when the demo flag is on and one exists. */
  plot: DemoPlot | null;
  /** Whether to show the native CSV chart. */
  native: boolean;
}

export type ViewSelection =
  | { tab: 'crabs'; metric: CrabMetric; view: CrabView }
  | { tab: 'wildlife' };

/**
 * What to render for a view at a site. Neither a plot nor the native chart
 * means "Not yet available".
 */
export function resolveView(
  site: LocalSite,
  selection: ViewSelection,
  demoOn: boolean,
): ResolvedView {
  if (selection.tab === 'wildlife') {
    return {
      plot: demoOn ? (findWildlifePlot(site.id) ?? null) : null,
      native: false,
    };
  }
  const { metric, view } = selection;
  const plot = demoOn ? (findCrabPlot(site.id, metric, view) ?? null) : null;
  // The only native chart today is density by site.
  const nativeExists =
    metric === 'density' && view === 'by-site' && hasNativeDensity(site);
  const superseded =
    plot !== null && PLOT_SUPERSEDES_NATIVE_METRICS.includes(metric);
  return { plot, native: nativeExists && !superseded };
}

/** True when the view has nothing to show. */
export function isUnavailable(resolved: ResolvedView): boolean {
  return !resolved.plot && !resolved.native;
}

export interface CountryOption {
  country: string;
  continent: string;
  hasResults: boolean;
}

/** Countries in the data with their continent and whether any site has results. */
export function countryOptions(
  sites: LocalSite[],
  demoOn: boolean,
): CountryOption[] {
  const byCountry = new Map<string, boolean>();
  for (const site of sites) {
    byCountry.set(
      site.country,
      (byCountry.get(site.country) ?? false) || hasResults(site, demoOn),
    );
  }
  return [...byCountry.entries()]
    .map(([country, results]) => ({
      country,
      continent: continentOf(country),
      hasResults: results,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

/** Sites with results, for the empty state's "Results available" list. */
export function sitesWithResults(
  sites: LocalSite[],
  demoOn: boolean,
): LocalSite[] {
  return sites
    .filter((s) => hasResults(s, demoOn))
    .sort(
      (a, b) =>
        a.country.localeCompare(b.country) || a.name.localeCompare(b.name),
    );
}

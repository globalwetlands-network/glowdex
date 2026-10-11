import type { CrabMetric, CrabView } from '../demoPlots/manifest';

export const CRAB_METRICS: { id: CrabMetric; label: string }[] = [
  { id: 'density', label: 'Density' },
  { id: 'diversity', label: 'Diversity' },
  { id: 'size', label: 'Size' },
];

/** View pills per metric, in design order. */
export const CRAB_VIEWS: Record<CrabMetric, CrabView[]> = {
  density: ['by-site', 'by-species', 'over-time'],
  diversity: ['by-site', 'over-time'],
  size: ['overall', 'by-month'],
};

/** View pill labels. `by-site` becomes "By site type" where sites are site types. */
export function viewLabel(view: CrabView, comparesSiteTypes: boolean): string {
  switch (view) {
    case 'by-site':
      return comparesSiteTypes ? 'By site type' : 'By site';
    case 'by-species':
      return 'By species';
    case 'over-time':
      return 'Over time';
    case 'overall':
      return 'Overall';
    case 'by-month':
      return 'By month';
  }
}

/**
 * Density duplication rule (GLO-221). With the demo flag on, a preview plot
 * for these metrics replaces the native CSV chart at that location, so only
 * one set of numbers is on screen. The CSV and the plot values differ (e.g.
 * Australia CSV 13.6 / 45.6 / 28 crabs per m² vs about 23 / 72 / 44 in the
 * plot) and the difference is unresolved with Rod and Diego.
 */
export const PLOT_SUPERSEDES_NATIVE_METRICS: readonly CrabMetric[] = [
  'density',
  'diversity',
];

/**
 * Neutral site-type palette from the design tokens, for the native chart.
 * No traffic-light colours.
 */
export const SITE_TYPE_COLORS: Record<string, string> = {
  Reference: '#1f5fa8',
  Degraded: '#7e6bb0',
  Rehabilitated: '#1d9e75',
};

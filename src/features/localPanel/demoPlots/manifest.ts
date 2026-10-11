/**
 * Demo plot manifest (GLO-221).
 *
 * Partner-supplied plots (Plots_For_App_Oct2026), shown as a preview behind the
 * `local-demo-plots` flag until the underlying data tables arrive and native
 * charts replace them. The PNGs are used exactly as delivered: never crop,
 * recolour or relabel them. Some use group labels that differ from our UI
 * (e.g. "Restored" for Rehabilitated); they are accepted as delivered.
 *
 * Each `load()` is a literal dynamic import, so Vite emits the image as a
 * hashed asset under the deploy base path, in its own lazy chunk (never in
 * the main bundle). `width`/`height` are the PNG's pixel size, used to
 * reserve layout space and to avoid upscaling small images.
 */

/** Analysis metric a plot shows. */
export type PlotMetric =
  | 'density'
  | 'diversity'
  | 'size'
  | 'composition'
  | 'over-time'
  | 'fish';

/** Crabs / Wildlife toggle in the panel. */
export type PanelTab = 'crabs' | 'wildlife';

/** Metric pill on the Crabs tab. */
export type CrabMetric = 'density' | 'diversity' | 'size';

/** View pill on the Crabs tab. */
export type CrabView =
  | 'by-site'
  | 'by-species'
  | 'over-time'
  | 'overall'
  | 'by-month';

export interface DemoPlot {
  /** File name without extension. */
  id: string;
  /** `site_id` from local-sites.csv. */
  siteId: string;
  metric: PlotMetric;
  tab: PanelTab;
  /** Where the plot sits on the Crabs tab; absent for Wildlife plots. */
  crabMetric?: CrabMetric;
  crabView?: CrabView;
  title: string;
  caption: string;
  alt: string;
  credit: string;
  /** Extra context shown above the plot. */
  note?: string;
  width: number;
  height: number;
  load: () => Promise<string>;
}

const AUS = 'au-moreton-bay';
const PH = 'ph-rasa-island';
const AUS_CREDIT = 'Courtesy of Griffith University';
const PH_CREDIT = 'Courtesy of Katala Foundation';

export const DEMO_PLOTS: readonly DemoPlot[] = [
  // Australia, Southern Moreton Bay
  {
    id: '01_AUS_crab_density_overall',
    siteId: AUS,
    metric: 'density',
    tab: 'crabs',
    crabMetric: 'density',
    crabView: 'by-site',
    title: 'Crab density by site',
    caption:
      'Mean density of mangrove crabs, all species combined, at each site (crabs per m²).',
    alt: 'Bar chart of mean crab density in crabs per square metre, all species combined, for Reference 1, Reference 2 and the rehabilitated site (labelled Restored), with error bars.',
    credit: AUS_CREDIT,
    width: 3455,
    height: 2043,
    load: () =>
      import('./01_AUS_crab_density_overall.png').then((m) => m.default),
  },
  {
    id: '07_AUS_species_composition',
    siteId: AUS,
    metric: 'composition',
    tab: 'crabs',
    crabMetric: 'density',
    crabView: 'by-species',
    title: 'Crab density by species',
    caption:
      'Mean number of crabs per sample for each of the five species recorded, by site.',
    alt: 'Five stacked bar charts, one per crab species (Australoplax tridentata, Tubuca coarctata, Heloecius cordiformis, Tubuca longidigitum, Parasesarma erythrodactyla), each showing the average number of crabs per deployment at Reference 1, Reference 2 and the rehabilitated site (labelled Restored).',
    credit: AUS_CREDIT,
    width: 3195,
    height: 5007,
    load: () =>
      import('./07_AUS_species_composition.png').then((m) => m.default),
  },
  {
    id: '05_AUS_crab_density_over_time',
    siteId: AUS,
    metric: 'over-time',
    tab: 'crabs',
    crabMetric: 'density',
    crabView: 'over-time',
    title: 'Crab density over time',
    caption:
      'Mean density at each site for each sampling month, July 2025 to August 2026 (crabs per m²).',
    alt: 'Line chart of crab density in crabs per square metre by deployment month, July 2025 to August 2026, with one line each for Reference 1, Reference 2 and the rehabilitated site (labelled Restored), with error bars.',
    credit: AUS_CREDIT,
    width: 3543,
    height: 2043,
    load: () =>
      import('./05_AUS_crab_density_over_time.png').then((m) => m.default),
  },
  {
    id: '03_AUS_diversity_overall',
    siteId: AUS,
    metric: 'diversity',
    tab: 'crabs',
    crabMetric: 'diversity',
    crabView: 'by-site',
    title: 'Crab diversity by site',
    caption: 'Mean number of crab species recorded per sample at each site.',
    alt: 'Bar chart of the average number of crab species per deployment for Reference 1, Reference 2 and the rehabilitated site (labelled Restored), with error bars.',
    credit: AUS_CREDIT,
    width: 3243,
    height: 2043,
    load: () => import('./03_AUS_diversity_overall.png').then((m) => m.default),
  },
  {
    id: '06_AUS_diversity_over_time',
    siteId: AUS,
    metric: 'over-time',
    tab: 'crabs',
    crabMetric: 'diversity',
    crabView: 'over-time',
    title: 'Crab diversity over time',
    caption:
      'Mean number of crab species per sample at each site for each sampling month.',
    alt: 'Line chart of the average number of crab species per deployment by deployment month, with one line each for Reference 1, Reference 2 and the rehabilitated site (labelled Restored).',
    credit: AUS_CREDIT,
    width: 3543,
    height: 2043,
    load: () =>
      import('./06_AUS_diversity_over_time.png').then((m) => m.default),
  },
  {
    id: '11_AUS_overall_size_distribution',
    siteId: AUS,
    metric: 'size',
    tab: 'crabs',
    crabMetric: 'size',
    crabView: 'overall',
    title: 'Crab size by site',
    caption:
      'Distribution of carapace width (mm) for all crabs measured at each site.',
    alt: 'Density curves of crab carapace width in millimetres for Reference 1, Reference 2 and the rehabilitated site (labelled Restored), with dotted vertical reference lines and the number of crabs measured in the legend.',
    credit: AUS_CREDIT,
    width: 3843,
    height: 2343,
    load: () =>
      import('./11_AUS_overall_size_distribution.png').then((m) => m.default),
  },
  {
    id: '16_AUS_size_distribution_over_time_restored',
    siteId: AUS,
    metric: 'over-time',
    tab: 'crabs',
    crabMetric: 'size',
    crabView: 'by-month',
    title: 'Crab size by month · Rehabilitated site',
    caption:
      'Distribution of carapace width (mm) at the rehabilitated site for each sampling month.',
    note: 'By-month plots are available for the Rehabilitated site only.',
    alt: 'Density curves of crab carapace width in millimetres at the rehabilitated site (labelled Restored), one curve per sampling month from July 2025 to August 2026, with the number of crabs measured each month in the legend.',
    credit: AUS_CREDIT,
    width: 3843,
    height: 2343,
    load: () =>
      import('./16_AUS_size_distribution_over_time_restored.png').then(
        (m) => m.default,
      ),
  },
  {
    id: 'AUS_fish_wildlife_indicator_nMDS',
    siteId: AUS,
    metric: 'fish',
    tab: 'wildlife',
    title: 'Fish community by site',
    caption: 'Fish community composition across the three sites.',
    alt: 'nMDS ordination plot titled Fish Community Comparisons, with outlined groups of samples for Reference 1, Reference 2 and the rehabilitated site (labelled Restored).',
    credit: AUS_CREDIT,
    width: 825,
    height: 637,
    load: () =>
      import('./AUS_fish_wildlife_indicator_nMDS.png').then((m) => m.default),
  },

  // Philippines, Rasa Island
  {
    id: '02_PH_crab_density_overall',
    siteId: PH,
    metric: 'density',
    tab: 'crabs',
    crabMetric: 'density',
    crabView: 'by-site',
    title: 'Crab density by site type',
    caption:
      'Mean density of mangrove crabs, all species combined, at each site type (crabs per m²).',
    alt: 'Bar chart of mean crab density in crabs per square metre, all species combined, for Degraded, Rehabilitated (labelled Restored) and Reference site types, with error bars.',
    credit: PH_CREDIT,
    width: 3243,
    height: 2043,
    load: () =>
      import('./02_PH_crab_density_overall.png').then((m) => m.default),
  },
  {
    id: '08_PH_species_composition',
    siteId: PH,
    metric: 'composition',
    tab: 'crabs',
    crabMetric: 'density',
    crabView: 'by-species',
    title: 'Crab density by species',
    caption:
      'Mean number of crabs per sample for each of the five species recorded, by site type.',
    alt: 'Five stacked bar charts, one per crab species, each showing the average number of crabs per sample at Degraded, Rehabilitated (labelled Restored) and Reference site types.',
    credit: PH_CREDIT,
    width: 3195,
    height: 5007,
    load: () =>
      import('./08_PH_species_composition.png').then((m) => m.default),
  },
  {
    id: '04_PH_diversity_overall',
    siteId: PH,
    metric: 'diversity',
    tab: 'crabs',
    crabMetric: 'diversity',
    crabView: 'by-site',
    title: 'Crab diversity by site type',
    caption:
      'Mean number of crab species recorded per sample at each site type.',
    alt: 'Bar chart of the average number of crab species per sample for Degraded, Rehabilitated (labelled Restored) and Reference site types.',
    credit: PH_CREDIT,
    width: 3243,
    height: 2043,
    load: () => import('./04_PH_diversity_overall.png').then((m) => m.default),
  },
  {
    id: '12_PH_overall_size_distribution',
    siteId: PH,
    metric: 'size',
    tab: 'crabs',
    crabMetric: 'size',
    crabView: 'overall',
    title: 'Crab size by site type',
    caption:
      'Distribution of carapace width (mm) for all crabs measured at each site type.',
    alt: 'Density curves of crab carapace width in millimetres for Degraded, Rehabilitated (labelled Restored) and Reference site types, with dotted vertical reference lines and the number of crabs measured in the legend.',
    credit: PH_CREDIT,
    width: 3843,
    height: 2343,
    load: () =>
      import('./12_PH_overall_size_distribution.png').then((m) => m.default),
  },
  {
    id: 'PH_fish_wildlife_indicator_plot',
    siteId: PH,
    metric: 'fish',
    tab: 'wildlife',
    title: 'Fish abundance by site type',
    caption:
      'Mean abundance of mangrove snapper and golden rabbitfish per sample at each site type.',
    alt: 'Two panels, mangrove snapper and golden rabbitfish, each with a photo of the fish above a bar chart of mean abundance per sample at three site types, with sample counts on the axis.',
    credit: PH_CREDIT,
    width: 3600,
    height: 1950,
    load: () =>
      import('./PH_fish_wildlife_indicator_plot.png').then((m) => m.default),
  },
];

/** All demo plots for a site, in manifest order. */
export function getPlotsForSite(siteId: string): DemoPlot[] {
  return DEMO_PLOTS.filter((p) => p.siteId === siteId);
}

/** The demo plot for a Crabs metric/view at a site, if one exists. */
export function findCrabPlot(
  siteId: string,
  metric: CrabMetric,
  view: CrabView,
): DemoPlot | undefined {
  return DEMO_PLOTS.find(
    (p) =>
      p.siteId === siteId &&
      p.tab === 'crabs' &&
      p.crabMetric === metric &&
      p.crabView === view,
  );
}

/** The Wildlife demo plot for a site, if one exists. */
export function findWildlifePlot(siteId: string): DemoPlot | undefined {
  return DEMO_PLOTS.find((p) => p.siteId === siteId && p.tab === 'wildlife');
}

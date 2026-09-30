/**
 * Fact sheet figures shown directly under the hero (GLO-189).
 *
 * The structure (four figures) is locked; don't add a fifth without a separate
 * decision. Flip `provisional` to false once a figure is confirmed.
 */
export interface FactSheetFigure {
  value: string;
  label: string;
  provisional: boolean;
}

/** Shared with the hero's "… sites, and growing" byline so the two can't drift. */
export const MONITORING_SITES_COUNT = 14;

export const FACT_SHEET_FIGURES: readonly FactSheetFigure[] = [
  {
    value: '1,600+',
    label: 'mangrove areas analysed worldwide',
    provisional: false,
  },
  {
    value: '~20',
    label: 'indicators',
    provisional: false,
  },
  {
    value: String(MONITORING_SITES_COUNT),
    label: 'monitoring sites in 8 countries and territories',
    provisional: false,
  },
  {
    value: '19',
    label: 'research partners in 17 countries',
    provisional: false,
  },
];

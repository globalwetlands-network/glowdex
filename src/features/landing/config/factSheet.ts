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

/**
 * Shared with the hero's "… locations, and growing" byline so the two can't
 * drift. Typed by hand, not counted from the data: check it against the live
 * local data (unique locations in local-sites.csv) at each monthly publish.
 */
export const MONITORING_LOCATIONS_COUNT = 14;

/**
 * Single source of truth for the partner figures, shared with the Partners
 * section. The 17-vs-19 question is open: change it here, not in each
 * section.
 */
export const RESEARCH_PARTNERS_COUNT = 19;
export const PARTNER_COUNTRIES_COUNT = 17;

export const FACT_SHEET_FIGURES: readonly FactSheetFigure[] = [
  {
    value: '1,600+',
    label: 'Mangrove areas analysed worldwide',
    provisional: false,
  },
  {
    value: '~20',
    label: 'Indicators',
    provisional: false,
  },
  {
    value: String(MONITORING_LOCATIONS_COUNT),
    label: 'Monitoring locations in 8 countries and territories',
    provisional: false,
  },
  {
    value: String(RESEARCH_PARTNERS_COUNT),
    label: `Research partners in ${PARTNER_COUNTRIES_COUNT} countries`,
    provisional: false,
  },
];

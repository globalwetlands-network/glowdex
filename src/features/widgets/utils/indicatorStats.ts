/**
 * Shared presentation helpers for the backend statistical indicator
 * summaries (AIStatisticalIndicatorSummary). Used by the on-screen
 * StatisticalDetailToggle and by the exportable cell summary (GLO-172)
 * so both render identical, science-approved labels and interpretations.
 */

export const CURRENT_PRESSURE_KEYS = new Set([
  'pressure_mangrove_climate_current',
  'pressure_mangrove_land_current',
  'pressure_mangrove_marine_current',
]);

export const RATE_PRESSURE_KEYS = new Set([
  'pressure_mangrove_climate_rate',
  'pressure_mangrove_land_rate',
  'pressure_mangrove_marine_rate',
]);

export const INVERTED_ECOLOGICAL_KEYS = new Set([
  'mang_spec_score',
  // mang_frag_area_mn_rate removed — positive rate = habitat
  // consolidating (mean patch area increasing), not fragmenting.
  // Confirmed by science team review, June 2026.
]);

/**
 * Curated, science-approved display labels keyed by indicator key.
 * Preferred over the raw `indicator` field on the summary.
 */
export const SIGNAL_LABELS: Record<string, string> = {
  mang_fish_dens: 'Fish density',
  mang_invert_dens: 'Invertebrate density',
  mang_mean_agb_mg_ha: 'Above-ground biomass',
  mang_mean_SOC: 'Soil organic carbon',
  mang_spec_score: 'Species threat score',
  // Renamed from 'Fragmentation rate' — a positive value means
  // mean patch area is increasing (habitat consolidating).
  // Confirmed by science team review, June 2026.
  mang_frag_area_mn_rate: 'Consolidation rate',
  mang_frag_area_mn: 'Fragment area',
  mang_mean_age: 'Mean canopy age',
  pressure_mangrove_climate_current: 'Climate pressure',
  pressure_mangrove_land_current: 'Land pressure',
  pressure_mangrove_marine_current: 'Marine pressure',
  pressure_mangrove_climate_rate: 'Climate trend',
  pressure_mangrove_land_rate: 'Land trend',
  pressure_mangrove_marine_rate: 'Marine trend',
};

/**
 * Returns the curated display label for an indicator, falling back to
 * the raw label the backend supplied when the key is unknown.
 */
export function indicatorLabel(key: string, fallback: string): string {
  return SIGNAL_LABELS[key] ?? fallback;
}

/**
 * Normalises a raw grouping label (e.g. "Cluster_3") to "Typology 3".
 */
export function formatGroupingLabel(raw: string): string {
  return raw.replace(/^(?:Cluster|Typology)_?(\d+)$/i, 'Typology $1');
}

/**
 * Returns the correct ordinal suffix for a percentile number.
 */
export function ordinalSuffix(n: number): string {
  const rounded = Math.round(n);
  const mod100 = rounded % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rounded}th`;
  switch (rounded % 10) {
    case 1:
      return `${rounded}st`;
    case 2:
      return `${rounded}nd`;
    case 3:
      return `${rounded}rd`;
    default:
      return `${rounded}th`;
  }
}

function interpretEcologicalPercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally high for this typology';
  if (percentile >= 75) return 'above typical range for this typology';
  if (percentile >= 60) return 'moderately above median for this typology';
  if (percentile >= 40) return 'near median for this typology';
  if (percentile >= 25) return 'moderately below median for this typology';
  if (percentile >= 10) return 'below typical range for this typology';
  return 'exceptionally low for this typology';
}

function interpretInvertedPercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally high threat for this typology';
  if (percentile >= 75) return 'above typical threat level for this typology';
  if (percentile >= 60) return 'moderately elevated threat for this typology';
  if (percentile >= 40) return 'near median threat level for this typology';
  if (percentile >= 25) return 'moderately low threat for this typology';
  if (percentile >= 10) return 'below typical threat level for this typology';
  return 'exceptionally low threat for this typology';
}

function interpretPressurePercentile(percentile: number): string {
  if (percentile >= 90)
    return 'exceptionally elevated stress for this typology';
  if (percentile >= 75) return 'above typical stress level for this typology';
  if (percentile >= 60) return 'moderately elevated stress for this typology';
  if (percentile >= 40) return 'near median stress level for this typology';
  if (percentile >= 25) return 'moderately low stress for this typology';
  if (percentile >= 10) return 'below typical stress level for this typology';
  return 'exceptionally low stress for this typology';
}

function interpretRatePercentile(percentile: number, value: number): string {
  if (value === 0) return 'no net change';
  const direction = value < 0 ? 'declining' : 'increasing';
  if (percentile >= 90) return `rapidly ${direction} for this typology`;
  if (percentile >= 75)
    return `${direction} above typical rate for this typology`;
  if (percentile >= 25) return `${direction} at typical rate for this typology`;
  if (percentile >= 10)
    return `${direction} below typical rate for this typology`;
  return `rapidly ${direction} for this typology`;
}

/**
 * Human interpretation of a percentile for the given indicator,
 * accounting for pressure, rate and inverted-ecological indicators.
 */
export function getInterpretation(
  key: string,
  percentile: number,
  value: number,
): string {
  if (RATE_PRESSURE_KEYS.has(key)) {
    return interpretRatePercentile(percentile, value);
  }
  if (CURRENT_PRESSURE_KEYS.has(key)) {
    return interpretPressurePercentile(percentile);
  }
  if (INVERTED_ECOLOGICAL_KEYS.has(key)) {
    return interpretInvertedPercentile(percentile);
  }
  return interpretEcologicalPercentile(percentile);
}

/**
 * Raw CSV row shape — matches local-wetlands-crab-data.csv headers exactly.
 * All fields are strings because parseCsv uses dynamicTyping: false.
 */
export interface LocalObservationRaw {
  Year: string;
  Site_Type: string;
  Species: string;
  Density: string;
  SE: string;
  Samples_n: string;
}

export type SiteCondition = 'Reference' | 'Degraded' | 'Rehabilitated';

export interface LocalObservation {
  year: number;
  siteType: SiteCondition;
  species: string;
  density: number;
  se: number;
  samplesN: number;
}

/**
 * Metadata for a single monitoring site.
 * Separated from LocalSite so it can be used in
 * SITE_METADATA without the derived fields.
 */
export interface LocalSiteMetadata {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  partner: string;
  /**
   * [longitude, latitude] — GeoJSON convention.
   * TODO: Replace placeholder coordinates with verified
   * Mgazana geolocation before release.
   */
  coordinates: [number, number];
}

/**
 * A monitoring site with its full observation dataset and
 * the global max density across all conditions and years —
 * used to fix the Y-axis for honest cross-condition
 * comparison. Mirrors Nelson Miranda's fixed_y_limit.
 */
export interface LocalSite extends LocalSiteMetadata {
  availableYears: number[];
  observations: LocalObservation[];
  /**
   * Fixed Y-axis maximum across all years and conditions.
   * Computed once in deriveLocalWetlands. Minimum floor of 5
   * prevents a zero-height chart when all densities are zero.
   */
  globalMaxDensity: number;
}

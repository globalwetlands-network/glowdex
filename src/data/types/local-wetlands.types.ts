/**
 * Raw CSV row shape — matches local-wetlands-crab-data.csv headers exactly.
 * All fields are strings because parseCsv uses dynamicTyping: false.
 */
export interface LocalObservationRaw {
  Country_name: string;
  Location_name: string;
  Location_lat: string;
  Location_long: string;
  Year: string;
  Site_Type: string;
  Species: string;
  Density: string;
  SE: string;
  Samples_n: string;
  Partner_id?: string;
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

export interface LocalSiteMetadata {
  id: string;
  name: string;
  country: string;
  /**
   * [longitude, latitude] — GeoJSON convention.
   * Derived from Location_long / Location_lat in CSV.
   */
  coordinates: [number, number];
  /**
   * Partner organisation ID matching PARTNER_REGISTRY.
   * null when no partner association is available.
   * TODO: Replace hardcoded mapping with Partner_id
   * column from CSV once it is available.
   */
  partnerId: string | null;
}

export interface LocalSite extends LocalSiteMetadata {
  availableYears: number[];
  observations: LocalObservation[];
}

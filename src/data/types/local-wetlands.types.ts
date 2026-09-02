/**
 * Raw row shape for the sites file (local-sites.csv) — the
 * authoritative source for coordinates and site list. One row
 * per coordinate point; a site may have several rows (one per
 * condition, sometimes at distinct lat/long). All fields are
 * strings because parseCsv uses dynamicTyping: false.
 */
export interface LocalSiteRaw {
  Country_name: string;
  Location_name: string;
  Location_lat: string;
  Location_long: string;
  Year: string;
  Site_Type: string;
}

/**
 * Raw row shape for the observations file (local-observations.csv)
 * — the authoritative source for density/species/partner data that
 * feeds the crab-density chart. All fields are strings because
 * parseCsv uses dynamicTyping: false.
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

/**
 * A single mapped coordinate for a site. One marker is rendered
 * per point. `condition` is the Site_Type from local-sites.csv after
 * synonym normalisation (e.g. "Restored" becomes "Rehabilitated").
 * It is intentionally a plain string, not the strict SiteCondition
 * type, so any future unrecognised condition still renders a marker
 * without polluting the chart-facing type.
 */
export interface LocalSitePoint {
  /** [longitude, latitude] — GeoJSON convention. */
  coordinates: [number, number];
  condition: string;
}

export interface LocalSite extends LocalSiteMetadata {
  availableYears: number[];
  observations: LocalObservation[];
  /**
   * All mapped coordinates for this site (one per local-sites.csv
   * row). Drives the per-point marker layer. `coordinates` on
   * LocalSiteMetadata is the first of these — the representative
   * point used for proximity, fly-to, and the low-zoom site pin.
   */
  points: LocalSitePoint[];
}

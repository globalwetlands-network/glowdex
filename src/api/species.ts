import { apiClient } from './client';

/**
 * IUCN Red List conservation status codes.
 * Mirrors the backend `ConservationStatus` union (species.config.ts) — kept in
 * the API layer so the DTO types stay self-contained. The frontend styling
 * lookup (CONSERVATION_STATUS_INFO) imports this rather than redefining it.
 * https://www.iucnredlist.org/about/categories-and-criteria
 */
export type ConservationStatus =
  | 'EX'
  | 'EW'
  | 'CR'
  | 'EN'
  | 'VU'
  | 'NT'
  | 'LC'
  | 'DD'
  | 'NE';

export interface ObservationPoint {
  lat: number;
  lng: number;
  date: string;
  datasetName: string;
  occurrenceId: number;
}

export interface RegionSummary {
  label: string;
  count: number;
  color: string;
}

/**
 * A geographic bounding box returned by the species API.
 * Mirrors RegionBoundResponse in the backend species.types.ts.
 * Used as a geographic fallback for species auto-selection
 * when no hub match is found for the selected cell.
 */
export interface RegionBoundResponse {
  label: string;
  /** [min, max] latitude in decimal degrees */
  lat: [number, number];
  /** [min, max] longitude in decimal degrees */
  lng: [number, number];
}

export interface SpeciesObservationsResponse {
  speciesId: string;
  totalObservations: number;
  recentObservations: number;
  lastObserved: string | null;
  regionSummary: RegionSummary[];
  observations: ObservationPoint[];
  cachedAt: string;
  partner: string;
  region: string;
  learnMoreUrl: string;
  conservationStatus: string;
}

export async function fetchSpeciesObservations(
  speciesId: string,
): Promise<SpeciesObservationsResponse> {
  return apiClient<SpeciesObservationsResponse>(
    `/species/${speciesId}/observations`,
  );
}

/**
 * Static config + spotlight display content for a single species.
 * Mirrors SpeciesConfigResponse in the backend species.types.ts, which is
 * the single source of truth for all of this content. The only per-species
 * data the frontend still owns is the image binary (see SPECIES_IMAGES),
 * mapped by `id`.
 */
export interface SpeciesConfigResponse {
  id: string;
  commonName: string;
  localName?: string;
  scientificName: string;
  conservationStatus: ConservationStatus;
  iucnUrl: string;
  summaryText: string;
  dataApplicability: string;
  dataSource: string;
  learnMoreUrl: string;
  mapTipText: string;
  stub?: boolean;
  imageCredit?: string;
  imageCreditUrl?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  partnerIds: string[];
  regionBounds: RegionBoundResponse[];
}

/**
 * Response envelope for GET /api/species/config.
 */
export interface AllSpeciesConfigResponse {
  species: SpeciesConfigResponse[];
}

/**
 * Fetches lightweight static config for all species.
 * No GBIF observation data — only partnerIds and regionBounds
 * needed for frontend auto-selection logic.
 */
export async function fetchAllSpeciesConfig(): Promise<AllSpeciesConfigResponse> {
  return apiClient<AllSpeciesConfigResponse>('/species/config');
}

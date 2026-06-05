import { apiClient } from './client';

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
 * Lightweight static config for a single species.
 * Mirrors SpeciesConfigResponse in the backend species.types.ts.
 */
export interface SpeciesConfigResponse {
  id: string;
  commonName: string;
  hubIds: string[];
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
 * No GBIF observation data — only hubIds and regionBounds
 * needed for frontend auto-selection logic.
 */
export async function fetchAllSpeciesConfig(): Promise<AllSpeciesConfigResponse> {
  return apiClient<AllSpeciesConfigResponse>('/species/config');
}

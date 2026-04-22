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

export interface SpeciesObservationsResponse {
  speciesId: string;
  totalObservations: number;
  lastObserved: string | null;
  regionSummary: RegionSummary[];
  observations: ObservationPoint[];
  cachedAt: string;
}

export async function fetchSpeciesObservations(
  speciesId: string,
): Promise<SpeciesObservationsResponse> {
  return apiClient<SpeciesObservationsResponse>(
    `/species/${speciesId}/observations`,
  );
}

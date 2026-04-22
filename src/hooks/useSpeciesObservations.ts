import { useQuery } from '@tanstack/react-query';
import {
  fetchSpeciesObservations,
  type SpeciesObservationsResponse,
} from '@/api/species';

/**
 * Fetches species observation data from GBIF via the backend API.
 * Uses TanStack Query for caching with a 24h stale time to match backend cache.
 */
export function useSpeciesObservations(speciesId: string) {
  return useQuery<SpeciesObservationsResponse>({
    queryKey: ['species-observations', speciesId],
    queryFn: () => fetchSpeciesObservations(speciesId),
    enabled: !!speciesId,
    staleTime: 1000 * 60 * 60 * 24, // 24h — matches backend cache TTL
    retry: 2,
  });
}

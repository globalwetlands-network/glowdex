/**
 * Fetches lightweight static config for all species.
 *
 * Returns hubIds and regionBounds for each species — used by
 * SpeciesSpotlightWidget to power the three-tier auto-selection
 * logic (partner match → region bounds → empty state).
 *
 * One request covers all species, keeping network overhead
 * minimal. 24h stale time matches the static nature of the data.
 *
 * Note: this hook is intentionally separate from
 * useSpeciesObservations — it fetches only the fields needed
 * for selection logic, not the full GBIF observation payload.
 */
import { useQuery } from '@tanstack/react-query';
import {
  fetchAllSpeciesConfig,
  type AllSpeciesConfigResponse,
} from '@/api/species';

/**
 *
 */
export function useSpeciesConfig() {
  return useQuery<AllSpeciesConfigResponse>({
    queryKey: ['species-config'],
    queryFn: fetchAllSpeciesConfig,
    staleTime: 1000 * 60 * 60 * 24, // 24h — static config data
    retry: 2,
  });
}

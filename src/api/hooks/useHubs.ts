import { useQuery } from '@tanstack/react-query';
import { fetchHubs, type HubsResponse } from '@/api/hubs';

/**
 * Fetches all hub partner locations from the backend API.
 * Uses TanStack Query with a 24h stale time — hub data changes rarely.
 */
export function useHubs() {
  return useQuery<HubsResponse>({
    queryKey: ['hubs'],
    queryFn: fetchHubs,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    retry: 2,
  });
}

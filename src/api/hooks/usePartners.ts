import { useQuery } from '@tanstack/react-query';
import { fetchPartners, type PartnersResponse } from '@/api/partners';

/**
 * Fetches all partner organisation locations from the backend API.
 * Uses TanStack Query with a 24h stale time — partner data changes rarely.
 */
export function usePartners() {
  return useQuery<PartnersResponse>({
    queryKey: ['partners'],
    queryFn: fetchPartners,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    retry: 2,
  });
}

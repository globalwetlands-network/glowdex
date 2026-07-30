import { useQuery } from '@tanstack/react-query';
import { fetchStatistics } from '@/api/statistics';
import type { StatisticsResponse } from '@/api/types';

/**
 * Hook to fetch statistical distribution data for a
 * specific grid cell.
 *
 * Uses TanStack Query for automatic deduplication,
 * caching, and request cancellation — consistent with
 * other API hooks in the codebase (usePartners etc.).
 *
 * Returns null data when gridCellId is null — the query
 * is disabled and no request is made.
 */
export function useGlobalStatistics(gridCellId: number | null) {
  const { data, isLoading, error } = useQuery<StatisticsResponse>({
    queryKey: ['statistics', gridCellId],
    // gridCellId! is safe — queryFn only runs when
    // enabled is true, which requires gridCellId to
    // be non-null (!!gridCellId). This is standard
    // TanStack Query pattern for nullable query keys.
    queryFn: () => fetchStatistics(gridCellId!),
    enabled: !!gridCellId,
    // 5 min — deterministic per cell, aligns with backend cache TTL.
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error
      ? error instanceof Error
        ? error
        : new Error(String(error))
      : null,
  };
}

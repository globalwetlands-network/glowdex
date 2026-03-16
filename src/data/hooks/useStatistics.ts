import { useState, useEffect } from 'react';
import { fetchStatistics } from '@/api/statistics';
import type { StatisticsResponse } from '@/api/types';

/**
 * Hook to fetch statistical distribution data for a specific grid cell
 */
export function useStatistics(
  gridCellId: number | null,
  contextId: string = 'default',
) {
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gridCellId) {
      setData(null);
      return;
    }

    /**
     * Internal async loader for statistics
     */
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchStatistics(gridCellId!, contextId);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load statistics'),
        );
        console.error('Error loading statistics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [gridCellId, contextId]);

  return { data, isLoading, error };
}

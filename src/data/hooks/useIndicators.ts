import { useEffect, useMemo, useState } from 'react';

import { loadIndicators } from '../loaders/loadIndicators';
import type { Indicator, IndicatorDimension } from '@/features/widgets/types/indicator.types';

/**
 * Groups indicators by dimension
 */
function groupByDimension(indicators: Indicator[]): IndicatorDimension[] {
  const groups: Record<string, Indicator[]> = {};

  indicators.forEach(ind => {
    if (!groups[ind.dimension]) {
      groups[ind.dimension] = [];
    }
    groups[ind.dimension].push(ind);
  });

  return Object.entries(groups).map(([name, inds]) => ({
    name,
    indicators: inds
  }));
}

/**
 * Hook to load and transform indicator metadata
 * Returns flat list of indicators and grouped by dimension
 */
export function useIndicators() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {

    /**
     * Load indicators
     */
    async function load() {

      try {
        const data = await loadIndicators();
        setIndicators(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load indicators:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const dimensions: IndicatorDimension[] = useMemo(() => {
    return groupByDimension(indicators);
  }, [indicators]);

  return { indicators, dimensions, isLoading, error };
}

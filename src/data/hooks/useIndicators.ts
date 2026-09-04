import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadIndicators } from '../loaders/loadIndicators';
import type {
  Indicator,
  IndicatorDimension,
} from '@/features/widgets/types/indicator.types';

/**
 * Groups indicators by dimension
 */
function groupByDimension(indicators: Indicator[]): IndicatorDimension[] {
  const groups: Record<string, Indicator[]> = {};

  indicators.forEach((ind) => {
    if (!groups[ind.dimension]) {
      groups[ind.dimension] = [];
    }
    groups[ind.dimension].push(ind);
  });

  return Object.entries(groups).map(([name, inds]) => ({
    name,
    indicators: inds,
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
  const [reloadIndex, setReloadIndex] = useState(0);

  /** Re-attempts the load (used by the retry flow after resetting the manifest). */
  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadIndex((index) => index + 1);
  }, []);

  useEffect(() => {
    // Guard against overlapping loads: if reload() re-runs this effect (or the
    // hook unmounts) while a load is in flight, ignore the stale result so an
    // older request can't win the race and overwrite newer state.
    let cancelled = false;

    /**
     * Load indicators
     */
    async function load() {
      try {
        const data = await loadIndicators();
        if (cancelled) return;
        setIndicators(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load indicators:', err);
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [reloadIndex]);

  const dimensions: IndicatorDimension[] = useMemo(() => {
    return groupByDimension(indicators);
  }, [indicators]);

  return { indicators, dimensions, isLoading, error, reload };
}

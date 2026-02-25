import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { FilterState } from '@/features/widgets/types/filter.types';

export const useFilterAnalytics = (filterState: FilterState) => {
  const posthog = usePostHog();

  // Depend on individual primitive values (or joined strings) to avoid deep object checking
  // and accidental refire loops
  const habitatsKey = Object.entries(filterState.habitats)
    .filter(([_, isSelected]) => isSelected)
    .map(([habitat]) => habitat)
    .sort()
    .join(',');
  const typologyScale = filterState.typologyScale;
  const quantile = filterState.quantile;

  useEffect(() => {
    posthog?.capture('filter_changed', {
      habitats: filterState.habitats,
      typologyScale: filterState.typologyScale,
      quantile: filterState.quantile,
    });
  }, [habitatsKey, typologyScale, quantile, posthog]);
};

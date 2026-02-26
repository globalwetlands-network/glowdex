import { Habitat } from '@/types/enums/habitat.enum';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { FilterState } from '@/features/widgets/types/filter.types';

/**
 * Hook to capture analytics events when the user changes map filters.
 * 
 * Tracks changes to habitats, typology scale, and quantile settings,
 * and sends a 'filter_changed' event to PostHog.
 * 
 * @param filterState - The current state of all user-configurable filters.
 */
export const useFilterAnalytics = (filterState: FilterState) => {
  const posthog = usePostHog();

  // Depend on individual primitive values (or joined strings) to avoid deep object checking
  // and accidental refire loops
  const habitatsKey = Object.entries(filterState.habitats)
    .filter(([, isSelected]) => isSelected)
    .map(([habitat]) => habitat)
    .sort()
    .join(',');
  const typologyScale = filterState.typologyScale;
  const quantile = filterState.quantile;

  useEffect(() => {
    // Reconstruct the habitats object specifically for analytics tracking
    // This allows us to track the correct values without needing to depend on
    // the potentially new object reference `filterState.habitats` on each render.
    const habitatsList = habitatsKey ? habitatsKey.split(',') : [];
    const habitatsState = {
      [Habitat.MANGROVES]: habitatsList.includes(Habitat.MANGROVES),
      [Habitat.SALTMARSH]: habitatsList.includes(Habitat.SALTMARSH),
      [Habitat.SEAGRASS]: habitatsList.includes(Habitat.SEAGRASS),
    };

    posthog?.capture('filter_changed', {
      habitats: habitatsState,
      typologyScale,
      quantile,
    });
  }, [habitatsKey, typologyScale, quantile, posthog]);
};

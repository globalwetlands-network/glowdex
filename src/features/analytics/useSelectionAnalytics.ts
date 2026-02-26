import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { EnrichedGridCell } from '@/app/types/app.types';

export const useSelectionAnalytics = (selectedCell: EnrichedGridCell | null) => {
  const posthog = usePostHog();

  useEffect(() => {
    if (!selectedCell) return;

    const habitats = [];
    if (selectedCell.mangroves) habitats.push('mangroves');
    if (selectedCell.saltmarsh) habitats.push('saltmarsh');
    if (selectedCell.seagrass) habitats.push('seagrass');

    posthog?.capture('grid_cell_selected', {
      cell_id: String(selectedCell.id),
      country: selectedCell.country,
      habitats: habitats,
      typology_5: selectedCell.cluster5,
      typology_18: selectedCell.cluster18
    });
  }, [selectedCell, posthog]);
};

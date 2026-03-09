import { Habitat } from '@/types/enums/habitat.enum';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { EnrichedGridCell } from '@/app/types/app.types';

/**
 * Hook to capture analytics events when a grid cell is selected.
 * 
 * Tracks the selected cell's properties, including related habitats and typologies,
 * and sends a 'grid_cell_selected' event to PostHog.
 * 
 * @param selectedCell - The currently selected, enriched grid cell, or null if no cell is selected.
 */
export const useSelectionAnalytics = (selectedCell: EnrichedGridCell | null) => {
  const posthog = usePostHog();

  useEffect(() => {
    if (!selectedCell) return;

    const habitats = [];
    if (selectedCell.mangroves) habitats.push(Habitat.MANGROVES);
    if (selectedCell.saltmarsh) habitats.push(Habitat.SALTMARSH);
    if (selectedCell.seagrass) habitats.push(Habitat.SEAGRASS);

    try {
      posthog?.capture('grid_cell_selected', {
        cell_id: String(selectedCell.id),
        country: selectedCell.country,
        habitats: habitats,
        typology_5: selectedCell.cluster5,
        typology_18: selectedCell.cluster18
      });
    } catch (error) {
      console.error('Failed to capture grid_cell_selected event:', error);
    }
  }, [selectedCell, posthog]);
};

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export const useSelectionAnalytics = (selectedCellId: string | null) => {
  const posthog = usePostHog();

  useEffect(() => {
    if (!selectedCellId) return;

    posthog?.capture('grid_cell_selected', {
      cell_id: selectedCellId,
    });
  }, [selectedCellId, posthog]);
};

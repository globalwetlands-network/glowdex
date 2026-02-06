import { useMemo } from 'react';
import type { RichGridCell } from '@/data/types/grid.types';

// TODO: Refine this logic if legacy had specific transformations.
// Currently purely ensuring we extract the raw numeric distribution for the violin plot.

export function useViolinPlotData(gridCells: RichGridCell[]) {
  return useMemo(() => {
    // Example: Extracting residuals or some metric for the distribution.
    // If the violin plot is meant to show "Typology distribution", we might need different prep.
    // Assuming for now we are plotting a metric like 'residual_5' or similar.
    // Since 'residuals' object exists in RichGridCell.

    // We will return arrays of numbers for different metrics we might want to plot.

    // Safety check
    if (!gridCells.length) return { residuals: [] };

    // Hardcoded key for parity/checking.
    // In legacy, this would be selected via UI. For now, we use a known valid metric.
    const METRIC_KEY = 'mang_spec_score';

    const residuals = gridCells
      .map(c => c.residuals[METRIC_KEY])
      .filter(v => typeof v === 'number' && !isNaN(v));

    // Temporary logging for verification
    console.log(`[ViolinPlot] Data points for ${METRIC_KEY}:`, residuals.length);

    return {
      residuals
    };
  }, [gridCells]);
}

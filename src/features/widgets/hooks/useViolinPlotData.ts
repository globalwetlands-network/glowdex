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

    // Extract residuals (assuming we want to plot the distribution of model residuals)
    // Note: 'residuals' on gridCell might be a dictionary. We need a specific key.
    // Looking at 'loadResiduals.ts', it returns an object of values.
    // Let's grab the first available key or a specific one for parity.

    // Checking one cell to see keys (heuristic, ideally strict type)
    // For this generic hook, we'll map 'res_5' if available, as a default demo.

    const residuals = gridCells
      .map(c => c.residuals['res_5']) // Using res_5 as a primary metric example
      .filter(v => typeof v === 'number') as number[];

    return {
      residuals
    };
  }, [gridCells]);
}

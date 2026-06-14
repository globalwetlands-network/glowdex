/**
 * SpeciesCompositionTrigger
 *
 * Inactive disclosure trigger hinting at species composition
 * data. Shows species colour swatches to signal richness
 * without revealing the full chart.
 *
 * Not yet interactive — species composition chart is a
 * future iteration. Renders as a visual affordance only.
 *
 * Swatch colours imported from speciesPalette constants
 * so they stay in sync with the future composition chart.
 */

import { ChevronDown } from 'lucide-react';
import { CRAB_SPECIES_SWATCH_COLORS } from '@/data/constants/speciesPalette';

export function SpeciesCompositionTrigger() {
  return (
    <div
      className="flex items-center gap-2 py-2 px-1 text-gray-400 cursor-not-allowed select-none"
      title="Species composition coming in a future update"
      aria-disabled="true"
    >
      <div className="flex items-center gap-0.5">
        {CRAB_SPECIES_SWATCH_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">Species composition</span>
      <ChevronDown className="w-3 h-3 ml-auto" />
    </div>
  );
}

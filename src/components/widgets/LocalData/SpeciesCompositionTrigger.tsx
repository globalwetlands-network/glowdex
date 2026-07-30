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

import { CRAB_SPECIES_SWATCH_COLORS } from '@/data/constants/speciesPalette';

export function SpeciesCompositionTrigger() {
  return (
    <div
      className="flex items-center gap-2 py-2 px-1 text-gray-400 cursor-not-allowed select-none pointer-events-none"
      title="Species composition coming in a future update"
    >
      <div className="flex items-center gap-0.5">
        {CRAB_SPECIES_SWATCH_COLORS.map((color) => (
          <div
            key={color}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">Crab species composition</span>
      <span className="text-[10px] text-gray-300 italic ml-auto shrink-0">
        Coming soon
      </span>
    </div>
  );
}

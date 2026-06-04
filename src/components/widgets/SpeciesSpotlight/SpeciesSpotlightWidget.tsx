import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import type { SpeciesSpotlightData } from '@/data/speciesSpotlight';
import {
  SPECIES_SPOTLIGHT_DATA,
  CONSERVATION_STATUS_INFO,
} from '@/data/speciesSpotlight';
import type { ObservationPoint } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { HubResponse } from '@/api/hubs';
import { findNearestHub } from '@/utils/geo';
import { SpeciesTab } from './SpeciesTab';

interface SpeciesSpotlightWidgetProps {
  species?: SpeciesSpotlightData[];
  onSpeciesLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
  selectedCell: EnrichedGridCell | null;
  hubs: HubResponse[];
}

export function SpeciesSpotlightWidget({
  species = SPECIES_SPOTLIGHT_DATA,
  onSpeciesLayerToggle,
  selectedCell,
  hubs,
}: SpeciesSpotlightWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [layerEnabled, setLayerEnabled] = useState(false);
  // Tracks a manual tab selection scoped to a specific cell.
  // null means no manual override — auto-selection applies.
  // Automatically ignored when selectedCell changes to a
  // different cell, with no effect or setState-in-render needed.
  const [manualSelection, setManualSelection] = useState<{
    cellId: number;
    index: number;
  } | null>(null);

  const handleTabChange = (idx: number) => {
    if (idx !== effectiveIndex) {
      if (layerEnabled) {
        onSpeciesLayerToggle(activeSpecies.id, [], false);
      }
      setLayerEnabled(false);
      setActiveIndex(idx);
      setManualSelection(
        selectedCell ? { cellId: selectedCell.id, index: idx } : null,
      );
    }
  };

  /**
   * Derives the species index to auto-select based on the nearest
   * hub to the selected cell. Returns -1 if no match is found.
   * Only used when the user has not manually selected a tab.
   */
  const autoIndex = useMemo(() => {
    if (!selectedCell?.centerCoords || !hubs.length) return -1;

    const nearest = findNearestHub(
      selectedCell.centerCoords.latitude,
      selectedCell.centerCoords.longitude,
      hubs,
    );

    console.log('Find nearest hub', nearest);
    if (!nearest) return -1;

    return species.findIndex((s) => s.hubIds?.includes(nearest.hub.id));
  }, [selectedCell, hubs, species]);

  /**
   * Effective active tab index — single source of truth for
   * which species tab is displayed.
   *
   * Priority order:
   * 1. Manual selection — if the user tapped a tab for the
   *    current cell, respect that choice.
   * 2. Auto-selection — nearest hub match surfaces the
   *    relevant species automatically.
   * 3. Fallback — default activeIndex (0 on load).
   *
   * Manual selection is scoped by cellId so switching to a
   * new cell clears the override automatically — no effect
   * or setState-in-render required.
   */
  const effectiveIndex =
    manualSelection !== null && manualSelection.cellId === selectedCell?.id
      ? manualSelection.index
      : autoIndex !== -1
        ? autoIndex
        : activeIndex;

  const activeSpecies = species[effectiveIndex];

  if (!activeSpecies) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Species Spotlight
        </h3>
        <button
          onClick={() => setInfoOpen((prev) => !prev)}
          className={`p-1 rounded-md transition-colors ${
            infoOpen
              ? 'bg-teal-100 text-teal-700'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Toggle species information"
          title="Species information"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1.5 flex-wrap">
        {species.map((sp, idx) => {
          const isActive = idx === effectiveIndex;
          const statusColor =
            CONSERVATION_STATUS_INFO[sp.conservationStatus]?.badgeClasses ?? '';

          return (
            <button
              key={sp.id}
              onClick={() => handleTabChange(idx)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {sp.commonName}
              {!isActive && (
                <span
                  className={`inline-block px-1 py-px rounded text-[9px] font-bold border ${statusColor}`}
                >
                  {sp.conservationStatus}
                </span>
              )}
              {sp.stub && !isActive && (
                <span className="text-[9px] text-gray-400 italic">soon</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <SpeciesTab
        species={activeSpecies}
        layerEnabled={layerEnabled}
        onLayerToggle={(speciesId, observations, enabled) => {
          setLayerEnabled(enabled);
          onSpeciesLayerToggle(speciesId, observations, enabled);
        }}
        infoOpen={infoOpen}
        setInfoOpen={setInfoOpen}
      />
    </div>
  );
}

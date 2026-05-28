import { useState } from 'react';
import { Info } from 'lucide-react';
import type { SpeciesSpotlightData } from '@/data/speciesSpotlight';
import {
  SPECIES_SPOTLIGHT_DATA,
  CONSERVATION_STATUS_INFO,
} from '@/data/speciesSpotlight';
import type { ObservationPoint } from '@/api/species';
import { SpeciesTab } from './SpeciesTab';

interface SpeciesSpotlightWidgetProps {
  species?: SpeciesSpotlightData[];
  onSpeciesLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
}

export function SpeciesSpotlightWidget({
  species = SPECIES_SPOTLIGHT_DATA,
  onSpeciesLayerToggle,
}: SpeciesSpotlightWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [layerEnabled, setLayerEnabled] = useState(false);

  const handleTabChange = (idx: number) => {
    if (idx !== activeIndex) {
      if (layerEnabled) {
        onSpeciesLayerToggle(activeSpecies.id, [], false);
      }
      setLayerEnabled(false);
      setActiveIndex(idx);
    }
  };

  const activeSpecies = species[activeIndex];

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
          const isActive = idx === activeIndex;
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

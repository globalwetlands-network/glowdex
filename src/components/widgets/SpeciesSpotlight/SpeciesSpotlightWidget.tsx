import { useState } from 'react';
import { Info } from 'lucide-react';
import type {
  SpeciesSpotlightData,
  SpeciesDistribution,
} from '@/data/speciesSpotlight';
import { SPECIES_SPOTLIGHT_DATA } from '@/data/speciesSpotlight';
import { SpeciesTab } from './SpeciesTab';
import { SpeciesInfoPanel } from './SpeciesInfoPanel';

interface SpeciesSpotlightWidgetProps {
  species?: SpeciesSpotlightData[];
  onSpeciesLayerToggle: (
    distribution: SpeciesDistribution,
    enabled: boolean,
  ) => void;
}

const STATUS_PILL_COLORS: Record<string, string> = {
  CR: 'bg-red-100 text-red-700 border-red-200',
  EN: 'bg-orange-100 text-orange-700 border-orange-200',
  VU: 'bg-amber-100 text-amber-700 border-amber-200',
  NT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LC: 'bg-green-100 text-green-700 border-green-200',
  DD: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function SpeciesSpotlightWidget({
  species = SPECIES_SPOTLIGHT_DATA,
  onSpeciesLayerToggle,
}: SpeciesSpotlightWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);

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
          const statusColor = STATUS_PILL_COLORS[sp.conservationStatus] ?? '';

          return (
            <button
              key={sp.id}
              onClick={() => setActiveIndex(idx)}
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

      {/* Info panel (expandable) */}
      <SpeciesInfoPanel species={activeSpecies} open={infoOpen} />

      {/* Active tab content */}
      <SpeciesTab
        species={activeSpecies}
        onLayerToggle={onSpeciesLayerToggle}
      />
    </div>
  );
}

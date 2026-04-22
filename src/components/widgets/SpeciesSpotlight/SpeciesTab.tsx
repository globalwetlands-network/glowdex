import { useState, type ReactNode } from 'react';
import type {
  SpeciesSpotlightData,
  SpeciesDistribution,
} from '@/data/speciesSpotlight';
import { SpeciesDonutChart } from './SpeciesDonutChart';
import { SpeciesMapTip } from './SpeciesMapTip';
import { Clock } from 'lucide-react';

interface SpeciesTabProps {
  species: SpeciesSpotlightData;
  onLayerToggle: (distribution: SpeciesDistribution, enabled: boolean) => void;
}

/**
 * Parses simple `**bold**` markdown markers into <strong> tags.
 */
function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

export function SpeciesTab({ species, onLayerToggle }: SpeciesTabProps) {
  const [layerEnabled, setLayerEnabled] = useState(false);

  const handleToggleLayer = () => {
    const nextEnabled = !layerEnabled;
    setLayerEnabled(nextEnabled);
    onLayerToggle(species.distribution, nextEnabled);
  };

  // Stub state
  if (species.stub) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">Data coming soon</p>
        <p className="text-xs text-gray-400 mt-1">
          {species.commonName} data is being prepared for a future release.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {/* Summary text */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {parseBold(species.summaryText)}
      </p>

      {/* Chart + Legend row */}
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <SpeciesDonutChart segments={species.populationSegments} />
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-2">
          {species.populationSegments.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-600">{segment.label}</span>
              <span className="text-gray-400 font-medium ml-auto tabular-nums">
                {segment.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map tip */}
      {species.mapTipText && (
        <SpeciesMapTip
          text={species.mapTipText}
          enabled={layerEnabled}
          onToggle={handleToggleLayer}
        />
      )}

      {/* Data applicability footer */}
      {species.dataApplicability && (
        <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-2">
          <span>
            Applicability:{' '}
            <span className="font-medium">{species.dataApplicability}</span>
          </span>
          {species.learnMoreUrl && (
            <a
              href={species.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              Learn more →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

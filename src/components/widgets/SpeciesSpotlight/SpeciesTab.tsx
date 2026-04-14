import { type ReactNode } from 'react';
import type { SpeciesSpotlightData } from '@/data/speciesSpotlight';
import { useSpeciesObservations } from '@/hooks/useSpeciesObservations';
import type { ObservationPoint } from '@/api/species';
import { SpeciesMapTip } from './SpeciesMapTip';
import { SpeciesInfoPanel } from './SpeciesInfoPanel';
import { Clock } from 'lucide-react';

interface SpeciesTabProps {
  species: SpeciesSpotlightData;
  layerEnabled: boolean;
  onLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
  infoOpen: boolean;
  setInfoOpen: (open: boolean) => void;
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

/**
 * Formats a date string as "MMM YYYY" (e.g., "Jan 2024")
 */
function formatLastObserved(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 bg-teal-50 border border-teal-100 rounded-lg p-3">
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-lg h-16 animate-pulse"
        />
      ))}
    </div>
  );
}

export function SpeciesTab({
  species,
  layerEnabled,
  onLayerToggle,
  infoOpen,
}: SpeciesTabProps) {
  // Only fetch if not a stub
  const { data, isLoading, isError } = useSpeciesObservations(
    species.stub ? '' : species.id,
  );

  const handleToggleLayer = () => {
    const nextEnabled = !layerEnabled;
    onLayerToggle(species.id, data?.observations ?? [], nextEnabled);
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
      {/* Species image */}
      {species.imageUrl && (
        <div className="relative w-full rounded-xl overflow-hidden bg-gray-50">
          <img
            src={species.imageUrl}
            alt={species.commonName}
            className="w-full h-48 object-contain"
          />
          {species.imageCredit && species.imageCreditUrl && (
            <a
              href={species.imageCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1.5 right-2 text-[9px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {species.imageCredit}
            </a>
          )}
          {species.imageCredit && !species.imageCreditUrl && (
            <span className="absolute bottom-1.5 right-2 text-[9px] text-gray-400">
              {species.imageCredit}
            </span>
          )}
        </div>
      )}

      {/* Summary text */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {parseBold(species.summaryText)}
      </p>

      {/* Source attribution */}
      {species.sourceUrl && species.sourceLabel && (
        <p className="text-[10px] text-gray-400 -mt-2">
          Source:{' '}
          <a
            href={species.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            {species.sourceLabel}
          </a>
        </p>
      )}

      {/* Info panel (expandable) */}
      <SpeciesInfoPanel species={species} open={infoOpen} data={data} />

      {/* Loading state */}
      {isLoading && <SkeletonCards />}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            Could not load observation data.
          </p>
          {species.mapTipText && (
            <SpeciesMapTip
              text={species.mapTipText}
              enabled={false}
              onToggle={() => {}}
              disabled
            />
          )}
        </div>
      )}

      {/* Data loaded: stat cards */}
      {data && !isLoading && !isError && (
        <>
          <div className="flex gap-2">
            <StatCard
              value={data.totalObservations.toLocaleString()}
              label="Observations recorded"
            />
            <StatCard
              value={formatLastObserved(data.lastObserved)}
              label="Last recorded sighting"
            />
            <StatCard
              value={data.regionSummary[0]?.label ?? '—'}
              label="Primary range"
            />
          </div>

          {/* Map tip */}
          {species.mapTipText && (
            <SpeciesMapTip
              text={species.mapTipText}
              enabled={layerEnabled}
              onToggle={handleToggleLayer}
            />
          )}
        </>
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

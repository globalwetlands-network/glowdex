import { ExternalLink } from 'lucide-react';
import type {
  SpeciesSpotlightData,
  ConservationStatus,
} from '@/data/speciesSpotlight';

interface SpeciesInfoPanelProps {
  species: SpeciesSpotlightData;
  open: boolean;
}

const STATUS_LABELS: Record<
  ConservationStatus,
  { label: string; color: string; bg: string }
> = {
  CR: {
    label: 'Critically Endangered',
    color: 'text-red-700',
    bg: 'bg-red-100 border-red-200',
  },
  EN: {
    label: 'Endangered',
    color: 'text-orange-700',
    bg: 'bg-orange-100 border-orange-200',
  },
  VU: {
    label: 'Vulnerable',
    color: 'text-amber-700',
    bg: 'bg-amber-100 border-amber-200',
  },
  NT: {
    label: 'Near Threatened',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100 border-yellow-200',
  },
  LC: {
    label: 'Least Concern',
    color: 'text-green-700',
    bg: 'bg-green-100 border-green-200',
  },
  DD: {
    label: 'Data Deficient',
    color: 'text-gray-700',
    bg: 'bg-gray-100 border-gray-200',
  },
};

export function SpeciesInfoPanel({ species, open }: SpeciesInfoPanelProps) {
  const status = STATUS_LABELS[species.conservationStatus];

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mt-3">
        {/* Names */}
        <div>
          <h4 className="text-sm font-bold text-gray-900">
            {species.commonName}
            {species.localName && (
              <span className="text-gray-500 font-normal">
                {' '}
                ({species.localName})
              </span>
            )}
          </h4>
          <p className="text-xs text-gray-500 italic">
            {species.scientificName}
          </p>
        </div>

        {/* IUCN Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${status.bg} ${status.color}`}
          >
            {species.conservationStatus} — {status.label}
          </span>
        </div>

        {/* Data source */}
        {species.dataSource && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Data Source
            </p>
            <p className="text-xs text-gray-600">{species.dataSource}</p>
          </div>
        )}

        {/* Learn more link */}
        {species.learnMoreUrl && (
          <a
            href={species.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 transition-colors"
          >
            Learn more
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

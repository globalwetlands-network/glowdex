import { ExternalLink } from 'lucide-react';
import {
  CONSERVATION_STATUS_INFO,
  type SpeciesSpotlightData,
} from '@/data/speciesSpotlight';
import type { SpeciesObservationsResponse } from '@/api/species';

interface SpeciesInfoPanelProps {
  species: SpeciesSpotlightData;
  open: boolean;
  data?: SpeciesObservationsResponse | null;
}

export function SpeciesInfoPanel({
  species,
  open,
  data,
}: SpeciesInfoPanelProps) {
  const status = CONSERVATION_STATUS_INFO[species.conservationStatus];

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
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${status.badgeClasses}`}
          >
            {species.conservationStatus} — {status.label}
          </span>
        </div>

        {/* Partner */}
        {data?.partner && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Partner
            </p>
            <p className="text-xs text-gray-600">{data.partner}</p>
          </div>
        )}

        {/* Region */}
        {data?.region && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Region
            </p>
            <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100">
              {data.region}
            </span>
          </div>
        )}

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
        {data?.learnMoreUrl && (
          <a
            href={data.learnMoreUrl}
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

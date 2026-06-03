import { useState, useMemo } from 'react';
import { MapPin, ExternalLink, Building2 } from 'lucide-react';
import { useHubs } from '@/api/hooks/useHubs';
import { findNearestHub } from '@/utils/geo';
import type { EnrichedGridCell } from '@/app/types/app.types';

interface HubPartnerWidgetProps {
  selectedCell: EnrichedGridCell | null;
  onHubLayerToggle: (enabled: boolean) => void;
}

export function HubPartnerWidget({
  selectedCell,
  onHubLayerToggle,
}: HubPartnerWidgetProps) {
  const { data: hubsData, isLoading, isError } = useHubs();
  // Controls hub layer visibility. 'global' means on with no
  // specific cell context (default). A cell ID means on for
  // that cell. null means explicitly toggled off.
  const [enabledForCellId, setEnabledForCellId] = useState<
    number | 'global' | null
  >('global');

  const hubLayerEnabled =
    enabledForCellId === 'global' || enabledForCellId === selectedCell?.id;

  const nearest = useMemo(() => {
    if (!selectedCell?.centerCoords || !hubsData?.hubs.length) return null;

    return findNearestHub(
      selectedCell.centerCoords.latitude,
      selectedCell.centerCoords.longitude,
      hubsData.hubs,
    );
  }, [selectedCell, hubsData]);

  const handleToggle = () => {
    if (!nearest && enabledForCellId !== 'global') return;
    const next = !hubLayerEnabled;
    setEnabledForCellId(next ? (selectedCell?.id ?? 'global') : null);
    onHubLayerToggle(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-xs text-gray-400 py-2">Hub data unavailable</p>;
  }

  if (!selectedCell || !nearest) {
    return (
      <div className="space-y-3">
        <div
          className="rounded-lg border border-teal-100
          bg-teal-50/50 p-3 flex items-center gap-3"
        >
          <div
            className="w-2 h-2 rounded-full bg-[#0f6e56]
            shrink-0"
          />
          <p className="text-xs text-gray-600">
            Hub partner locations are visible on the map.
          </p>
        </div>
        <div
          className="flex flex-col items-center justify-center
          py-4 text-center gap-1.5"
        >
          <MapPin size={18} className="text-gray-300" />
          <p className="text-sm text-gray-400">
            Select a cell to find your nearest partner
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin size={10} className="shrink-0" />
        <span>
          Cell {selectedCell.id}
          {selectedCell.country ? ` · ${selectedCell.country}` : ''}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        HUB PARTNER
      </p>

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Building2 size={16} className="text-[#0f6e56] mt-0.5 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 leading-snug">
            {nearest.hub.institution}
          </span>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">
            {nearest.hub.city}, {nearest.hub.country}
          </p>
          <p className="text-xs text-gray-400">
            {nearest.distanceKm.toLocaleString()} km from selected cell
          </p>
        </div>

        <div className="border-t border-gray-100" />

        <p className="text-xs text-gray-600">
          {nearest.hub.lead}
          <span className="text-gray-400"> · {nearest.hub.role}</span>
        </p>

        <a
          href={nearest.hub.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors"
        >
          <ExternalLink size={10} />
          Visit website
        </a>
      </div>

      <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#0f6e56] shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#0f6e56] uppercase tracking-wide">
              MAP TIP
            </p>
            <p className="text-xs text-gray-600">Show hub locations on map</p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={hubLayerEnabled}
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            hubLayerEnabled ? 'bg-[#0f6e56]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
              hubLayerEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

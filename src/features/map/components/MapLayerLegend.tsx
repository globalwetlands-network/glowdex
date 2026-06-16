import type { ReactNode } from 'react';
import {
  SearchMarkerIcon,
  PartnerMarkerIcon,
  SpeciesMarkerIcon,
  MangroveExtentIcon,
  LocalSiteMarkerIcon,
} from '@/components/map/markers';

interface MapLayerLegendProps {
  partnerLayerEnabled: boolean;
  speciesLayerEnabled: boolean;
  mangroveLayerEnabled: boolean;
  localSiteLayerEnabled: boolean;
  localSitesCount: number;
  searchMarkerVisible: boolean;
  activeSpeciesName?: string;
}

interface LegendItem {
  icon: ReactNode;
  label: string;
}

export function MapLayerLegend({
  partnerLayerEnabled,
  speciesLayerEnabled,
  mangroveLayerEnabled,
  localSiteLayerEnabled,
  localSitesCount,
  searchMarkerVisible,
  activeSpeciesName,
}: MapLayerLegendProps) {
  const items: LegendItem[] = [];

  if (searchMarkerVisible) {
    items.push({
      icon: <SearchMarkerIcon size={16} />,
      label: 'Search result',
    });
  }

  if (partnerLayerEnabled) {
    items.push({
      icon: <PartnerMarkerIcon size={16} />,
      label: 'Partner organisation',
    });
  }

  if (localSiteLayerEnabled && localSitesCount > 0) {
    items.push({
      icon: <LocalSiteMarkerIcon size={14} />,
      label: 'Local monitoring location',
    });
  }

  if (speciesLayerEnabled) {
    items.push({
      icon: <SpeciesMarkerIcon size={14} />,
      label: activeSpeciesName
        ? `${activeSpeciesName} observations`
        : 'Species observations',
    });
  }

  if (mangroveLayerEnabled) {
    items.push({
      icon: <MangroveExtentIcon size={14} />,
      label: 'Mangrove habitat extent',
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="absolute bottom-8 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 px-3 py-2 space-y-1.5 pointer-events-none">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            {item.icon}
          </div>
          <span className="text-[10px] text-gray-600 leading-none whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

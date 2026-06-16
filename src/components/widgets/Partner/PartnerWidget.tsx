import { useMemo } from 'react';
import { MapPin, ExternalLink, Building2, BarChart2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { usePartners } from '@/api/hooks/usePartners';
import { findNearestPartner } from '@/utils/geo';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { LocalSite } from '@/data/types/local-wetlands.types';

interface PartnerWidgetProps {
  selectedCell: EnrichedGridCell | null;
  onPartnerLayerToggle: (enabled: boolean) => void;
  partnerLayerEnabled: boolean;
  clickedPartnerId: string | null;
  /**
   * Local monitoring sites — used to check whether the
   * displayed partner has an associated monitoring site.
   * When a matching site exists, a link is shown to
   * navigate to the local data in the Analysis tab.
   */
  localSites: LocalSite[];
  /**
   * Called when the user clicks "View local monitoring
   * data" — switches to Analysis tab and selects the
   * associated site. Pass handleSiteSelect from App.tsx
   * directly — it already handles tab switching.
   */
  onViewLocalData: (siteId: string) => void;
}

export function PartnerWidget({
  selectedCell,
  onPartnerLayerToggle,
  partnerLayerEnabled,
  clickedPartnerId,
  localSites,
  onViewLocalData,
}: PartnerWidgetProps) {
  const posthog = usePostHog();
  const { data: partnersData, isLoading, isError } = usePartners();

  const nearest = useMemo(() => {
    if (!selectedCell?.centerCoords || !partnersData?.partners.length)
      return null;

    return findNearestPartner(
      selectedCell.centerCoords.latitude,
      selectedCell.centerCoords.longitude,
      partnersData.partners,
    );
  }, [selectedCell, partnersData]);

  const displayedPartner = useMemo(() => {
    if (!partnersData?.partners) return nearest;

    if (clickedPartnerId) {
      const clicked = partnersData.partners.find(
        (p) => p.id === clickedPartnerId,
      );
      if (clicked) {
        const distance = selectedCell?.centerCoords
          ? findNearestPartner(
              selectedCell.centerCoords.latitude,
              selectedCell.centerCoords.longitude,
              [clicked],
            )
          : null;
        return (
          distance ?? {
            partner: clicked,
            distanceKm: 0,
          }
        );
      }
    }

    return nearest;
  }, [partnersData, clickedPartnerId, nearest, selectedCell]);

  const associatedLocalSite = useMemo(() => {
    if (!displayedPartner?.partner.id) return null;
    // partnerId: null sites are implicitly excluded —
    // equality with a non-empty string never matches null.
    return (
      localSites.find((s) => s.partnerId === displayedPartner.partner.id) ??
      null
    );
  }, [localSites, displayedPartner]);

  const handleToggle = () => {
    onPartnerLayerToggle(!partnerLayerEnabled);
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
    return (
      <p className="text-xs text-gray-400 py-2">Partner data unavailable</p>
    );
  }

  if (!selectedCell || !displayedPartner) {
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
            Partner organisation locations are visible on the map.
          </p>
        </div>
        <div
          className="flex flex-col items-center justify-center
          py-4 text-center gap-1.5"
        >
          <MapPin size={18} className="text-gray-300" />
          <p className="text-sm text-gray-400">
            Select a cell to find your nearest partner organisation
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
        {clickedPartnerId
          ? 'SELECTED PARTNER ORGANISATION'
          : 'NEAREST PARTNER ORGANISATION'}
      </p>

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Building2 size={16} className="text-[#0f6e56] mt-0.5 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 leading-snug">
            {displayedPartner.partner.institution}
          </span>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">
            {displayedPartner.partner.city}, {displayedPartner.partner.country}
          </p>
          <p className="text-xs text-gray-400">
            {displayedPartner.distanceKm.toLocaleString()} km from selected cell
          </p>
        </div>

        {/* Only render https:// URLs — see
            LocalWetlandsAnalysisWidget for policy note.
            Divider is inside the condition so it only
            renders when the link block is visible. */}
        {displayedPartner.partner.websiteUrl.startsWith('https://') && (
          <>
            <div className="border-t border-gray-100" />
            <a
              href={displayedPartner.partner.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors"
            >
              <ExternalLink size={10} />
              Visit website
            </a>
          </>
        )}

        {/* Always shown — hardcoded https:// URL, not from the API */}
        <div className="border-t border-gray-100 pt-2">
          <p className="text-[10px] text-gray-400 mb-1">
            Learn more about the project
          </p>
          <a
            href="https://globalwetlandsproject.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors"
          >
            <ExternalLink size={10} />
            Global Wetlands Project
          </a>
        </div>

        {associatedLocalSite && (
          <div className="border-t border-gray-100 pt-2">
            <p className="text-[10px] text-gray-400 mb-1">
              Field monitoring data
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  posthog?.capture('view_local_data_clicked', {
                    site_id: associatedLocalSite.id,
                    partner_id: displayedPartner?.partner.id ?? null,
                    partner_institution:
                      displayedPartner?.partner.institution ?? null,
                  });
                  posthog?.capture('local_site_selected', {
                    site_id: associatedLocalSite.id,
                    site_name: associatedLocalSite.name,
                    site_country: associatedLocalSite.country,
                    partner_id: associatedLocalSite.partnerId ?? null,
                    trigger_source: 'partner_link',
                    had_cell_selected: !!selectedCell,
                  });
                } catch (error) {
                  console.error(
                    'Failed to capture view_local_data_clicked event:',
                    error,
                  );
                }
                onViewLocalData(associatedLocalSite.id);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors"
            >
              <BarChart2 size={10} />
              View local monitoring data
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#0f6e56] shrink-0" />
          <div>
            <p className="text-xs text-gray-600">
              Show partner organisation locations
            </p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={partnerLayerEnabled}
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            partnerLayerEnabled ? 'bg-[#0f6e56]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
              partnerLayerEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

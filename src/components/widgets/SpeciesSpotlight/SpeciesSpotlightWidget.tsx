import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { SpeciesSpotlightData } from '@/data/speciesSpotlight';
import {
  SPECIES_SPOTLIGHT_DATA,
  CONSERVATION_STATUS_INFO,
} from '@/data/speciesSpotlight';
import type { ObservationPoint, RegionBoundResponse } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { PartnerResponse } from '@/api/partners';
import { findNearestPartner } from '@/utils/geo';
import { useSpeciesConfig } from '@/api/hooks/useSpeciesConfig';
import { SpeciesTab } from './SpeciesTab';

interface SpeciesSpotlightWidgetProps {
  species?: SpeciesSpotlightData[];
  onSpeciesLayerToggle: (
    speciesId: string,
    observations: ObservationPoint[],
    enabled: boolean,
  ) => void;
  selectedCell: EnrichedGridCell | null;
  partners: PartnerResponse[];
  /**
   * Called when the active species changes — either via
   * auto-selection or manual tab click. Passes the center
   * coordinates of the species' primary region so the map
   * can fly to the relevant area.
   * Optional — no fly behaviour if not provided.
   */
  onSpeciesSelect?: (center: { lng: number; lat: number }) => void;
  /**
   * ID of a partner clicked directly on the map. When set,
   * the spotlight immediately shows the species associated
   * with that partner without requiring a cell selection.
   */
  clickedPartnerId?: string | null;
  /**
   * When true, suppresses the map fly-to triggered by
   * auto-selection (cell change or partner match). Manual
   * species tab clicks still fly the map.
   *
   * Set to true when a monitoring site pin was clicked so
   * the site fly-to is not overridden by the species
   * auto-select that fires when the associated cell is set.
   */
  suppressAutoFlyTo?: boolean;
}

/**
 * Calculates the geographic center of a species' primary
 * regionBound (index 0 — most specific) for map fly-to.
 * Returns null if no bounds are defined.
 */
function getSpeciesPrimaryCenter(
  regionBounds: RegionBoundResponse[],
): { lng: number; lat: number } | null {
  if (!regionBounds.length) return null;
  const primary = regionBounds[0];
  return {
    lat: (primary.lat[0] + primary.lat[1]) / 2,
    lng: (primary.lng[0] + primary.lng[1]) / 2,
  };
}

/**
 * Returns true if the given lat/lng falls within the bound.
 * Inclusive on all edges.
 */
function isInBound(
  lat: number,
  lng: number,
  bound: RegionBoundResponse,
): boolean {
  return (
    lat >= bound.lat[0] &&
    lat <= bound.lat[1] &&
    lng >= bound.lng[0] &&
    lng <= bound.lng[1]
  );
}

export function SpeciesSpotlightWidget({
  species = SPECIES_SPOTLIGHT_DATA,
  onSpeciesLayerToggle,
  selectedCell,
  partners,
  onSpeciesSelect,
  clickedPartnerId,
  suppressAutoFlyTo = false,
}: SpeciesSpotlightWidgetProps) {
  const posthog = usePostHog();
  const [activeIndex, setActiveIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  // Tracks which species ID has its observation layer enabled.
  // null means no layer is active. Scoped to a species ID rather
  // than a boolean so it automatically becomes stale when the
  // effective species changes — no manual reset needed.
  const [layerEnabledForSpecies, setLayerEnabledForSpecies] = useState<
    string | null
  >(null);
  /**
   * Tracks a manual tab selection scoped to a specific cell.
   * null means no manual override — auto-selection applies.
   * Automatically ignored when selectedCell changes to a
   * different cell, with no effect or setState-in-render needed.
   */
  const [manualSelection, setManualSelection] = useState<{
    cellId: number;
    index: number;
  } | null>(null);

  const { data: speciesConfigData } = useSpeciesConfig();

  const handleTabChange = (idx: number) => {
    if (idx !== effectiveIndex) {
      if (layerEnabled && activeSpecies) {
        onSpeciesLayerToggle(activeSpecies.id, [], false);
      }
      setLayerEnabledForSpecies(null);
      setActiveIndex(idx);
      setManualSelection(
        selectedCell ? { cellId: selectedCell.id, index: idx } : null,
      );
      const newSpecies = species[idx];
      if (newSpecies) {
        try {
          posthog?.capture('species_tab_selected', {
            species_id: newSpecies.id,
            species_common_name: newSpecies.commonName,
            previous_species_id: activeSpecies?.id ?? null,
            selection_type: 'manual',
            cell_id:
              selectedCell?.id !== undefined ? String(selectedCell.id) : null,
          });
        } catch (error) {
          console.error('Failed to capture species_tab_selected event:', error);
        }
      }
    }
  };

  /**
   * Derives the species index to auto-select using three-tier
   * priority:
   *
   * Tier 1 — Partner match: nearest partner is in species' partnerIds.
   *   Partner-validated, most intentional signal.
   *
   * Tier 2 — Region bounds: cell falls within species' known
   *   geographic range. Scientific fallback for areas not
   *   covered by partner proximity alone.
   *
   * Tier 3 — No match: returns -1. effectiveIndex will show
   *   the empty state.
   *
   * Returns -1 while speciesConfigData is loading to avoid
   * a premature empty state flash before config has arrived.
   */
  const autoIndex = useMemo(() => {
    // Tier 1a: Direct partner click — exact ID, no cell coordinates needed
    if (clickedPartnerId && speciesConfigData) {
      const directMatchIdx = species.findIndex((s) => {
        const config = speciesConfigData.species.find((c) => c.id === s.id);
        return config?.partnerIds.includes(clickedPartnerId) ?? false;
      });
      if (directMatchIdx !== -1) return directMatchIdx;
    }

    if (!selectedCell?.centerCoords) return -1;
    // Defer until config is loaded to avoid empty state flash
    if (!speciesConfigData) return -1;

    const { latitude: lat, longitude: lng } = selectedCell.centerCoords;

    // Tier 1b: Nearest partner match via cell coordinates
    if (partners.length) {
      const nearest = findNearestPartner(lat, lng, partners);
      if (nearest) {
        const partnerMatchIdx = species.findIndex((s) => {
          const config = speciesConfigData.species.find((c) => c.id === s.id);
          return config?.partnerIds.includes(nearest.partner.id) ?? false;
        });
        if (partnerMatchIdx !== -1) return partnerMatchIdx;
      }
    }

    // Tier 2: Region bounds fallback
    const boundsMatchIdx = species.findIndex((s) => {
      const config = speciesConfigData.species.find((c) => c.id === s.id);
      return (
        config?.regionBounds.some((bound) => isInBound(lat, lng, bound)) ??
        false
      );
    });
    if (boundsMatchIdx !== -1) return boundsMatchIdx;

    // Tier 3: No match
    return -1;
  }, [selectedCell, partners, species, speciesConfigData, clickedPartnerId]);

  // Tracks which tier resolved the auto-selection — used for analytics only.
  const autoTier = useMemo((): 'partner_match' | 'region_bounds' | null => {
    if (autoIndex === -1 || !speciesConfigData) return null;

    // Tier 1a: Direct partner click
    if (clickedPartnerId) {
      const matched = species.some((s) => {
        const config = speciesConfigData.species.find((c) => c.id === s.id);
        return config?.partnerIds.includes(clickedPartnerId) ?? false;
      });
      if (matched) return 'partner_match';
    }

    if (!selectedCell?.centerCoords) return null;
    const { latitude: lat, longitude: lng } = selectedCell.centerCoords;
    if (partners.length) {
      const nearest = findNearestPartner(lat, lng, partners);
      if (nearest) {
        const matched = species.some((s) => {
          const config = speciesConfigData.species.find((c) => c.id === s.id);
          return config?.partnerIds.includes(nearest.partner.id) ?? false;
        });
        if (matched) return 'partner_match';
      }
    }
    return 'region_bounds';
  }, [
    autoIndex,
    selectedCell,
    partners,
    species,
    speciesConfigData,
    clickedPartnerId,
  ]);

  /**
   * Effective active tab index — single source of truth for
   * which species tab is displayed.
   *
   * Priority order:
   * 1. Manual selection scoped to current cell — always
   *    respected regardless of auto-selection.
   * 2. Auto-selection via partner match or region bounds.
   * 3. Default activeIndex when no cell is selected.
   * 4. Default activeIndex while speciesConfigData is loading
   *    — avoids premature empty state flash.
   * 5. -1 when cell is selected, config is loaded, and no
   *    species match exists — triggers empty state.
   */
  // Manual selection always wins for the current cell
  let effectiveIndex: number;
  if (manualSelection !== null && manualSelection.cellId === selectedCell?.id) {
    effectiveIndex = manualSelection.index;
  } else if (selectedCell && !speciesConfigData) {
    // While config is loading, show default rather than flashing empty state
    effectiveIndex = activeIndex;
  } else if (autoIndex !== -1) {
    // Auto-selection found a match
    effectiveIndex = autoIndex;
  } else if (!selectedCell) {
    // No cell selected — show default
    effectiveIndex = activeIndex;
  } else {
    // Cell selected, config loaded, no match — empty state
    effectiveIndex = -1;
  }

  const activeSpecies = effectiveIndex !== -1 ? species[effectiveIndex] : null;

  // Layer is only considered active if it matches the currently
  // displayed species. Resets automatically when effectiveIndex
  // changes via auto-selection without needing handleTabChange.
  const layerEnabled =
    layerEnabledForSpecies !== null &&
    layerEnabledForSpecies === activeSpecies?.id;

  // Ref so the effect below can read the latest layerEnabledForSpecies
  // without listing it as a dependency (which would re-fire the effect
  // on every layer toggle, not just on species changes).
  // Synced via useLayoutEffect (fires before useEffect) so the ref is
  // always current when the main effect runs.
  const layerEnabledForSpeciesRef = useRef(layerEnabledForSpecies);
  useLayoutEffect(() => {
    layerEnabledForSpeciesRef.current = layerEnabledForSpecies;
  });

  /**
   * Fires onSpeciesSelect when the active species changes.
   * Handles both manual tab clicks and auto-selection.
   * Only fires when effectiveIndex resolves to a real species
   * (not -1) and speciesConfigData is loaded.
   * useEffect is appropriate here — we are triggering an
   * external side effect (map movement) in response to a
   * React state change, which is exactly the intended use
   * of effects.
   */
  useEffect(() => {
    if (
      effectiveIndex === -1 ||
      !onSpeciesSelect ||
      !speciesConfigData ||
      !selectedCell
    )
      return;

    // Notify parent to deactivate the layer for the previous species.
    // Uses a ref so this doesn't re-fire when the user toggles the layer —
    // only when effectiveIndex changes (species auto-selected or manually switched).
    if (layerEnabledForSpeciesRef.current) {
      onSpeciesLayerToggle(layerEnabledForSpeciesRef.current, [], false);
    }

    const currentSpecies = species[effectiveIndex];
    if (!currentSpecies) return;
    const config = speciesConfigData.species.find(
      (c) => c.id === currentSpecies.id,
    );
    if (!config) return;
    const isAutoSelection =
      autoTier !== null &&
      !(
        manualSelection !== null &&
        manualSelection.cellId === selectedCell.id &&
        manualSelection.index === effectiveIndex
      );

    const center = getSpeciesPrimaryCenter(config.regionBounds);
    if (center && !(suppressAutoFlyTo && isAutoSelection))
      onSpeciesSelect(center);

    // Fire auto-selection analytics only when the effective index
    // came from auto-selection — manual selections are tracked in handleTabChange.
    if (isAutoSelection) {
      try {
        posthog?.capture('species_auto_selected', {
          species_id: currentSpecies.id,
          species_common_name: currentSpecies.commonName,
          selection_tier: autoTier,
          cell_id: String(selectedCell.id),
        });
      } catch (error) {
        console.error('Failed to capture species_auto_selected event:', error);
      }
    }
  }, [
    effectiveIndex,
    onSpeciesSelect,
    onSpeciesLayerToggle,
    speciesConfigData,
    selectedCell,
    species,
    autoTier,
    manualSelection,
    suppressAutoFlyTo,
    posthog,
  ]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Species Spotlight
        </h3>
        <button
          type="button"
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

      {/* Empty state — cell selected but no species match */}
      {selectedCell && effectiveIndex === -1 && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
          <p className="text-xs text-gray-500 leading-relaxed">
            No spotlight species documented for this region yet.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Explore our partner species, or contact the nearest partner
            organisation for local data.
          </p>
        </div>
      )}

      {/* Species tab content — only rendered when a match exists */}
      {activeSpecies && (
        <SpeciesTab
          species={activeSpecies}
          layerEnabled={layerEnabled}
          onLayerToggle={(speciesId, observations, enabled) => {
            setLayerEnabledForSpecies(enabled ? speciesId : null);
            onSpeciesLayerToggle(speciesId, observations, enabled);
            try {
              posthog?.capture('species_layer_toggled', {
                species_id: speciesId,
                species_common_name: activeSpecies.commonName,
                enabled,
                observation_count: observations.length,
              });
            } catch (error) {
              console.error(
                'Failed to capture species_layer_toggled event:',
                error,
              );
            }
          }}
          infoOpen={infoOpen}
          setInfoOpen={setInfoOpen}
        />
      )}
    </div>
  );
}

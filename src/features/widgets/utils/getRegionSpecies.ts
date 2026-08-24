import type { RegionBoundResponse, SpeciesConfigResponse } from '@/api/species';
import type { PartnerResponse } from '@/api/partners';
import { findNearestPartner } from '@/utils/geo';
import { MAX_SITE_ASSOCIATION_DISTANCE_KM } from '@/data/constants/localWetlands.constants';

/**
 * Returns true if the given lat/lng falls within the bound.
 * Inclusive on all edges. Mirrors the geographic test used by
 * SpeciesSpotlightWidget's auto-selection.
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

/**
 * Derives the species recorded for the region of a selected cell,
 * without needing the observation layer to be enabled.
 *
 * Uses the same two signals SpeciesSpotlightWidget relies on:
 *   - Partner match: the nearest partner (within the site-association
 *     distance) appears in a species' `partnerIds`.
 *   - Region bounds: the cell falls within a species' known range.
 *
 * Results are deduplicated by species id, and `stub` species (placeholder
 * entries with no real content) are excluded. Returns an empty array when
 * the cell has no coordinates or no species match — callers render a
 * graceful "none recorded" state.
 */
export function getRegionSpecies(
  centerCoords: { latitude: number; longitude: number } | undefined,
  species: SpeciesConfigResponse[],
  partners: PartnerResponse[],
): SpeciesConfigResponse[] {
  if (!centerCoords || !species.length) return [];

  const { latitude: lat, longitude: lng } = centerCoords;
  const matched = new Map<string, SpeciesConfigResponse>();

  // Partner match — only trust it when the partner is geographically
  // close, so a distant partner's species is not attributed to this cell.
  const nearest = findNearestPartner(lat, lng, partners);
  if (nearest && nearest.distanceKm <= MAX_SITE_ASSOCIATION_DISTANCE_KM) {
    for (const s of species) {
      if (!s.stub && s.partnerIds.includes(nearest.partner.id)) {
        matched.set(s.id, s);
      }
    }
  }

  // Region bounds — the geographic "recorded for the region" signal.
  for (const s of species) {
    if (!s.stub && s.regionBounds.some((b) => isInBound(lat, lng, b))) {
      matched.set(s.id, s);
    }
  }

  return [...matched.values()];
}

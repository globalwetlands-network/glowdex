import katalaImg from '@/assets/species/katala.jpg';
import estuaryStringRayImg from '@/assets/species/estuary-stingray.jpg';
import fiddlerCrabImg from '@/assets/species/fiddler-crab-second.jpg';

/**
 * Species Spotlight — frontend presentation data only.
 *
 * All per-species *content* (names, summaries, credits, links, conservation
 * status, etc.) is owned by the backend registry and served via
 * GET /api/species/config — see the SpeciesConfigResponse type in
 * `@/api/species`. This file holds only what is inherently frontend:
 *
 *  - CONSERVATION_STATUS_INFO — a static IUCN code → Tailwind styling lookup.
 *  - SPECIES_IMAGES — the image binaries, mapped by species `id`. Kept as
 *    Vite-optimized assets rather than hosted URLs.
 *  - Shared chart/type helpers.
 */

/**
 * IUCN Red List Conservation Status codes.
 * https://www.iucnredlist.org/about/categories-and-criteria
 */
export type ConservationStatus =
  | 'EX'
  | 'EW'
  | 'CR'
  | 'EN'
  | 'VU'
  | 'NT'
  | 'LC'
  | 'DD'
  | 'NE';

/**
 * Styling and label information for each IUCN conservation status.
 * Colors follow the IUCN's visual convention (red → green scale).
 */
export interface ConservationStatusInfo {
  /** Full human-readable label (e.g., "Critically Endangered") */
  label: string;
  /** Tailwind text color class */
  textColor: string;
  /** Tailwind background + border classes for badges */
  badgeClasses: string;
}

/**
 * Conservation status metadata keyed by status code.
 * Single source of truth for all status-related styling and labels.
 */
export const CONSERVATION_STATUS_INFO: Record<
  ConservationStatus,
  ConservationStatusInfo
> = {
  CR: {
    label: 'Critically Endangered',
    textColor: 'text-red-700',
    badgeClasses: 'bg-red-100 text-red-700 border-red-200',
  },
  EN: {
    label: 'Endangered',
    textColor: 'text-orange-700',
    badgeClasses: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  VU: {
    label: 'Vulnerable',
    textColor: 'text-amber-700',
    badgeClasses: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  NT: {
    label: 'Near Threatened',
    textColor: 'text-yellow-700',
    badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  LC: {
    label: 'Least Concern',
    textColor: 'text-green-700',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
  },
  DD: {
    label: 'Data Deficient',
    textColor: 'text-gray-700',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  EX: {
    label: 'Extinct',
    textColor: 'text-gray-900',
    badgeClasses: 'bg-gray-900 text-white border-gray-900',
  },
  EW: {
    label: 'Extinct in the Wild',
    textColor: 'text-gray-800',
    badgeClasses: 'bg-gray-800 text-white border-gray-800',
  },
  NE: {
    label: 'Not Evaluated',
    textColor: 'text-gray-500',
    badgeClasses: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

export interface SpeciesPopulationSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Species image binaries, keyed by the species `id` from the backend
 * registry. Kept in the frontend as Vite-optimized assets. When adding a
 * new species, drop its image into `@/assets/species/` and add one line here.
 */
export const SPECIES_IMAGES: Record<string, string> = {
  katala: katalaImg,
  'fiddler-crab': fiddlerCrabImg,
  'estuary-stingray': estuaryStringRayImg,
};
